<#
.SYNOPSIS
Deploy MegiLance frontend to DigitalOcean App Platform using doctl (PowerShell only, no bash required).

.EXAMPLE
  $env:DO_API_TOKEN = 'dop_v1_...'
  .\devops\deploy_do_frontend.ps1
#>

param(
    [string]$Token = $env:DO_API_TOKEN,
    [int]$MaxWaitSeconds = 600
)

$ErrorActionPreference = 'Stop'
$WarningPreference = 'SilentlyContinue'

# Ensure doctl exists
if (-not (Get-Command doctl -ErrorAction SilentlyContinue)) {
    Write-Error "doctl not found. Install from https://github.com/digitalocean/doctl/releases"
    exit 1
}

# Prompt for token if not set
if (-not $Token) {
    Write-Host "Enter DigitalOcean API token:" -ForegroundColor Yellow
    $secureToken = Read-Host -AsSecureString
    $Token = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureToken)
    )
}

if (-not $Token) {
    Write-Error "Token required"
    exit 1
}

$APP_NAME = 'megilance-frontend'
$SPEC_FILE = './devops/do-app-spec.yaml'

if (-not (Test-Path $SPEC_FILE)) {
    Write-Error "Spec file not found: $SPEC_FILE"
    exit 1
}

# Auth
Write-Host "Step 1: Authenticating doctl..." -ForegroundColor Cyan
$authResult = & doctl auth init --access-token $Token 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Auth output: $authResult"
    Write-Error "Authentication failed"
    exit 1
}
Write-Host "✓ Authenticated" -ForegroundColor Green

# Get or create app
Write-Host "Step 2: Looking for existing app '$APP_NAME'..." -ForegroundColor Cyan

$appsJson = & doctl apps list --format Name,ID --output json --no-header 2>&1
if ($LASTEXITCODE -eq 0 -and $appsJson) {
    try {
        $apps = $appsJson | ConvertFrom-Json -ErrorAction SilentlyContinue
        $existingApp = $apps | Where-Object { $_.name -eq $APP_NAME } | Select-Object -First 1
        if ($existingApp) {
            $APP_ID = $existingApp.id
            Write-Host "✓ Found existing app: $APP_ID" -ForegroundColor Green
            Write-Host "  Updating app with spec..." -ForegroundColor Cyan
            $updateResult = & doctl apps update $APP_ID --spec $SPEC_FILE 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✓ App updated" -ForegroundColor Green
            } else {
                Write-Host "  Update output: $updateResult" -ForegroundColor Yellow
            }
        }
    } catch {
        Write-Host "  (No existing apps found)" -ForegroundColor DarkGray
    }
}

# If no app found, create new one
if (-not $APP_ID) {
    Write-Host "  Creating new app from spec..." -ForegroundColor Cyan
    $createJson = & doctl apps create --spec $SPEC_FILE --output json 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to create app: $createJson"
        exit 1
    }
    
    try {
        $appData = $createJson | ConvertFrom-Json
        $APP_ID = $appData.id
        if (-not $APP_ID) {
            Write-Error "No app ID returned: $createJson"
            exit 1
        }
        Write-Host "✓ Created app: $APP_ID" -ForegroundColor Green
    } catch {
        Write-Error "Failed to parse create response: $createJson"
        exit 1
    }
}

# Poll deployment
Write-Host "Step 3: Polling deployment status..." -ForegroundColor Cyan

$pollCount = 0
$pollInterval = 15
$maxPolls = [Math]::Ceiling($MaxWaitSeconds / $pollInterval)

while ($pollCount -lt $maxPolls) {
    $depsJson = & doctl apps deployments list $APP_ID --format ID,Phase --output json 2>&1
    
    if ($LASTEXITCODE -eq 0 -and $depsJson) {
        try {
            $deps = $depsJson | ConvertFrom-Json -ErrorAction SilentlyContinue
            if ($deps -and $deps.Count -gt 0) {
                $latestDep = $deps[0]
                $DEP_ID = $latestDep.id
                $STATUS = $latestDep.phase
                
                Write-Host "  Deployment $DEP_ID - Phase: $STATUS" -ForegroundColor Yellow
                
                if ($STATUS -eq 'ACTIVE') {
                    Write-Host "✓ Deployment ACTIVE!" -ForegroundColor Green
                    Write-Host ""
                    Write-Host "Step 4: Retrieving app URL..." -ForegroundColor Cyan
                    
                    $appDetailsJson = & doctl apps get $APP_ID --output json 2>&1
                    if ($LASTEXITCODE -eq 0) {
                        try {
                            $appDetails = $appDetailsJson | ConvertFrom-Json
                            $appUrl = $appDetails.default_ingress
                            if ($appUrl) {
                                Write-Host "✓ Frontend deployed successfully!" -ForegroundColor Green
                                Write-Host "  URL: $appUrl" -ForegroundColor Cyan
                                exit 0
                            }
                        } catch { }
                    }
                    exit 0
                }
                
                if ($STATUS -eq 'ERROR') {
                    Write-Host "✗ Deployment ERROR" -ForegroundColor Red
                    Write-Host "Step 4: Fetching error logs..." -ForegroundColor Cyan
                    
                    $logFile = "do_deploy_logs_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
                    $logsJson = & doctl apps logs get --app-id $APP_ID --deployment-id $DEP_ID 2>&1
                    $logsJson | Out-File $logFile -Encoding UTF8
                    
                    Write-Host "Logs saved to: $logFile" -ForegroundColor Yellow
                    Write-Host ""
                    Write-Host "=== Last 50 lines of logs ===" -ForegroundColor Yellow
                    if (Test-Path $logFile) {
                        Get-Content $logFile -Tail 50 | Write-Host
                    }
                    Write-Host "===========================" -ForegroundColor Yellow
                    Write-Host ""
                    Write-Error "Deployment failed. See logs above and in $logFile"
                    exit 1
                }
            }
        } catch {
            Write-Host "  (Waiting for first deployment...)" -ForegroundColor DarkGray
        }
    }
    
    $pollCount++
    if ($pollCount -lt $maxPolls) {
        Write-Host "  Waiting $pollInterval seconds... (attempt $pollCount/$maxPolls)" -ForegroundColor DarkGray
        Start-Sleep -Seconds $pollInterval
    }
}

Write-Error "Deployment timed out after $MaxWaitSeconds seconds"
Write-Host "Check dashboard: https://cloud.digitalocean.com/apps/$APP_ID" -ForegroundColor Yellow
exit 1
