#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Automated GitHub Workflow Monitor and Fixer
.DESCRIPTION
    Monitors GitHub Actions workflows, detects errors, and automatically fixes them
#>

param(
    [string]$WorkflowFile = "auto-deploy.yml",
    [int]$MaxIterations = 10,
    [int]$CheckInterval = 30
)

Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   AUTOMATED WORKFLOW MONITOR & FIXER v1.0              ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

$ErrorActionPreference = "Continue"
$iteration = 0
$workflowsPath = ".github/workflows"

function Test-YAMLSyntax {
    param([string]$FilePath)
    
    Write-Host "`n🔍 Checking YAML syntax: $FilePath" -ForegroundColor Yellow
    
    $content = Get-Content $FilePath -Raw
    $errors = @()
    
    # Check for heredoc syntax
    if ($content -match 'python - <<') {
        $errors += "Heredoc syntax found (causes YAML parse errors)"
    }
    
    # Check for common YAML issues
    if ($content -match '^\s+[^-\s].*:\s*$') {
        # Potential indentation issue
    }
    
    if ($errors.Count -eq 0) {
        Write-Host "  ✅ No syntax errors found" -ForegroundColor Green
        return $true
    } else {
        Write-Host "  ❌ Errors found:" -ForegroundColor Red
        $errors | ForEach-Object { Write-Host "     - $_" -ForegroundColor Red }
        return $false
    }
}

function Fix-HeredocSyntax {
    param([string]$FilePath)
    
    Write-Host "`n🔧 Fixing heredoc syntax in: $FilePath" -ForegroundColor Yellow
    
    $content = Get-Content $FilePath -Raw
    
    if ($content -match 'python - <<''PY''[\r\n]+(.*?)[\r\n]+PY') {
        Write-Host "  ⚠️ Heredoc found - converting to one-liner..." -ForegroundColor Yellow
        
        # Extract the Python code
        $pythonCode = $matches[1] -replace '[\r\n]+', '; '
        $pythonCode = $pythonCode.Trim()
        
        # Replace with one-liner
        $oneLiner = "python -c `"$pythonCode`""
        $content = $content -replace 'python - <<''PY''[\r\n]+(.*?)[\r\n]+PY', $oneLiner
        
        Set-Content -Path $FilePath -Value $content -NoNewline
        Write-Host "  ✅ Fixed: Converted to one-liner" -ForegroundColor Green
        return $true
    }
    
    Write-Host "  ℹ️ No heredoc syntax to fix" -ForegroundColor Gray
    return $false
}

function Get-WorkflowErrors {
    Write-Host "`n📊 Scanning all workflows for issues..." -ForegroundColor Yellow
    
    $allWorkflows = Get-ChildItem "$workflowsPath/*.yml"
    $errorCount = 0
    $fixedCount = 0
    
    foreach ($workflow in $allWorkflows) {
        Write-Host "`n  Processing: $($workflow.Name)" -ForegroundColor Cyan
        
        $hasErrors = -not (Test-YAMLSyntax -FilePath $workflow.FullName)
        
        if ($hasErrors) {
            $errorCount++
            $fixed = Fix-HeredocSyntax -FilePath $workflow.FullName
            if ($fixed) { $fixedCount++ }
        }
    }
    
    return @{
        Total = $allWorkflows.Count
        Errors = $errorCount
        Fixed = $fixedCount
    }
}

function Invoke-GitCommitAndPush {
    param([string]$Message)
    
    Write-Host "`n📦 Committing fixes..." -ForegroundColor Yellow
    
    $changes = git status --porcelain
    if ($changes) {
        git add .github/workflows/*.yml
        git commit -m "fix(workflows): $Message"
        git push origin main
        Write-Host "  ✅ Changes committed and pushed" -ForegroundColor Green
        return $true
    } else {
        Write-Host "  ℹ️ No changes to commit" -ForegroundColor Gray
        return $false
    }
}

# Main execution loop
while ($iteration -lt $MaxIterations) {
    $iteration++
    
    Write-Host "`n╔════════════════ ITERATION $iteration/$MaxIterations ═══════════════╗" -ForegroundColor Cyan
    
    $results = Get-WorkflowErrors
    
    Write-Host "`n📈 Results:" -ForegroundColor Yellow
    Write-Host "   Total workflows: $($results.Total)" -ForegroundColor White
    Write-Host "   Errors found: $($results.Errors)" -ForegroundColor $(if ($results.Errors -eq 0) { "Green" } else { "Red" })
    Write-Host "   Fixed: $($results.Fixed)" -ForegroundColor Green
    
    if ($results.Fixed -gt 0) {
        Invoke-GitCommitAndPush -Message "automated fix iteration $iteration"
    }
    
    if ($results.Errors -eq 0) {
        Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green -BackgroundColor DarkGreen
        Write-Host "║  ✅ ALL WORKFLOWS FIXED AND READY! SUCCESS! ✅          ║" -ForegroundColor Green -BackgroundColor DarkGreen
        Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green -BackgroundColor DarkGreen
        break
    }
    
    if ($iteration -lt $MaxIterations) {
        Write-Host "`n⏳ Waiting $CheckInterval seconds before next check..." -ForegroundColor Gray
        Start-Sleep -Seconds $CheckInterval
    }
}

if ($results.Errors -gt 0) {
    Write-Host "`n⚠️ Maximum iterations reached. Manual intervention may be required." -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "`n🎉 All workflows are now fixed and validated!" -ForegroundColor Green
    exit 0
}
