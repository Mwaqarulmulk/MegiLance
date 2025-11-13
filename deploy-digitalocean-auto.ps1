# DigitalOcean Frontend Deployment Script
# Run this script to deploy MegiLance frontend to DigitalOcean App Platform

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "  MegiLance Frontend - DigitalOcean Deployment" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Step 1: Verify authentication
Write-Host "`n[1/5] Verifying DigitalOcean authentication..." -ForegroundColor Yellow
$authCheck = doctl auth list 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Authentication successful" -ForegroundColor Green
} else {
    Write-Host "✗ Authentication failed. Please run: doctl auth init" -ForegroundColor Red
    exit 1
}

# Step 2: GitHub Authorization Instructions
Write-Host "`n[2/5] GitHub Authorization Required" -ForegroundColor Yellow
Write-Host "To enable auto-deployment from GitHub, you need to:" -ForegroundColor White
Write-Host "  1. Go to: https://cloud.digitalocean.com/apps/new" -ForegroundColor Cyan
Write-Host "  2. Click 'GitHub' as the source" -ForegroundColor Cyan
Write-Host "  3. Click 'Authorize DigitalOcean'" -ForegroundColor Cyan
Write-Host "  4. Select your repository: ghulam-mujtaba5/MegiLance" -ForegroundColor Cyan
Write-Host "  5. After authorization, return here and press Enter" -ForegroundColor Cyan
Write-Host "`nOpening browser..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Start-Process "https://cloud.digitalocean.com/apps/new"

Read-Host "`nPress Enter after you've authorized GitHub"

# Step 3: Create the app
Write-Host "`n[3/5] Creating App Platform app..." -ForegroundColor Yellow
Write-Host "Using configuration from digitalocean-app.yaml" -ForegroundColor White

$createApp = doctl apps create --spec digitalocean-app.yaml --format ID --no-header 2>&1
if ($LASTEXITCODE -eq 0) {
    $appId = $createApp.Trim()
    Write-Host "✓ App created successfully!" -ForegroundColor Green
    Write-Host "  App ID: $appId" -ForegroundColor Cyan
} else {
    Write-Host "✗ Failed to create app" -ForegroundColor Red
    Write-Host $createApp -ForegroundColor Red
    
    Write-Host "`nAlternative: Create app manually via Console" -ForegroundColor Yellow
    Write-Host "  1. Go to: https://cloud.digitalocean.com/apps/new" -ForegroundColor Cyan
    Write-Host "  2. Connect GitHub repository: ghulam-mujtaba5/MegiLance" -ForegroundColor Cyan
    Write-Host "  3. Branch: main" -ForegroundColor Cyan
    Write-Host "  4. Source Directory: /frontend" -ForegroundColor Cyan
    Write-Host "  5. Dockerfile: frontend/Dockerfile" -ForegroundColor Cyan
    Write-Host "  6. Add environment variables (see below)" -ForegroundColor Cyan
    exit 1
}

# Step 4: Get app information
Write-Host "`n[4/5] Getting app information..." -ForegroundColor Yellow
$appInfo = doctl apps get $appId --format Spec.Name,DefaultIngress,ActiveDeployment.ID 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host $appInfo -ForegroundColor Cyan
} else {
    Write-Host "Warning: Could not retrieve app info" -ForegroundColor Yellow
}

# Step 5: Monitor deployment
Write-Host "`n[5/5] Monitoring deployment..." -ForegroundColor Yellow
Write-Host "This may take 5-10 minutes. Please wait..." -ForegroundColor White

$maxAttempts = 30
$attempt = 0
$deployed = $false

while ($attempt -lt $maxAttempts -and -not $deployed) {
    $attempt++
    Write-Host "  Checking deployment status... ($attempt/$maxAttempts)" -ForegroundColor Gray
    
    $status = doctl apps get $appId --format ActiveDeployment.Phase --no-header 2>&1
    
    if ($status -match "ACTIVE") {
        $deployed = $true
        Write-Host "`n✓ Deployment successful!" -ForegroundColor Green
    } elseif ($status -match "ERROR" -or $status -match "FAILED") {
        Write-Host "`n✗ Deployment failed!" -ForegroundColor Red
        Write-Host "Check logs with: doctl apps logs $appId --type build" -ForegroundColor Yellow
        break
    } else {
        Write-Host "  Status: $status" -ForegroundColor Gray
        Start-Sleep -Seconds 20
    }
}

if (-not $deployed -and $attempt -ge $maxAttempts) {
    Write-Host "`nDeployment is taking longer than expected." -ForegroundColor Yellow
    Write-Host "Monitor progress at: https://cloud.digitalocean.com/apps/$appId" -ForegroundColor Cyan
}

# Get app URL
Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "  Deployment Summary" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

$appUrl = doctl apps get $appId --format DefaultIngress --no-header 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "`nYour frontend is live at:" -ForegroundColor Green
    Write-Host "  $appUrl" -ForegroundColor Cyan
    Write-Host "`nApp ID: $appId" -ForegroundColor White
} else {
    Write-Host "`nApp ID: $appId" -ForegroundColor White
    Write-Host "Get URL with: doctl apps get $appId" -ForegroundColor Yellow
}

# Next steps
Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "  Next Steps" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "1. Update environment variables:" -ForegroundColor Yellow
Write-Host "   - Go to App Settings -> Environment Variables" -ForegroundColor White
Write-Host "   - Update NEXT_PUBLIC_API_URL with your Oracle VM IP" -ForegroundColor White
Write-Host "`n2. Enable auto-deployment:" -ForegroundColor Yellow
Write-Host "   - App Settings -> Source -> Auto-deploy: ON" -ForegroundColor White
Write-Host "`n3. Configure custom domain:" -ForegroundColor Yellow
Write-Host "   - App Settings -> Domains -> Add Domain" -ForegroundColor White
Write-Host "`n4. View logs:" -ForegroundColor Yellow
Write-Host "   doctl apps logs $appId --type run --follow" -ForegroundColor Cyan
Write-Host "`n5. Monitor app:" -ForegroundColor Yellow
Write-Host "   https://cloud.digitalocean.com/apps/$appId" -ForegroundColor Cyan
Write-Host "`n==================================================" -ForegroundColor Cyan

# Save app ID for future reference
$appId | Out-File -FilePath "digitalocean-app-id.txt" -NoNewline
Write-Host "`n✓ App ID saved to digitalocean-app-id.txt" -ForegroundColor Green
