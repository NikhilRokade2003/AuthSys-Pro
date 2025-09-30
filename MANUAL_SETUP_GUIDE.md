# 🚀 Manual Setup Guide - Full Stack Authentication System

## Prerequisites

Before starting, ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MySQL Server** (v8.0 or higher) - [Download here](https://dev.mysql.com/downloads/mysql/)
- **Git** (optional but recommended)

---

## 📋 Step-by-Step Setup Instructions

### Step 1: MySQL Database Setup

#### 1.1 Install MySQL Server
- Download and install MySQL Server from the official website
- During installation, set a root password (remember this!)
- Start MySQL service (usually starts automatically)

#### 1.2 Create Database and User
Open MySQL Command Line Client or MySQL Workbench and run:

```sql
-- Create the database
CREATE DATABASE auth_system;

-- Create a dedicated user for the app
CREATE USER 'auth_user'@'localhost' IDENTIFIED BY 'SecurePassword123!';

-- Grant privileges to the user
GRANT ALL PRIVILEGES ON auth_system.* TO 'auth_user'@'localhost';

-- Apply the changes
FLUSH PRIVILEGES;

-- Verify the database was created
SHOW DATABASES;
```

### Step 2: Backend Setup

#### 2.1 Navigate to Backend Directory
```bash
cd "C:\Users\nikhi\OneDrive\Desktop\STUDYMATERIALS\python projects\HB_Task4\auth-system\backend"
```

#### 2.2 Install Dependencies
```bash
npm install
```

#### 2.3 Create Environment File
Copy the example environment file and customize it:

```bash
# Copy the example file
copy .authsys.example .authsys
```

#### 2.4 Edit the .authsys File
Open `.authsys` file in a text editor and update these critical values:

```env
# Database Configuration - REQUIRED
DB_HOST=localhost
DB_PORT=3306
DB_NAME=auth_system
DB_USER=auth_user
DB_PASSWORD=SecurePassword123!

# JWT Configuration - REQUIRED (Generate strong secrets)
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long_here
JWT_EXPIRE=24h
JWT_REFRESH_SECRET=your_refresh_secret_also_very_long_and_secure_here
JWT_REFRESH_EXPIRE=7d

# Security Configuration
BCRYPT_SALT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_TIME_MINUTES=30

# OTP Configuration
OTP_EXPIRE_MINUTES=5

# App Configuration
NODE_ENV=development
PORT=5000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Optional: Email Configuration (for OTP emails)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Optional: SMS Configuration (for OTP SMS)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Optional: Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

#### 2.5 Generate Strong JWT Secrets
You can generate strong secrets using Node.js:

```bash
# Run this in your terminal to generate secrets
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

#### 2.6 Start the Backend Server
```bash
npm start
```

**Expected Output:**
```
🚀 Server running on port 5000
✅ Database connected successfully
📊 User table synchronized
🔐 Authentication system ready!
```

### Step 3: Frontend Setup

#### 3.1 Open New Terminal and Navigate to Frontend
```bash
cd "C:\Users\nikhi\OneDrive\Desktop\STUDYMATERIALS\python projects\HB_Task4\auth-system\frontend"
```

#### 3.2 Install Frontend Dependencies
```bash
npm install
```

#### 3.3 Create Frontend Environment File
```bash
copy .env.local.example .env.local
```

#### 3.4 Start the Frontend Development Server
```bash
npm run dev
```

**Expected Output:**
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

---

## 🧪 Testing Your Setup

### 1. Verify Backend is Running
Open your browser and go to: `http://localhost:5000`
You should see a JSON response or welcome message.

### 2. Verify Frontend is Running
Open your browser and go to: `http://localhost:3000`
You should see your hacker-themed authentication UI.

### 3. Test Database Connection
Check your backend terminal logs for:
- ✅ Database connected successfully
- 📊 User table synchronized

### 4. Test API Endpoints
You can test the API using a tool like Postman or curl:

```bash
# Test server health
curl http://localhost:5000

# Test user registration
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"Password123!\"}"
```

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. MySQL Connection Failed
**Error:** `ECONNREFUSED` or `Access denied`
**Solution:**
- Verify MySQL service is running
- Check database credentials in `.env`
- Ensure user has proper privileges

#### 2. Port Already in Use
**Error:** `EADDRINUSE: address already in use :::5000`
**Solution:**
```bash
# Kill process using port 5000
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Or change PORT in .authsys file
```

#### 3. Missing Environment Variables
**Error:** JWT_SECRET is not defined
**Solution:**
- Ensure `.authsys` file exists in backend directory
- Verify all required variables are set
- Restart the server after changes

#### 4. Dependencies Issues
**Error:** Module not found
**Solution:**
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 🚀 Available API Endpoints

Once running, your backend will have these endpoints:

### Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/oauth` - OAuth login (Google/Facebook)

### OTP Routes
- `POST /api/otp/send-email` - Send OTP via email
- `POST /api/otp/send-sms` - Send OTP via SMS
- `POST /api/otp/verify` - Verify OTP code
- `POST /api/otp/resend` - Resend OTP

### Profile Routes
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `POST /api/profile/upload-avatar` - Upload profile picture
- `POST /api/profile/change-password` - Change password
- `DELETE /api/profile/delete-account` - Delete account

---

## 🎯 Quick Start Commands

```bash
# Terminal 1: Start Backend
cd "C:\Users\nikhi\OneDrive\Desktop\STUDYMATERIALS\python projects\HB_Task4\auth-system\backend"
npm install
npm start

# Terminal 2: Start Frontend
cd "C:\Users\nikhi\OneDrive\Desktop\STUDYMATERIALS\python projects\HB_Task4\auth-system\frontend"
npm install
npm run dev
```

**Access your app at:** `http://localhost:3000`

---

## 🔒 Security Notes

1. **Never commit `.authsys` files** to version control
2. **Use strong, unique JWT secrets** in production
3. **Enable HTTPS** in production
4. **Regularly update dependencies** for security patches
5. **Set up proper database backups**

---

Your hacker-themed authentication system is now ready to use! 🎉