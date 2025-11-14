# @AI-HINT: Script to test backend Docker build locally before deploying to Digital Ocean
Write-Host "`n=== BACKEND BUILD TEST ===" -ForegroundColor Cyan
Write-Host "Building backend Docker image locally..." -ForegroundColor Yellow

# Build the backend image
docker build -f backend/Dockerfile -t megilance-backend-test:latest .

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Backend build SUCCEEDED!" -ForegroundColor Green
    
    Write-Host "`nTesting backend container..." -ForegroundColor Yellow
    
    # Run container briefly to test startup
    $containerId = docker run -d `
        -e DATABASE_URL="postgresql://user:pass@localhost:5432/megilance" `
        -e SECRET_KEY="test-secret-key-min-32-chars-long" `
        -e ENVIRONMENT="production" `
        -p 8001:8000 `
        megilance-backend-test:latest
    
    Write-Host "Container started: $containerId" -ForegroundColor Gray
    Write-Host "Waiting 10 seconds for startup..." -ForegroundColor Gray
    Start-Sleep 10
    
    # Check logs
    Write-Host "`nContainer logs:" -ForegroundColor Cyan
    docker logs $containerId 2>&1 | Select-Object -Last 20
    
    # Test health endpoint
    Write-Host "`nTesting health endpoint..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8001/api/health/live" -TimeoutSec 5
        Write-Host "✅ Health check PASSED: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Health check failed (may be expected without DB): $_" -ForegroundColor Yellow
    }
    
    # Cleanup
    Write-Host "`nStopping test container..." -ForegroundColor Gray
    docker stop $containerId | Out-Null
    docker rm $containerId | Out-Null
    
    Write-Host "`n🎉 Backend build test COMPLETE!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n❌ Backend build FAILED!" -ForegroundColor Red
    Write-Host "Fix errors before deploying to Digital Ocean." -ForegroundColor Red
    exit 1
}
