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
 * Starts CloudWatch RUM.
 *
 * Configuration is written to SSM by durianpy-root-infra and baked in at build
 * time by scripts/generate-env.mjs. Stages without an app monitor — local dev,
 * and the dev stage — simply have no values, so this is a no-op there. Because
 * the check is against build-time constants, Vite eliminates the whole body and
 * the SDK never enters the bundle on those stages.
 *
 * The SDK is loaded dynamically so it lands in its own chunk. It statically
 * imports rrweb for session replay, which we do not enable but which cannot be
 * tree-shaken, and that is ~86 kB gzipped — too much to put on the critical path
 * of a page whose load performance we are trying to measure.
 *
 * Errors thrown while that chunk is in flight would otherwise be missed, which
 * is the worst moment to be blind, so they are buffered and replayed once the
 * client exists.
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
      // Keep in step with the app monitor's telemetries in durianpy-root-infra.
      // 'http' is deliberately excluded: it emits an event per fetch/XHR, and
      // RUM is billed per event, so it is by far the most expensive category.
      telemetries: ['errors', 'performance'],
      allowCookies: true,
      // Browser-side X-Ray tracing bills a trace per instrumented request on
      // top of the RUM events. The backend services are already traced.
      enableXRay: false,
      sessionSampleRate: parseSampleRate(import.meta.env.VITE_RUM_SESSION_SAMPLE_RATE)
    };

    client = new AwsRumClient(applicationId, APPLICATION_VERSION, region, config);

    for (const error of bufferedErrors) {
      client.recordError(error);
    }

    return client;
  } catch (error) {
    // Telemetry must never take the app down with it. A blocked request or a
    // failed Cognito exchange should cost us monitoring, not the page.
    console.warn('CloudWatch RUM failed to initialise', error);
    return undefined;
  } finally {
    stopBufferingErrors();
  }
};
