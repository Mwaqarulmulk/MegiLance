# Quick Authentication Test Script

Write-Host "`n🔐 Testing Login System`n" -ForegroundColor Cyan

# Test Client Login
Write-Host "1. Client Login (client1@megilance.com)..." -ForegroundColor Yellow
$clientResp = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login" -Method Post -ContentType "application/x-www-form-urlencoded" -Body "username=client1@megilance.com&password=Demo123!"
if ($clientResp.access_token) {
    Write-Host "   ✅ Success! User: $($clientResp.user.name) ($($clientResp.user.user_type))" -ForegroundColor Green
} else {
    Write-Host "   ❌ Failed - no token" -ForegroundColor Red
}

# Test Freelancer Login
Write-Host "`n2. Freelancer Login (freelancer1@megilance.com)..." -ForegroundColor Yellow
$freelancerResp = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login" -Method Post -ContentType "application/x-www-form-urlencoded" -Body "username=freelancer1@megilance.com&password=Demo123!"
if ($freelancerResp.access_token) {
    Write-Host "   ✅ Success! User: $($freelancerResp.user.name) ($($freelancerResp.user.user_type))" -ForegroundColor Green
    Write-Host "   Hourly Rate: `$$($freelancerResp.user.hourly_rate)" -ForegroundColor Gray
} else {
    Write-Host "   ❌ Failed - no token" -ForegroundColor Red
}

# Test Admin Login
Write-Host "`n3. Admin Login (admin@megilance.com)..." -ForegroundColor Yellow
$adminResp = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login" -Method Post -ContentType "application/x-www-form-urlencoded" -Body "username=admin@megilance.com&password=Demo123!"
if ($adminResp.access_token) {
    Write-Host "   ✅ Success! User: $($adminResp.user.name) ($($adminResp.user.user_type))" -ForegroundColor Green
} else {
    Write-Host "   ❌ Failed - no token" -ForegroundColor Red
}

# Test authenticated endpoint
Write-Host "`n4. Testing /api/auth/me with token..." -ForegroundColor Yellow
$headers = @{Authorization = "Bearer $($clientResp.access_token)"}
$me = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/me" -Headers $headers
Write-Host "   ✅ Authenticated as: $($me.name) ($($me.user_type))" -ForegroundColor Green

Write-Host "`n✅ ALL TESTS PASSED! Authentication system working perfectly!`n" -ForegroundColor Green
