import type { AwsRum, AwsRumConfig } from 'aws-rum-web';

const APPLICATION_VERSION = '1.0.0';
const DEFAULT_SESSION_SAMPLE_RATE = 0.1;
const MAX_BUFFERED_ERRORS = 10;

let client: AwsRum | undefined;

const bufferedErrors: unknown[] = [];

const bufferError = (error: unknown) => {
  if (bufferedErrors.length < MAX_BUFFERED_ERRORS) {
    bufferedErrors.push(error);
  }
};

const onEarlyError = (event: ErrorEvent) => bufferError(event.error ?? event.message);
const onEarlyRejection = (event: PromiseRejectionEvent) => bufferError(event.reason);

const startBufferingErrors = () => {
  window.addEventListener('error', onEarlyError);
  window.addEventListener('unhandledrejection', onEarlyRejection);
};

const stopBufferingErrors = () => {
  window.removeEventListener('error', onEarlyError);
  window.removeEventListener('unhandledrejection', onEarlyRejection);
  bufferedErrors.length = 0;
};

const parseSampleRate = (raw: string | undefined): number => {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 1) {
    return DEFAULT_SESSION_SAMPLE_RATE;
  }
  return parsed;
};

/**
 * Origins that get an X-Amzn-Trace-Id header, so a browser trace joins the
 * backend trace for the same request.
 *
 * The header is only safe to send where the API's CORS preflight allows it. The
 * payment API is deliberately absent: its deployed OPTIONS mock still advertises
 * an older Access-Control-Allow-Headers list without X-Amzn-Trace-Id, so adding
 * it there would fail preflight and break checkout. Its next deploy refreshes
 * that list, after which it can be added here.
 */
const traceHeaderUrls = (): RegExp[] =>
  [import.meta.env.VITE_API_AUTH_BASE_URL, import.meta.env.VITE_API_EVENTS_BASE_URL]
    .filter((url): url is string => Boolean(url))
    .flatMap((url) => {
      try {
        return [new RegExp(`^${new URL(url).origin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`)];
      } catch {
        return [];
      }
    });

/**
 * Starts CloudWatch RUM. Config comes from SSM at build time via
 * scripts/generate-env.mjs; stages without an app monitor have no values, and
 * Vite then eliminates this body so the SDK never enters the bundle.
 *
 * The SDK is imported dynamically because it statically pulls in rrweb, which
 * we do not enable and cannot tree-shake — 86 kB gzipped off the critical path.
 * Errors thrown while that chunk loads are buffered and replayed.
 */
export const initRum = async (): Promise<AwsRum | undefined> => {
  if (client) {
    return client;
  }

  const applicationId = import.meta.env.VITE_RUM_APP_MONITOR_ID;
  const identityPoolId = import.meta.env.VITE_RUM_IDENTITY_POOL_ID;
  const region = import.meta.env.VITE_RUM_REGION;

  if (!applicationId || !identityPoolId || !region) {
    return undefined;
  }

  startBufferingErrors();

  try {
    const { AwsRum: AwsRumClient } = await import('aws-rum-web');

    const config: AwsRumConfig = {
      identityPoolId,
      // 'errors', 'performance' and 'http' mirror the app monitor in
      // durianpy-root-infra. 'replay' is client-only — the RUM service has no
      // telemetry value for it — and listing telemetries at all opts out of it
      // by default, which is why session replay was previously absent.
      //
      // The http plugin records failed requests only; recordAllRequests is left
      // at its false default, so successful calls cost nothing.
      telemetries: [
        'errors',
        'performance',
        'replay',
        [
          'http',
          {
            addXRayTraceIdHeader: traceHeaderUrls()
          }
        ]
      ],
      allowCookies: true,
      // Emits an X-Ray trace per request in a sampled session. Combined with the
      // header above this joins the browser to the backend traces.
      enableXRay: true,
      sessionSampleRate: parseSampleRate(import.meta.env.VITE_RUM_SESSION_SAMPLE_RATE)
    };

    client = new AwsRumClient(applicationId, APPLICATION_VERSION, region, config);

    for (const error of bufferedErrors) {
      client.recordError(error);
    }

    return client;
  } catch (error) {
    // Telemetry must never take the app down with it.
    console.warn('CloudWatch RUM failed to initialise', error);
    return undefined;
  } finally {
    stopBufferingErrors();
  }
};
