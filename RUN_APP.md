# Cara Menjalankan Aplikasi

## Masalah: Maven atau Java tidak ditemukan

### Solusi 1: Jalankan via IDE (RECOMMENDED)

#### Jika pakai IntelliJ IDEA:
1. Buka project di IntelliJ
2. Tunggu indexing selesai
3. Cari file `CinemoxApplication.java`
4. Klik kanan → Run 'CinemoxApplication'

#### Jika pakai VS Code:
1. Install extension "Spring Boot Extension Pack"
2. Buka project
3. Tekan F5 atau klik "Run" di Spring Boot Dashboard

#### Jika pakai Eclipse:
1. Import project sebagai Maven project
2. Klik kanan project → Run As → Spring Boot App

### Solusi 2: Set JAVA_HOME (Manual)

1. Cari lokasi Java installation:
```powershell
where java
```

2. Set JAVA_HOME (temporary):
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
```

3. Jalankan aplikasi:
```powershell
.\mvnw.cmd spring-boot:run
```

### Solusi 3: Install Maven & Java

1. Download Java 17: https://adoptium.net/
2. Download Maven: https://maven.apache.org/download.cgi
3. Set environment variables
4. Restart terminal

## Setelah Aplikasi Berjalan

1. Tunggu sampai muncul: `Started CinemoxApplication`
2. Buka browser: http://localhost:8080
3. Clear localStorage:
   - Tekan F12
   - Console: `localStorage.clear(); location.reload();`
4. Login dengan:
   - Email: maskiryz23@gmail.com
   - Password: admin123

## Verifikasi

Cek di Console browser setelah login:
```javascript
console.log('Role:', JSON.parse(localStorage.getItem('userInfo')).role);
// Should show: "ADMIN"
```

Sekarang coba add movie lagi!
