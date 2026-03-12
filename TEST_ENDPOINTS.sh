#!/bin/bash
# 🧪 JWT AUTH ENDPOINT TEST SCRIPT (BASH/CURL)
# Test all 5 endpoints according to specification

API_URL="http://localhost:5000"  # Change to your backend URL

echo ""
echo "🎯 JWT AUTHENTICATION TEST - 5 ENDPOINTS"
echo ""

# ============================================
# 1. REGISTRERING (No Auth Required)
# ============================================
echo "1️⃣  TEST: REGISTRERING /api/Register/RegisterUser"
echo "Expected: 200 + {message, access, refresh}"
echo ""

REGISTER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/Register/RegisterUser" \
  -H "Content-Type: application/json" \
  -d '{
    "Email": "test@test.com",
    "Password": "test123",
    "ConfirmPassword": "test123"
  }')

HTTP_CODE=$(echo "$REGISTER_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$REGISTER_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ PASS - Status: $HTTP_CODE"
  echo "Response: $RESPONSE_BODY"
  
  # Extract tokens
  ACCESS_TOKEN=$(echo "$RESPONSE_BODY" | grep -o '"access":"[^"]*"' | cut -d'"' -f4)
  REFRESH_TOKEN=$(echo "$RESPONSE_BODY" | grep -o '"refresh":"[^"]*"' | cut -d'"' -f4)
  
  echo ""
  echo "✓ Access Token: ${ACCESS_TOKEN:0:50}..."
  echo "✓ Refresh Token: ${REFRESH_TOKEN:0:50}..."
else
  echo "❌ FAIL - Status: $HTTP_CODE"
  echo "Response: $RESPONSE_BODY"
fi

echo ""
echo "============================================================"
echo ""

# ============================================
# 2. LOGIN (JWT Authentication)
# ============================================
echo "2️⃣  TEST: LOGIN /api/auth/login/"
echo "Expected: 200 + {access, refresh, user}"
echo ""

LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/auth/login/" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "test123"
  }')

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ PASS - Status: $HTTP_CODE"
  echo "Response: $RESPONSE_BODY"
  
  # Update tokens
  ACCESS_TOKEN=$(echo "$RESPONSE_BODY" | grep -o '"access":"[^"]*"' | cut -d'"' -f4)
  REFRESH_TOKEN=$(echo "$RESPONSE_BODY" | grep -o '"refresh":"[^"]*"' | cut -d'"' -f4)
  
  echo ""
  echo "✓ Access Token: ${ACCESS_TOKEN:0:50}..."
  echo "✓ Refresh Token: ${REFRESH_TOKEN:0:50}..."
else
  echo "❌ FAIL - Status: $HTTP_CODE"
  echo "Response: $RESPONSE_BODY"
fi

echo ""
echo "============================================================"
echo ""

# ============================================
# 3. AUTHENTICATED REQUEST (Profile)
# ============================================
echo "3️⃣  TEST: GET PROFILE /api/profile/getmyprofile/"
echo "Expected: 200 + profile data (with Bearer token)"
echo ""

PROFILE_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/profile/getmyprofile/" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json")

HTTP_CODE=$(echo "$PROFILE_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$PROFILE_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ PASS - Status: $HTTP_CODE"
  echo "Response: $RESPONSE_BODY"
else
  echo "❌ FAIL - Status: $HTTP_CODE"
  echo "Response: $RESPONSE_BODY"
  if [ "$HTTP_CODE" = "401" ]; then
    echo "⚠️  401 Unauthorized - Token might be invalid/expired"
  fi
fi

echo ""
echo "============================================================"
echo ""

# ============================================
# 3b. TEST WITHOUT TOKEN (Should fail with 401)
# ============================================
echo "3️⃣b TEST: GET PROFILE WITHOUT TOKEN"
echo "Expected: 401 Unauthorized"
echo ""

NO_AUTH_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/profile/getmyprofile/" \
  -H "Content-Type: application/json")

HTTP_CODE=$(echo "$NO_AUTH_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "401" ]; then
  echo "✅ PASS - Correctly returned 401 Unauthorized"
else
  echo "❌ FAIL - Expected 401, got: $HTTP_CODE"
fi

echo ""
echo "============================================================"
echo ""

# ============================================
# 4. REFRESH TOKEN
# ============================================
echo "4️⃣  TEST: REFRESH TOKEN /api/auth/refresh/"
echo "Expected: 200 + {access: new_token}"
echo ""

REFRESH_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/auth/refresh/" \
  -H "Content-Type: application/json" \
  -d "{\"refresh\": \"$REFRESH_TOKEN\"}")

HTTP_CODE=$(echo "$REFRESH_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$REFRESH_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ PASS - Status: $HTTP_CODE"
  echo "Response: $RESPONSE_BODY"
  
  # Update access token
  NEW_ACCESS_TOKEN=$(echo "$RESPONSE_BODY" | grep -o '"access":"[^"]*"' | cut -d'"' -f4)
  ACCESS_TOKEN=$NEW_ACCESS_TOKEN
  
  echo ""
  echo "✓ New Access Token: ${NEW_ACCESS_TOKEN:0:50}..."
else
  echo "❌ FAIL - Status: $HTTP_CODE"
  echo "Response: $RESPONSE_BODY"
fi

echo ""
echo "============================================================"
echo ""

# ============================================
# 5. LOGOUT (Blacklist Refresh Token)
# ============================================
echo "5️⃣  TEST: LOGOUT /api/Logout"
echo "Expected: 200 + {message: 'Logged out successfully'}"
echo ""

LOGOUT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/Logout" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"refresh\": \"$REFRESH_TOKEN\"}")

HTTP_CODE=$(echo "$LOGOUT_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$LOGOUT_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ PASS - Status: $HTTP_CODE"
  echo "Response: $RESPONSE_BODY"
else
  echo "❌ FAIL - Status: $HTTP_CODE"
  echo "Response: $RESPONSE_BODY"
fi

echo ""
echo "============================================================"
echo ""

# ============================================
# 5b. TEST: Verify Refresh Token is Blacklisted
# ============================================
echo "5️⃣b TEST: VERIFY REFRESH TOKEN BLACKLISTED"
echo "Expected: 401 or error (refresh token should not work)"
echo ""

BLACKLIST_TEST=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/auth/refresh/" \
  -H "Content-Type: application/json" \
  -d "{\"refresh\": \"$REFRESH_TOKEN\"}")

HTTP_CODE=$(echo "$BLACKLIST_TEST" | tail -n1)

if [ "$HTTP_CODE" != "200" ]; then
  echo "✅ PASS - Refresh token correctly blacklisted (cannot be used)"
  echo "Status: $HTTP_CODE"
else
  echo "❌ FAIL - Refresh token should be blacklisted, got: $HTTP_CODE"
fi

echo ""
echo "============================================================"
echo ""

# ============================================
# SUMMARY
# ============================================
echo "📊 TEST SUMMARY"
echo ""
echo "🚨 KRITERIER FÖR GODKÄND:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Registrering ger tokens direkt (ingen login efteråt)"
echo "✅ Login fungerar"
echo "✅ Profile GET kräver Bearer token (401 utan)"
echo "✅ Refresh fungerar när access token expirat"
echo "✅ Logout blacklists refresh token"
echo ""
echo "✨ All tests completed!"
echo ""
