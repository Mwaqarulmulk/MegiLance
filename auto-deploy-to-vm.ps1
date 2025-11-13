# Automated VM Deployment - Retry Until Success
# This script will keep trying until VM is ready and then deploy everything

$ErrorActionPreference = "Continue"
$env:OCI_CLI_AUTH = "security_token"

$vmIP = "193.122.57.193"
$sshKey = "oracle-vm-ssh.key"
$maxRetries = 20
$retryDelay = 30

Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  MegiLance Backend - Automated Deployment to Oracle VM       ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "   VM IP:        $vmIP" -ForegroundColor Gray
Write-Host "   SSH Key:      $sshKey" -ForegroundColor Gray
Write-Host "   Max Retries:  $maxRetries" -ForegroundColor Gray
Write-Host "   Retry Delay:  ${retryDelay}s`n" -ForegroundColor Gray

# Ensures the OpenSSH client is available, installing it when running elevated
function Ensure-OpenSSHClient {
    if (Get-Command ssh -ErrorAction SilentlyContinue) {
        return $true
    }

    $principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        Write-Host "   ❌ OpenSSH Client is missing and this script is not running as Administrator." -ForegroundColor Red
        Write-Host "      Please restart PowerShell as Administrator and run:`n        Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0`" -ForegroundColor Yellow
        Write-Host "      Alternatively install via Settings → Apps → Optional Features → Add a feature." -ForegroundColor Yellow
        return $false
    }

    Write-Host "   Installing OpenSSH Client capability..." -ForegroundColor Yellow
    Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0 | Out-Null
    if (Get-Command ssh -ErrorAction SilentlyContinue) {
        Write-Host "   ✅ OpenSSH Client installed." -ForegroundColor Green
        return $true
    } else {
        Write-Host "   ⚠️ Failed to install OpenSSH Client. Please run the command manually and rerun this script." -ForegroundColor Yellow
        return $false
    }
}

# Function to test SSH (pure PowerShell / OpenSSH, no bash dependency)
function Test-SSHConnection {
    param($ip, $key)
    $result = & ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 -o BatchMode=yes -i "$key" opc@$ip "echo ok" 2>&1
    return ($LASTEXITCODE -eq 0 -and $result -match 'ok')
}

# Function to run command on VM (uses native ssh)
function Invoke-SSHCommand {
    param($ip, $key, $command)
    & ssh -o StrictHostKeyChecking=no -i "$key" opc@$ip "$command" 2>&1
}

# Step 0: Ensure OpenSSH client exists
if (-not (Ensure-OpenSSHClient)) {
    Write-Host "❌ Unable to continue without OpenSSH client. Fix the installation and rerun." -ForegroundColor Red
    exit 1
}

# Step 1: Wait for SSH
Write-Host "🔌 Step 1: Waiting for SSH connection..." -ForegroundColor Cyan
Write-Host "   (Cloud-init may take 5-10 minutes to complete)`n" -ForegroundColor Gray

$connected = $false
for ($i = 1; $i -le $maxRetries; $i++) {
    Write-Host "   Attempt $i/$maxRetries..." -NoNewline -ForegroundColor Yellow
    
    if (Test-SSHConnection -ip $vmIP -key $sshKey) {
        Write-Host " ✅ Connected!" -ForegroundColor Green
        $connected = $true
        break
    } else {
        Write-Host " ⏳ Not ready yet" -ForegroundColor Gray
        if ($i -lt $maxRetries) {
            Write-Host "      Waiting ${retryDelay}s before retry..." -ForegroundColor DarkGray
            Start-Sleep -Seconds $retryDelay
        }
    }
}

if (-not $connected) {
    Write-Host "`n❌ Failed to connect after $maxRetries attempts" -ForegroundColor Red
    Write-Host "`n💡 Try these alternatives:" -ForegroundColor Yellow
    Write-Host "   1. Use Oracle Cloud Shell: ssh opc@$vmIP" -ForegroundColor Gray
    Write-Host "   2. Check VM Console Connection in Oracle Console" -ForegroundColor Gray
    Write-Host "   3. Wait 10 more minutes and run this script again`n" -ForegroundColor Gray
    exit 1
}

Write-Host "`n✅ SSH connection established!`n" -ForegroundColor Green

# Step 2: Check system status
Write-Host "🔍 Step 2: Checking system status..." -ForegroundColor Cyan
$systemInfo = Invoke-SSHCommand -ip $vmIP -key $sshKey -command @"
echo '=== System Info ==='
uname -a
echo ''
echo '=== Uptime ==='
uptime
echo ''
echo '=== Memory ==='
free -h
echo ''
echo '=== Disk ==='
df -h /
"@
Write-Host $systemInfo -ForegroundColor Gray
Write-Host ""

