## Core Package Rules

This workspace is `@courtrank/core`, the shared framework-agnostic package.

- Keep this package portable. It must not import React hooks/components, Next.js APIs, Expo/React Native APIs, Clerk, HeroUI, NativeWind, browser-only DOM APIs, or app-local aliases.
- Allowed contents: TypeScript models, pure lib helpers, API domain modules, the shared fetch client/config, query-key factories, optimistic cache helpers, and colocated pure tests.
- API modules stay one-liners over `apiGet`, `apiPost`, `apiPut`, `apiPatch`, and `apiDelete` from `src/api/client.ts`. Authed functions take `token` as the first argument and call `requireToken(token)` at the boundary.
- Runtime configuration is injected by host apps with `setApiConfig({ baseUrl, timeoutMs })`. Never read `NEXT_PUBLIC_*` or `EXPO_PUBLIC_*` directly inside core.
- Mutation error UI is injected by host apps with `setMutationNotifier`. Core must not know whether the notifier is HeroUI, native toast, or something else.
- Query keys come only from `src/queries/keys.ts`; extend the factory instead of inlining raw arrays in app hooks.
- Labels and surface constants are shared here. App-specific rendering maps, Tailwind classes, NativeWind classes, and style tokens stay in the app workspaces.
- Tests are pure Vitest tests colocated as `*.test.ts`. Prefer adding tests here when changing shared scoring, standings, search, labels, API client, or optimistic behavior.

Useful commands from the repo root:

- `pnpm --filter @courtrank/core test`
