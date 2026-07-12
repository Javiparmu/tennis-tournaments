# Project conventions (rules)

These are the established patterns. Follow them; when you add a feature, extend the canonical module rather than re-rolling a variant. Each rule names the file or workspace that is the source of truth.

## Monorepo shape

This is a pnpm workspace:

- `apps/web` is the Next.js 16 web app (`@courtrank/web`).
- `apps/mobile` is the Expo SDK 54 React Native app (`@courtrank/mobile`).
- `packages/core` is the shared framework-agnostic package (`@courtrank/core`).

Keep the boundary clean: shared models, pure logic, API domain functions, query keys, labels, and optimistic cache helpers live in core; app-specific auth hooks, UI, runtime config wiring, and platform styling live in the relevant app.

## Next.js version

**This is NOT the Next.js you know.** Next 16 lives in `apps/web`. APIs, conventions, and file layout may differ from training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing routing/metadata/caching code, and heed deprecation notices. Notably: middleware lives in `apps/web/proxy.ts` (not `middleware.ts`), and dynamic-route `params` is a `Promise` you must `await`.

## Expo / React Native version

The mobile app lives in `apps/mobile` and uses Expo SDK 54, Expo Router, React Native 0.81, Clerk Expo, TanStack Query, and NativeWind. It requires a development build for native modules such as Clerk secure-store; do not assume Expo Go is enough. Device testing needs a LAN IP or tunnel for the backend, not `localhost`.

## Data layer

Four layers, strictly separated:

1. **`packages/core/src/api/*.ts`** - one module per domain (`tournaments`, `trainings`, `users`, ...). Each function is a one-liner over the typed helpers in `packages/core/src/api/client.ts`: `apiGet` / `apiPost` / `apiPut` / `apiPatch` / `apiDelete`.
   - Authed calls take `token: string | null | undefined` as the **first** argument and pass `requireToken(token)` to the helper. Public calls omit the token.
   - `packages/core/src/api/client.ts` is the single fetch boundary: timeout with NaN-guarded default (8000ms), trailing-slash-safe URL join, envelope type guard, and `ApiError`.
   - Backend envelope shape is `{ status, message, data }`; `request()` unwraps `data` on `status === "SUCCESS"` and throws `ApiError` otherwise.
   - Core never reads `NEXT_PUBLIC_*` or `EXPO_PUBLIC_*` directly. Host apps inject runtime config with `setApiConfig({ baseUrl, timeoutMs })` from `apps/web/lib/api-init.ts` and `apps/mobile/lib/core-init.ts`.

2. **`packages/core/src/queries/*.ts`** - pure query-key factories and optimistic helpers.
   - Query keys come only from `packages/core/src/queries/keys.ts`. Never inline a raw array. Add a new key to the factory.
   - `optimistic()` and its pure helpers live here. The mutation failure notifier is injected per app with `setMutationNotifier`.

3. **`apps/*/data/queries/*.ts`** - app-specific React Query hooks wrapping the core api functions.
   - Web hooks use `@clerk/nextjs`; mobile hooks use `@clerk/clerk-expo`.
   - Get the token inside the `queryFn` / `mutationFn`: `async () => fn(await getToken(), ...)` via the app's `useAuth()`.
   - `staleTime: 30_000` is the default; `enabled` guards until required params are ready, and until `isLoaded && isSignedIn` for authed queries.
   - Mutations invalidate via broad `*Root` keys (for example `queryKeys.myTrainingsRoot`, `queryKeys.userRoot`). These prefix-match every related key and are intentionally broad. Invalidation runs in `onSettled`, not awaited.

4. **Components/screens** consume the query/mutation hooks. They never import from `packages/core/src/api/*` directly.

## Optimistic updates (mutations)

Every create/update/delete mutation is wired for optimistic UX through the shared `optimistic()` factory in `packages/core/src/queries/optimistic.ts`. Do not hand-roll `onMutate`/`onError`/`onSettled` per hook and do not put an awaited `invalidateQueries` in `onSuccess`.

