@echo off
echo ============================================
echo Building Cinemox Application
echo ============================================
echo.

echo Cleaning previous builds...
mvn clean

echo.
echo Building application...
mvn package -DskipTests

echo.
echo ============================================
echo Build Complete!
echo ============================================
echo.
echo JAR file location: target\cinemox-0.0.1-SNAPSHOT.jar
echo.
echo To run the application:
echo java -jar target\cinemox-0.0.1-SNAPSHOT.jar
echo.
pause
