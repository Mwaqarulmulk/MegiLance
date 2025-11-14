# @AI-HINT: Script to test frontend Docker build locally before deploying to Digital Ocean
Write-Host "`n=== FRONTEND BUILD TEST ===" -ForegroundColor Cyan
Write-Host "Building frontend Docker image locally..." -ForegroundColor Yellow

# Build the frontend image
docker build -f frontend/Dockerfile -t megilance-frontend-test:latest .

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Frontend build SUCCEEDED!" -ForegroundColor Green
    
    Write-Host "`nTesting frontend container..." -ForegroundColor Yellow
    
    # Run container briefly to test startup
    $containerId = docker run -d `
        -e NEXT_PUBLIC_BACKEND_URL="http://localhost:8000" `
        -p 3001:3000 `
        megilance-frontend-test:latest
    
    Write-Host "Container started: $containerId" -ForegroundColor Gray
    Write-Host "Waiting 5 seconds for startup..." -ForegroundColor Gray
    Start-Sleep 5
    
    # Check logs
    Write-Host "`nContainer logs:" -ForegroundColor Cyan
    docker logs $containerId 2>&1 | Select-Object -Last 20
    
    # Test homepage
    Write-Host "`nTesting homepage..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001" -TimeoutSec 10
        Write-Host "✅ Homepage LOADED: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Homepage failed: $_" -ForegroundColor Red
    }
    
    # Cleanup
    Write-Host "`nStopping test container..." -ForegroundColor Gray
    docker stop $containerId | Out-Null
    docker rm $containerId | Out-Null
    
    Write-Host "`n🎉 Frontend build test COMPLETE!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n❌ Frontend build FAILED!" -ForegroundColor Red
    Write-Host "Fix errors before deploying to Digital Ocean." -ForegroundColor Red
    exit 1
}
