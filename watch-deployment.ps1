#!/usr/bin/env pwsh
# Enhanced deployment monitoring script

$ErrorActionPreference = "Continue"
$env:GH_TOKEN = "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"

$runId = "18190842719"
$maxChecks = 40  # 40 checks * 30 seconds = 20 minutes max
$checkInterval = 30
$checkCount = 0

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     🚀 MONITORING DEPLOYMENT - RUN ID: $runId     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "📊 Check interval: $checkInterval seconds" -ForegroundColor Gray
Write-Host "⏱️  Max duration: $($maxChecks * $checkInterval / 60) minutes" -ForegroundColor Gray
Write-Host "🔗 URL: https://github.com/ghulam-mujtaba5/MegiLance/actions/runs/$runId`n" -ForegroundColor Cyan

while ($checkCount -lt $maxChecks) {
    $checkCount++
    
    Write-Host "[Check $checkCount/$maxChecks] " -ForegroundColor Yellow -NoNewline
    
    try {
        # Get workflow run status
        $run = gh run view $runId --json status,conclusion,workflowName,displayTitle,createdAt,updatedAt 2>&1 | ConvertFrom-Json
        
        $status = $run.status
        $conclusion = $run.conclusion
        
        # Display status
        if ($status -eq "completed") {
            if ($conclusion -eq "success") {
                Write-Host "✅ SUCCESS!" -ForegroundColor Green
                Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green -BackgroundColor DarkGreen
                Write-Host "║              🎉 DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉           ║" -ForegroundColor Green -BackgroundColor DarkGreen
                Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green -BackgroundColor DarkGreen
                
                Write-Host "✅ Workflow: $($run.workflowName)" -ForegroundColor Green
                Write-Host "✅ Status: $status" -ForegroundColor Green
                Write-Host "✅ Conclusion: $conclusion" -ForegroundColor Green
                Write-Host "✅ Created: $($run.createdAt)" -ForegroundColor Green
                Write-Host "✅ Completed: $($run.updatedAt)" -ForegroundColor Green
                Write-Host "`n🔗 View details: https://github.com/ghulam-mujtaba5/MegiLance/actions/runs/$runId" -ForegroundColor Cyan
                
                # Get deployment URLs
                Write-Host "`n📡 Fetching deployment details..." -ForegroundColor Yellow
                try {
                    $logs = gh run view $runId --log 2>&1
                    
                    # Extract ECS service names
                    $backendService = $logs | Select-String -Pattern "megilance-backend-service" | Select-Object -First 1
                    $frontendService = $logs | Select-String -Pattern "megilance-frontend-service" | Select-Object -First 1
                    
                    if ($backendService -or $frontendService) {
                        Write-Host "`n🚀 DEPLOYMENT ENDPOINTS:" -ForegroundColor Cyan
                        if ($backendService) {
                            Write-Host "   📍 Backend: Check ECS service 'megilance-backend-service' in AWS Console" -ForegroundColor White
                        }
                        if ($frontendService) {
                            Write-Host "   📍 Frontend: Check ECS service 'megilance-frontend-service' in AWS Console" -ForegroundColor White
                        }
                        Write-Host "`n💡 Get service URLs:" -ForegroundColor Yellow
                        Write-Host "   aws ecs describe-services --cluster megilance-cluster --services megilance-backend-service --region us-east-2" -ForegroundColor Gray
                    }
                } catch {
                    Write-Host "⚠️ Could not fetch deployment details" -ForegroundColor Yellow
                }
                
                exit 0
                
            } elseif ($conclusion -eq "failure") {
                Write-Host "❌ FAILED!" -ForegroundColor Red
                Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Red
                Write-Host "║                  ❌ DEPLOYMENT FAILED! ❌                       ║" -ForegroundColor Red
                Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Red
                
                Write-Host "🔍 Fetching error logs..." -ForegroundColor Yellow
                gh run view $runId --log-failed 2>&1 | Select-Object -First 50
                
                Write-Host "`n🔗 Full logs: https://github.com/ghulam-mujtaba5/MegiLance/actions/runs/$runId" -ForegroundColor Cyan
                exit 1
                
            } else {
                Write-Host "⚠️ Completed with status: $conclusion" -ForegroundColor Yellow
                exit 2
            }
        } elseif ($status -eq "in_progress") {
            Write-Host "⏳ In progress... (elapsed: $($checkCount * $checkInterval)s)" -ForegroundColor Yellow
        } elseif ($status -eq "queued") {
            Write-Host "⏰ Queued..." -ForegroundColor Gray
        } else {
            Write-Host "❓ Status: $status" -ForegroundColor Gray
        }
        
    } catch {
        Write-Host "⚠️ Error checking status: $_" -ForegroundColor Red
    }
    
    # Wait before next check
    if ($checkCount -lt $maxChecks) {
        Start-Sleep -Seconds $checkInterval
    }
}

Write-Host "`n⏱️ Monitoring timeout reached (${maxChecks} checks)" -ForegroundColor Yellow
Write-Host "🔗 Check status manually: https://github.com/ghulam-mujtaba5/MegiLance/actions/runs/$runId" -ForegroundColor Cyan
exit 3
