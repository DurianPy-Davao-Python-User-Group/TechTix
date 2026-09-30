import React, { lazy, Suspense, useMemo, type ComponentType, type ReactNode } from 'react';
import { useNavigate, useLocation, useInRouterContext } from 'react-router-dom';
import ReactDOM from 'react-dom';
import ErrorBoundary from './ErrorBoundary';
import { init, registerRemotes, loadRemote } from '@module-federation/runtime';
import { QueryClient, useQueryClient } from '@tanstack/react-query';

/** The type of MFE determines how the Host loads it. */
export type RemoteType = 'route' | 'widget' | 'hydrated';

/** Configuration for a single remote MFE in the discovery manifest. */
export interface RemoteEntry {
  url: string;
  scope: string;
  module: string;
  type: RemoteType;
  routePrefix?: string;
  featureFlag?: string;
  integrity?: string;
}

/** The discovery manifest shape. */
export interface DiscoveryManifest {
  version: string;
  updatedAt: string;
  remotes: Record<string, RemoteEntry>;
  featureFlags?: Record<string, boolean>;
}

/** Props passed to a remote MFE component by the Host's RemoteLoader. */
export interface RemoteMfeProps {
  basePath?: string;
  currentRoute?: string;
  onNavigate?: (path: string, options?: { replace?: boolean }) => void;
  serverHtml?: string;
  dataEndpoint?: string;
  [key: string]: unknown;
}

export interface RemoteLoaderProps {
  remote: RemoteEntry;
  mfeProps?: RemoteMfeProps;
  loadingFallback?: ReactNode;
}

let isMfInitialized = false;

function ensureMfInitialized(): void {
  if (isMfInitialized) return;
  try {
    init({
      name: 'techtixHost',
      remotes: [],
      shared: {
        react: {
          version: '19.2.8',
          scope: 'default',
          lib: () => React,
          shareConfig: {
            singleton: true,
            requiredVersion: '^19.0.0'
          }
        },
        'react-dom': {
          version: '19.2.8',
          scope: 'default',
          lib: () => ReactDOM,
          shareConfig: {
            singleton: true,
            requiredVersion: '^19.0.0'
          }
        }
      }
    });
    isMfInitialized = true;
  } catch (e) {
    console.warn('[MF Runtime Init Warning]', e);
  }
}

const registeredRemotes = new Set<string>();

function ensureRemoteRegistered(remote: RemoteEntry): void {
  ensureMfInitialized();
  if (registeredRemotes.has(remote.scope)) return;
  try {
    registerRemotes([
      {
        name: remote.scope,
        alias: remote.scope,
        entry: remote.url,
        type: 'module'
      }
    ]);
    registeredRemotes.add(remote.scope);
  } catch (e) {
    console.warn(`[MF Register Remote Warning: ${remote.scope}]`, e);
  }
}

function createRemoteComponent(remote: RemoteEntry, queryClient: QueryClient): ComponentType<RemoteMfeProps> {
  return lazy(async () => {
    const queryKey = [remote.url, remote.module];

    const component = await queryClient.fetchQuery({
      queryKey,
      staleTime: Infinity,
      queryFn: async () => {
        ensureRemoteRegistered(remote);

        const rawModule = remote.module || './App';
        const cleanModule = rawModule.startsWith('./') ? rawModule.slice(2) : rawModule;

        const candidateNames = [`${remote.scope}/${cleanModule}`, `${remote.scope}/${rawModule}`, remote.scope];

        let lastError: unknown = null;

        for (const name of candidateNames) {
          try {
            const res = await loadRemote<Record<string, unknown>>(name);
            if (res) {
              return res.default || res?.[cleanModule] || res;
            }
          } catch (err) {
            lastError = err;
          }
        }

        console.error(`Failed to load remote ${remote.scope} module ${remote.module}:`, lastError);
        throw lastError || new Error(`Failed to load remote module for scope ${remote.scope}`);
      }
    });

    return { default: component };
  });
}

const DefaultSuspenseFallback = (
  <div className="flex items-center justify-center p-12">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

function RemoteLoaderInRouter({
  RemoteComponent,
  remote,
  mfeProps,
  loadingFallback
}: {
  RemoteComponent: React.ComponentType<RemoteMfeProps>;
  remote: RemoteEntry;
  mfeProps?: RemoteMfeProps;
  loadingFallback: ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const mergedProps: RemoteMfeProps = useMemo(
    () => ({
      basePath: remote.routePrefix ?? '',
      currentRoute: location.pathname,
      onNavigate: (path: string, options?: { replace?: boolean }) => {
        navigate(path, options);
      },
      ...mfeProps
    }),
    [remote.routePrefix, location.pathname, navigate, mfeProps]
  );

  return (
    <ErrorBoundary name={remote.scope}>
      <Suspense fallback={loadingFallback}>
        <RemoteComponent {...mergedProps} />
      </Suspense>
    </ErrorBoundary>
  );
}

export function RemoteLoader({ remote, mfeProps, loadingFallback }: RemoteLoaderProps) {
  const queryClient = useQueryClient();
  const inRouter = useInRouterContext();

  const RemoteComponent = useMemo(() => {
    const queryKey = [remote.url, remote.module, 'component'];

    let cachedComponent: React.ComponentType<RemoteMfeProps> | undefined;
    if ((cachedComponent = queryClient.getQueryData(queryKey))) {
      return cachedComponent;
    }

    const remoteComponent = createRemoteComponent(remote, queryClient);
    queryClient.setQueryData(queryKey, remoteComponent);
    return remoteComponent;
  }, [remote, queryClient]);

  const fallback = loadingFallback ?? DefaultSuspenseFallback;

  if (inRouter) {
    return <RemoteLoaderInRouter RemoteComponent={RemoteComponent} remote={remote} mfeProps={mfeProps} loadingFallback={fallback} />;
  }

  const mergedProps: RemoteMfeProps = {
    basePath: remote.routePrefix ?? '',
    currentRoute: typeof window !== 'undefined' ? window.location.pathname : undefined,
    onNavigate: (path: string, options?: { replace?: boolean }) => {
      if (typeof window !== 'undefined') {
        if (options?.replace) {
          window.location.replace(path);
        } else {
          window.location.assign(path);
        }
      }
    },
    ...mfeProps
  };

  return (
    <ErrorBoundary name={remote.scope}>
      <Suspense fallback={fallback}>
        <RemoteComponent {...mergedProps} />
      </Suspense>
    </ErrorBoundary>
  );
}

export default RemoteLoader;
