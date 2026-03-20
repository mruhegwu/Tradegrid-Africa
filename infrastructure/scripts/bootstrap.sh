#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# bootstrap.sh – One-time local-environment setup script
# Usage: ./infrastructure/scripts/bootstrap.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[bootstrap]${NC} $*"; }
warn() { echo -e "${YELLOW}[bootstrap]${NC} $*"; }

# ── 1. Check prerequisites ────────────────────────────────────────────────────
log "Checking prerequisites..."

for cmd in node npm docker; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "ERROR: '$cmd' is required but not installed. Aborting." >&2
    exit 1
  fi
done

NODE_VER=$(node -e "process.stdout.write(process.versions.node)")
REQUIRED_MAJOR=18
ACTUAL_MAJOR=$(echo "$NODE_VER" | cut -d. -f1)
if [ "$ACTUAL_MAJOR" -lt "$REQUIRED_MAJOR" ]; then
  echo "ERROR: Node.js >= ${REQUIRED_MAJOR} required (found ${NODE_VER})" >&2
  exit 1
fi

log "Node $(node -v)  |  npm $(npm -v)  |  Docker $(docker --version | awk '{print $3}' | sed 's/,$//')"

# ── 2. Copy .env if missing ───────────────────────────────────────────────────
if [ ! -f .env ]; then
  cp .env.example .env
  warn ".env created from .env.example – please fill in real values before running."
fi

# ── 3. Install dependencies ───────────────────────────────────────────────────
log "Installing dependencies..."
npm install

# ── 4. Set up husky hooks ────────────────────────────────────────────────────
log "Setting up git hooks..."
npm run prepare 2>/dev/null || true

log "Bootstrap complete. Run 'npm run dev' to start development servers."
