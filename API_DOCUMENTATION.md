# Cinemox API Documentation

Base URL: `http://localhost:8080/api`

## Authentication Endpoints

### 1. Register User
**POST** `/auth/register`

Request Body:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phoneNumber": "08123456789"
}
```

Response:
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email with OTP.",
  "data": null
}
```

### 2. Verify Email
**POST** `/auth/verify-email`

Request Body:
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

Response:
```json
{
  "success": true,
  "message": "Email verified successfully. You can now login.",
  "data": null
}
```

### 3. Login
**POST** `/auth/login`

Request Body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "USER"
  }
}
```

### 4. Forgot Password
**POST** `/auth/forgot-password?email=user@example.com`

Response:
```json
{
  "success": true,
  "message": "OTP sent to your email",
  "data": null
}
```

### 5. Reset Password
**POST** `/auth/reset-password`

Request Body:
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newpassword123"
}
```

Response:
```json
{
  "success": true,
  "message": "Password reset successful",
  "data": null
}
```

## Movie Endpoints

### 1. Get All Movies
**GET** `/movies`

Response:
```json
{
  "success": true,
  "message": "Movies retrieved successfully",
  "data": [...]
}
```

### 2. Get Now Showing Movies
**GET** `/movies/now-showing`

### 3. Get Coming Soon Movies
**GET** `/movies/coming-soon`

### 4. Get Movie by ID
**GET** `/movies/{id}`

### 5. Search Movies
**GET** `/movies/search?query=avengers`

## Schedule Endpoints

### 1. Get Schedules by Movie
**GET** `/schedules/movie/{movieId}`

### 2. Get Schedules by Date
**GET** `/schedules/date/2024-12-10`

### 3. Get Schedule by ID
**GET** `/schedules/{id}`

## Booking Endpoints (Requires Authentication)

### 1. Create Booking
**POST** `/bookings`

Headers:
```
Authorization: Bearer {JWT_TOKEN}
```

Request Body:
```json
{
  "scheduleId": "schedule123",
  "seats": ["A1", "A2", "A3"],
  "totalPrice": 150000
}
```

Response:
```json
{
  "success": true,
  "message": "Booking successful",
  "data": {
    "id": "booking123",
    "bookingCode": "ABCD123456",
    "barcodeUrl": "data:image/png;base64,...",
    ...
  }
}
```

### 2. Get My Bookings
**GET** `/bookings/my-bookings`

Headers:
```
Authorization: Bearer {JWT_TOKEN}
```

### 3. Get Booking by Code
**GET** `/bookings/code/{bookingCode}`

## Admin Endpoints (Requires ADMIN Role)

### User Management

#### Get All Users
**GET** `/admin/users`

#### Toggle User Active Status
**PUT** `/admin/users/{id}/toggle-active`

#### Delete User
**DELETE** `/admin/users/{id}`

### Movie Management

#### Create Movie
**POST** `/admin/movies`

Request Body:
```json
{
  "title": "Movie Title",
  "description": "Description",
  "genre": "Action, Adventure",
  "duration": 120,
  "director": "Director Name",
  "cast": ["Actor 1", "Actor 2"],
  "posterUrl": "https://...",
  "trailerUrl": "https://...",
  "rating": "PG-13",
  "imdbRating": 8.5,
  "releaseDate": "2024-12-01T00:00:00",
  "nowShowing": true,
  "comingSoon": false
}
```

#### Update Movie
**PUT** `/admin/movies/{id}`

#### Delete Movie
**DELETE** `/admin/movies/{id}`

### Schedule Management

#### Get All Schedules
**GET** `/admin/schedules`

#### Create Schedule
**POST** `/admin/schedules`

Request Body:
```json
{
  "movieId": "movie123",
  "movieTitle": "Movie Title",
  "theater": "Theater 1",
  "showDate": "2024-12-10",
  "showTime": "18:00",
  "totalSeats": 50,
  "availableSeats": 50,
  "bookedSeats": [],
  "price": 50000,
  "active": true
}
```

#### Update Schedule
**PUT** `/admin/schedules/{id}`

#### Delete Schedule
**DELETE** `/admin/schedules/{id}`

### Booking Management

#### Get All Bookings
**GET** `/admin/bookings`

### Statistics

#### Get Dashboard Statistics
**GET** `/admin/statistics`

Response:
```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "totalUsers": 100,
    "totalMovies": 10,
    "totalSchedules": 84,
    "totalBookings": 50,
    "monthlyBookings": 15,
    "totalRevenue": 5000000
  }
}
```

#### Get Monthly Statistics
**GET** `/admin/statistics/bookings-by-month`

Response:
```json
{
  "success": true,
  "message": "Monthly statistics retrieved successfully",
  "data": {
    "bookingsByMonth": {
      "DECEMBER 2024": 15,
      "NOVEMBER 2024": 25
    },
    "revenueByMonth": {
      "DECEMBER 2024": 1500000,
      "NOVEMBER 2024": 2500000
    }
  }
}
```

## Error Responses

All endpoints return error responses in this format:

```json
{
  "success": false,
  "message": "Error message here",
  "data": null
}
```

Common HTTP Status Codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error
