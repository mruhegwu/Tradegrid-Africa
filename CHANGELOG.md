# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added

- **API** – JWT-based authentication with `POST /api/v1/auth/register` and
  `POST /api/v1/auth/login`
- **API** – `GET /api/v1/auth/me` to retrieve the current user (requires Bearer token)
- **API** – Listings CRUD: `GET`, `POST`, `PATCH`, `DELETE /api/v1/listings`
  - Seller-only create/update/delete
  - Pagination, category/condition/price/text filtering
- **API** – Centralised error-handling middleware with Zod validation support
- **API** – Rate limiting (200 req / 15 min) via `express-rate-limit`
- **API** – Request ID middleware (`X-Request-Id` header on every response)
- **API** – Structured logging with `pino` (pretty-print in dev, JSON in production)
- **API** – In-memory store with a typed `InMemoryStore<T>` class (DB-ready interface)
- **API** – 28 integration tests covering auth and listings routes
- **Frontend** – Listings page (`/listings`) with server-side rendering
- **Frontend** – `ListingCard` component
- **Frontend** – API client (`src/lib/api.ts`) for fetching listings
- **Frontend** – Design tokens and full CSS component library
- **packages/utils** – Unit tests for all utility helpers

---

## [0.1.0] – 2026-03-20

### Added

- Monorepo scaffold with **Turborepo** and **npm workspaces**
- `apps/web` – Next.js 15 frontend skeleton
- `apps/api` – Express + TypeScript API skeleton with `/health` endpoint
- `packages/ui` – Shared React component library (Button)
- `packages/config` – Shared ESLint base configuration
- `packages/utils` – Shared utility functions (`formatCurrency`, `truncate`, `capitalise`,
  `sleep`)
- `infrastructure/docker` – Multi-stage Dockerfiles for web and API
- `infrastructure/terraform` – AWS provider starter with variables and outputs
- `infrastructure/scripts` – `bootstrap.sh` and `deploy.sh`
- `docker-compose.yml` – Full local stack (web, api, postgres, redis)
- GitHub Actions: `ci.yml`, `cd.yml`, `lint.yml`
- Pre-commit hooks with Husky + lint-staged
- Commit message linting with commitlint (Conventional Commits)
