#!/usr/bin/env pwsh
# Continuous autonomous deployment system

$ErrorActionPreference = "Continue"
$env:GH_TOKEN = "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"

$currentRunId = "18190842719"
$maxAttempts = 10
$attemptCount = 4  # We're already on attempt #4

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║       🤖 AUTONOMOUS DEPLOYMENT SYSTEM - CONTINUOUS MODE 🤖     ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Magenta

while ($attemptCount -le $maxAttempts) {
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host "ATTEMPT #$attemptCount of $maxAttempts" -ForegroundColor Yellow
    Write-Host "Run ID: $currentRunId" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray
    
    # Wait for workflow to complete
    $checkCount = 0
    $maxChecks = 40
    
    while ($checkCount -lt $maxChecks) {
        $checkCount++
        Start-Sleep -Seconds 30
        
        try {
            $run = gh run view $currentRunId --json status,conclusion,workflowName 2>&1 | ConvertFrom-Json
            
            Write-Host "[Check $checkCount/$maxChecks] Status: $($run.status)" -ForegroundColor $(if ($run.status -eq 'completed') { 'Cyan' } else { 'Yellow' })
            
            if ($run.status -eq "completed") {
                if ($run.conclusion -eq "success") {
                    Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green -BackgroundColor DarkGreen
                    Write-Host "║              🎉 DEPLOYMENT SUCCESSFUL! 🎉                      ║" -ForegroundColor Green -BackgroundColor DarkGreen
                    Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green -BackgroundColor DarkGreen
                    
                    Write-Host "✅ Deployment completed after $attemptCount attempts" -ForegroundColor Green
                    Write-Host "🔗 https://github.com/ghulam-mujtaba5/MegiLance/actions/runs/$currentRunId" -ForegroundColor Cyan
                    exit 0
                    
                } elseif ($run.conclusion -eq "failure") {
                    Write-Host "`n❌ Attempt #$attemptCount FAILED" -ForegroundColor Red
                    
                    # Get error logs
                    Write-Host "`n🔍 Analyzing failure..." -ForegroundColor Yellow
                    $errorLogs = gh run view $currentRunId --log-failed 2>&1 | Select-Object -First 80
                    
                    # Check for common error patterns
                    $subnetError = $errorLogs | Select-String -Pattern "subnets can not be empty"
                    $dbError = $errorLogs | Select-String -Pattern "connection timed out|Connection refused"
                    $iamError = $errorLogs | Select-String -Pattern "AccessDenied|UnauthorizedOperation"
                    $ecsError = $errorLogs | Select-String -Pattern "ResourceNotFoundException|ClusterNotFoundException"
                    
                    if ($subnetError) {
                        Write-Host "❌ ERROR: Subnet issue detected (still!)" -ForegroundColor Red
                        Write-Host "📊 This shouldn't happen - subnet filter was fixed" -ForegroundColor Yellow
                        Write-Host "💡 Manual intervention may be required" -ForegroundColor Yellow
                        
                    } elseif ($dbError) {
                        Write-Host "❌ ERROR: Database connection issue detected" -ForegroundColor Red
                        Write-Host "💡 This shouldn't happen - migrations moved to ECS" -ForegroundColor Yellow
                        
                    } elseif ($iamError) {
                        Write-Host "❌ ERROR: IAM permissions issue" -ForegroundColor Red
                        Write-Host "💡 Check IAM roles and policies in AWS" -ForegroundColor Yellow
                        
                    } elseif ($ecsError) {
                        Write-Host "❌ ERROR: ECS resource not found" -ForegroundColor Red
                        Write-Host "💡 Infrastructure may not be fully set up" -ForegroundColor Yellow
                        
                    } else {
                        Write-Host "❌ ERROR: Unknown failure - displaying logs" -ForegroundColor Red
                        $errorLogs | Select-Object -First 30
                    }
                    
                    Write-Host "`n🔗 Full logs: https://github.com/ghulam-mujtaba5/MegiLance/actions/runs/$currentRunId" -ForegroundColor Cyan
                    Write-Host "`n⚠️ Manual review recommended - autonomous fixes exhausted for this iteration" -ForegroundColor Yellow
                    exit 1
                }
                break
            }
            
        } catch {
            Write-Host "⚠️ Error checking status: $_" -ForegroundColor Yellow
        }
    }
    
    if ($checkCount -ge $maxChecks) {
        Write-Host "`n⏱️ Timeout waiting for deployment" -ForegroundColor Yellow
        break
    }
}

Write-Host "`n⚠️ Maximum attempts reached" -ForegroundColor Yellow
exit 2
