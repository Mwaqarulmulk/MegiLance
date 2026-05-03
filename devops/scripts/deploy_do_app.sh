#!/usr/bin/env bash
# deploy_do_app.sh - Deploy frontend to DigitalOcean App Platform
# Usage: bash devops/scripts/deploy_do_app.sh <DO_API_TOKEN>
# Or: export DO_API_TOKEN=... && bash devops/scripts/deploy_do_app.sh

set -e

TOKEN="${1:-${DO_API_TOKEN}}"
if [ -z "$TOKEN" ]; then
  echo "Error: DigitalOcean API token required as argument or DO_API_TOKEN env var"
  exit 1
fi

REPO_ROOT="${PWD}"
SPEC_FILE="${REPO_ROOT}/devops/do-app-spec.yaml"
APP_NAME="megilance-frontend"
CONTEXT="megilance-do"

if [ ! -f "$SPEC_FILE" ]; then
  echo "Error: $SPEC_FILE not found"
  exit 1
fi

# Authenticate
echo "Authenticating doctl..."
doctl auth init --access-token "$TOKEN" --context "$CONTEXT" 2>/dev/null || true
doctl auth switch --context "$CONTEXT"

# Find or create App
echo "Looking for existing app '$APP_NAME'..."
APP_ID=$(doctl apps list --format Name,ID --no-header 2>/dev/null | grep "^${APP_NAME} " | awk '{print $NF}' || echo "")

if [ -n "$APP_ID" ]; then
  echo "Found app: $APP_ID. Updating spec..."
  doctl apps update "$APP_ID" --spec "$SPEC_FILE" 2>/dev/null || echo "Update may have failed; will retry..."
else
  echo "Creating new app from spec..."
  OUT=$(doctl apps create --spec "$SPEC_FILE" --format ID --no-header 2>/dev/null)
  APP_ID="${OUT}"
  if [ -z "$APP_ID" ]; then
    echo "Error: Failed to create app. Ensure GitHub repo is accessible."
    exit 1
  fi
  echo "Created app: $APP_ID"
fi

# Poll deployment
echo "Polling deployment status..."
POLL_COUNT=0
MAX_POLLS=40
DEPLOYMENT_ID=""

while [ $POLL_COUNT -lt $MAX_POLLS ]; do
  DEPS=$(doctl apps deployments list "$APP_ID" --format ID,Phase --no-header 2>/dev/null | head -1)
  if [ -z "$DEPS" ]; then
    echo "Waiting for deployment to appear..."
    sleep 5
    POLL_COUNT=$((POLL_COUNT + 1))
    continue
  fi
  
  DEPLOYMENT_ID=$(echo "$DEPS" | awk '{print $1}')
  STATUS=$(echo "$DEPS" | awk '{print $NF}')
  
  echo "Deployment $DEPLOYMENT_ID: $STATUS"
  
  if [ "$STATUS" = "ACTIVE" ]; then
    echo "✓ Deployment succeeded!"
    APP_URL=$(doctl apps get "$APP_ID" --format DefaultIngress --no-header 2>/dev/null || echo "https://app.ondigitalocean.com/app/$APP_ID")
    echo "Frontend URL: $APP_URL"
    exit 0
  fi
  
  if [ "$STATUS" = "ERROR" ]; then
    echo "✗ Deployment failed. Fetching logs..."
    LOG_FILE="do_deploy_logs_$(date +%s).log"
    doctl apps logs get --app-id "$APP_ID" --deployment-id "$DEPLOYMENT_ID" 2>/dev/null > "$LOG_FILE" || true
    head -100 "$LOG_FILE"
    echo "Full logs saved to $LOG_FILE"
    exit 1
  fi
  
  sleep 15
  POLL_COUNT=$((POLL_COUNT + 1))
done

echo "Deployment timed out after ~10 minutes. Check app dashboard: https://cloud.digitalocean.com/apps/$APP_ID"
exit 1