Spread the factory into mutation options and provide `mutationFn` yourself:

```ts
return useMutation({
  mutationFn: async (payload: UpdateFooRequest) => updateFoo(await getToken(), payload),
  ...optimistic<UpdateFooRequest, Foo>(queryClient, {
    targets: (vars) => [{ key: queryKeys.foo(vars.id), patch: (prev) => (prev ? mergeDefined(prev as Foo, vars) : prev) }],
    invalidate: (vars) => [queryKeys.foosRoot, queryKeys.foo(vars.id)],
  }),
});
```

What the factory does: `onMutate` cancels in-flight queries, snapshots each `targets` cache, and paints the optimistic value; `onError` rolls every snapshot back and fires the app-injected danger notifier; `onSettled` invalidates the `invalidate` keys without awaiting.

Rules:

- Always pass explicit type args: `optimistic<TVars, TData>(...)`. Use `unknown` for `TData` when the hook does not read the response.
- `targets` paint only where a merge is safe and cheap: single-entity caches (`mergeDefined`) and list deletes (`removeById`) / list-row edits (`updateById`). Use reconcile-only for fragile caches keyed by ranges/timezone or computed fan-out.
- `patch` stays pure and side-effect free; colocate cases in `packages/core/src/queries/optimistic.test.ts`.
- Fire-and-close is allowed: callbacks run from the mutation even after the triggering modal/sheet unmounts.
- Paint before slow side effects. If upload/persistence is slow, put it inside `mutationFn` and paint an immediately available preview value.

## Errors and user-facing messages

- `request()` throws `ApiError` with a Spanish, user-safe message.
- To display any caught error, run it through `errorMessage(error)` from `@courtrank/core` / `packages/core/src/lib/errors.ts`.
- Web renders errors with `FormError` from `apps/web/components/modal-shell.tsx`; mobile renders errors with `apps/mobile/components/ui/form-error.tsx`. Gate on `isError` / `error != null`, not on the message being truthy.
- Mutation failures raise a danger toast through `setMutationNotifier`: web wires HeroUI in `apps/web/app/providers.tsx` via `apps/web/data/queries/notify.ts`; mobile wires its native toast in `apps/mobile/app/_layout.tsx` via `apps/mobile/lib/notify.ts`.
- Each app's `QueryClient` sets a last-resort `mutations.onError = console.error` floor so a failure is never fully silent. This is not a substitute for surfacing the error in the UI.

## Shared UI primitives

Reuse these; do not hand-roll equivalents.

### Web

| Need | Use | File |
| --- | --- | --- |
| Page frame | `PageScaffold` | `apps/web/components/page-scaffold.tsx` |
| Form modal chrome | `ModalShell` | `apps/web/components/modal-shell.tsx` |
| Inline validation/submit error | `FormError` | `apps/web/components/modal-shell.tsx` |
| Text input styling | `inputClass` | `apps/web/components/modal-shell.tsx` |
| Destructive confirmation | `ConfirmDialog` | `apps/web/components/confirm-dialog.tsx` |
| Dark gradient hero chrome | `PageHeroFrame` / `PageHero` | `apps/web/components/page-hero.tsx` |
| Space-reserving loading state | `PageSkeleton` | `apps/web/components/page-skeleton.tsx` |
| Empty/error card | `EmptyState` | `apps/web/components/empty-state.tsx` |

### Mobile

Use the NativeWind kit in `apps/mobile/components/ui`: `Screen`, `Card`, `Button`, `Hero`, `FormError`, `EmptyState`, `Skeleton`, `Sheet`, `SegmentedTabs`, `Chip`, and `Toast`. Sheets replace web modals. Use `lucide-react-native` for icons and `react-native-svg` for charts/brackets.

## Spanish labels

All user-visible enum copy lives in `packages/core/src/lib/labels.ts` (`TOURNAMENT_STATUS_LABEL`, `MATCH_STATUS_LABEL`, `PHASE_FORMAT_LABEL`, `JOIN_STATUS_LABEL`, ...) and surface copy in `packages/core/src/lib/surface.ts` (`SURFACE_LABEL`). The UI is Spanish-only; no i18n. Do not inline label strings in components/screens.

