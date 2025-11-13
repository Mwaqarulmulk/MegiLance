#!/bin/bash
# MegiLance Oracle Cloud Always Free Tier Deployment Setup
# This script sets up the Oracle Cloud VM for backend + AI deployment with Git auto-deployment

set -e

echo "======================================"
echo "MegiLance Oracle Cloud VM Setup"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_USER="megilance"
APP_DIR="/home/$APP_USER/megilance"
REPO_URL="https://github.com/ghulam-mujtaba5/MegiLance.git"
DOCKER_COMPOSE_VERSION="2.23.0"

echo -e "${GREEN}Step 1: Updating system packages...${NC}"
sudo dnf update -y
sudo dnf install -y git curl wget vim nano

echo -e "${GREEN}Step 2: Installing Docker...${NC}"
# Install Docker on Oracle Linux
sudo dnf config-manager --add-repo=https://download.docker.com/linux/centos/docker-ce.repo
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add current user to docker group
sudo usermod -aG docker $USER
sudo usermod -aG docker $APP_USER 2>/dev/null || true

echo -e "${GREEN}Step 3: Installing Docker Compose...${NC}"
sudo curl -L "https://github.com/docker/compose/releases/download/v${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

echo -e "${GREEN}Step 4: Creating application user and directory...${NC}"
# Create app user if doesn't exist
if ! id "$APP_USER" &>/dev/null; then
    sudo useradd -m -s /bin/bash $APP_USER
    echo -e "${YELLOW}Created user: $APP_USER${NC}"
fi

# Create application directory
sudo mkdir -p $APP_DIR
sudo chown -R $APP_USER:$APP_USER $APP_DIR

echo -e "${GREEN}Step 5: Configuring firewall...${NC}"
# Open required ports
sudo firewall-cmd --permanent --add-port=8000/tcp  # Backend API
sudo firewall-cmd --permanent --add-port=80/tcp    # HTTP
sudo firewall-cmd --permanent --add-port=443/tcp   # HTTPS
sudo firewall-cmd --reload

echo -e "${GREEN}Step 6: Installing Nginx (reverse proxy)...${NC}"
sudo dnf install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

echo -e "${GREEN}Step 7: Setting up Git repository...${NC}"
sudo -u $APP_USER bash << 'EOF'
cd /home/megilance
if [ ! -d "megilance/.git" ]; then
    git clone $REPO_URL megilance
    cd megilance
else
    cd megilance
    git pull origin main
fi

# Set up Git configuration
git config --global user.name "MegiLance Deployer"
git config --global user.email "deploy@megilance.com"
EOF

echo -e "${GREEN}Step 8: Creating deployment scripts...${NC}"
# Create the auto-deploy script
sudo tee /home/$APP_USER/deploy.sh > /dev/null << 'DEPLOY_SCRIPT'
#!/bin/bash
# Auto-deployment script for MegiLance

set -e

APP_DIR="/home/megilance/megilance"
LOG_FILE="/home/megilance/deploy.log"
BRANCH="main"

echo "=== Deployment started at $(date) ===" | tee -a $LOG_FILE

cd $APP_DIR

# Pull latest changes
echo "Pulling latest changes from $BRANCH..." | tee -a $LOG_FILE
git fetch origin
git reset --hard origin/$BRANCH

# Copy environment files if they don't exist
if [ ! -f backend/.env ]; then
    echo "WARNING: backend/.env not found. Please create it!" | tee -a $LOG_FILE
fi

# Build and restart services
echo "Building and restarting services..." | tee -a $LOG_FILE
docker-compose -f docker-compose.oracle.yml down
docker-compose -f docker-compose.oracle.yml build --no-cache backend ai
docker-compose -f docker-compose.oracle.yml up -d backend ai

# Wait for services to be healthy
echo "Waiting for services to be healthy..." | tee -a $LOG_FILE
sleep 10

# Check health
if curl -f http://localhost:8000/api/health/live > /dev/null 2>&1; then
    echo "✓ Deployment successful!" | tee -a $LOG_FILE
else
    echo "✗ Health check failed!" | tee -a $LOG_FILE
    docker-compose -f docker-compose.oracle.yml logs backend
    exit 1
fi

echo "=== Deployment completed at $(date) ===" | tee -a $LOG_FILE
DEPLOY_SCRIPT

sudo chmod +x /home/$APP_USER/deploy.sh
sudo chown $APP_USER:$APP_USER /home/$APP_USER/deploy.sh

