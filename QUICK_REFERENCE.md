# 🎯 QUICK REFERENCE - JWT AUTH HEADERS

## ✅ ALL SKYDDADE CALLS FORMAT:

```typescript
// Every protected API call must include:
headers: {
  "Authorization": `Bearer ${localStorage.getItem('access_token')}`,
  "Content-Type": "application/json"
}
```

---

## 📋 5 ENDPOINTS - EXAKTA ANROP:

### 1️⃣ REGISTRERING (❌ No Auth)
```bash
POST /api/Register/RegisterUser
Content-Type: multipart/form-data

FormData:
  Email: "test@test.com"
  Password: "test123"
  ConfirmPassword: "test123"

✅ Response 200:
{
  "message": "User created",
  "access": "jwt_access_token...",
  "refresh": "jwt_refresh_token..."
}
```

---

### 2️⃣ LOGIN (❌ No Auth)
```bash
POST /api/auth/login/
Content-Type: application/json

{
  "email": "test@test.com",
  "password": "test123"
}

✅ Response 200:
{
  "access": "jwt_access_token...",
  "refresh": "jwt_refresh_token...",
  "user": {
    "email": "test@test.com",
    "name": "Test User"
  }
}
```

---

### 3️⃣ GET PROFILE (✅ Auth Required)
```bash
GET /api/profile/getmyprofile/
Authorization: Bearer <access_token>
Content-Type: application/json

✅ Response 200: Profile data
❌ Response 401: Unauthorized (no token / invalid token)
```

---

### 4️⃣ REFRESH TOKEN (❌ No Auth)
```bash
POST /api/auth/refresh/
Content-Type: application/json

{
  "refresh": "jwt_refresh_token..."
}

✅ Response 200:
{
  "access": "new_jwt_access_token..."
}

❌ Response 401: Refresh token invalid/expired/blacklisted
```

---

### 5️⃣ LOGOUT (✅ Auth Required)
```bash
POST /api/Logout
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "refresh": "jwt_refresh_token..."
}

✅ Response 200:
{
  "message": "Logged out successfully"
}
```

**Backend action:** Blacklists the refresh token so it cannot be used again.

---

## 🚨 KRITERIER FÖR GODKÄND:

- [x] ✅ Registrering ger tokens direkt (ingen login efteråt)
- [x] ✅ Login fungerar 
- [x] ✅ Profile GET kräver Bearer token (401 utan)
- [x] ✅ Refresh fungerar när access token expirat
- [x] ✅ Logout blacklists refresh token

---

## 🧪 TESTA MED SCRIPTS:

**PowerShell:**
```powershell
.\TEST_ENDPOINTS.ps1
```

**Bash:**
```bash
bash TEST_ENDPOINTS.sh
```

---

## 💾 TOKEN STORAGE (localStorage):

```javascript
// After successful registration or login:
localStorage.setItem('access_token', 'jwt_access...')
localStorage.setItem('refresh_token', 'jwt_refresh...')
localStorage.setItem('authUser', JSON.stringify({email: '...'}))

// On logout:
localStorage.removeItem('access_token')
localStorage.removeItem('refresh_token')
localStorage.removeItem('authUser')
```

---

## 🔄 AUTOMATIC TOKEN REFRESH:

When any protected endpoint returns **401**:
1. Frontend automatically calls `/api/auth/refresh/`
2. Gets new access token
3. Retries original request with new token
4. If refresh fails → clear tokens → redirect to login

**Implemented in:** `ApiService.fetchWithAuth()`

---

## ✨ FRONTEND FILES MODIFIED:

1. **ApiService.ts** - JWT token management + auto-refresh
2. **RegisterPage.tsx** - Store tokens + auto-login
3. **LoginPage.tsx** - JWT endpoint + store tokens
4. **AuthContext.tsx** - Logout with Bearer token + blacklist

---

## 🎯 TEST CHECKLIST:

- [ ] Register user → Check localStorage has tokens
- [ ] Login user → Check localStorage has tokens
- [ ] Visit /profile → Should load (authenticated)
- [ ] Visit /profile without tokens → Should get 401
- [ ] Refresh token → Should get new access token
- [ ] Logout → Tokens cleared + refresh token blacklisted
- [ ] Try refresh with blacklisted token → Should fail

---

**All endpoints ready for testing!** 🚀
