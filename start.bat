@echo off
echo ============================================
echo Cinemox - Cinema Booking System
echo ============================================
echo.

echo Checking Java installation...
java -version 2>nul
if errorlevel 1 (
    echo ERROR: Java is not installed!
    echo Please install Java 17 from: https://adoptium.net/temurin/releases/?version=17
    pause
    exit /b 1
)
echo Java is installed!
echo.

echo Checking Maven installation...
mvn -version 2>nul
if errorlevel 1 (
    echo ERROR: Maven is not installed!
    echo Please install Maven. See INSTALLATION.md for instructions.
    pause
    exit /b 1
)
echo Maven is installed!
echo.

echo Starting Cinemox application...
echo.
echo The application will be available at:
echo - Homepage: http://localhost:8080/
echo - Admin Dashboard: http://localhost:8080/admin.html
echo.
echo Default Admin Account:
echo - Email: maskiryz23@gmail.com
echo - Password: admin123
echo.
echo Press Ctrl+C to stop the application
echo.

mvn spring-boot:run
