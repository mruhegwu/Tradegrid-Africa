# Contributing to Tradegrid Africa

Thank you for your interest in contributing! This guide will help you get up and running
quickly.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Conventions](#commit-conventions)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Style Guide](#style-guide)

---

## Code of Conduct

Be respectful. We are building for a diverse, pan-African community. Harassment,
discrimination, or exclusionary behaviour will not be tolerated.

---

## Getting Started

```bash
# 1. Fork the repository on GitHub, then clone your fork
git clone https://github.com/<your-username>/Tradegrid-Africa.git
cd Tradegrid-Africa

# 2. Bootstrap (installs deps + sets up git hooks)
bash infrastructure/scripts/bootstrap.sh

# 3. Copy and fill in your environment variables
cp .env.example .env
vim .env
```

---

## Development Workflow

```bash
# Start all services in watch mode
npm run dev

# In a separate terminal, start the local Docker stack (postgres, redis)
docker compose up db redis
```

### Useful commands

| Command          | Description                               |
| ---------------- | ----------------------------------------- |
| `npm run dev`    | Start all apps concurrently in watch mode |
| `npm run build`  | Production build (all workspaces)         |
| `npm run test`   | Run all tests                             |
| `npm run lint`   | ESLint across all workspaces              |
| `npm run format` | Auto-format with Prettier                 |

---

## Commit Conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/). Your commit
message must match the pattern:

```
<type>(<scope>): <subject>
```

### Allowed types

| Type       | When to use                          |
| ---------- | ------------------------------------ |
| `feat`     | A new feature                        |
| `fix`      | A bug fix                            |
| `docs`     | Documentation only                   |
| `style`    | Formatting, missing semicolons, etc. |
| `refactor` | Code restructuring (no feature/fix)  |
| `perf`     | Performance improvement              |
| `test`     | Adding or fixing tests               |
| `build`    | Build system changes                 |
| `ci`       | CI/CD changes                        |
| `chore`    | Maintenance tasks                    |
| `revert`   | Reverting a previous commit          |

### Examples

```bash
git commit -m "feat(api): add listings search endpoint"
git commit -m "fix(web): correct currency formatting on listings page"
git commit -m "docs: update contributing guide"
git commit -m "test(api): add auth integration tests"
```

> **Tip:** The `commit-msg` git hook will reject non-conforming messages automatically.

---

## Pull Request Process

1. **Branch** off `main` using a descriptive name:

   ```bash
   git checkout -b feat/listing-search
   ```

2. **Write tests** for your changes (see [Testing](#testing)).

3. **Ensure CI passes** locally before pushing:

   ```bash
   npm run lint && npm run test && npm run build
   ```

4. **Push** and open a PR against `main`.

5. **Fill in the PR template** — describe what changed and why.

6. **Address review comments** promptly.

PRs that break existing tests, skip validation, or don't follow commit conventions will not be
merged.

---

## Project Structure

```
apps/
  web/        # Next.js 15 frontend (TypeScript)
  api/        # Express REST API (TypeScript)
packages/
  ui/         # Shared React components
  config/     # Shared ESLint base config
  utils/      # Shared utility functions
infrastructure/
  docker/     # Dockerfiles
  terraform/  # IaC (AWS)
  scripts/    # bootstrap.sh, deploy.sh
tests/        # Global smoke tests
```

---

## Testing

```bash
# Run all tests
npm run test

# Run a specific workspace
npm run test --workspace=apps/api

# With coverage
npm run test -- --coverage
```

Write tests in the `src/__tests__/` directory of the relevant workspace. Follow the naming
convention `<feature>.test.ts`.

---

## Style Guide

- **TypeScript** everywhere — no plain `.js` in `apps/` or `packages/`.
- **Prettier** for formatting — run `npm run format` before committing.
- **ESLint** for code quality — run `npm run lint` to check.
- **No `any`** — use proper types; flag unavoidable uses with a comment explaining why.
- Use **named exports** over default exports for library code in `packages/`.
- Keep functions **small and focused** — one responsibility per function.
