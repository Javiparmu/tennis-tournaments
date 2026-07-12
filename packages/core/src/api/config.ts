// Runtime API configuration for the shared fetch client. The web app and the
// mobile app inject their own base URL (from NEXT_PUBLIC_* / EXPO_PUBLIC_*) via
// setApiConfig() at startup, so this package never hard-codes a host or an env
// prefix. getApiConfig() throws a clear error if a request is made before the
// host app has configured it.
export type ApiConfig = {
  baseUrl: string;
  /** Request timeout in ms; falls back to 8000 when unset or invalid. */
  timeoutMs?: number;
};

let config: ApiConfig | null = null;

export function setApiConfig(next: ApiConfig): void {
  config = next;
}

export function getApiConfig(): ApiConfig {
  if (!config) {
    throw new Error("CourtRank API is not configured. Call setApiConfig({ baseUrl }) at app startup.");
  }
  return config;
}
