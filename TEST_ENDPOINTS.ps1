# 🧪 JWT AUTH ENDPOINT TEST SCRIPT
# Test all 5 endpoints according to specification

$API_URL = "http://localhost:5000"  # Change to your backend URL

Write-Host "`n🎯 JWT AUTHENTICATION TEST - 5 ENDPOINTS`n" -ForegroundColor Cyan

# ============================================
# 1. REGISTRERING (No Auth Required)
# ============================================
Write-Host "1️⃣  TEST: REGISTRERING /api/Register/RegisterUser" -ForegroundColor Yellow
Write-Host "Expected: 200 + {message, access, refresh}" -ForegroundColor Gray

$registerBody = @{
    Email = "test@test.com"
    Password = "test123"
    ConfirmPassword = "test123"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-WebRequest -Uri "$API_URL/api/Register/RegisterUser" `
        -Method POST `
        -ContentType "application/json" `
        -Body $registerBody `
        -UseBasicParsing
    
    $registerData = $registerResponse.Content | ConvertFrom-Json
    Write-Host "✅ PASS - Status: $($registerResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($registerResponse.Content)" -ForegroundColor Green
    
    # Store tokens for next tests
    $ACCESS_TOKEN = $registerData.access
    $REFRESH_TOKEN = $registerData.refresh
    
    Write-Host "`n✓ Access Token: $($ACCESS_TOKEN.Substring(0, 50))..." -ForegroundColor Green
    Write-Host "✓ Refresh Token: $($REFRESH_TOKEN.Substring(0, 50))..." -ForegroundColor Green
} catch {
    Write-Host "❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
}

Write-Host "`n" + ("="*60) + "`n"

# ============================================
# 2. LOGIN (JWT Authentication)
# ============================================
Write-Host "2️⃣  TEST: LOGIN /api/auth/login/" -ForegroundColor Yellow
Write-Host "Expected: 200 + {access, refresh, user}" -ForegroundColor Gray

