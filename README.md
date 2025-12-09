# Cinemox - Cinema Booking System

Aplikasi web cinema booking lengkap dengan fitur booking tiket, admin dashboard, OTP verification, dan email notifications.

## Features

### User Features
- Register dengan email verification (OTP)
- Login dengan JWT authentication
- Forgot password dengan OTP reset
- Browse movies (Now Showing & Coming Soon)
- View movie details
- Book tickets dengan seat selection
- View booking history
- Receive email confirmation dengan barcode QR
- Responsive design untuk semua device

### Admin Features
- Admin dashboard dengan statistik
- Manage movies (CRUD operations)
- Manage schedules (CRUD operations)
- View all bookings
- Manage users (activate/deactivate, delete)
- Charts untuk bookings dan revenue analysis

## Technology Stack

### Backend
- Java 17
- Spring Boot 3.2.0
- Spring Security dengan JWT
- Spring Data MongoDB
- Spring Mail untuk email notifications
- ZXing untuk barcode generation

### Frontend
- HTML5, CSS3, JavaScript (Vanilla)
- Chart.js untuk grafik
- Font Awesome untuk icons
- Responsive design

### Database
- MongoDB Atlas

## Color Palette
- Primary Dark: #005461
- Primary Teal: #018790
- Primary Cyan: #00B7B5
- Primary Light: #F4F4F4

## Installation & Setup

### Prerequisites
- Java 17 atau lebih tinggi
- Maven 3.6+
- MongoDB Atlas account

### Configuration

1. Clone repository
```bash
git clone <repository-url>
cd Cinemox
```

2. Update `application.properties` dengan credentials Anda (sudah dikonfigurasi):
```properties
spring.data.mongodb.uri=mongodb+srv://maskiryz23_db_user:G9wWKoEY0LXFA8gT@cinemox1.mx6sksz.mongodb.net/?appName=Cinemox1
spring.mail.username=maskiryz23@gmail.com
spring.mail.password=qgno iacp kams qbbf
```

3. Build project
```bash
mvn clean install
```

4. Run application
```bash
mvn spring-boot:run
```

Application akan berjalan di `http://localhost:8080`

## Default Admin Account

- Email: maskiryz23@gmail.com
- Password: admin123

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register user baru
- POST `/api/auth/verify-email` - Verify email dengan OTP
- POST `/api/auth/login` - Login user
- POST `/api/auth/forgot-password` - Request password reset OTP
- POST `/api/auth/reset-password` - Reset password dengan OTP

### Movies
- GET `/api/movies` - Get all movies
- GET `/api/movies/now-showing` - Get now showing movies
- GET `/api/movies/coming-soon` - Get coming soon movies
- GET `/api/movies/{id}` - Get movie by ID
- GET `/api/movies/search?query={query}` - Search movies

### Schedules
- GET `/api/schedules/movie/{movieId}` - Get schedules by movie
- GET `/api/schedules/date/{date}` - Get schedules by date
- GET `/api/schedules/{id}` - Get schedule by ID

### Bookings (Requires Authentication)
- POST `/api/bookings` - Create booking
- GET `/api/bookings/my-bookings` - Get user's bookings
- GET `/api/bookings/code/{bookingCode}` - Get booking by code

### Admin (Requires ADMIN role)
- GET `/api/admin/users` - Get all users
- PUT `/api/admin/users/{id}/toggle-active` - Toggle user status
- DELETE `/api/admin/users/{id}` - Delete user
- POST `/api/admin/movies` - Create movie
- PUT `/api/admin/movies/{id}` - Update movie
- DELETE `/api/admin/movies/{id}` - Delete movie
- GET `/api/admin/schedules` - Get all schedules
- POST `/api/admin/schedules` - Create schedule
- PUT `/api/admin/schedules/{id}` - Update schedule
- DELETE `/api/admin/schedules/{id}` - Delete schedule
- GET `/api/admin/bookings` - Get all bookings
- GET `/api/admin/statistics` - Get dashboard statistics
- GET `/api/admin/statistics/bookings-by-month` - Get monthly statistics

## Deployment to Vercel

### Note on Spring Boot & Vercel
Vercel secara default mendukung aplikasi serverless dan static sites. Untuk Spring Boot, ada beberapa opsi:

### Option 1: Deploy Backend Terpisah (Recommended)

1. **Deploy Backend ke Railway/Render/Heroku**
   - Railway: https://railway.app
   - Render: https://render.com
   - Heroku: https://heroku.com

2. **Deploy Frontend ke Vercel**
   - Copy folder `src/main/resources/static` ke root project
   - Buat file `vercel.json`:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "package.json",
         "use": "@vercel/static-build"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/$1"
       }
     ]
   }
   ```
   - Update `js/config.js` dengan backend URL:
   ```javascript
   const API_BASE_URL = 'https://your-backend-url.com/api';
   ```

### Option 2: Deploy Full Stack ke Railway

1. Install Railway CLI
```bash
npm i -g @railway/cli
```

2. Login dan deploy
```bash
railway login
railway init
railway up
```

3. Set environment variables di Railway dashboard

### Option 3: Deploy ke Azure/AWS/GCP
Gunakan Azure App Service, AWS Elastic Beanstalk, atau Google Cloud Run untuk deployment yang lebih robust.

## Email Configuration

Email menggunakan Gmail SMTP. Untuk production:
1. Gunakan email service profesional (SendGrid, AWS SES, etc.)
2. Update konfigurasi di `application.properties`

## Database Seeding

Application akan otomatis membuat:
- Admin user (maskiryz23@gmail.com)
- Sample movies (3 movies)
- Sample schedules (84 schedules untuk 7 hari ke depan)

## Security

- Password di-hash menggunakan BCrypt
- JWT token untuk authentication
- OTP verification untuk email
- Admin-only routes protected dengan Spring Security

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## License

MIT License

## Contact

For support: maskiryz23@gmail.com

## Screenshots

### Homepage
Modern hero section dengan movie grid dan search functionality.

### Movie Detail
Detailed movie information dengan schedule selection.

### Seat Selection
Interactive seat map untuk booking tickets.

### Admin Dashboard
Comprehensive dashboard dengan statistics dan charts.

## Future Enhancements

- Payment gateway integration
- Movie reviews and ratings
- Loyalty program
- Mobile app (React Native)
- Push notifications
- Social media integration
- Advanced search filters
- Movie recommendations
