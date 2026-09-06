/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_AUTH_BASE_URL: string;
  readonly VITE_API_EVENTS_BASE_URL: string;
  readonly VITE_API_PAYMENT_BASE_URL: string;
  // CloudWatch RUM. Absent on stages without an app monitor, so optional.
  readonly VITE_RUM_APP_MONITOR_ID?: string;
  readonly VITE_RUM_IDENTITY_POOL_ID?: string;
  readonly VITE_RUM_REGION?: string;
  readonly VITE_RUM_SESSION_SAMPLE_RATE?: string;
  readonly VITE_RUM_REPLAY_SAMPLE_RATE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
