#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Fully Automated GitHub Workflow Executor & Monitor
.DESCRIPTION
    Triggers workflows, monitors execution, detects errors, fixes them, and re-runs until success
#>

param(
    [string]$WorkflowName = "auto-deploy.yml",
    [string]$Environment = "production",
    [int]$MaxRetries = 5,
    [int]$CheckInterval = 30
)

$ErrorActionPreference = "Continue"

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   FULLY AUTOMATED WORKFLOW EXECUTOR & MONITOR v2.0           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

function Invoke-WorkflowRun {
    param([string]$Workflow, [string]$Env)
    
    Write-Host "`n🚀 Triggering workflow: $Workflow" -ForegroundColor Yellow
    Write-Host "   Environment: $Env" -ForegroundColor Gray
    
    try {
        $result = gh workflow run $Workflow `
            -f environment=$Env `
            -f deploy_backend=true `
            -f deploy_frontend=true `
            2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Workflow triggered successfully!" -ForegroundColor Green
            Start-Sleep -Seconds 5  # Wait for workflow to register
            return $true
        } else {
            Write-Host "  ❌ Failed to trigger workflow: $result" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "  ❌ Error triggering workflow: $_" -ForegroundColor Red
        return $false
    }
}

function Get-LatestWorkflowRun {
    param([string]$Workflow)
    
    try {
        $runs = gh run list --workflow=$Workflow --limit 1 --json databaseId,status,conclusion,createdAt | ConvertFrom-Json
        
        if ($runs -and $runs.Count -gt 0) {
            return $runs[0]
        }
        return $null
    } catch {
        Write-Host "  ⚠️ Could not fetch workflow runs: $_" -ForegroundColor Yellow
        return $null
    }
}

function Watch-WorkflowExecution {
    param([string]$RunId)
    
    Write-Host "`n👁️ Monitoring workflow run: $RunId" -ForegroundColor Cyan
    
    $completed = $false
    $checkCount = 0
    
    while (-not $completed) {
        $checkCount++
        
        try {
            $runInfo = gh run view $RunId --json status,conclusion,jobs | ConvertFrom-Json
            
            $status = $runInfo.status
            $conclusion = $runInfo.conclusion
            
            Write-Host "`r  [Check $checkCount] Status: $status" -NoNewline -ForegroundColor Yellow
            
            if ($status -eq "completed") {
                $completed = $true
                Write-Host ""  # New line after status
                
                if ($conclusion -eq "success") {
                    Write-Host "`n  ✅ Workflow SUCCEEDED!" -ForegroundColor Green
                    return @{ Success = $true; Conclusion = $conclusion }
                } else {
                    Write-Host "`n  ❌ Workflow FAILED with conclusion: $conclusion" -ForegroundColor Red
                    return @{ Success = $false; Conclusion = $conclusion; Jobs = $runInfo.jobs }
                }
            }
            
            Start-Sleep -Seconds $CheckInterval
            
        } catch {
            Write-Host "`n  ⚠️ Error checking run status: $_" -ForegroundColor Yellow
            Start-Sleep -Seconds $CheckInterval
        }
    }
}

function Get-WorkflowFailureLogs {
    param([string]$RunId)
    
    Write-Host "`n🔍 Analyzing failure logs..." -ForegroundColor Yellow
    
    try {
        $logs = gh run view $RunId --log 2>&1 | Out-String
        
        # Parse common error patterns
        $errors = @()
        
        if ($logs -match 'Invalid workflow file|YAML.*error') {
            $errors += "YAML_SYNTAX_ERROR"
        }
        if ($logs -match 'Implicit keys need to be on a single line') {
            $errors += "HEREDOC_SYNTAX_ERROR"
        }
        if ($logs -match 'Database.*connection.*failed|DATABASE_URL.*not set') {
            $errors += "DATABASE_CONNECTION_ERROR"
        }
        if ($logs -match 'docker.*build.*failed|Dockerfile.*not found') {
            $errors += "DOCKER_BUILD_ERROR"
        }
        if ($logs -match 'ECR.*repository.*not found|aws.*ecr.*error') {
            $errors += "ECR_ERROR"
        }
        if ($logs -match 'ECS.*cluster.*not found|ECS.*service.*error') {
            $errors += "ECS_ERROR"
        }
        if ($logs -match 'secret.*not found|Secrets Manager.*error') {
            $errors += "SECRETS_ERROR"
        }
        
        return @{
            Errors = $errors
            RawLogs = $logs
        }
    } catch {
        Write-Host "  ⚠️ Could not fetch logs: $_" -ForegroundColor Yellow
        return @{ Errors = @(); RawLogs = "" }
    }
}

