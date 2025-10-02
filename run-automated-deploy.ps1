#!/usr/bin/env pwsh
# Quick launcher for automated workflow execution

Write-Host "`n🚀 Starting Fully Automated Workflow Execution..." -ForegroundColor Cyan

& ".\.github\scripts\auto-run-and-monitor.ps1" `
    -WorkflowName "auto-deploy.yml" `
    -Environment "production" `
    -MaxRetries 5 `
    -CheckInterval 30
