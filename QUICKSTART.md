# Quick Start Guide - Cinemox

## Untuk Developer

### 1. Clone & Setup
```bash
cd c:\Users\Rizky\Documents\Coding\Cinemox
mvn clean install
```

### 2. Run Application
```bash
mvn spring-boot:run
```

Aplikasi akan berjalan di: http://localhost:8080

### 3. Login sebagai Admin
- Email: maskiryz23@gmail.com
- Password: admin123
- Access admin dashboard di: http://localhost:8080/admin.html

### 4. Test User Registration
1. Buka http://localhost:8080/register.html
2. Register dengan email Anda
3. Check email untuk OTP
4. Verify email
5. Login dan book tickets

---

## Project Structure

```
Cinemox/
├── src/
│   ├── main/
│   │   ├── java/com/cinemox/
│   │   │   ├── CinemoxApplication.java
│   │   │   ├── config/
│   │   │   │   └── DataInitializer.java
│   │   │   ├── controller/
│   │   │   │   ├── AdminController.java
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── BookingController.java
│   │   │   │   ├── MovieController.java
│   │   │   │   └── ScheduleController.java
│   │   │   ├── dto/
│   │   │   │   ├── ApiResponse.java
│   │   │   │   ├── AuthResponse.java
│   │   │   │   ├── BookingRequest.java
│   │   │   │   ├── LoginRequest.java
│   │   │   │   ├── RegisterRequest.java
│   │   │   │   ├── ResetPasswordRequest.java
│   │   │   │   └── VerifyOTPRequest.java
│   │   │   ├── model/
│   │   │   │   ├── Booking.java
│   │   │   │   ├── Movie.java
│   │   │   │   ├── OTP.java
│   │   │   │   ├── Schedule.java
│   │   │   │   └── User.java
│   │   │   ├── repository/
│   │   │   │   ├── BookingRepository.java
│   │   │   │   ├── MovieRepository.java
│   │   │   │   ├── OTPRepository.java
│   │   │   │   ├── ScheduleRepository.java
│   │   │   │   └── UserRepository.java
│   │   │   ├── security/
│   │   │   │   ├── JwtRequestFilter.java
│   │   │   │   ├── JwtUtil.java
│   │   │   │   └── SecurityConfig.java
│   │   │   └── service/
│   │   │       ├── AuthService.java
│   │   │       ├── BarcodeService.java
│   │   │       ├── BookingService.java
│   │   │       ├── CustomUserDetailsService.java
│   │   │       └── EmailService.java
│   │   └── resources/
│   │       ├── application.properties
│   │       └── static/
│   │           ├── admin.html
│   │           ├── forgot-password.html
│   │           ├── index.html
│   │           ├── login.html
│   │           ├── movie-detail.html
│   │           ├── my-bookings.html
│   │           ├── register.html
│   │           ├── css/
│   │           │   ├── admin.css
│   │           │   ├── auth.css
│   │           │   ├── bookings.css
│   │           │   ├── movie-detail.css
│   │           │   └── style.css
│   │           └── js/
│   │               ├── admin.js
│   │               ├── auth.js
│   │               ├── config.js
│   │               ├── main.js
│   │               └── movie-detail.js
│   └── test/
├── pom.xml
├── Dockerfile
├── Procfile
├── vercel.json
├── README.md
├── DEPLOYMENT.md
└── .gitignore
```

---

## Features Checklist

### Authentication ✓
- [x] Register dengan email verification (OTP)
- [x] Login dengan JWT
- [x] Forgot password dengan OTP
- [x] Password hashing dengan BCrypt
- [x] Role-based access control (USER, ADMIN)

### User Features ✓
- [x] Browse movies (Now Showing & Coming Soon)
- [x] Search movies
- [x] View movie details
- [x] Book tickets dengan seat selection
- [x] View booking history
- [x] Email confirmation dengan barcode

### Admin Features ✓
- [x] Dashboard dengan statistics
- [x] Charts untuk bookings dan revenue
- [x] Manage movies (view, delete)
- [x] Manage schedules (view, delete)
- [x] View all bookings
- [x] Manage users (toggle active, delete)

### Email Notifications ✓
- [x] OTP untuk registration
- [x] OTP untuk forgot password
- [x] Booking confirmation dengan barcode
- [x] HTML email templates

### Design ✓
- [x] Color palette custom (#005461, #018790, #00B7B5, #F4F4F4)
- [x] Responsive design (mobile, tablet, desktop)
- [x] Smooth animations
- [x] Modern UI/UX
- [x] No emoji

---

## API Testing dengan Postman/cURL

### Register
```bash
curl -X POST http://localhost:8080/api/auth/register \
-H "Content-Type: application/json" \
-d '{
  "email": "test@example.com",
  "password": "password123",
  "fullName": "Test User",
  "phoneNumber": "08123456789"
}'
```

### Verify Email
```bash
curl -X POST http://localhost:8080/api/auth/verify-email \
-H "Content-Type: application/json" \
-d '{
  "email": "test@example.com",
  "otp": "123456"
}'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
-H "Content-Type: application/json" \
-d '{
  "email": "test@example.com",
  "password": "password123"
}'
```

### Get Movies
```bash
curl http://localhost:8080/api/movies/now-showing
```

### Create Booking (with JWT)
```bash
curl -X POST http://localhost:8080/api/bookings \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_JWT_TOKEN" \
-d '{
  "scheduleId": "SCHEDULE_ID",
  "seats": ["A1", "A2"],
  "totalPrice": 100000
}'
```

---

## Database Schema

### Users Collection
```javascript
{
  "_id": ObjectId,
  "email": String (unique),
  "password": String (hashed),
  "fullName": String,
  "phoneNumber": String,
  "roles": [String],
  "emailVerified": Boolean,
  "active": Boolean,
  "createdAt": DateTime,
  "updatedAt": DateTime
}
```

### Movies Collection
```javascript
{
  "_id": ObjectId,
  "title": String,
  "description": String,
  "genre": String,
  "duration": Number,
  "director": String,
  "cast": [String],
  "posterUrl": String,
  "trailerUrl": String,
  "rating": String,
  "imdbRating": Number,
  "releaseDate": DateTime,
  "nowShowing": Boolean,
  "comingSoon": Boolean,
  "createdAt": DateTime,
  "updatedAt": DateTime
}
```

### Schedules Collection
```javascript
{
  "_id": ObjectId,
  "movieId": String,
  "movieTitle": String,
  "theater": String,
  "showDate": Date,
  "showTime": Time,
  "totalSeats": Number,
  "availableSeats": Number,
  "bookedSeats": [String],
  "price": Number,
  "active": Boolean
}
```

### Bookings Collection
```javascript
{
  "_id": ObjectId,
  "userId": String,
  "userEmail": String,
  "userName": String,
  "scheduleId": String,
  "movieId": String,
  "movieTitle": String,
  "theater": String,
  "showDate": String,
  "showTime": String,
  "seats": [String],
  "totalTickets": Number,
  "totalPrice": Number,
  "bookingCode": String,
  "barcodeUrl": String,
  "status": String,
  "bookingDate": DateTime,
  "createdAt": DateTime
}
```

---

## Next Steps

1. **Run the application**
   ```bash
   mvn spring-boot:run
   ```

2. **Access the application**
   - Homepage: http://localhost:8080
   - Admin: http://localhost:8080/admin.html

3. **Test all features**
   - Register → Verify Email → Login → Book Tickets

4. **Ready to deploy?**
   - Read DEPLOYMENT.md untuk deployment instructions

---

## Support

Email: maskiryz23@gmail.com
