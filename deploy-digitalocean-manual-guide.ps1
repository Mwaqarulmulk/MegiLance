# Quick DigitalOcean Console Deployment Guide
# If CLI doesn't work, follow these manual steps

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "  Manual Deployment via DigitalOcean Console" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

Write-Host "`nOpening DigitalOcean Apps Console..." -ForegroundColor Yellow
Start-Sleep -Seconds 1
Start-Process "https://cloud.digitalocean.com/apps/new"

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "  Step-by-Step Instructions" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

Write-Host "`n[1] SELECT SOURCE" -ForegroundColor Green
Write-Host "  • Click 'GitHub'" -ForegroundColor White
Write-Host "  • Authorize DigitalOcean (first time)" -ForegroundColor White
Write-Host "  • Repository: ghulam-mujtaba5/MegiLance" -ForegroundColor Cyan
Write-Host "  • Branch: main" -ForegroundColor Cyan
Write-Host "  • Auto-deploy: ON ✓" -ForegroundColor Yellow
Write-Host "  • Click 'Next'" -ForegroundColor White

Write-Host "`n[2] CONFIGURE RESOURCES" -ForegroundColor Green
Write-Host "  • Name: megilance-frontend" -ForegroundColor Cyan
Write-Host "  • Type: Web Service (auto-detected)" -ForegroundColor White
Write-Host "  • Source Directory: /frontend" -ForegroundColor Cyan
Write-Host "  • Dockerfile Path: frontend/Dockerfile" -ForegroundColor Cyan
Write-Host "  • Click 'Edit' next to Environment Variables" -ForegroundColor White

Write-Host "`n[3] ENVIRONMENT VARIABLES" -ForegroundColor Green
Write-Host "  Add these variables (click 'Add Variable'):" -ForegroundColor White
Write-Host ""
Write-Host "  NODE_ENV = production" -ForegroundColor Cyan
Write-Host "  NEXT_TELEMETRY_DISABLED = 1" -ForegroundColor Cyan
Write-Host "  NEXT_PUBLIC_API_URL = http://YOUR_ORACLE_VM_IP/api" -ForegroundColor Yellow
Write-Host "  NEXT_PUBLIC_APP_NAME = MegiLance" -ForegroundColor Cyan
Write-Host "  NEXT_PUBLIC_APP_URL = https://megilance-frontend.ondigitalocean.app" -ForegroundColor Cyan
Write-Host "  PORT = 3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Note: Replace YOUR_ORACLE_VM_IP with actual IP!" -ForegroundColor Red
Write-Host "  • Click 'Save'" -ForegroundColor White
Write-Host "  • Click 'Next'" -ForegroundColor White

Write-Host "`n[4] SELECT PLAN" -ForegroundColor Green
Write-Host "  • Instance Type: Basic" -ForegroundColor White
Write-Host "  • Instance Size: Basic (512 MB RAM / 1 vCPU) - `$5/month" -ForegroundColor Cyan
Write-Host "  • Containers: 1" -ForegroundColor White
Write-Host "  • Click 'Next'" -ForegroundColor White

Write-Host "`n[5] REVIEW & DEPLOY" -ForegroundColor Green
Write-Host "  • App Name: megilance-frontend" -ForegroundColor Cyan
Write-Host "  • Region: New York (nyc3)" -ForegroundColor Cyan
Write-Host "  • Review all settings" -ForegroundColor White
Write-Host "  • Click 'Create Resources'" -ForegroundColor Yellow

Write-Host "`n[6] WAIT FOR DEPLOYMENT" -ForegroundColor Green
Write-Host "  • Build time: ~5-10 minutes" -ForegroundColor White
Write-Host "  • Watch progress in the DigitalOcean dashboard" -ForegroundColor White
Write-Host "  • You'll get a live URL when complete" -ForegroundColor White

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "  After Deployment" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

Write-Host "`n✓ Your app will be live at:" -ForegroundColor Green
Write-Host "  https://megilance-frontend-xxxxx.ondigitalocean.app" -ForegroundColor Cyan

Write-Host "`n✓ Auto-deployment is enabled:" -ForegroundColor Green
Write-Host "  • Every push to 'main' branch triggers deployment" -ForegroundColor White
Write-Host "  • Zero-downtime deployments" -ForegroundColor White

Write-Host "`n✓ View build logs:" -ForegroundColor Green
Write-Host "  • App -> Runtime Logs" -ForegroundColor White
Write-Host "  • App -> Build Logs" -ForegroundColor White

Write-Host "`n✓ Configure custom domain:" -ForegroundColor Green
Write-Host "  • App -> Settings -> Domains" -ForegroundColor White
Write-Host "  • Add Domain -> Enter your domain" -ForegroundColor White
Write-Host "  • Follow DNS instructions" -ForegroundColor White

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "  Cost: `$5/month (FREE with `$200 student credits!)" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan

Write-Host "`n"
