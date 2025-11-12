# MegiLance Demo - Final Verification Script
# Run this 5 minutes before your professor demo

Write-Host "`n" -NoNewline
Write-Host "🎓 " -ForegroundColor Cyan -NoNewline
Write-Host "MegiLance Demo - Final Verification" -ForegroundColor White
Write-Host "=" * 50 -ForegroundColor Gray
Write-Host ""

$allGood = $true

# 1. Check Docker containers
Write-Host "1️⃣  Checking Docker containers..." -ForegroundColor Yellow
try {
    $containers = docker ps --filter name=megilance --format "{{.Names}}" 
    $containerCount = ($containers | Measure-Object -Line).Lines
    
    if ($containerCount -eq 2) {
        Write-Host "   ✅ Both containers running" -ForegroundColor Green
        $containers | ForEach-Object { Write-Host "      - $_" -ForegroundColor Gray }
    } else {
        Write-Host "   ❌ Expected 2 containers, found $containerCount!" -ForegroundColor Red
        $allGood = $false
    }
} catch {
    Write-Host "   ❌ Failed to check containers: $_" -ForegroundColor Red
    $allGood = $false
}

# 2. Check backend health
Write-Host "`n2️⃣  Checking backend health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8000/api/health/live" -TimeoutSec 5
    if ($health.status -eq "ok") {
        Write-Host "   ✅ Backend healthy" -ForegroundColor Green
        Write-Host "      Response: $($health | ConvertTo-Json -Compress)" -ForegroundColor Gray
    } else {
        Write-Host "   ❌ Backend unhealthy: $($health | ConvertTo-Json)" -ForegroundColor Red
        $allGood = $false
    }
} catch {
    Write-Host "   ❌ Backend not responding: $_" -ForegroundColor Red
    Write-Host "      Try: docker-compose -f docker-compose.oracle.yml restart backend" -ForegroundColor Yellow
    $allGood = $false
}

# 3. Check database connection and data
Write-Host "`n3️⃣  Checking Oracle database..." -ForegroundColor Yellow
try {
    $dbScript = @"
from sqlalchemy import create_engine, text
import os
e = create_engine(os.getenv('DATABASE_URL'))
c = e.connect()
print(f'users:{c.execute(text("SELECT COUNT(*) FROM users")).scalar()}')
print(f'projects:{c.execute(text("SELECT COUNT(*) FROM projects")).scalar()}')
print(f'proposals:{c.execute(text("SELECT COUNT(*) FROM proposals")).scalar()}')
"@
    
    $dbResult = docker exec megilance-backend-1 python -c $dbScript 2>&1
    
    if ($dbResult -match 'users:(\d+)') {
        $userCount = $matches[1]
        Write-Host "   ✅ Database connected" -ForegroundColor Green
    }
    
    if ($dbResult -match 'projects:(\d+)') {
        $projectCount = $matches[1]
    }
    
    if ($dbResult -match 'proposals:(\d+)') {
        $proposalCount = $matches[1]
    }
    
    Write-Host "      - Users: $userCount" -ForegroundColor Gray
    Write-Host "      - Projects: $projectCount" -ForegroundColor Gray
    Write-Host "      - Proposals: $proposalCount" -ForegroundColor Gray
    
    if ($userCount -lt 6) {
        Write-Host "   ⚠️  Expected 6 users, found $userCount" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Database check failed: $_" -ForegroundColor Red
    $allGood = $false
}

# 4. Check database tables
Write-Host "`n4️⃣  Checking database tables..." -ForegroundColor Yellow
try {
    $tableScript = @"
from sqlalchemy import create_engine, text
import os
e = create_engine(os.getenv('DATABASE_URL'))
c = e.connect()
tables = [r[0] for r in c.execute(text('SELECT table_name FROM user_tables ORDER BY table_name'))]
print(','.join(tables))
"@
    
    $tables = docker exec megilance-backend-1 python -c $tableScript 2>&1
    $tableList = $tables -split ','
    $tableCount = $tableList.Count
    
    if ($tableCount -ge 6) {
        Write-Host "   ✅ $tableCount tables created" -ForegroundColor Green
        $tableList | ForEach-Object { Write-Host "      - $_" -ForegroundColor Gray }
    } else {
        Write-Host "   ⚠️  Expected 6 tables, found $tableCount" -ForegroundColor Yellow
        $tableList | ForEach-Object { Write-Host "      - $_" -ForegroundColor Gray }
    }
} catch {
    Write-Host "   ❌ Table check failed: $_" -ForegroundColor Red
    $allGood = $false
}

# 5. Check API endpoints
Write-Host "`n5️⃣  Checking API endpoints..." -ForegroundColor Yellow
try {
    $projects = Invoke-RestMethod -Uri "http://localhost:8000/api/projects" -TimeoutSec 5
    $projectCount = ($projects | Measure-Object).Count
    Write-Host "   ✅ Projects API working ($projectCount projects)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Projects API failed: $_" -ForegroundColor Red
    $allGood = $false
}

# 6. Check frontend
Write-Host "`n6️⃣  Checking frontend..." -ForegroundColor Yellow
try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing
    if ($frontend.StatusCode -eq 200) {
        Write-Host "   ✅ Frontend accessible" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  Frontend not responding: $_" -ForegroundColor Yellow
    Write-Host "      (Not critical for backend demo)" -ForegroundColor Gray
}

# Summary
Write-Host "`n" -NoNewline
Write-Host "=" * 50 -ForegroundColor Gray
if ($allGood) {
    Write-Host "🎉 " -ForegroundColor Green -NoNewline
    Write-Host "ALL SYSTEMS READY FOR DEMO!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "  1. Open: PROFESSOR_DEMO_SCRIPT_FINAL.md" -ForegroundColor White
    Write-Host "  2. Open browser: http://localhost:8000/api/docs" -ForegroundColor White
    Write-Host "  3. Open Oracle Console: https://cloud.oracle.com/" -ForegroundColor White
    Write-Host "`n💡 Demo credentials (password: Demo123!):" -ForegroundColor Cyan
    Write-Host "   - Admin: admin@megilance.com" -ForegroundColor Gray
    Write-Host "   - Client: client1@megilance.com" -ForegroundColor Gray
    Write-Host "   - Freelancer: freelancer1@megilance.com" -ForegroundColor Gray
} else {
    Write-Host "⚠️  " -ForegroundColor Yellow -NoNewline
    Write-Host "SOME CHECKS FAILED" -ForegroundColor Yellow
    Write-Host "`nQuick fixes:" -ForegroundColor Cyan
    Write-Host "  docker-compose -f docker-compose.oracle.yml restart" -ForegroundColor White
    Write-Host "  Start-Sleep -Seconds 25" -ForegroundColor White
    Write-Host "  .\verify-demo-ready.ps1" -ForegroundColor White
}
Write-Host "=" * 50 -ForegroundColor Gray
Write-Host ""
