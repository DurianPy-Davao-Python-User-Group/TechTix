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
      // Must match the app monitor in durianpy-root-infra. 'http' is excluded:
      // an event per fetch/XHR, and RUM bills per event.
      telemetries: ['errors', 'performance'],
      allowCookies: true,
      // Would bill a trace per instrumented request; the backend is traced.
      enableXRay: false,
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
