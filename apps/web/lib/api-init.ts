import { setApiConfig } from "@courtrank/core/api/client";

// Inject the web app's runtime config into the shared @courtrank/core fetch
// client. Imported for its side effect from the client Providers (covers React
// Query calls during SSR + hydration) and from the server metadata pages (covers
// generateMetadata's requestForMetadata). NEXT_PUBLIC_* is inlined into the
// client bundle and available via process.env on the server — same value both
// sides.
setApiConfig({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  timeoutMs: Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS) || undefined,
});