echo -e "${GREEN}Step 9: Setting up Git webhook listener...${NC}"
# Install webhook listener
sudo -u $APP_USER bash << 'EOF'
cd /home/megilance
mkdir -p webhook
cat > webhook/webhook-listener.py << 'WEBHOOK'
#!/usr/bin/env python3
"""
Simple webhook listener for Git auto-deployment
Listens on port 9000 for GitHub/GitLab webhooks
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import subprocess
import json
import hmac
import hashlib
import os

WEBHOOK_SECRET = os.environ.get('WEBHOOK_SECRET', 'change-me-in-production')
DEPLOY_SCRIPT = '/home/megilance/deploy.sh'

class WebhookHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/webhook':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            # Verify webhook signature (GitHub)
            signature = self.headers.get('X-Hub-Signature-256', '')
            if signature:
                expected = 'sha256=' + hmac.new(
                    WEBHOOK_SECRET.encode(),
                    post_data,
                    hashlib.sha256
                ).hexdigest()
                
                if not hmac.compare_digest(signature, expected):
                    self.send_response(401)
                    self.end_headers()
                    return
            
            # Parse payload
            try:
                payload = json.loads(post_data)
                branch = payload.get('ref', '').split('/')[-1]
                
                # Only deploy on main branch pushes
                if branch == 'main':
                    print(f"Webhook received for main branch. Deploying...")
                    subprocess.Popen([DEPLOY_SCRIPT])
                    
                    self.send_response(200)
                    self.end_headers()
                    self.wfile.write(b'Deployment triggered')
                else:
                    self.send_response(200)
                    self.end_headers()
                    self.wfile.write(b'Ignored: not main branch')
            except Exception as e:
                print(f"Error: {e}")
                self.send_response(500)
                self.end_headers()
        else:
            self.send_response(404)
            self.end_headers()
    
    def log_message(self, format, *args):
        print(f"[{self.address_string()}] {format % args}")

if __name__ == '__main__':
    server = HTTPServer(('0.0.0.0', 9000), WebhookHandler)
    print('Webhook listener started on port 9000')
    server.serve_forever()
WEBHOOK

chmod +x webhook/webhook-listener.py
EOF

# Create systemd service for webhook listener
sudo tee /etc/systemd/system/megilance-webhook.service > /dev/null << 'SERVICE'
[Unit]
Description=MegiLance Webhook Listener
After=network.target

[Service]
Type=simple
User=megilance
WorkingDirectory=/home/megilance/webhook
Environment="WEBHOOK_SECRET=your-secret-here"
ExecStart=/usr/bin/python3 /home/megilance/webhook/webhook-listener.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
SERVICE

sudo systemctl daemon-reload
sudo systemctl enable megilance-webhook.service
sudo systemctl start megilance-webhook.service

# Open webhook port
sudo firewall-cmd --permanent --add-port=9000/tcp
sudo firewall-cmd --reload

echo -e "${GREEN}Step 10: Creating Nginx reverse proxy config...${NC}"
sudo tee /etc/nginx/conf.d/megilance.conf > /dev/null << 'NGINX'
upstream backend {
    server localhost:8000;
}

server {
    listen 80;
    server_name _;

    # Increase body size for file uploads
    client_max_body_size 100M;

    # API proxy
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket support
    location /ws/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://backend/api/health/live;
    }

    # Webhook endpoint
    location /webhook {
        proxy_pass http://localhost:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
NGINX

sudo nginx -t
sudo systemctl reload nginx

echo -e "${GREEN}Step 11: Creating docker-compose.oracle.yml...${NC}"
sudo -u $APP_USER tee $APP_DIR/docker-compose.oracle.yml > /dev/null << 'COMPOSE'
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    volumes:
      - ./oracle-wallet-23ai:/app/oracle-wallet:ro
      - ./backend/uploads:/app/uploads
    env_file:
      - ./backend/.env
    environment:
      - ENVIRONMENT=production
      - DATABASE_TYPE=oracle
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/health/live"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    networks:
      - megilance-network

  ai:
    build:
      context: ./ai
      dockerfile: Dockerfile
    volumes:
      - ./ai:/app
      - ai-models:/app/models
    environment:
      - ENV=production
      - BACKEND_URL=http://backend:8000
    restart: unless-stopped
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - megilance-network

volumes:
  ai-models:

networks:
  megilance-network:
    driver: bridge
COMPOSE

echo ""
echo -e "${GREEN}======================================"
echo "Setup Complete!"
echo "======================================${NC}"
echo ""
echo "Next steps:"
echo "1. Configure Oracle Autonomous Database wallet:"
echo "   - Place wallet files in: $APP_DIR/oracle-wallet-23ai/"
echo ""
echo "2. Create backend/.env file:"
echo "   sudo nano $APP_DIR/backend/.env"
echo ""
echo "3. Set webhook secret:"
echo "   sudo sed -i 's/your-secret-here/YOUR_ACTUAL_SECRET/' /etc/systemd/system/megilance-webhook.service"
echo "   sudo systemctl daemon-reload"
echo "   sudo systemctl restart megilance-webhook.service"
echo ""
echo "4. Configure GitHub webhook:"
echo "   URL: http://YOUR_VM_IP/webhook"
echo "   Secret: (same as webhook secret above)"
echo "   Events: Just push events"
echo ""
echo "5. Run initial deployment:"
echo "   sudo -u $APP_USER /home/$APP_USER/deploy.sh"
echo ""
echo "Useful commands:"
echo "  - View logs: docker-compose -f $APP_DIR/docker-compose.oracle.yml logs -f"
echo "  - Manual deploy: sudo -u $APP_USER /home/$APP_USER/deploy.sh"
echo "  - Webhook status: sudo systemctl status megilance-webhook"
echo "  - Webhook logs: sudo journalctl -u megilance-webhook -f"
echo ""
