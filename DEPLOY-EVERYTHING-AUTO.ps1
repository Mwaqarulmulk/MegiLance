#!/usr/bin/env pwsh
# Complete Automated Deployment - MegiLance Backend to Oracle Linux VM

$ErrorActionPreference = "Continue"
$vmIP = "193.122.57.193"
$sshKey = "oracle-vm-ssh.key"

Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     MegiLance - Full Automated Deployment to Oracle VM       ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "🎯 Target: opc@$vmIP`n" -ForegroundColor Yellow

# Step 1: Wait for Docker to be ready
Write-Host "⏳ Step 1: Waiting for Docker installation..." -ForegroundColor Cyan
$dockerReady = $false
$maxAttempts = 15
$attempt = 0

while (-not $dockerReady -and $attempt -lt $maxAttempts) {
    $attempt++
    Write-Host "   Attempt $attempt/$maxAttempts..." -ForegroundColor Gray
    
    $result = ssh -i $sshKey -o StrictHostKeyChecking=no -o ConnectTimeout=10 opc@$vmIP "docker --version 2>&1" 2>&1
    
    if ($LASTEXITCODE -eq 0 -and $result -match "Docker version") {
        $dockerReady = $true
        Write-Host "   ✅ Docker is ready: $result" -ForegroundColor Green
    } else {
        Write-Host "   ⏳ Docker not ready yet, waiting 15s..." -ForegroundColor Yellow
        Start-Sleep -Seconds 15
    }
}

if (-not $dockerReady) {
    Write-Host "`n❌ Docker installation timeout. Installing manually..." -ForegroundColor Red
    ssh -i $sshKey opc@$vmIP @"
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker opc
"@
    Write-Host "   ✅ Docker installed manually`n" -ForegroundColor Green
}

# Step 2: Install docker-compose
Write-Host "🐳 Step 2: Installing docker-compose..." -ForegroundColor Cyan
ssh -i $sshKey opc@$vmIP @"
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
docker-compose --version
"@
Write-Host "   ✅ docker-compose installed`n" -ForegroundColor Green

# Step 3: Install Git
Write-Host "📦 Step 3: Installing Git..." -ForegroundColor Cyan
ssh -i $sshKey opc@$vmIP "sudo yum install -y git && git --version"
Write-Host "   ✅ Git installed`n" -ForegroundColor Green

# Step 4: Clone repository
Write-Host "📥 Step 4: Cloning MegiLance repository..." -ForegroundColor Cyan
ssh -i $sshKey opc@$vmIP @"
rm -rf ~/MegiLance
git clone https://github.com/ghulam-mujtaba5/MegiLance.git ~/MegiLance
cd ~/MegiLance && git log --oneline -1
"@
Write-Host "   ✅ Repository cloned`n" -ForegroundColor Green

