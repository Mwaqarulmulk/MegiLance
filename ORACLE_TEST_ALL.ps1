# Oracle Database Test & Verification Script
# Tests all APIs and database functionality

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     Oracle Database Complete Testing Suite          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:8000"
$testResults = @()

# Test 1: Health Check
Write-Host "📊 Test 1/10: Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/health/live" -Method Get -TimeoutSec 10
    if ($response.status -eq "healthy") {
        Write-Host "✅ PASS: Backend is healthy" -ForegroundColor Green
        $testResults += @{test="Health Check"; status="PASS"}
    } else {
        Write-Host "❌ FAIL: Backend unhealthy: $($response | ConvertTo-Json)" -ForegroundColor Red
        $testResults += @{test="Health Check"; status="FAIL"}
    }
} catch {
    Write-Host "❌ FAIL: Health check failed - $($_.Exception.Message)" -ForegroundColor Red
    $testResults += @{test="Health Check"; status="FAIL"}
}
Write-Host ""

# Test 2: Database Version
Write-Host "📊 Test 2/10: Oracle Database Version" -ForegroundColor Yellow
try {
    $version = docker exec megilance-backend-1 python -c @"
from sqlalchemy import create_engine, text
import os
engine = create_engine(os.getenv('DATABASE_URL'))
with engine.connect() as conn:
    result = conn.execute(text('SELECT BANNER FROM V\$VERSION WHERE ROWNUM = 1'))
    print(result.scalar())
"@ 2>&1

    if ($version -match "Oracle") {
        Write-Host "✅ PASS: $version" -ForegroundColor Green
        $testResults += @{test="Database Version"; status="PASS"; details=$version}
    } else {
        Write-Host "❌ FAIL: Could not detect Oracle version" -ForegroundColor Red
        $testResults += @{test="Database Version"; status="FAIL"}
    }
} catch {
    Write-Host "❌ FAIL: Version check failed - $($_.Exception.Message)" -ForegroundColor Red
    $testResults += @{test="Database Version"; status="FAIL"}
}
Write-Host ""

# Test 3: oracledb Module
Write-Host "📊 Test 3/10: oracledb Python Module" -ForegroundColor Yellow
try {
    $oracledbVer = docker exec megilance-backend-1 python -c "import oracledb; print(oracledb.__version__)" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PASS: oracledb v$oracledbVer installed" -ForegroundColor Green
        $testResults += @{test="oracledb Module"; status="PASS"; version=$oracledbVer}
    } else {
        Write-Host "❌ FAIL: oracledb not found" -ForegroundColor Red
        $testResults += @{test="oracledb Module"; status="FAIL"}
    }
} catch {
    Write-Host "❌ FAIL: Module check failed" -ForegroundColor Red
    $testResults += @{test="oracledb Module"; status="FAIL"}
}
Write-Host ""

# Test 4: Database Tables
Write-Host "📊 Test 4/10: Database Schema (Tables)" -ForegroundColor Yellow
try {
    $tables = docker exec megilance-backend-1 python -c @"
from sqlalchemy import create_engine, text
import os
engine = create_engine(os.getenv('DATABASE_URL'))
with engine.connect() as conn:
    result = conn.execute(text('SELECT table_name FROM user_tables ORDER BY table_name'))
    tables = [row[0] for row in result]
    print(','.join(tables) if tables else 'NO_TABLES')
"@ 2>&1

    if ($tables -and $tables -ne "NO_TABLES") {
        Write-Host "✅ PASS: Found tables: $tables" -ForegroundColor Green
        $testResults += @{test="Database Schema"; status="PASS"; tables=$tables}
    } else {
        Write-Host "⚠️  WARN: No tables found (run migrations first)" -ForegroundColor Yellow
        $testResults += @{test="Database Schema"; status="WARN"}
    }
} catch {
    Write-Host "❌ FAIL: Schema check failed - $($_.Exception.Message)" -ForegroundColor Red
    $testResults += @{test="Database Schema"; status="FAIL"}
}
Write-Host ""

