#!/usr/bin/env bash
# deploy_compose.sh <repo_dir> <branch>
# Pull latest from git and restart docker-compose stack (assumes docker & docker-compose installed)
set -euo pipefail
REPO_DIR="${1:-$(pwd)}"
BRANCH="${2:-main}"

echo "Deploying in ${REPO_DIR} from branch ${BRANCH}"
cd "$REPO_DIR"

# Ensure correct branch
git fetch --all --tags --prune
git checkout "$BRANCH"
git pull --rebase origin "$BRANCH"

# Optional: run migrations or build steps for backend services
if [ -f "./backend/requirements.txt" ]; then
  echo "(Optional) Backend deps may need install inside container image build"
fi

# Pull images defined in compose (if using image tags) then rebuild local images
if [ -f docker-compose.yml ] || [ -f docker-compose.yaml ]; then
  echo "Using docker compose to build and bring up services"
  # If using Docker Compose v2 (docker compose) prefer that
  if command -v docker-compose >/dev/null 2>&1; then
    docker-compose pull || true
    docker-compose build --pull --no-cache || true
    docker-compose up -d --remove-orphans
  else
    docker compose pull || true
    docker compose build --pull --no-cache || true
    docker compose up -d --remove-orphans
  fi
else
  echo "No docker-compose.yml found in repository root"
  exit 1
fi

echo "Deployment finished"