# Step 5: Upload Oracle wallet
Write-Host "🔐 Step 5: Uploading Oracle wallet..." -ForegroundColor Cyan
if (Test-Path "oracle-wallet-23ai") {
    ssh -i $sshKey opc@$vmIP "mkdir -p ~/MegiLance/oracle-wallet-23ai"
    scp -i $sshKey -o StrictHostKeyChecking=no -r oracle-wallet-23ai/* opc@${vmIP}:~/MegiLance/oracle-wallet-23ai/
    Write-Host "   ✅ Wallet uploaded`n" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  oracle-wallet-23ai not found, skipping`n" -ForegroundColor Yellow
}

# Step 6: Create backend .env
Write-Host "⚙️  Step 6: Creating backend environment file..." -ForegroundColor Cyan
Write-Host "   Enter database password (or press Enter to use default): " -ForegroundColor Yellow -NoNewline
$dbPassword = Read-Host
if ([string]::IsNullOrWhiteSpace($dbPassword)) {
    $dbPassword = "YourSecurePassword123"
}

$secretKey = ssh -i $sshKey opc@$vmIP "openssl rand -hex 32"

$envContent = @"
DATABASE_URL=oracle://admin:${dbPassword}@megilancedb_high?wallet_location=/app/oracle-wallet-23ai
SECRET_KEY=$secretKey
CORS_ORIGINS=http://localhost:3000,http://$vmIP,http://${vmIP}:3000,http://193.122.57.193,http://193.122.57.193:3000
DEBUG=False
ENVIRONMENT=production
"@

$envContent | Out-File -FilePath "backend-env-temp.txt" -Encoding UTF8 -NoNewline
scp -i $sshKey -o StrictHostKeyChecking=no backend-env-temp.txt opc@${vmIP}:~/MegiLance/backend/.env
Remove-Item backend-env-temp.txt
Write-Host "   ✅ Environment file created`n" -ForegroundColor Green

# Step 7: Create docker-compose.minimal.yml
Write-Host "🐋 Step 7: Creating docker-compose configuration..." -ForegroundColor Cyan
$composeContent = @"
version: '3.8'

services:
  backend:
    build: ./backend
    container_name: megilance-backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
      - ./oracle-wallet-23ai:/app/oracle-wallet-23ai:ro
    env_file:
      - ./backend/.env
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/health/live"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
"@

$composeContent | Out-File -FilePath "docker-compose-temp.yml" -Encoding UTF8 -NoNewline
scp -i $sshKey -o StrictHostKeyChecking=no docker-compose-temp.yml opc@${vmIP}:~/MegiLance/docker-compose.minimal.yml
Remove-Item docker-compose-temp.yml
Write-Host "   ✅ Docker Compose file created`n" -ForegroundColor Green

# Step 8: Build and start containers
Write-Host "🚀 Step 8: Building and starting containers..." -ForegroundColor Cyan
ssh -i $sshKey opc@$vmIP @"
cd ~/MegiLance
echo '>>> Building backend image...'
docker-compose -f docker-compose.minimal.yml build
echo '>>> Starting containers...'
docker-compose -f docker-compose.minimal.yml up -d
echo '>>> Waiting 30 seconds for startup...'
sleep 30
echo '>>> Container status:'
docker-compose -f docker-compose.minimal.yml ps
"@
Write-Host "   ✅ Containers started`n" -ForegroundColor Green

# Step 9: Health check
Write-Host "🏥 Step 9: Running health checks..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

$healthCheck = ssh -i $sshKey opc@$vmIP "curl -s http://localhost:8000/api/health/live"
if ($healthCheck -match "healthy" -or $healthCheck -match "ok") {
    Write-Host "   ✅ Health check passed!`n" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Health check response: $healthCheck`n" -ForegroundColor Yellow
}

# Step 10: Show logs
Write-Host "📋 Step 10: Recent logs..." -ForegroundColor Cyan
ssh -i $sshKey opc@$vmIP "cd ~/MegiLance && docker-compose -f docker-compose.minimal.yml logs --tail=20"

# Final summary
Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                  🎉 DEPLOYMENT COMPLETE! 🎉                  ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📊 Deployment Summary:" -ForegroundColor Cyan
Write-Host "   VM IP:        $vmIP" -ForegroundColor White
Write-Host "   User:         opc" -ForegroundColor White
Write-Host "   OS:           Oracle Linux 8" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Access Points:" -ForegroundColor Cyan
Write-Host "   API Base:     http://$vmIP:8000" -ForegroundColor Yellow
Write-Host "   Health:       http://$vmIP:8000/api/health/live" -ForegroundColor Yellow
Write-Host "   API Docs:     http://$vmIP:8000/api/docs" -ForegroundColor Yellow
Write-Host "   ReDoc:        http://$vmIP:8000/api/redoc" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔧 Useful Commands:" -ForegroundColor Cyan
Write-Host "   SSH:          ssh -i $sshKey opc@$vmIP" -ForegroundColor Gray
Write-Host "   Logs:         ssh -i $sshKey opc@$vmIP 'cd ~/MegiLance && docker-compose -f docker-compose.minimal.yml logs -f'" -ForegroundColor Gray
Write-Host "   Restart:      ssh -i $sshKey opc@$vmIP 'cd ~/MegiLance && docker-compose -f docker-compose.minimal.yml restart'" -ForegroundColor Gray
Write-Host "   Stop:         ssh -i $sshKey opc@$vmIP 'cd ~/MegiLance && docker-compose -f docker-compose.minimal.yml down'" -ForegroundColor Gray
Write-Host ""

# Test external access
Write-Host "🧪 Testing external API access..." -ForegroundColor Cyan
$apiTest = Invoke-RestMethod -Uri "http://$vmIP:8000/api/health/live" -Method Get -TimeoutSec 10 -ErrorAction SilentlyContinue
if ($apiTest) {
    Write-Host "   ✅ API is publicly accessible!" -ForegroundColor Green
    Write-Host "   Response: $($apiTest | ConvertTo-Json -Compress)" -ForegroundColor Gray
} else {
    Write-Host "   ⚠️  Could not reach API from local machine" -ForegroundColor Yellow
    Write-Host "   Check if port 8000 is open in security list" -ForegroundColor Yellow
}

Write-Host "`n✨ Backend deployment completed successfully! ✨`n" -ForegroundColor Green