# Test 5: User Registration
Write-Host "📊 Test 5/10: User Registration API" -ForegroundColor Yellow
$testUser = @{
    email = "oracle-test-$(Get-Random)@megilance.com"
    password = "OracleTest123!"
    full_name = "Oracle Test User"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post `
        -ContentType "application/json" -Body $testUser -TimeoutSec 10
    
    if ($response.id) {
        Write-Host "✅ PASS: User created with ID $($response.id)" -ForegroundColor Green
        $script:testUserId = $response.id
        $script:testUserEmail = ($testUser | ConvertFrom-Json).email
        $testResults += @{test="User Registration"; status="PASS"; user_id=$response.id}
    } else {
        Write-Host "❌ FAIL: Registration returned no user ID" -ForegroundColor Red
        $testResults += @{test="User Registration"; status="FAIL"}
    }
} catch {
    if ($_.Exception.Message -match "409") {
        Write-Host "⚠️  WARN: User already exists (acceptable)" -ForegroundColor Yellow
        $testResults += @{test="User Registration"; status="WARN"}
    } else {
        Write-Host "❌ FAIL: Registration failed - $($_.Exception.Message)" -ForegroundColor Red
        $testResults += @{test="User Registration"; status="FAIL"}
    }
}
Write-Host ""

# Test 6: User Login
Write-Host "📊 Test 6/10: User Login API" -ForegroundColor Yellow
if ($script:testUserEmail) {
    $loginData = "username=$($script:testUserEmail)&password=OracleTest123!"
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post `
            -ContentType "application/x-www-form-urlencoded" -Body $loginData -TimeoutSec 10
        
        if ($response.access_token) {
            Write-Host "✅ PASS: Login successful, token received" -ForegroundColor Green
            $script:authToken = $response.access_token
            $testResults += @{test="User Login"; status="PASS"}
        } else {
            Write-Host "❌ FAIL: No access token received" -ForegroundColor Red
            $testResults += @{test="User Login"; status="FAIL"}
        }
    } catch {
        Write-Host "❌ FAIL: Login failed - $($_.Exception.Message)" -ForegroundColor Red
        $testResults += @{test="User Login"; status="FAIL"}
    }
} else {
    Write-Host "⏭️  SKIP: No test user available" -ForegroundColor Gray
    $testResults += @{test="User Login"; status="SKIP"}
}
Write-Host ""

