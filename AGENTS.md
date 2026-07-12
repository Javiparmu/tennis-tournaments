## CodeGraph

When answering structural or codebase questions, use CodeGraph before broad filesystem searches. This is a hard ordering rule for repo maps, architecture, call flow, dependencies, symbol references, impact analysis, and "how does X work" questions.

Required order for structural/codebase questions:

1. Resolve the project root with `git rev-parse --show-toplevel || pwd`.
2. Confirm the root is a real project/workspace. Do not initialize CodeGraph in `$HOME`, temporary directories, or non-project folders.
3. Check for `<project-root>/.codegraph/` before broad Read/Glob/Grep exploration.
4. If `.codegraph/` is missing and CodeGraph is enabled/available, run `gentle-ai codegraph init --cwd <project-root>` once, then use the `codegraph_explore` MCP tool or `codegraph explore "..."`.
5. Missing `.codegraph/` is the trigger to initialize, not a reason to skip CodeGraph.
6. Only fall back to normal filesystem tools after CodeGraph init or use fails, and briefly explain the fallback.

<!-- BEGIN:project-rules -->
## What This Project Is

CourtRank is a pnpm monorepo for tennis tournaments:

- **Players** browse tournaments, sign up, follow brackets/standings, and get a gamified profile with Elo-style rating, achievements, calendar, trainings, rackets, and stringing history.
- **Hosts (clubs)** create and manage tournaments from the web app. Club accounts are **provisioned manually by the platform operator**; there is no self-service club creation, and club-facing CTAs point to the contact mailto in `packages/core/src/lib/contact.ts`.
- **Admins** use the web-only `/admin` area to review club contact requests and provision clubs.

## Monorepo Map

- `apps/web` - Next.js 16 web app (`@courtrank/web`). Includes club/host/admin flows, public tournament/player pages, Clerk Next auth, HeroUI, Tailwind, and web-only query hooks.
- `apps/mobile` - Expo SDK 54 + React Native player companion (`@courtrank/mobile`). Includes player-first tournament browsing, join/withdraw flows, ranking, own profile tools, Clerk Expo auth, NativeWind, and mobile-only query hooks.
- `packages/core` - framework-agnostic shared package (`@courtrank/core`). Contains models, pure lib helpers, API domain modules, API runtime config, query keys, and optimistic cache helpers. It must not depend on React, Next, Expo, Clerk, HeroUI, or NativeWind.

## Stack

- **Package manager:** pnpm workspaces. Run commands from the repo root unless a workspace-specific instruction says otherwise.
- **Web:** Next.js 16. Use the in-repo docs under `node_modules/next/dist/docs/` before writing routing, metadata, proxy, or caching code. This version differs from older Next.js assumptions.
- **Web UI:** HeroUI React, with docs in `.heroui-docs/react`.
- **Mobile:** React Native + Expo SDK 54, Expo Router, Clerk Expo with secure-store token cache, TanStack Query, NativeWind, EAS for builds/updates.
- **Auth:** Clerk. Use the agent skills under `.agents/skills/clerk*` when touching setup, Next.js patterns, organizations, webhooks, or testing.

## Working In This Repo

- **Conventions and rules:** see `.claude/rules/conventions.md` for data-layer boundaries, query keys, shared UI, labels, layout, resilience, metadata, testing, and commits.
- **Local and manual testing:** see `.claude/rules/local-testing.md` for backend contract, env vars, seeded accounts, web smoke checks, and mobile device checks.
- **Scoped agent files:** also read the nearest `AGENTS.md` in `apps/web`, `apps/mobile`, or `packages/core` before editing there.
- **Root scripts:** `pnpm dev` runs web, `pnpm mobile` starts Expo, `pnpm build` builds web, `pnpm test` fans out tests, and `pnpm lint` runs Biome across the repo.
<!-- END:project-rules -->
