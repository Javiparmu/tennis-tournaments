# Project conventions (rules)

These are the established patterns. Follow them; when you add a feature, extend the canonical module rather than re-rolling a variant. Each rule names the file that is the source of truth.

## Next.js version

**This is NOT the Next.js you know.** Next 16 — APIs, conventions, and file layout may differ from training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing routing/metadata/caching code, and heed deprecation notices. Notably: middleware lives in `proxy.ts` (not `middleware.ts`), and dynamic-route `params` is a `Promise` you must `await`.

## Data layer

Three layers, strictly separated:

1. **`data/api/*.ts`** — one module per domain (`tournaments`, `trainings`, `users`, …). Each function is a one-liner over the typed helpers in `data/api/client.ts`: `apiGet` / `apiPost` / `apiPut` / `apiPatch` / `apiDelete`.
   - Authed calls take `token: string | null | undefined` as the **first** argument and pass `requireToken(token)` to the helper. Public calls omit the token (no `Authorization` header).
   - `data/api/client.ts` is the single fetch boundary: timeout with NaN-guarded default (8000ms), trailing-slash-safe URL join, envelope type guard, and `ApiError` (Spanish message extracted from the backend envelope, plus `status`). Do not fetch outside this module.
   - Backend envelope shape is `{ status, message, data }`; `request()` unwraps `data` on `status === "SUCCESS"` and throws `ApiError` otherwise.

2. **`data/queries/*.ts`** — `"use client"` React Query hooks wrapping the api functions.
   - Get the token inside the `queryFn` / `mutationFn`: `async () => fn(await getToken(), …)` via `useAuth()`.
   - `staleTime: 30_000` is the default; `enabled` guards until required params (and `isLoaded && isSignedIn` for authed queries) are ready.
   - **Query keys come only from the `queryKeys` factory in `data/queries/keys.ts`.** Never inline a raw array. Add a new key to the factory.
   - Mutations invalidate via the **broad `*Root` keys** (e.g. `queryKeys.myTrainingsRoot`, `queryKeys.userRoot`). These prefix-match every related key and are intentionally broad — do not narrow them. Invalidation runs in `onSettled`, **not** awaited — see **Optimistic updates** below.

3. **Components** consume the query/mutation hooks. They never import from `data/api/*` directly.

## Optimistic updates (mutations)

Every create/update/delete mutation is wired for optimistic UX through the shared `optimistic()` factory in `data/queries/optimistic.ts`. Do not hand-roll `onMutate`/`onError`/`onSettled` per hook and do not put an awaited `invalidateQueries` in `onSuccess` (that blocks the modal on a full refetch after the write already succeeded — the bug this pattern replaced).

Spread the factory into the mutation options and provide `mutationFn` yourself:

```ts
return useMutation({
  mutationFn: async (payload: UpdateFooRequest) => updateFoo(await getToken(), payload),
  ...optimistic<UpdateFooRequest, Foo>(queryClient, {
    targets: (vars) => [{ key: queryKeys.foo(vars.id), patch: (prev) => (prev ? mergeDefined(prev as Foo, vars) : prev) }],
    invalidate: (vars) => [queryKeys.foosRoot, queryKeys.foo(vars.id)],
  }),
});
```

What the factory does: `onMutate` cancels in-flight queries, snapshots each `targets` cache, and paints the optimistic value; `onError` rolls every snapshot back and fires a danger toast via `notifyMutationError`; `onSettled` invalidates the `invalidate` keys **without awaiting** (so `mutateAsync` resolves after one write, not after a refetch).

Rules:
- **Always pass explicit type args** — `optimistic<TVars, TData>(...)`. Omitting them lets contextual inference collapse `TData` and the options fail to type-check. Use `unknown` for `TData` when the hook doesn't read the response (reconcile-only).
- **`targets` — paint only where a merge is safe and cheap:** single-entity caches (`mergeDefined`) and list deletes (`removeById`) / list-row edits (`updateById`), all pure helpers in `optimistic.ts`. A `patch` that returns `previous` unchanged is skipped (nothing snapshotted). Read a value the mutation vars don't carry (e.g. the old username) via `queryClient.getQueryData` inside `targets`.
- **Reconcile-only (no `targets`) for fragile caches:** anything keyed by ranges/timezone (trainings, calendar) or with computed fan-out (match score, join-request decisions). The modal still closes fast and the background refetch fills it in — do **not** hand-splice those.
- **`patch` stays pure** (side-effect free) so it's unit-testable; colocate cases in `optimistic.test.ts`.

**Fire-and-close:** because these callbacks run from the mutation (not the component observer), they still fire after the triggering modal unmounts. So a handler may call `mutate(...)` / start the flow and `onClose()` immediately without awaiting — the paint, rollback, reconcile, and toast all still happen. Keep an awaited `mutateAsync` only when you need the response before closing (e.g. following a server-slugified value to a redirect URL).

**Paint before slow side-effects, never after.** `onMutate` fires when `mutate` is *called*, so if a slow step (an image upload, say) runs before the call, the paint waits on it and stops being instant. Put the slow persistence step *inside* the mutation and paint a local stand-in up front: pass the durable step as a lazy callback the `mutationFn` awaits, and paint an immediately-available preview via a separate optimistic value (a data URL for an image — no revocation, survives unmount). `useUpdateMeMutation` + `profile-edit-modal.tsx` are the reference: the avatar paints from a data URL instantly, the Clerk upload runs in `mutationFn`, and the background refetch swaps in the real CDN URL.

## Errors and user-facing messages

