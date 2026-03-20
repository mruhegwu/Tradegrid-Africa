#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy.sh – Simulated deployment script (replace with real logic)
# Usage: ENVIRONMENT=staging ./infrastructure/scripts/deploy.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ENVIRONMENT="${ENVIRONMENT:-staging}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
REGISTRY="${DOCKER_REGISTRY:-ghcr.io}"
ORG="${GITHUB_REPOSITORY_OWNER:-mruhegwu}"

log() { echo "[deploy] $*"; }

log "Deploying to environment: ${ENVIRONMENT}"
log "Image tag: ${IMAGE_TAG}"

case "$ENVIRONMENT" in
  staging)
    log "Pulling images..."
    docker pull "${REGISTRY}/${ORG}/tradegrid-africa-web:${IMAGE_TAG}"
    docker pull "${REGISTRY}/${ORG}/tradegrid-africa-api:${IMAGE_TAG}"
    log "Restarting services..."
    docker compose pull
    docker compose up -d --no-build
    log "Staging deployment complete."
    ;;
  production)
    log "Production deployment – ensure you have run smoke tests first."
    # Add production deploy steps here (e.g., kubectl apply, ECS task update, etc.)
    log "Production deployment complete."
    ;;
  *)
    echo "ERROR: Unknown environment '${ENVIRONMENT}'. Use 'staging' or 'production'." >&2
    exit 1
    ;;
esac