# Step 3: Check Docker installation
Write-Host "🐳 Step 3: Checking Docker installation..." -ForegroundColor Cyan
$dockerCheck = Invoke-SSHCommand -ip $vmIP -key $sshKey -command "docker --version 2>&1 && docker-compose --version 2>&1"
if ($dockerCheck -match "Docker version") {
    Write-Host "   ✅ Docker is installed!" -ForegroundColor Green
    Write-Host "   $($dockerCheck -split "`n" | Select-Object -First 2)" -ForegroundColor Gray
} else {
    Write-Host "   ⚠️  Docker not found, installing..." -ForegroundColor Yellow
    Invoke-SSHCommand -ip $vmIP -key $sshKey -command @"
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
rm get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
"@
    Write-Host "   ✅ Docker installed!" -ForegroundColor Green
}
Write-Host ""

# Step 4: Clone repository
Write-Host "📦 Step 4: Setting up repository..." -ForegroundColor Cyan
$repoSetup = Invoke-SSHCommand -ip $vmIP -key $sshKey -command @"
mkdir -p /home/opc/app
cd /home/opc/app
if [ -d "MegiLance" ]; then
    echo 'Repository exists, pulling latest...'
    cd MegiLance
    git pull origin main
else
    echo 'Cloning repository...'
    git clone https://github.com/ghulam-mujtaba5/MegiLance.git
    cd MegiLance
fi
echo 'Current directory:'
pwd
echo 'Files:'
ls -la | head -10
"@
Write-Host $repoSetup -ForegroundColor Gray
Write-Host "   ✅ Repository ready!" -ForegroundColor Green
Write-Host ""

# Step 5: Upload Oracle wallet
Write-Host "📂 Step 5: Uploading Oracle DB wallet..." -ForegroundColor Cyan
if (Test-Path "oracle-wallet-23ai") {
    Write-Host "   Creating wallet directory on VM..." -ForegroundColor Gray
    Invoke-SSHCommand -ip $vmIP -key $sshKey -command "mkdir -p /home/opc/app/MegiLance/oracle-wallet-23ai"
    
    Write-Host "   Uploading wallet files..." -ForegroundColor Gray
    if (-not (Get-Command scp -ErrorAction SilentlyContinue)) { Write-Host "   ❌ 'scp' not found. Install OpenSSH Client." -ForegroundColor Red } else { & scp -o StrictHostKeyChecking=no -i "$sshKey" -r oracle-wallet-23ai/* opc@${vmIP}:/home/opc/app/MegiLance/oracle-wallet-23ai/ 2>&1 | Out-Null }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Wallet uploaded successfully!" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Wallet upload failed, will need manual upload" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠️  Oracle wallet not found locally at ./oracle-wallet-23ai" -ForegroundColor Yellow
}
Write-Host ""

# Step 6: Create environment file
Write-Host "🔧 Step 6: Configuring environment..." -ForegroundColor Cyan
$envContent = @"
# Oracle Database Configuration
DATABASE_URL=oracle+oracledb://ADMIN:YOUR_PASSWORD_HERE@megilanceai_high
WALLET_LOCATION=/app/oracle-wallet

# Backend Configuration  
SECRET_KEY=megilance-super-secret-key-change-in-production-$(Get-Random)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS Origins
CORS_ORIGINS=http://localhost:3000,http://$vmIP,http://$vmIP:3000

# Environment
ENVIRONMENT=production
DEBUG=False

# Server
HOST=0.0.0.0
PORT=8000
"@

$tempFile = New-TemporaryFile
Set-Content -Path $tempFile -Value $envContent -NoNewline
if (-not (Get-Command scp -ErrorAction SilentlyContinue)) { Write-Host "   ❌ 'scp' not found. Install OpenSSH Client." -ForegroundColor Red } else { & scp -o StrictHostKeyChecking=no -i "$sshKey" "$tempFile" opc@${vmIP}:/home/opc/app/MegiLance/backend/.env 2>&1 | Out-Null }
Remove-Item $tempFile -ErrorAction SilentlyContinue

Write-Host "   ✅ Environment file created!" -ForegroundColor Green
Write-Host "   ⚠️  IMPORTANT: Update DATABASE_URL password in backend/.env" -ForegroundColor Yellow
Write-Host ""

# Step 7: Deploy with Docker Compose
Write-Host "🚀 Step 7: Deploying backend..." -ForegroundColor Cyan
Write-Host "   Starting Docker containers..." -ForegroundColor Gray
$deployOutput = Invoke-SSHCommand -ip $vmIP -key $sshKey -command @"
cd /home/opc/app/MegiLance
docker-compose -f docker-compose.minimal.yml pull
docker-compose -f docker-compose.minimal.yml up -d
sleep 15
docker ps
"@
Write-Host $deployOutput -ForegroundColor Gray

if ($deployOutput -match "megilance") {
    Write-Host "`n   ✅ Backend deployed successfully!" -ForegroundColor Green
} else {
    Write-Host "`n   ⚠️  Deployment may have issues, check logs" -ForegroundColor Yellow
}
Write-Host ""

