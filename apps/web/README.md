# CourtRank Web (`@courtrank/web`)

Next.js 16 web app for CourtRank. It hosts public tournament/player pages plus the club host and platform admin workflows. Shared data models, API modules, labels, query keys, and optimistic helpers come from `@courtrank/core`.

## Local development

From the repo root:

```bash
pnpm dev
```

or directly:

```bash
pnpm --filter @courtrank/web dev
```

Set `NEXT_PUBLIC_API_BASE_URL` in `apps/web/.env.local` to the backend URL. Local default is usually `http://localhost:8080`.

## Useful commands

```bash
pnpm --filter @courtrank/web build
pnpm --filter @courtrank/web test
```

## Notes

- This app uses Next.js 16. Read `../../node_modules/next/dist/docs/` before changing routing, metadata, proxy, or caching behavior.
- Auth middleware lives in `proxy.ts`, not `middleware.ts`.
- Vercel must use `apps/web` as the project root directory.