- `request()` throws `ApiError` with a Spanish, user-safe message.
- To display any caught error, run it through `errorMessage(error)` (`lib/errors.ts`) — always returns a string.
- Render it with `<FormError message={…} />` (`components/modal-shell.tsx`), gated on the query/mutation's `isError` / `error != null`, **not** on the message being truthy. Use this for pre-submit validation and for modals that stay open on failure.
- **Mutation failures also raise a danger toast** via `notifyMutationError` (`data/queries/notify.ts`, HeroUI `Toast.Provider` mounted in `app/providers.tsx`). This is the error channel for optimistic **fire-and-close** flows, where the modal is already gone — see **Optimistic updates**. Every mutation gets it through the `optimistic()` factory; do not call it by hand inside a mutation hook.
- The `QueryClient` sets `defaultOptions.mutations.onError = console.error` (`app/providers.tsx`) as a last-resort floor so a failure is never fully silent. This is not a substitute for surfacing the error in the UI.

## Shared UI primitives

Reuse these; do not hand-roll equivalents.

| Need | Use | File |
| --- | --- | --- |
| Page frame (header + `<main>` + footer) | `PageScaffold` | `components/page-scaffold.tsx` |
| Form modal chrome (overlay, backdrop-close, disable-while-submitting) | `ModalShell` | `components/modal-shell.tsx` |
| Inline validation/submit error | `FormError` | `components/modal-shell.tsx` |
| Text input styling | `inputClass` | `components/modal-shell.tsx` |
| Destructive confirmation (replaces `window.confirm`) | `ConfirmDialog` | `components/confirm-dialog.tsx` |
| Dark gradient hero chrome | `PageHeroFrame` / `PageHero` | `components/page-hero.tsx` |
| Space-reserving loading state | `PageSkeleton` | `components/page-skeleton.tsx` |
| Empty/error card | `EmptyState` | `components/empty-state.tsx` |

## Spanish labels

All user-visible enum copy lives in `lib/labels.ts` (`TOURNAMENT_STATUS_LABEL`, `MATCH_STATUS_LABEL`, `PHASE_FORMAT_LABEL`, `JOIN_STATUS_LABEL`, …) and surface copy in `lib/surface.ts` (`SURFACE_LABEL`). The UI is Spanish-only; no i18n. Do not inline label strings in components — import the map.

Intentional per-context divergences are encoded as separate maps, not silently forked: `TOURNAMENT_STATUS_LABEL` (management copy, DRAFT → "Borrador") vs `TOURNAMENT_STATUS_LABEL_PUBLIC` (player listings, DRAFT → "Próximamente"). If copy must diverge by context, add a named map with a comment saying why.

## Layout (load-bearing)

- Every top-level page renders through `PageScaffold`, whose `<main>` frame is `mx-auto w-full max-w-6xl flex-1 px-6 py-10`. This matches the `SiteHeader` container (`max-w-6xl`) so content edges line up across tabs. **Do not introduce other outer widths** (`max-w-3xl/4xl/5xl`); narrow inner sections may still cap their own width.
- `html` keeps `overflow-y: scroll` + `scrollbar-gutter: stable` (`app/globals.css`). Keep it — it stops the centered frame shifting horizontally between short (no-scroll) and tall (scroll) pages. `scrollbar-gutter` alone is not enough because `<html>` has `h-full`.
- **No layout shift from async UI.** Components that appear after auth/data resolves (Clerk `useUser`, React Query) must reserve their space from first paint — render the container at final height with a skeleton inside. Never `return null` then pop in; that shifts content under the cursor and breaks hover states.

## Resilience routes

`app/error.tsx`, `app/global-error.tsx`, and `app/not-found.tsx` exist as client fallbacks (Spanish copy, "Reintentar" → `reset()`). Loading branches use space-reserving skeletons, not bare "Cargando…" text. No `loading.tsx` files (client pages + React Query rarely trigger route suspense).

## Auth

- `proxy.ts` runs `clerkMiddleware` with `createRouteMatcher(["/admin(.*)", "/host(.*)"])` → anonymous visitors to those trees are redirected to sign-in. `/players` and `/tournaments` stay public (shareable).
- Role gating is client + backend: the role comes from `/users/me`, not session claims. The backend authorizes every mutation — client gating is UI-only.

## Metadata / SEO

Client pages cannot export `metadata`, so:

- Root `app/layout.tsx` sets `title: { default, template: "%s · CourtRank" }`.
- Each client-page segment has a server `layout.tsx` exporting static `metadata` (title + Spanish description).
- Public dynamic routes (`tournaments/[id]`, `players/[id]`) are thin server `page.tsx` files that export `generateMetadata` (`await params`) and render `_components/*-page-client.tsx`. Metadata fetches use `requestForMetadata()` (cached, `revalidate: 300`, no token) — **not** `request()` (which is `no-store`). On invalid id or fetch error, return fallback metadata; `generateMetadata` must never throw. Page data still flows through React Query in the client component (no double-fetch in the render path).

## Testing

Vitest, `node` environment, pure logic only (no jsdom / component tests — poor ROI). Tests are colocated as `*.test.ts` next to the module. Run with `pnpm test`; wired into husky **pre-push** (not pre-commit). For code that reads env at module-load (`data/api/client.ts`), exercise it via `vi.resetModules()` + `vi.stubEnv` + dynamic `import()`.

## Tooling & commits

- **Biome is the only linter/formatter** (`pnpm check`, `pnpm lint`, `pnpm format`). ESLint is gone.
- Package manager is **pnpm**.
- Conventional commits: subject ≤ 50 chars, one logical change per commit. End the body with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- The repo has pre-existing repo-wide Biome CRLF/`.vscode` format diffs in untouched files — leave them alone; keep your touched files clean.
