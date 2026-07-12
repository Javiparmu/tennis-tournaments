import { setApiConfig } from "@courtrank/core";

// Inject the mobile runtime config into the shared @courtrank/core fetch client.
// EXPO_PUBLIC_* is inlined at build time. Imported for its side effect from the
// root layout, before any query fires.
setApiConfig({
  baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? "",
  timeoutMs: Number(process.env.EXPO_PUBLIC_API_TIMEOUT_MS) || undefined,
});
