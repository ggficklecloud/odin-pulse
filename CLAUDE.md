# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install                  # Install all workspace dependencies
pnpm dev                      # Build shared, then start web (port 3000) and api (port 3001) concurrently
pnpm build                    # Build all packages
pnpm lint                     # Lint all packages (builds shared first)
pnpm typecheck                # Type-check all packages (builds shared first)
pnpm format                   # Format with prettier

# Individual packages
pnpm --filter @odin-pulse/api dev
pnpm --filter @odin-pulse/web dev
```

No test framework is configured yet.

## Architecture

pnpm monorepo with three workspace packages. `packages/shared` must be built before the other two can type-check or lint.

### apps/api — Fastify 5 backend

Entry: `src/server.ts`. Registers route groups and starts a news fetch scheduler on `onReady`.

**Module structure** (`src/modules/<domain>/`):
- **news/** — `NewsService` orchestrates multi-source scraping (7 Chinese financial news sources), writes to Elasticsearch index `finance_news`. `NewsScheduler` runs a configurable loop (default 2 min). Supports keyword/category/source/sentiment search via ES.
- **auth/** — `AuthService` handles email verification code login, password login, and GitHub/Google OAuth. `AuthSessionService` manages Redis-backed sessions via cookies. `MailService` sends verification codes via SMTP. `OAuthService` reads client credentials from the `platform_oauth_setting` PostgreSQL table.
- **short-link/** — `ShortLinkService` generates short URLs with optional custom slugs (via `nanoid`). `ShortLinkRepository` stores links in PostgreSQL (`short_links` table) with visit counting. Redirect endpoint at `/s/:slug`.
- **market/** — `MarketService` fetches stock/crypto/index quotes from iTick API, cached in Redis with 60s TTL. Frontend-only rendering currently (no dedicated API routes registered in server.ts yet).

**Shared libs** (`src/lib/`):
- `postgres.ts` — pg pool singleton with healthcheck
- `redis.ts` — Redis client singleton with healthcheck
- `snowflake.ts` — Snowflake ID generator for short-link IDs

All routes exist in two prefixes: `/api/v1/*` (current) and `/finance/*`, `/auth/*`, `/user/*` (legacy compatibility).

**Config**: `src/config/env.ts` uses Zod to parse and validate all env vars with sensible defaults. No `.env` file is committed — use `apps/api/.env.example` as template.

### apps/web — Next.js 16 frontend

App Router with React 19. All API calls go through `src/lib/api.ts`. Key routes:
- `/` — Landing page with news preview and stats (server-rendered, `force-dynamic`)
- `/news`, `/news/[id]` — News listing and detail
- `/markets` — Stock/crypto/index market dashboard (static, no backend route yet)
- `/short-links` — Short link management (requires auth)
- `/login` — Email code / password / OAuth login
- `/account` — User profile (requires session)
- `/oauth/github-callback`, `/oauth/google-callback` — OAuth redirect handlers

**UI**: Base UI primitives (`@base-ui/react`), Tailwind CSS 4, shadcn-style components in `src/components/ui/`. Navy/Gold color scheme, Poppins (headings) + Open Sans (body), Soft UI Evolution aesthetic. Animations via `framer-motion`.

**Frontend auth pattern**: All authenticated API calls must include `credentials: "include"` to send the session cookie. The `fetchJson` helper in `api.ts` already does this — use it for GET requests. For POST/DELETE, add `credentials: "include"` explicitly to the fetch options.

### packages/shared

Exports shared TypeScript types and constants from `src/news.ts`, `src/auth.ts`, `src/short-link.ts`, `src/market.ts`. Built as JS (not just type-only) so both api and web can consume it.

## Data Infrastructure

| Store | Purpose | Connection |
|-------|---------|------------|
| Elasticsearch | News articles (index: `finance_news`) | `ES_NODE` env var |
| PostgreSQL | Auth + short links (6 tables across 2 DDL files) | `POSTGRES_*` env vars |
| Redis | Session storage + market quote cache | `REDIS_*` env vars |

DDL files: `db/postgres/001_auth.sql`, `db/postgres/002_short_link.sql`. MySQL is no longer used — all relational data is on PostgreSQL.

## Deployment

Push to `main` triggers GitHub Actions on a **self-hosted ARM64 runner**. The workflow writes env files from secrets, then runs `scripts/deploy_remote.sh` which builds Docker images and updates containers via `deploy/compose/docker-compose.prod.yml`.

Production: web on `127.0.0.1:3100`, api on `127.0.0.1:3101`. Nginx reverse-proxies `codego.eu.org` — `/api`, `/finance`, `/s` route to the API container, everything else to web. Both containers join the `hfcloud_net` Docker network.

Required GitHub Secrets: `PROD_API_ENV`, `PROD_WEB_ENV`. Container DNS names should be used in production env (e.g., `api:3101` not `127.0.0.1:3101`).
