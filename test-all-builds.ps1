# @AI-HINT: Master script to test both backend and frontend builds locally before deployment
Write-Host @"
╔═══════════════════════════════════════════════════════╗
║  MegiLance - Local Build Verification                ║
║  Test both builds before Digital Ocean deployment    ║
╚═══════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

$startTime = Get-Date

# Test Backend
Write-Host "`n[1/2] Testing Backend Build..." -ForegroundColor Magenta
& "$PSScriptRoot\test-backend-build.ps1"
$backendResult = $LASTEXITCODE

# Test Frontend
Write-Host "`n[2/2] Testing Frontend Build..." -ForegroundColor Magenta
& "$PSScriptRoot\test-frontend-build.ps1"
$frontendResult = $LASTEXITCODE

# Summary
$duration = (Get-Date) - $startTime
Write-Host "`n╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  BUILD VERIFICATION SUMMARY                           ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host "`nBackend:  " -NoNewline
if ($backendResult -eq 0) {
    Write-Host "✅ PASSED" -ForegroundColor Green
} else {
    Write-Host "❌ FAILED" -ForegroundColor Red
}

Write-Host "Frontend: " -NoNewline
if ($frontendResult -eq 0) {
    Write-Host "✅ PASSED" -ForegroundColor Green
} else {
    Write-Host "❌ FAILED" -ForegroundColor Red
}

Write-Host "`nDuration: $($duration.TotalSeconds.ToString('F1')) seconds" -ForegroundColor Gray

if ($backendResult -eq 0 -and $frontendResult -eq 0) {
    Write-Host "`n🎉 ALL BUILDS PASSED - Safe to deploy to Digital Ocean!" -ForegroundColor Green
    Write-Host "`nTo deploy, run:" -ForegroundColor Cyan
    Write-Host "  git add ." -ForegroundColor Yellow
    Write-Host "  git commit -m 'your message'" -ForegroundColor Yellow
    Write-Host "  git push origin main" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "`n⚠️ BUILD FAILURES DETECTED - DO NOT deploy until fixed!" -ForegroundColor Red
    exit 1
}
