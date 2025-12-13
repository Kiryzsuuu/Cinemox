# Troubleshooting Guide - 403 Forbidden Error

## Problem
Saat mencoba add movie di admin panel, muncul error:
- `Failed to execute 'json' on 'Response': Unexpected end of JSON input`
- `POST http://localhost:8080/api/admin/movies 403 (Forbidden)`

## Root Cause
Error 403 Forbidden terjadi karena:
1. JWT token tidak memiliki role ADMIN yang valid
2. User belum login ulang setelah backend restart
3. Token expired atau tidak dikirim dengan benar

## Solution

### Step 1: Restart Backend
```bash
mvn clean install
mvn spring-boot:run
```

### Step 2: Clear Browser Storage & Login Ulang
1. Buka browser DevTools (F12)
2. Pergi ke tab **Application** > **Local Storage**
3. Hapus semua data untuk `http://localhost:8080`
4. Atau jalankan di Console:
```javascript
localStorage.clear();
location.reload();
```

### Step 3: Login dengan Admin Account
- Email: `maskiryz23@gmail.com`
- Password: `admin123`

### Step 4: Verify Authentication
Buka Console dan jalankan:
```javascript
// Check token
console.log('Token:', localStorage.getItem('token'));

// Check user info
console.log('User:', JSON.parse(localStorage.getItem('userInfo')));

// Decode JWT
const token = localStorage.getItem('token');
if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('JWT Payload:', payload);
}
```

### Step 5: Test API Request
```javascript
// Test admin endpoint
fetch('http://localhost:8080/api/admin/statistics', {
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
        'Content-Type': 'application/json'
    }
})
.then(r => r.json())
.then(d => console.log('Success:', d))
.catch(e => console.error('Error:', e));
```

## Verification Checklist

✅ Backend running di `http://localhost:8080`
✅ Admin user exists di database dengan role ADMIN
✅ Login berhasil dan token tersimpan di localStorage
✅ User info memiliki `role: "ADMIN"`
✅ JWT token valid dan belum expired
✅ Authorization header dikirim dengan format `Bearer <token>`

## Common Issues

### Issue 1: Token Expired
**Solution:** Login ulang untuk mendapatkan token baru

### Issue 2: User Tidak Punya Role ADMIN
**Solution:** Cek database MongoDB, pastikan user memiliki role "ADMIN" di field `roles`

### Issue 3: CORS Error
**Solution:** Sudah diperbaiki di SecurityConfig dengan `allowCredentials(true)`

### Issue 4: Token Tidak Dikirim
**Solution:** Pastikan `apiRequest()` function di `auth.js` menambahkan Authorization header

## Backend Logs to Check

Saat request ke `/api/admin/movies`, cek log backend:
```
JWT extracted username: maskiryz23@gmail.com
User authorities: [ROLE_ADMIN, ROLE_USER]
Authentication set for user: maskiryz23@gmail.com with authorities: [ROLE_ADMIN, ROLE_USER]
```

Jika tidak muncul log ini, berarti token tidak valid atau tidak dikirim.

## Database Check

Connect ke MongoDB dan verify:
```javascript
db.users.findOne({ email: "maskiryz23@gmail.com" })
```

Expected output:
```json
{
  "_id": "...",
  "email": "maskiryz23@gmail.com",
  "roles": ["ADMIN", "USER"],
  "emailVerified": true,
  "active": true
}
```

## Still Not Working?

1. Check browser Network tab untuk melihat request/response detail
2. Check backend console untuk error messages
3. Verify MongoDB connection
4. Try different browser atau incognito mode
5. Check if antivirus/firewall blocking requests