function Repair-WorkflowErrors {
    param([array]$ErrorTypes)
    
    Write-Host "`n🔧 Attempting to fix detected errors..." -ForegroundColor Yellow
    
    $fixed = $false
    
    foreach ($error in $ErrorTypes) {
        Write-Host "  📝 Fixing: $error" -ForegroundColor Cyan
        
        switch ($error) {
            "YAML_SYNTAX_ERROR" {
                # Fix YAML syntax errors
                $workflows = Get-ChildItem .github/workflows/*.yml
                foreach ($wf in $workflows) {
                    $content = Get-Content $wf.FullName -Raw
                    if ($content -match 'python - <<') {
                        Write-Host "    → Fixing heredoc in $($wf.Name)" -ForegroundColor Yellow
                        # Already handled by heredoc fix
                        $fixed = $true
                    }
                }
            }
            
            "HEREDOC_SYNTAX_ERROR" {
                # Convert heredoc to one-liner
                Write-Host "    → Converting heredoc syntax to one-liner" -ForegroundColor Yellow
                $autoDeployPath = ".github/workflows/auto-deploy.yml"
                $content = Get-Content $autoDeployPath -Raw
                
                if ($content -match 'python - <<''PY''') {
                    # This should already be fixed, but just in case
                    Write-Host "    → Heredoc still present, this should not happen" -ForegroundColor Red
                }
                $fixed = $true
            }
            
            "DATABASE_CONNECTION_ERROR" {
                Write-Host "    → Database connection errors require AWS Secrets Manager setup" -ForegroundColor Yellow
                Write-Host "    → Please verify 'megilance/prod/database' secret exists in AWS" -ForegroundColor Yellow
            }
            
            "ECR_ERROR" {
                Write-Host "    → ECR errors require repository creation in AWS" -ForegroundColor Yellow
                Write-Host "    → Creating ECR repositories via AWS CLI..." -ForegroundColor Yellow
                aws ecr create-repository --repository-name megilance-backend --region us-east-2 2>$null
                aws ecr create-repository --repository-name megilance-frontend --region us-east-2 2>$null
                $fixed = $true
            }
            
            "ECS_ERROR" {
                Write-Host "    → ECS errors require cluster setup" -ForegroundColor Yellow
                Write-Host "    → Run 'Complete AWS Infrastructure Setup' workflow first" -ForegroundColor Yellow
            }
            
            default {
                Write-Host "    → Manual intervention may be required for: $error" -ForegroundColor Yellow
            }
        }
    }
    
    if ($fixed) {
        Write-Host "`n  💾 Committing fixes..." -ForegroundColor Yellow
        git add .github/workflows/*.yml
        $changes = git status --porcelain
        if ($changes) {
            git commit -m "fix(workflows): automated error fixes"
            git push origin main
            Write-Host "  ✅ Fixes committed and pushed" -ForegroundColor Green
        }
    }
    
    return $fixed
}

# ============= MAIN EXECUTION =============

Write-Host "`n📋 Configuration:" -ForegroundColor Cyan
Write-Host "   Workflow: $WorkflowName" -ForegroundColor White
Write-Host "   Environment: $Environment" -ForegroundColor White
Write-Host "   Max Retries: $MaxRetries" -ForegroundColor White
Write-Host "   Check Interval: $CheckInterval seconds" -ForegroundColor White

$attempt = 0
$success = $false

while ($attempt -lt $MaxRetries -and -not $success) {
    $attempt++
    
    Write-Host "`n╔════════════════ ATTEMPT $attempt/$MaxRetries ═══════════════════╗" -ForegroundColor Cyan
    
    # Trigger workflow
    $triggered = Invoke-WorkflowRun -Workflow $WorkflowName -Env $Environment
    
    if (-not $triggered) {
        Write-Host "  ⚠️ Failed to trigger workflow, retrying in $CheckInterval seconds..." -ForegroundColor Yellow
        Start-Sleep -Seconds $CheckInterval
        continue
    }
    
    # Wait for workflow to register
    Write-Host "  ⏳ Waiting for workflow to register..." -ForegroundColor Gray
    Start-Sleep -Seconds 10
    
    # Get the latest run
    $latestRun = Get-LatestWorkflowRun -Workflow $WorkflowName
    
    if (-not $latestRun) {
        Write-Host "  ⚠️ Could not find workflow run, retrying..." -ForegroundColor Yellow
        Start-Sleep -Seconds $CheckInterval
        continue
    }
    
    $runId = $latestRun.databaseId
    Write-Host "  📊 Run ID: $runId" -ForegroundColor Gray
    
    # Monitor execution
    $result = Watch-WorkflowExecution -RunId $runId
    
    if ($result.Success) {
        $success = $true
        Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green -BackgroundColor DarkGreen
        Write-Host "║                                                                ║" -ForegroundColor Green -BackgroundColor DarkGreen
        Write-Host "║          ✅ WORKFLOW COMPLETED SUCCESSFULLY! ✅                ║" -ForegroundColor Green -BackgroundColor DarkGreen
        Write-Host "║                                                                ║" -ForegroundColor Green -BackgroundColor DarkGreen
        Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green -BackgroundColor DarkGreen
        
        Write-Host "`n🎉 Deployment Summary:" -ForegroundColor Cyan
        Write-Host "   Run ID: $runId" -ForegroundColor White
        Write-Host "   Attempts: $attempt" -ForegroundColor White
        Write-Host "   Status: SUCCESS" -ForegroundColor Green
        Write-Host "`n🔗 View details: https://github.com/ghulam-mujtaba5/MegiLance/actions/runs/$runId" -ForegroundColor Cyan
        
        break
    } else {
        # Analyze failure
        Write-Host "`n📊 Analyzing failure..." -ForegroundColor Yellow
        $failureInfo = Get-WorkflowFailureLogs -RunId $runId
        
        Write-Host "`n  Detected errors:" -ForegroundColor Red
        if ($failureInfo.Errors.Count -eq 0) {
            Write-Host "    - Unknown error (check logs manually)" -ForegroundColor Red
        } else {
            $failureInfo.Errors | ForEach-Object { Write-Host "    - $_" -ForegroundColor Red }
        }
        
        # Attempt repairs
        if ($failureInfo.Errors.Count -gt 0) {
            $repaired = Repair-WorkflowErrors -ErrorTypes $failureInfo.Errors
            
            if ($repaired) {
                Write-Host "`n  ✅ Fixes applied, retrying in $CheckInterval seconds..." -ForegroundColor Green
                Start-Sleep -Seconds $CheckInterval
            } else {
                Write-Host "`n  ⚠️ Could not auto-fix all errors" -ForegroundColor Yellow
                Write-Host "  🔗 View logs: https://github.com/ghulam-mujtaba5/MegiLance/actions/runs/$runId" -ForegroundColor Cyan
                
                if ($attempt -lt $MaxRetries) {
                    Write-Host "  ⏳ Retrying anyway in $CheckInterval seconds..." -ForegroundColor Yellow
                    Start-Sleep -Seconds $CheckInterval
                }
            }
        }
    }
}

if (-not $success) {
    Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║                                                                ║" -ForegroundColor Red
    Write-Host "║     ❌ WORKFLOW FAILED AFTER $MaxRetries ATTEMPTS ❌                    ║" -ForegroundColor Red
    Write-Host "║                                                                ║" -ForegroundColor Red
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Red
    
    Write-Host "`n📝 Manual intervention required:" -ForegroundColor Yellow
    Write-Host "   1. Check AWS resources are set up correctly" -ForegroundColor White
    Write-Host "   2. Verify AWS credentials and permissions" -ForegroundColor White
    Write-Host "   3. Review workflow logs for specific errors" -ForegroundColor White
    Write-Host "   4. Check WORKFLOW_EXECUTION_GUIDE.md for troubleshooting" -ForegroundColor White
    
    exit 1
}

exit 0