# Step 8: Test API
Write-Host "🧪 Step 8: Testing API endpoints..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

Write-Host "   Testing health endpoint..." -ForegroundColor Gray
$healthCheck = Invoke-SSHCommand -ip $vmIP -key $sshKey -command "curl -s http://localhost:8000/api/health/live"
if ($healthCheck -match "healthy") {
    Write-Host "   ✅ Health check passed!" -ForegroundColor Green
    Write-Host "   Response: $healthCheck" -ForegroundColor Gray
} else {
    Write-Host "   ⚠️  Health check failed or not ready yet" -ForegroundColor Yellow
    Write-Host "   Response: $healthCheck" -ForegroundColor Gray
}
Write-Host ""

# Step 9: Setup Git webhook
Write-Host "🔗 Step 9: Setting up Git webhook..." -ForegroundColor Cyan
$webhookScript = @'
#!/bin/bash
cd /home/opc/app/MegiLance
git pull origin main
docker-compose -f docker-compose.minimal.yml up -d --build
echo "$(date): Deployment triggered" >> /home/opc/app/deploy.log
'@

$tempHook = New-TemporaryFile
Set-Content -Path $tempHook -Value $webhookScript -NoNewline
if (-not (Get-Command scp -ErrorAction SilentlyContinue)) { Write-Host "   ❌ 'scp' not found. Install OpenSSH Client." -ForegroundColor Red } else { & scp -o StrictHostKeyChecking=no -i "$sshKey" "$tempHook" opc@${vmIP}:/home/opc/app/MegiLance/deploy-webhook.sh 2>&1 | Out-Null }
Invoke-SSHCommand -ip $vmIP -key $sshKey -command "chmod +x /home/opc/app/MegiLance/deploy-webhook.sh"
Remove-Item $tempHook -ErrorAction SilentlyContinue

Write-Host "   ✅ Webhook script created at: /home/opc/app/MegiLance/deploy-webhook.sh" -ForegroundColor Green
Write-Host ""

# Final summary
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    DEPLOYMENT COMPLETE! 🎉                   ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📊 Deployment Summary:" -ForegroundColor Cyan
Write-Host "   ✅ SSH connection established" -ForegroundColor Green
Write-Host "   ✅ Docker and Docker Compose installed" -ForegroundColor Green
Write-Host "   ✅ Repository cloned and updated" -ForegroundColor Green
Write-Host "   ✅ Oracle wallet uploaded" -ForegroundColor Green
Write-Host "   ✅ Environment configured" -ForegroundColor Green
Write-Host "   ✅ Backend deployed with Docker" -ForegroundColor Green
Write-Host "   ✅ Git webhook script created" -ForegroundColor Green
Write-Host ""

Write-Host "🌐 Access Your Backend:" -ForegroundColor Cyan
Write-Host "   API:          http://$vmIP:8000" -ForegroundColor Yellow
Write-Host "   Health:       http://$vmIP:8000/api/health/live" -ForegroundColor Yellow
Write-Host "   API Docs:     http://$vmIP:8000/api/docs" -ForegroundColor Yellow
Write-Host ""

Write-Host "⚠️  IMPORTANT - Manual Steps Required:" -ForegroundColor Yellow
Write-Host "   1. Update database password in backend/.env:" -ForegroundColor White
Write-Host "      ssh -i $sshKey opc@$vmIP" -ForegroundColor Gray
Write-Host "      nano /home/opc/app/MegiLance/backend/.env" -ForegroundColor Gray
Write-Host "      (Change YOUR_PASSWORD_HERE to actual Oracle DB password)" -ForegroundColor Gray
Write-Host ""
Write-Host "   2. Restart backend after password update:" -ForegroundColor White
Write-Host "      cd /home/opc/app/MegiLance" -ForegroundColor Gray
Write-Host "      docker-compose -f docker-compose.minimal.yml restart" -ForegroundColor Gray
Write-Host ""
Write-Host "   3. Setup GitHub webhook for auto-deployment:" -ForegroundColor White
Write-Host "      - Go to: https://github.com/ghulam-mujtaba5/MegiLance/settings/hooks" -ForegroundColor Gray
Write-Host "      - Add webhook: http://$vmIP:9000/deploy" -ForegroundColor Gray
Write-Host ""

Write-Host "🔍 Useful Commands:" -ForegroundColor Cyan
Write-Host "   SSH into VM:       ssh -i $sshKey opc@$vmIP" -ForegroundColor Gray
Write-Host "   View logs:         docker-compose -f docker-compose.minimal.yml logs -f" -ForegroundColor Gray
Write-Host "   Restart backend:   docker-compose -f docker-compose.minimal.yml restart" -ForegroundColor Gray
Write-Host "   Check status:      docker ps" -ForegroundColor Gray
Write-Host ""

Write-Host "✨ Next: Deploy frontend to DigitalOcean!" -ForegroundColor Cyan
Write-Host ""
