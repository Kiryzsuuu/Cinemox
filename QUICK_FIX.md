# Quick Fix - 403 Forbidden Error

## Masalah
Error 403 saat add movie karena JWT token tidak valid atau user bukan admin.

## Solusi Cepat (3 Langkah)

### 1. Restart Backend
```bash
cd c:\Users\Rizky\Documents\Coding\Cinemox
mvn spring-boot:run
```

### 2. Clear Browser & Login Ulang
Buka Console Browser (F12) dan jalankan:
```javascript
localStorage.clear();
window.location.href = '/login.html';
```

### 3. Login dengan Admin
- Email: **maskiryz23@gmail.com**
- Password: **admin123**

## Selesai!
Sekarang coba add movie lagi. Seharusnya sudah bisa.

## Penjelasan
- Backend sudah diperbaiki dengan:
  - ✅ CORS configuration dengan credentials
  - ✅ Logging untuk debug JWT
  - ✅ Global exception handler untuk 403 error
  - ✅ Proper JWT validation

- Error terjadi karena:
  - Token lama tidak valid setelah backend restart
  - Perlu login ulang untuk dapat token baru dengan role ADMIN

## Test Authentication
Setelah login, test di Console:
```javascript
// Check if admin
const userInfo = JSON.parse(localStorage.getItem('userInfo'));
console.log('Role:', userInfo.role); // Should be "ADMIN"

// Test admin API
fetch('http://localhost:8080/api/admin/statistics', {
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
        'Content-Type': 'application/json'
    }
})
.then(r => r.json())
.then(d => console.log('✅ Admin access OK:', d))
.catch(e => console.error('❌ Error:', e));
```
