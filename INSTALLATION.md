# Installation & Setup Guide

## Prerequisites

### 1. Install Java 17
Download and install from: https://adoptium.net/temurin/releases/?version=17

Verify installation:
```bash
java -version
```

### 2. Install Maven
**Option A - Using Chocolatey (Recommended for Windows):**
```powershell
# Install Chocolatey if not already installed
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Maven
choco install maven -y
```

**Option B - Manual Installation:**
1. Download Maven from: https://maven.apache.org/download.cgi
2. Extract to `C:\Program Files\Apache\maven`
3. Add to System Environment Variables:
   - `MAVEN_HOME` = `C:\Program Files\Apache\maven`
   - Add to `Path`: `%MAVEN_HOME%\bin`
4. Restart terminal and verify:
```bash
mvn -version
```

## Running the Application

### Method 1: Using Maven (Development)

```bash
# Navigate to project directory
cd c:\Users\Rizky\Documents\Coding\Cinemox

# Build and run
mvn spring-boot:run
```

The application will start at: `http://localhost:8080`

### Method 2: Using JAR file (Production-like)

```bash
# Build JAR
mvn clean package

# Run JAR
java -jar target/cinemox-0.0.1-SNAPSHOT.jar
```

### Method 3: Using Docker

```bash
# Build Docker image
docker build -t cinemox .

# Run container
docker run -p 8080:8080 cinemox
```

### Method 4: Using Docker Compose

```bash
docker-compose up
```

## First Time Setup

### 1. Verify MongoDB Connection
Check `src/main/resources/application.properties`:
```properties
spring.data.mongodb.uri=mongodb+srv://maskiryz23_db_user:G9wWKoEY0LXFA8gT@cinemox1.mx6sksz.mongodb.net/?appName=Cinemox1
```

### 2. Admin Account
Default admin account is automatically created on first run:
- **Email**: maskiryz23@gmail.com
- **Password**: admin123

### 3. Email Configuration
SMTP configured for Gmail:
- **Email**: maskiryz23@gmail.com
- **App Password**: qgno iacp kams qbbf

## Accessing the Application

### Frontend URLs
- **Homepage**: http://localhost:8080/
- **Login**: http://localhost:8080/login.html
- **Register**: http://localhost:8080/register.html
- **Admin Dashboard**: http://localhost:8080/admin.html

### API Base URL
```
http://localhost:8080/api
```

## Testing the Application

### 1. Register New User
```bash
curl -X POST http://localhost:8080/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"test123\",\"fullName\":\"Test User\",\"phoneNumber\":\"08123456789\"}"
```

### 2. Check Email for OTP
Check your email inbox for verification code.

### 3. Verify Email
```bash
curl -X POST http://localhost:8080/api/auth/verify-email ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"otp\":\"YOUR_OTP\"}"
```

### 4. Login
```bash
curl -X POST http://localhost:8080/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"test123\"}"
```

### 5. Login as Admin
```bash
curl -X POST http://localhost:8080/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"maskiryz23@gmail.com\",\"password\":\"admin123\"}"
```

## Database Seeding

On first run, the application automatically seeds:
- 1 Admin user
- 5 Sample movies
- 84 Sample schedules (7 days x 3 times per day x 4 movies)

## Troubleshooting

### Port 8080 Already in Use
```bash
# Find process using port 8080
netstat -ano | findstr :8080

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### MongoDB Connection Error
- Verify internet connection
- Check MongoDB Atlas cluster status
- Verify credentials in application.properties

### Email Not Sending
- Verify Gmail App Password is correct
- Check if "Less secure app access" is enabled (if using regular password)
- Verify internet connection

### Maven Build Fails
```bash
# Clear Maven cache
mvn clean

# Force update dependencies
mvn clean install -U
```

## Development Mode

Enable hot reload for frontend development:
1. Make changes to HTML/CSS/JS files
2. Refresh browser (no server restart needed)

For backend changes:
1. Stop application (Ctrl+C)
2. Run `mvn spring-boot:run` again

## Production Deployment

See `DEPLOYMENT.md` for detailed instructions on deploying to:
- Railway
- Render
- Heroku
- Azure App Service
- Docker

## Support

For issues or questions:
1. Check `README.md` for project overview
2. Check `API_DOCUMENTATION.md` for API reference
3. Check `QUICKSTART.md` for quick examples
4. Check application logs in console