$loginBody = @{
    email = "test@test.com"
    password = "test123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "$API_URL/api/auth/login/" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -UseBasicParsing
    
    $loginData = $loginResponse.Content | ConvertFrom-Json
    Write-Host "✅ PASS - Status: $($loginResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($loginResponse.Content)" -ForegroundColor Green
    
    # Update tokens
    $ACCESS_TOKEN = $loginData.access
    $REFRESH_TOKEN = $loginData.refresh
    
    Write-Host "`n✓ Access Token: $($ACCESS_TOKEN.Substring(0, 50))..." -ForegroundColor Green
    Write-Host "✓ Refresh Token: $($REFRESH_TOKEN.Substring(0, 50))..." -ForegroundColor Green
} catch {
    Write-Host "❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n" + ("="*60) + "`n"

# ============================================
# 3. AUTHENTICATED REQUEST (Profile)
# ============================================
Write-Host "3️⃣  TEST: GET PROFILE /api/profile/getmyprofile/" -ForegroundColor Yellow
Write-Host "Expected: 200 + profile data (with Bearer token)" -ForegroundColor Gray

try {
    $headers = @{
        "Authorization" = "Bearer $ACCESS_TOKEN"
        "Content-Type" = "application/json"
    }
    
    $profileResponse = Invoke-WebRequest -Uri "$API_URL/api/profile/getmyprofile/" `
        -Method GET `
        -Headers $headers `
        -UseBasicParsing
    
    Write-Host "✅ PASS - Status: $($profileResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($profileResponse.Content)" -ForegroundColor Green
} catch {
    Write-Host "❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "⚠️  401 Unauthorized - Token might be invalid/expired" -ForegroundColor Yellow
    }
}

Write-Host "`n" + ("="*60) + "`n"

# ============================================
# 3b. TEST WITHOUT TOKEN (Should fail with 401)
# ============================================
Write-Host "3️⃣b TEST: GET PROFILE WITHOUT TOKEN" -ForegroundColor Yellow
Write-Host "Expected: 401 Unauthorized" -ForegroundColor Gray

try {
    $profileNoAuthResponse = Invoke-WebRequest -Uri "$API_URL/api/profile/getmyprofile/" `
        -Method GET `
        -UseBasicParsing
    
    Write-Host "❌ FAIL - Should have returned 401, got: $($profileNoAuthResponse.StatusCode)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ PASS - Correctly returned 401 Unauthorized" -ForegroundColor Green
    } else {
        Write-Host "❌ FAIL - Wrong error code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

Write-Host "`n" + ("="*60) + "`n"

# ============================================
# 4. REFRESH TOKEN
# ============================================
Write-Host "4️⃣  TEST: REFRESH TOKEN /api/auth/refresh/" -ForegroundColor Yellow
Write-Host "Expected: 200 + {access: new_token}" -ForegroundColor Gray

$refreshBody = @{
    refresh = $REFRESH_TOKEN
} | ConvertTo-Json

try {
    $refreshResponse = Invoke-WebRequest -Uri "$API_URL/api/auth/refresh/" `
        -Method POST `
        -ContentType "application/json" `
        -Body $refreshBody `
        -UseBasicParsing
    
    $refreshData = $refreshResponse.Content | ConvertFrom-Json
    Write-Host "✅ PASS - Status: $($refreshResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($refreshResponse.Content)" -ForegroundColor Green
    
    # Update access token
    $NEW_ACCESS_TOKEN = $refreshData.access
    Write-Host "`n✓ New Access Token: $($NEW_ACCESS_TOKEN.Substring(0, 50))..." -ForegroundColor Green
    
    # Update for logout test
    $ACCESS_TOKEN = $NEW_ACCESS_TOKEN
} catch {
    Write-Host "❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n" + ("="*60) + "`n"

# ============================================
# 5. LOGOUT (Blacklist Refresh Token)
# ============================================
Write-Host "5️⃣  TEST: LOGOUT /api/Logout" -ForegroundColor Yellow
Write-Host "Expected: 200 + {message: 'Logged out successfully'}" -ForegroundColor Gray

$logoutBody = @{
    refresh = $REFRESH_TOKEN
} | ConvertTo-Json

try {
    $headers = @{
        "Authorization" = "Bearer $ACCESS_TOKEN"
        "Content-Type" = "application/json"
    }
    
    $logoutResponse = Invoke-WebRequest -Uri "$API_URL/api/Logout" `
        -Method POST `
        -Headers $headers `
        -Body $logoutBody `
        -UseBasicParsing
    
    Write-Host "✅ PASS - Status: $($logoutResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($logoutResponse.Content)" -ForegroundColor Green
} catch {
    Write-Host "❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n" + ("="*60) + "`n"

# ============================================
# 5b. TEST: Verify Refresh Token is Blacklisted
# ============================================
Write-Host "5️⃣b TEST: VERIFY REFRESH TOKEN BLACKLISTED" -ForegroundColor Yellow
Write-Host "Expected: 401 or error (refresh token should not work)" -ForegroundColor Gray

$refreshBlacklistBody = @{
    refresh = $REFRESH_TOKEN
} | ConvertTo-Json

try {
    $blacklistTestResponse = Invoke-WebRequest -Uri "$API_URL/api/auth/refresh/" `
        -Method POST `
        -ContentType "application/json" `
        -Body $refreshBlacklistBody `
        -UseBasicParsing
    
    Write-Host "❌ FAIL - Refresh token should be blacklisted, got: $($blacklistTestResponse.StatusCode)" -ForegroundColor Red
} catch {
    Write-Host "✅ PASS - Refresh token correctly blacklisted (cannot be used)" -ForegroundColor Green
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host "`n" + ("="*60) + "`n"

# ============================================
# SUMMARY
# ============================================
Write-Host "📊 TEST SUMMARY" -ForegroundColor Cyan
Write-Host @"

🚨 KRITERIER FÖR GODKÄND:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Registrering ger tokens direkt (ingen login efteråt)
✅ Login fungerar 
✅ Profile GET kräver Bearer token (401 utan)
✅ Refresh fungerar när access token expirat
✅ Logout blacklists refresh token

"@ -ForegroundColor White

Write-Host "`n✨ All tests completed!`n" -ForegroundColor Green
