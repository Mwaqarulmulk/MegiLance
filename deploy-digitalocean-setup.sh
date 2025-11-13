#!/bin/bash
# MegiLance DigitalOcean Frontend Deployment Setup
# Uses DigitalOcean CLI (doctl) for direct Git-connected deployment

set -e

echo "======================================"
echo "MegiLance DigitalOcean Frontend Setup"
echo "======================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
APP_NAME="megilance-frontend"
REPO_URL="https://github.com/ghulam-mujtaba5/MegiLance"
BRANCH="main"
REGION="nyc3"  # New York - closest to most users

echo -e "${GREEN}Step 1: Checking doctl installation...${NC}"
if ! command -v doctl &> /dev/null; then
    echo "Installing doctl..."
    
    # Detect OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        cd ~
        wget https://github.com/digitalocean/doctl/releases/download/v1.104.0/doctl-1.104.0-linux-amd64.tar.gz
        tar xf ~/doctl-1.104.0-linux-amd64.tar.gz
        sudo mv ~/doctl /usr/local/bin
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install doctl
    else
        echo "Please install doctl manually: https://docs.digitalocean.com/reference/doctl/how-to/install/"
        exit 1
    fi
fi

echo -e "${GREEN}Step 2: Authenticating with DigitalOcean...${NC}"
echo "Please enter your DigitalOcean API token:"
echo "(Get it from: https://cloud.digitalocean.com/account/api/tokens)"
read -s DO_TOKEN

doctl auth init -t $DO_TOKEN

echo -e "${GREEN}Step 3: Creating App Platform app with Git deployment...${NC}"

# Create app spec
cat > app-spec.yaml << 'APPSPEC'
name: megilance-frontend
region: nyc3

services:
  - name: frontend
    github:
      repo: ghulam-mujtaba5/MegiLance
      branch: main
      deploy_on_push: true
    source_dir: /frontend
    dockerfile_path: frontend/Dockerfile
    
    # Build configuration
    build_command: npm run build
    
    # Environment variables
    envs:
      - key: NODE_ENV
        value: production
      - key: NEXT_TELEMETRY_DISABLED
        value: "1"
      - key: NEXT_PUBLIC_API_URL
        value: ${BACKEND_URL}
        scope: RUN_AND_BUILD_TIME
    
    # Resource allocation (optimized for free tier)
    instance_count: 1
    instance_size_slug: basic-xxs
    
    # HTTP configuration
    http_port: 3000
    
    # Health check
    health_check:
      http_path: /
      initial_delay_seconds: 60
      period_seconds: 30
      timeout_seconds: 5
      success_threshold: 1
      failure_threshold: 3
    
    # Routes
    routes:
      - path: /

# Alerts
alerts:
  - rule: DEPLOYMENT_FAILED
  - rule: DEPLOYMENT_LIVE
APPSPEC

echo -e "${GREEN}Step 4: Deploying app...${NC}"
doctl apps create --spec app-spec.yaml

# Wait a moment for app to be created
sleep 5

# Get app ID
APP_ID=$(doctl apps list --format ID --no-header | head -n 1)

echo ""
echo -e "${GREEN}App created with ID: $APP_ID${NC}"

echo -e "${GREEN}Step 5: Configuring GitHub integration...${NC}"
echo ""
echo "To enable automatic deployments on every push:"
echo "1. Go to: https://cloud.digitalocean.com/apps/$APP_ID/settings"
echo "2. Click 'GitHub' in the source section"
echo "3. Authorize DigitalOcean to access your repository"
echo "4. Select repository: ghulam-mujtaba5/MegiLance"
echo "5. Select branch: main"
echo "6. Enable 'Autodeploy' option"
echo ""

echo -e "${GREEN}Step 6: Getting app URL...${NC}"
sleep 10
APP_URL=$(doctl apps list --format DefaultIngress --no-header | head -n 1)

echo ""
echo "======================================"
echo "Deployment Complete!"
echo "======================================"
echo ""
echo "App URL: https://$APP_URL"
echo "App ID: $APP_ID"
echo ""
echo "Useful commands:"
echo "  View app info:    doctl apps get $APP_ID"
echo "  View logs:        doctl apps logs $APP_ID --type run"
echo "  List deployments: doctl apps list-deployments $APP_ID"
echo "  Trigger deploy:   doctl apps create-deployment $APP_ID"
echo "  Update app:       doctl apps update $APP_ID --spec app-spec.yaml"
echo ""
echo "Environment variables to set:"
echo "  doctl apps update $APP_ID --spec app-spec.yaml"
echo ""
