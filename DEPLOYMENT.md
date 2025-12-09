# Deployment Guide - Cinemox

## Deployment Options

### Option 1: Railway (Recommended - Easiest)

Railway mendukung Spring Boot secara native dan mudah di-setup.

#### Steps:

1. **Buat account di Railway**
   - Kunjungi https://railway.app
   - Sign up dengan GitHub account

2. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

3. **Login**
   ```bash
   railway login
   ```

4. **Initialize project**
   ```bash
   cd Cinemox
   railway init
   ```

5. **Deploy**
   ```bash
   railway up
   ```

6. **Set Environment Variables** (Optional - jika ingin override)
   Di Railway Dashboard:
   - MONGODB_URI
   - MAIL_USERNAME
   - MAIL_PASSWORD
   - JWT_SECRET

7. **Generate Domain**
   ```bash
   railway domain
   ```

8. **Update Frontend Config**
   Edit `src/main/resources/static/js/config.js`:
   ```javascript
   const API_BASE_URL = 'https://your-app.railway.app/api';
   ```

---

### Option 2: Render.com

1. **Buat account di Render**
   - Kunjungi https://render.com
   - Sign up dengan GitHub

2. **Create New Web Service**
   - Connect GitHub repository
   - Build Command: `mvn clean install`
   - Start Command: `java -jar target/cinemox-1.0.0.jar`

3. **Environment Variables**
   Set di Render Dashboard:
   ```
   MONGODB_URI=mongodb+srv://...
   MAIL_USERNAME=maskiryz23@gmail.com
   MAIL_PASSWORD=qgno iacp kams qbbf
   JWT_SECRET=cinemox-secret-key-2023-super-secure-key-for-authentication
   ```

4. **Deploy**
   - Render akan otomatis build dan deploy
   - Update frontend config dengan URL yang diberikan

---

### Option 3: Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login**
   ```bash
   heroku login
   ```

3. **Create app**
   ```bash
   heroku create cinemox-app
   ```

4. **Set buildpack**
   ```bash
   heroku buildpacks:set heroku/java
   ```

5. **Create Procfile**
   ```
   web: java -jar target/cinemox-1.0.0.jar --server.port=$PORT
   ```

6. **Set environment variables**
   ```bash
   heroku config:set MONGODB_URI=mongodb+srv://...
   heroku config:set MAIL_USERNAME=maskiryz23@gmail.com
   heroku config:set MAIL_PASSWORD="qgno iacp kams qbbf"
   ```

7. **Deploy**
   ```bash
   git push heroku main
   ```

---

### Option 4: Azure App Service

1. **Install Azure CLI**
   ```bash
   az login
   ```

2. **Create resource group**
   ```bash
   az group create --name cinemox-rg --location eastus
   ```

3. **Create App Service plan**
   ```bash
   az appservice plan create --name cinemox-plan --resource-group cinemox-rg --sku B1 --is-linux
   ```

4. **Create web app**
   ```bash
   az webapp create --resource-group cinemox-rg --plan cinemox-plan --name cinemox-app --runtime "JAVA:17-java17"
   ```

5. **Configure app settings**
   ```bash
   az webapp config appsettings set --resource-group cinemox-rg --name cinemox-app --settings MONGODB_URI=mongodb+srv://...
   ```

6. **Deploy**
   ```bash
   mvn clean package
   az webapp deploy --resource-group cinemox-rg --name cinemox-app --src-path target/cinemox-1.0.0.jar
   ```

---

### Option 5: Docker + Any Cloud Provider

1. **Create Dockerfile**
   ```dockerfile
   FROM openjdk:17-jdk-slim
   WORKDIR /app
   COPY target/cinemox-1.0.0.jar app.jar
   EXPOSE 8080
   ENTRYPOINT ["java", "-jar", "app.jar"]
   ```

2. **Build image**
   ```bash
   mvn clean package
   docker build -t cinemox .
   ```

3. **Run locally to test**
   ```bash
   docker run -p 8080:8080 \
     -e MONGODB_URI="mongodb+srv://..." \
     -e MAIL_USERNAME="maskiryz23@gmail.com" \
     -e MAIL_PASSWORD="qgno iacp kams qbbf" \
     cinemox
   ```

4. **Push to Docker Hub**
   ```bash
   docker tag cinemox yourusername/cinemox
   docker push yourusername/cinemox
   ```

5. **Deploy ke cloud provider** (AWS ECS, Google Cloud Run, Azure Container Instances)

---

## Vercel Deployment (Frontend Only)

Karena Vercel tidak mendukung Java backend secara optimal, gunakan untuk frontend saja:

1. **Deploy backend ke Railway/Render** (pilih salah satu option di atas)

2. **Prepare frontend**
   ```bash
   mkdir frontend
   cp -r src/main/resources/static/* frontend/
   cd frontend
   ```

3. **Create vercel.json**
   ```json
   {
     "version": 2,
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/$1"
       }
     ]
   }
   ```

4. **Update config.js dengan backend URL**
   ```javascript
   const API_BASE_URL = 'https://your-backend-url.railway.app/api';
   ```

5. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```

---

## Post-Deployment Checklist

1. **Test all endpoints**
   - Register new user
   - Verify email with OTP
   - Login
   - Browse movies
   - Book tickets
   - Check email confirmation

2. **Test admin features**
   - Login as admin (maskiryz23@gmail.com / admin123)
   - View dashboard
   - Manage movies
   - Manage schedules
   - View bookings

3. **Test responsiveness**
   - Test on mobile devices
   - Test on tablets
   - Test on desktop

4. **Monitor logs**
   - Check for errors
   - Monitor email delivery
   - Monitor database connections

5. **Setup monitoring** (optional)
   - Use Railway/Render built-in monitoring
   - Setup Sentry for error tracking
   - Setup Google Analytics

---

## Production Recommendations

1. **Security**
   - Change default admin password
   - Use environment variables for secrets
   - Enable HTTPS
   - Add rate limiting
   - Add CORS restrictions

2. **Performance**
   - Add caching (Redis)
   - Optimize database queries
   - Add CDN for static assets
   - Enable gzip compression

3. **Monitoring**
   - Setup error tracking (Sentry)
   - Setup uptime monitoring (UptimeRobot)
   - Setup application monitoring (New Relic)

4. **Backup**
   - Regular MongoDB backups
   - Backup environment variables
   - Document all configurations

5. **Email**
   - Consider using SendGrid or AWS SES for production
   - Setup email templates
   - Monitor email delivery rates

---

## Troubleshooting

### Port issues
Pastikan menggunakan port dari environment variable:
```java
server.port=${PORT:8080}
```

### MongoDB connection
Cek connection string dan whitelist IP address di MongoDB Atlas.

### Email not sending
Verify Gmail app password dan pastikan "Less secure apps" enabled (atau gunakan OAuth2).

### CORS errors
Pastikan CORS configuration di SecurityConfig sudah benar.

### Frontend can't connect to backend
Update API_BASE_URL di config.js dengan URL backend yang benar.

---

## Support

Jika ada masalah deployment, contact: maskiryz23@gmail.com
