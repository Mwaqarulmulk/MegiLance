#!/usr/bin/env pwsh
# Quick deployment status check and finish

$IP = "193.122.57.193"
$KEY = "oracle-vm-ssh.key"

Write-Host "`n🔍 Checking Oracle VM Deployment Status`n" -ForegroundColor Cyan

# Test SSH
Write-Host "Testing SSH connection..." -ForegroundColor Yellow
$sshTest = & ssh -i $KEY -o ConnectTimeout=10 -o BatchMode=yes opc@$IP "echo OK" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ SSH connection failed!" -ForegroundColor Red
    Write-Host "VM might be rebooting or yum is locking SSH." -ForegroundColor Yellow
    Write-Host "Wait 2 minutes and run this script again.`n" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ SSH working`n" -ForegroundColor Green

# Check Docker
Write-Host "Checking Docker..." -ForegroundColor Yellow
$dockerVer = & ssh -i $KEY opc@$IP "docker --version 2>&1"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Docker installed: $dockerVer`n" -ForegroundColor Green
} else {
    Write-Host "⏳ Docker still installing..." -ForegroundColor Yellow
    Write-Host "Run: ssh -i $KEY opc@$IP 'sudo yum install -y docker-ce docker-ce-cli containerd.io && sudo systemctl start docker'`n" -ForegroundColor Gray
}

# Check repo
Write-Host "Checking repository..." -ForegroundColor Yellow
$repoCheck = & ssh -i $KEY opc@$IP "ls ~/MegiLance/backend 2>&1"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Repository cloned`n" -ForegroundColor Green
} else {
    Write-Host "❌ Repository not cloned" -ForegroundColor Red
    Write-Host "Run: ssh -i $KEY opc@$IP 'git clone https://github.com/ghulam-mujtaba5/MegiLance.git ~/MegiLance'`n" -ForegroundColor Gray
}

# Check wallet
Write-Host "Checking Oracle wallet..." -ForegroundColor Yellow
$walletCheck = & ssh -i $KEY opc@$IP "ls ~/MegiLance/oracle-wallet-23ai/cwallet.sso 2>&1"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Wallet uploaded`n" -ForegroundColor Green
} else {
    Write-Host "⏳ Wallet needs to be moved" -ForegroundColor Yellow
    Write-Host "Run: ssh -i $KEY opc@$IP 'mv ~/oracle-wallet-23ai ~/MegiLance/ 2>/dev/null || echo Already moved'`n" -ForegroundColor Gray
}

# Check if containers running
Write-Host "Checking containers..." -ForegroundColor Yellow
$containerCheck = & ssh -i $KEY opc@$IP "sudo docker ps 2>&1 | grep -i megilance || echo 'Not running'"
if ($containerCheck -match "megilance") {
    Write-Host "✅ Containers running!`n" -ForegroundColor Green
    
    # Test API
    Write-Host "Testing API..." -ForegroundColor Yellow
    $apiTest = & ssh -i $KEY opc@$IP "curl -s http://localhost:8000/api/health/live"
    if ($apiTest -match "healthy") {
        Write-Host "✅ API is healthy!`n" -ForegroundColor Green
        Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
        Write-Host "║              🎉 DEPLOYMENT SUCCESSFUL! 🎉                    ║" -ForegroundColor Green
        Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
        Write-Host "`n📍 API Endpoints:" -ForegroundColor Cyan
        Write-Host "   Health:    http://$IP:8000/api/health/live" -ForegroundColor White
        Write-Host "   Docs:      http://$IP:8000/api/docs" -ForegroundColor White
        Write-Host "   ReDoc:     http://$IP:8000/api/redoc`n" -ForegroundColor White
    } else {
        Write-Host "⚠️  API not responding yet" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Containers not running`n" -ForegroundColor Red
    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "1. SSH into VM: ssh -i $KEY opc@$IP" -ForegroundColor White
    Write-Host "2. Start containers:" -ForegroundColor White
    Write-Host "   cd ~/MegiLance" -ForegroundColor Gray
    Write-Host "   sudo docker compose -f docker-compose.minimal.yml up -d`n" -ForegroundColor Gray
}
