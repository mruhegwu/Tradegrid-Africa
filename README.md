# Tradegrid Africa

[![CI](https://github.com/mruhegwu/Tradegrid-Africa/actions/workflows/ci.yml/badge.svg)](https://github.com/mruhegwu/Tradegrid-Africa/actions/workflows/ci.yml)
[![CD](https://github.com/mruhegwu/Tradegrid-Africa/actions/workflows/cd.yml/badge.svg)](https://github.com/mruhegwu/Tradegrid-Africa/actions/workflows/cd.yml)
[![Lint](https://github.com/mruhegwu/Tradegrid-Africa/actions/workflows/lint.yml/badge.svg)](https://github.com/mruhegwu/Tradegrid-Africa/actions/workflows/lint.yml)

> Connecting traders across the African continent — production-grade monorepo.

---

## 📁 Repository Structure

```
.
├── .github/
│   └── workflows/
│       ├── ci.yml          # Install → Lint → Test → Build
│       ├── cd.yml          # Docker build/push → Deploy to staging
│       └── lint.yml        # ESLint + Prettier + Commitlint
│
├── apps/
│   ├── web/                # Next.js 15 frontend
│   └── api/                # Node.js / Express REST API
│
├── packages/
│   ├── ui/                 # Shared React component library
│   ├── config/             # Shared ESLint / Prettier config
│   └── utils/              # Shared utility functions
│
├── infrastructure/
│   ├── docker/             # Dockerfiles (web + api)
│   ├── terraform/          # IaC (AWS starter)
│   └── scripts/            # bootstrap.sh, deploy.sh
│
├── tests/                  # Global test suites (structure smoke tests)
│
├── .env.example            # Environment variable template
├── docker-compose.yml      # Local development stack
├── turbo.json              # Turborepo pipeline config
└── package.json            # Root workspace manifest
```

---

## 🚀 Quick Start

### Prerequisites

| Tool    | Minimum Version |
| ------- | --------------- |
| Node.js | 18.x            |
| npm     | 9.x             |
| Docker  | 24.x            |

### 1. Bootstrap your environment

```bash
# Clone the repository
git clone https://github.com/mruhegwu/Tradegrid-Africa.git
cd Tradegrid-Africa

# Run the bootstrap script (copies .env, installs deps, sets up hooks)
bash infrastructure/scripts/bootstrap.sh
```

### 2. Fill in environment variables

```bash
# Edit the generated .env with real values
vim .env
```

See `.env.example` for all available variables.

### 3. Start the full local stack

```bash
# Option A – using Docker Compose (recommended)
docker compose up

# Option B – using Turborepo dev server
npm run dev
```

| Service       | URL                          |
| ------------- | ---------------------------- |
| Web (Next.js) | http://localhost:3000        |
| API (Express) | http://localhost:4000        |
| API Health    | http://localhost:4000/health |
| PostgreSQL    | localhost:5432               |
| Redis         | localhost:6379               |

---

## 🛠️ Development Scripts

Run from the repository root:

| Command                | Description                  |
| ---------------------- | ---------------------------- |
| `npm run dev`          | Start all apps in watch mode |
| `npm run build`        | Build all apps and packages  |
| `npm run test`         | Run all test suites          |
| `npm run lint`         | Lint all workspaces          |
| `npm run format`       | Auto-format with Prettier    |
| `npm run format:check` | Check formatting (CI)        |

---

## 🔄 CI/CD

### Continuous Integration (`ci.yml`)

Triggered on every push to `main` and all pull requests:

1. **Install** – `npm ci` with dependency caching
2. **Lint** – ESLint + Prettier format check (runs in parallel with Test)
3. **Test** – Jest test suites across all workspaces (runs in parallel with Lint)
4. **Build** – Turborepo builds all packages and apps (after Lint + Test pass)

### Continuous Delivery (`cd.yml`)

Triggered on push to `main` (after CI passes):

1. **Docker Build & Push** – multi-stage builds for `web` and `api`, pushed to GHCR
2. **Deploy to Staging** – runs `infrastructure/scripts/deploy.sh`

### Lint (`lint.yml`)

Standalone lint workflow with ESLint, Prettier, and commitlint checks.
Blocks merges if any lint rule fails.

---

## 🐳 Docker

### Build images locally

```bash
# Web
docker build -f infrastructure/docker/Dockerfile.web -t tradegrid-africa/web:local .

# API
docker build -f infrastructure/docker/Dockerfile.api -t tradegrid-africa/api:local .
```

### Full stack via Compose

```bash
docker compose up --build
docker compose down -v   # tear down + remove volumes
```

---

## 🧪 Testing

```bash
# All workspaces
npm run test

# Specific workspace
npm run test --workspace=apps/api

# With coverage
npm run test -- --coverage
```

---

## 🔐 Required GitHub Secrets

| Secret         | Description                                 |
| -------------- | ------------------------------------------- |
| `GITHUB_TOKEN` | Auto-provided by GitHub Actions (GHCR push) |
| `JWT_SECRET`   | JWT signing secret for the API              |

> Add additional cloud secrets (AWS, GCP, etc.) as your infrastructure grows.

---

## 🌐 API Reference

Base URL: `http://localhost:4000`

### Health

| Method | Path      | Auth | Description          |
| ------ | --------- | ---- | -------------------- |
| GET    | `/health` | —    | Service health check |

### Auth

| Method | Path                    | Auth   | Description          |
| ------ | ----------------------- | ------ | -------------------- |
| POST   | `/api/v1/auth/register` | —      | Create a new account |
| POST   | `/api/v1/auth/login`    | —      | Obtain a JWT         |
| GET    | `/api/v1/auth/me`       | Bearer | Get the current user |

### Listings

| Method | Path                   | Auth            | Description                                |
| ------ | ---------------------- | --------------- | ------------------------------------------ |
| GET    | `/api/v1/listings`     | —               | List active listings (paginated)           |
| GET    | `/api/v1/listings/:id` | —               | Get a single listing                       |
| POST   | `/api/v1/listings`     | Bearer (seller) | Create a listing                           |
| PATCH  | `/api/v1/listings/:id` | Bearer (owner)  | Update a listing                           |
| DELETE | `/api/v1/listings/:id` | Bearer (owner)  | Soft-delete (seller) / hard-delete (admin) |

#### Listing query parameters

| Param       | Type                     | Description                             |
| ----------- | ------------------------ | --------------------------------------- |
| `page`      | number                   | Page number (default: 1)                |
| `limit`     | number                   | Items per page (1–100, default: 20)     |
| `category`  | string                   | Filter by category                      |
| `condition` | `new\|used\|refurbished` | Filter by condition                     |
| `minPrice`  | number                   | Minimum price                           |
| `maxPrice`  | number                   | Maximum price                           |
| `search`    | string                   | Full-text search on title & description |

---

## 📦 Monorepo (Turborepo)

This project uses [Turborepo](https://turbo.build/repo) for:

- **Parallel builds** across workspaces
- **Incremental computation** – only rebuilds what changed
- **Shared pipeline config** via `turbo.json`

### Upgrade path

| Scale          | Tool                                     |
| -------------- | ---------------------------------------- |
| Current        | Turborepo (npm workspaces)               |
| Growing team   | Add Nx for more granular task scheduling |
| Micro-frontend | Module Federation + Turborepo            |

---

## 🏗️ Infrastructure (Terraform)

Starter Terraform configuration in `infrastructure/terraform/`.

```bash
cd infrastructure/terraform
terraform init
terraform plan -var="environment=staging"
terraform apply
```

> The remote state backend is commented out by default.
> Uncomment and configure the S3 backend before deploying to production.

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full guide including commit conventions, PR process, and style guide.

---

## 📄 License

[MIT](./LICENSE)

---

## 📋 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a history of notable changes.
