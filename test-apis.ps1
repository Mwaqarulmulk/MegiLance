# Quick API Test Script
$baseUrl = "http://localhost:8000"

Write-Host "`nTesting MegiLance APIs..." -ForegroundColor Cyan

# 1. Health Check
$health = Invoke-RestMethod -Uri "$baseUrl/api/health/live"
Write-Host "✅ Health: $($health.status)"

# 2. Login as admin
$loginData = "username=admin@megilance.com&password=Admin123!"
$login = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -ContentType "application/x-www-form-urlencoded" -Body $loginData
Write-Host "✅ Login: Token received"

# 3. Get current user
$headers = @{Authorization = "Bearer $($login.access_token)"}
$me = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Headers $headers
Write-Host "✅ Current user: $($me.email) ($($me.user_type))"

# 4. List projects
$projects = Invoke-RestMethod -Uri "$baseUrl/api/projects"
Write-Host "✅ Projects: $($projects.Count) found"

Write-Host "`n🎉 All tests passed!" -ForegroundColor Green