# Test 7: Authenticated Endpoint
Write-Host "📊 Test 7/10: Authenticated Endpoint (/api/auth/me)" -ForegroundColor Yellow
if ($script:authToken) {
    $headers = @{
        Authorization = "Bearer $($script:authToken)"
    }
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Method Get `
            -Headers $headers -TimeoutSec 10
        
        if ($response.email) {
            Write-Host "✅ PASS: Retrieved user profile for $($response.email)" -ForegroundColor Green
            $testResults += @{test="Authenticated Endpoint"; status="PASS"}
        } else {
            Write-Host "❌ FAIL: No user data returned" -ForegroundColor Red
            $testResults += @{test="Authenticated Endpoint"; status="FAIL"}
        }
    } catch {
        Write-Host "❌ FAIL: Auth endpoint failed - $($_.Exception.Message)" -ForegroundColor Red
        $testResults += @{test="Authenticated Endpoint"; status="FAIL"}
    }
} else {
    Write-Host "⏭️  SKIP: No auth token available" -ForegroundColor Gray
    $testResults += @{test="Authenticated Endpoint"; status="SKIP"}
}
Write-Host ""

# Test 8: Data Persistence
Write-Host "📊 Test 8/10: Data Persistence (User Count)" -ForegroundColor Yellow
try {
    $count = docker exec megilance-backend-1 python -c @"
from sqlalchemy import create_engine, text
import os
engine = create_engine(os.getenv('DATABASE_URL'))
with engine.connect() as conn:
    result = conn.execute(text('SELECT COUNT(*) FROM users'))
    print(result.scalar())
"@ 2>&1

    if ($count -match '^\d+$') {
        Write-Host "✅ PASS: Found $count user(s) in Oracle database" -ForegroundColor Green
        $testResults += @{test="Data Persistence"; status="PASS"; user_count=$count}
    } else {
        Write-Host "❌ FAIL: Could not query user count" -ForegroundColor Red
        $testResults += @{test="Data Persistence"; status="FAIL"}
    }
} catch {
    Write-Host "❌ FAIL: Persistence test failed - $($_.Exception.Message)" -ForegroundColor Red
    $testResults += @{test="Data Persistence"; status="FAIL"}
}
Write-Host ""

# Test 9: Swagger UI
Write-Host "📊 Test 9/10: Swagger UI Documentation" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/docs" -Method Get -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ PASS: Swagger UI accessible at $baseUrl/api/docs" -ForegroundColor Green
        $testResults += @{test="Swagger UI"; status="PASS"}
    } else {
        Write-Host "❌ FAIL: Swagger UI returned status $($response.StatusCode)" -ForegroundColor Red
        $testResults += @{test="Swagger UI"; status="FAIL"}
    }
} catch {
    Write-Host "❌ FAIL: Swagger UI not accessible - $($_.Exception.Message)" -ForegroundColor Red
    $testResults += @{test="Swagger UI"; status="FAIL"}
}
Write-Host ""

# Test 10: Frontend Connection
Write-Host "📊 Test 10/10: Frontend Status" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Get -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ PASS: Frontend accessible at http://localhost:3000" -ForegroundColor Green
        $testResults += @{test="Frontend"; status="PASS"}
    } else {
        Write-Host "❌ FAIL: Frontend returned status $($response.StatusCode)" -ForegroundColor Red
        $testResults += @{test="Frontend"; status="FAIL"}
    }
} catch {
    Write-Host "⚠️  WARN: Frontend not responding (may not be started)" -ForegroundColor Yellow
    $testResults += @{test="Frontend"; status="WARN"}
}
Write-Host ""

# Summary
Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║              TEST RESULTS SUMMARY                    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$passed = ($testResults | Where-Object {$_.status -eq "PASS"}).Count
$failed = ($testResults | Where-Object {$_.status -eq "FAIL"}).Count
$warned = ($testResults | Where-Object {$_.status -eq "WARN"}).Count
$skipped = ($testResults | Where-Object {$_.status -eq "SKIP"}).Count
$total = $testResults.Count

Write-Host "✅ Passed:  $passed/$total" -ForegroundColor Green
Write-Host "❌ Failed:  $failed/$total" -ForegroundColor Red
Write-Host "⚠️  Warned:  $warned/$total" -ForegroundColor Yellow
Write-Host "⏭️  Skipped: $skipped/$total" -ForegroundColor Gray

if ($failed -eq 0 -and $passed -ge 7) {
    Write-Host "`n🎉 ALL CRITICAL TESTS PASSED! Oracle setup is working!" -ForegroundColor Green
} elseif ($failed -le 2) {
    Write-Host "`n⚠️  MOSTLY WORKING - Some tests failed but system is functional" -ForegroundColor Yellow
} else {
    Write-Host "`n❌ SYSTEM NOT READY - Multiple failures detected" -ForegroundColor Red
}

# Save results
$summary = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    total_tests = $total
    passed = $passed
    failed = $failed
    warned = $warned
    skipped = $skipped
    results = $testResults
} | ConvertTo-Json -Depth 3

$summary | Out-File "E:\MegiLance\oracle-test-results.json"
Write-Host "`n✅ Results saved to oracle-test-results.json" -ForegroundColor Gray

Write-Host "`n🔗 Quick Access:" -ForegroundColor Cyan
Write-Host "   Backend API:   http://localhost:8000/api/docs" -ForegroundColor White
Write-Host "   Frontend:      http://localhost:3000" -ForegroundColor White
Write-Host "   Health Check:  http://localhost:8000/api/health/live`n" -ForegroundColor White
