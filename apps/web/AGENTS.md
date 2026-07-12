## Web Workspace Rules

This workspace is `@courtrank/web`, the Next.js 16 app in the CourtRank monorepo.

- Keep web-only code here: routes, metadata layouts, Clerk Next auth UI, HeroUI components, Tailwind classes, host/admin screens, and web-specific query hooks.
- Shared models, pure formatting/search/score/standings/contact/error helpers, API domain functions, query keys, and optimistic helpers come from `@courtrank/core`; do not reintroduce `apps/web/models`, `apps/web/lib` copies for shared logic, or raw query-key arrays.
- The `@/*` alias points to `apps/web/*`. Use it only for web-local modules.
- Before touching Next routing, metadata, proxy, or caching behavior, read the relevant Next 16 docs in `../../node_modules/next/dist/docs/`.
- `proxy.ts` is the auth middleware entrypoint. Do not add `middleware.ts`.
- Dynamic-route `params` are promises in this Next version; await them in server pages and metadata functions.
- Public routes `/tournaments` and `/players` stay shareable. `/host` and `/admin` stay protected by Clerk middleware and backend authorization.
- Metadata fetches for public dynamic pages use `requestForMetadata` from `@courtrank/core/api/client` after importing `@/lib/api-init`; client page data still flows through React Query.
- Reuse the web primitives in `components/`: `PageScaffold`, `ModalShell`, `FormError`, `ConfirmDialog`, `PageHeroFrame`/`PageHero`, `PageSkeleton`, and `EmptyState`.
- Web deployment is the Vercel project with Root Directory set to `apps/web`.

Useful commands from the repo root:

- `pnpm dev`
- `pnpm --filter @courtrank/web build`
- `pnpm --filter @courtrank/web test`
