<!-- BEGIN:project-rules -->
## What this project is

A web app where **clubs register tennis tournaments** and **players sign up to play** in them.

- **Players** browse tournaments, sign up, and get a gamified experience: an Elo-style rating that reflects tournament placement, plus a profile with score, achievements, and practical tools.
- **Hosts (clubs)** use a club account to create and manage tournaments. Club accounts are **provisioned manually by the platform operator** — there is no self-service club creation; club-facing CTAs point to the contact mailto in `lib/contact.ts`.

## Stack

- **Framework:** Next.js 16 — use the in-repo docs under `node_modules/next/dist/docs/` (this version has breaking changes vs. older training data).
- **UI:** HeroUI React — patterns and components in `.heroui-docs/react`.
- **Auth:** Clerk — use the agent skills under `.agents/skills/clerk*` (setup, nextjs-patterns, orgs, webhooks) as needed.

## Working in this repo

- **Conventions and rules:** see @.claude/rules/conventions.md — the established patterns for the data layer, query keys, shared UI, labels, layout, resilience, metadata, testing, and commits. Follow them.
- **Local & manual testing** (backend contract, seeded accounts, admin access): see `.claude/rules/local-testing.md`.
<!-- END:project-rules -->