Intentional per-context divergences are encoded as separate maps, not silently forked: `TOURNAMENT_STATUS_LABEL` (management copy, DRAFT -> "Borrador") vs `TOURNAMENT_STATUS_LABEL_PUBLIC` (player listings, DRAFT -> "Proximamente"). If copy must diverge by context, add a named map with a comment saying why.

## Layout (load-bearing)

- Web top-level pages render through `PageScaffold`, whose `<main>` frame is `mx-auto w-full max-w-6xl flex-1 px-6 py-10`. This matches the `SiteHeader` container (`max-w-6xl`). Do not introduce other outer widths (`max-w-3xl/4xl/5xl`); narrow inner sections may still cap their own width.
- Web `html` keeps `overflow-y: scroll` + `scrollbar-gutter: stable` (`apps/web/app/globals.css`). Keep it.
- Mobile screens use `Screen` from `apps/mobile/components/ui/screen.tsx` for safe-area + scroll framing. Do not import web layout primitives.
- No layout shift from async UI. Components that appear after auth/data resolves must reserve their space from first paint with skeletons or fixed-height containers. Never `return null` then pop in.

## Resilience routes

Web `apps/web/app/error.tsx`, `apps/web/app/global-error.tsx`, and `apps/web/app/not-found.tsx` exist as client fallbacks with Spanish copy. Loading branches use space-reserving skeletons, not bare "Cargando..." text. Do not add web `loading.tsx` files unless route suspense is intentionally introduced.

## Auth

- `apps/web/proxy.ts` runs `clerkMiddleware` with `createRouteMatcher(["/admin(.*)", "/host(.*)"])`; anonymous visitors to those trees are redirected to sign-in. `/players` and `/tournaments` stay public.
- `apps/mobile` uses Clerk Expo in the root layout and Expo Router guards. Player/tournament detail routes should remain public/deep-linkable where the backend allows it; owner-only tools require a signed-in player.
- Role gating is client + backend: the role comes from `/users/me`, not session claims. The backend authorizes every mutation; client gating is UI-only.

## Metadata / SEO

Client pages cannot export `metadata`, so web follows these rules:

- Root `apps/web/app/layout.tsx` sets `title: { default, template: "%s · CourtRank" }`.
- Each client-page segment has a server `layout.tsx` exporting static `metadata` with title + Spanish description.
- Public dynamic routes (`tournaments/[id]`, `players/[id]`) are thin server `page.tsx` files that export `generateMetadata` (`await params`) and render `_components/*-page-client.tsx`.
- Metadata fetches use `requestForMetadata()` after importing `@/lib/api-init`, not `request()`. On invalid id or fetch error, return fallback metadata; `generateMetadata` must never throw.

## Testing

- Root `pnpm test` runs workspace tests recursively.
- Core and web use Vitest, `node` environment, pure logic only unless a component test is explicitly justified. Tests are colocated as `*.test.ts`.
- Mobile currently uses `tsc -p apps/mobile/tsconfig.json --noEmit` as its `test` script. Add pure tests only when the mobile test harness exists; otherwise keep platform behavior verified manually.
- For runtime config injection, prefer testing the core client with `setApiConfig`/`getApiConfig` instead of module-load env stubbing.

## Tooling & commits

- Biome is the only linter/formatter at the repo root (`pnpm check`, `pnpm lint`, `pnpm format`). ESLint is gone.
- Package manager is pnpm.
- Root scripts delegate to workspaces: `pnpm dev` -> web, `pnpm mobile` -> Expo, `pnpm build` -> web build, `pnpm test` -> recursive workspace tests.
- Conventional commits: subject <= 50 chars, one logical change per commit. End the body with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- The repo may have pre-existing repo-wide Biome CRLF/`.vscode` format diffs in untouched files. Leave them alone; keep your touched files clean.
