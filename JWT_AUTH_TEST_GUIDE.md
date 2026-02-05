# JWT Authentication Testing Guide

## ✅ Implementation Complete

All JWT authentication endpoints have been implemented according to your specification:

### 🧪 Quick Test with Scripts:

**PowerShell:**
```powershell
cd c:\Users\yazda\Desktop\JBDH-frontend
.\TEST_ENDPOINTS.ps1
```

**Bash/Git Bash:**
```bash
cd /c/Users/yazda/Desktop/JBDH-frontend
bash TEST_ENDPOINTS.sh
```

These scripts will automatically test all 5 endpoints and verify the criteria.

---

### 📋 Endpoints Implemented:

| Endpoint | Method | Status | Implementation |
|----------|--------|--------|----------------|
| `/api/Register/RegisterUser` | POST | ✅ | Returns `{access, refresh}` tokens + auto-login |
| `/api/auth/login/` | POST | ✅ | Returns `{access, refresh, user}` + stores tokens |
| `/api/auth/refresh/` | POST | ✅ | Automatic token refresh on 401 responses |
| `/api/Logout` | POST | ✅ | Blacklists refresh token |
| `/api/profile/getmyprofile/` | GET | ✅ | Uses `Authorization: Bearer <token>` |

---

## 🔧 What Was Changed:

### 1. **ApiService.ts** - JWT Token Management
- ✅ Added token storage methods (`setTokens`, `getAccessToken`, `getRefreshToken`, `clearTokens`)
- ✅ Added automatic token refresh logic (`refreshAccessToken`)
- ✅ Updated `fetchWithAuth` to:
  - Include `Authorization: Bearer <access_token>` header
  - Automatically refresh tokens on 401 responses
  - Retry failed requests with new token

### 2. **RegisterPage.tsx** - Auto-Login After Registration
- ✅ Updated endpoint to `/api/Register/RegisterUser`
- ✅ Stores JWT tokens from response (`data.access`, `data.refresh`)
- ✅ Auto-logs in user after successful registration
- ✅ Redirects to home page instead of login

### 3. **LoginPage.tsx** - JWT Login
- ✅ Updated endpoint to `/api/auth/login/`
- ✅ Stores JWT tokens from response
- ✅ Extracts user info from response
- ✅ Sets user context and redirects to home

### 4. **AuthContext.tsx** - Logout with Token Blacklisting
- ✅ Updated `logout()` to call `/api/Logout` endpoint
- ✅ Sends refresh token to backend for blacklisting
- ✅ Clears all tokens and user state

---

## 🧪 How to Test:

### Test 1: Registration (No Auth Required)
```bash
# Open your app and register a new user
# Fill in the registration form with:
Email: test@test.com
Password: test123
ConfirmPassword: test123

# Expected Result:
✅ Backend returns: {message: "User created", access: "jwt...", refresh: "jwt..."}
✅ Frontend stores tokens in localStorage
✅ User is automatically logged in
✅ Redirected to home page "/"
```

### Test 2: Login with JWT
```bash
# Navigate to /login
# Fill in:
Email: test@test.com
Password: test123

# Expected Result:
✅ POST to /api/auth/login/
✅ Response: {access: "jwt...", refresh: "jwt...", user: {...}}
✅ Tokens stored in localStorage
✅ User logged in and redirected to "/"
```

### Test 3: Authenticated Request
```bash
# While logged in, navigate to /profile
# This page calls ApiService.getMyProfile()

# Expected Behavior:
✅ Request includes: Authorization: Bearer <access_token>
✅ GET /api/profile/getmyprofile/
✅ If token valid: Returns profile data (200)
✅ If token expired: Auto-refreshes and retries (200)
✅ If refresh fails: Returns 401
```

### Test 4: Token Refresh (Automatic)
``Includes: Authorization: Bearer <access_token>
✅ Sends body
# This happens automatically in the background

# Scenario: Access token expires (401 response)
1. Request fails with 401
2. Frontend automatically calls POST /api/auth/refresh/
3. Sends: {refresh: "refresh_token"}
4. Receives: {access: "new_token"}
5. Retries original request with new token
6. If refresh token invalid/expired: Clears tokens and logs out
```

### Test 5: Logout
```bash
# Click logout button in your app

# Expected Behavior:
✅ POST to /api/Logout
✅ Sends: {refresh: "refresh_token"}
✅ Backend blacklists the refresh token
✅ Frontend clears localStorage (access_token, refresh_token, authUser)
✅ User redirected to login page
```

---

## 🔍 Verify Token Storage:

Open browser DevTools > Application > Local Storage:

```
localStorage.getItem('access_token')  // JWT access token
localStorage.getItem('refresh_token') // JWT refresh token
localStorage.getItem('authUser')      // User info
```

---

## 🚀 Quick Test Flow:

1. **Register** → Check localStorage for tokens → Should be logged in
2. **Logout** → Tokens cleared → Should be on login page
3. **Login** → Check localStorage for tokens → Should be logged in
4. **Navigate to /profile** → Should see profile data (authenticated request)
5. **Wait for token expiration** (or manually corrupt access token) → Should auto-refresh

---

## 📝 API Request Examples:

### Registration:
```javascript
POST /api/Register/RegisterUser
Content-Type: multipart/form-data

FormData:
  Email: "test@test.com"
  Password: "test123"
  ConfirmPassword: "test123"
  
Response 200:
{
  "message": "User created",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Login:
```javascript
POST /api/auth/login/
Content-Type: application/json

{
  "email": "test@test.com",
  "password": "test123"
}

Response 200:
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "email": "test@test.com",
    "name": "Test User"
  }
}
```

### Refresh Token:
```javascript
POST /api/auth/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}

Response 200:
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Authenticated Request:
```javascript
GET /api/profile/getmyprofile/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...

Response 200: Profile data
Response 401: Token expired → Auto-refresh triggered
```

### Logout:
```javascript
POST /api/Logout
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}

Response 200:
{
  "message": "Logged out successfully"
}
```

---

## ⚠️ Important Notes:

1. **Registration now returns tokens directly** - No need to login after registration
2. **All authenticated requests include Bearer token** - Automatic via `fetchWithAuth`
3. **Token refresh is automatic** - Happens transparently on 401 errors
4. **Logout blacklists refresh token** - Prevents reuse of old tokens
5. **Tokens stored in localStorage** - Persist across page refreshes

---

## 🐛 Troubleshooting:

**Issue: "401 Unauthorized" on authenticated requests**
- Check if tokens exist in localStorage
- Verify Authorization header format: `Bearer <token>`
- Check if tokens are expired (try login again)

**Issue: "Token refresh loop"**
- Refresh token might be expired/invalid
- Clear localStorage and login again

**Issue: "Registration doesn't auto-login"**
- Check backend response includes `access` and `refresh` fields
- Check browser console for errors

**Issue: "Logout doesn't work"**
- Check if `/api/Logout` endpoint is accessible
- Verify tokens are cleared from localStorage regardless of API response

---

## ✅ Ready to Test!

Your JWT authentication is now fully implemented and ready for testing. All endpoints match your specification exactly.
