# AUTH SYSTEM - Database Migration Guide

## MongoDB to MySQL Migration

This guide will help you migrate from MongoDB to MySQL using Sequelize.

### 1. Install MySQL Server

#### For Windows:
1. Download MySQL Server from https://dev.mysql.com/downloads/mysql/
2. Install MySQL Server and set a root password
3. Create a new database for your auth system:

```sql
CREATE DATABASE auth_system;
CREATE USER 'auth_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON auth_system.* TO 'auth_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Update Environment Variables

Create a `.authsys` file in the backend directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=auth_system
DB_USER=auth_user
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=24h
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRE=7d

# Security Configuration
BCRYPT_SALT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_TIME_MINUTES=30

# OTP Configuration
OTP_EXPIRE_MINUTES=5

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# SMS Configuration (optional)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890

# Cloudinary Configuration (optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# App Configuration
NODE_ENV=development
PORT=5000
```

### 3. Initialize Database Tables

The Sequelize model will automatically create the `users` table when you start the server. The table will include all the necessary fields for authentication, OTP, OAuth, and user management.

### 4. Start the Backend

```bash
cd backend
npm install
npm start
```

The database connection will be established and tables will be created automatically.

### 5. Test the System

You can now test all the authentication endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/oauth` - OAuth login
- `POST /api/otp/send-email` - Send OTP via email
- `POST /api/otp/send-sms` - Send OTP via SMS
- `POST /api/otp/verify` - Verify OTP
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### 6. Database Schema

The MySQL `users` table will have the following structure:

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  phone VARCHAR(20),
  bio TEXT,
  profile_picture VARCHAR(500),
  role ENUM('user', 'admin', 'moderator') DEFAULT 'user',
  is_email_verified BOOLEAN DEFAULT FALSE,
  is_phone_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_blocked BOOLEAN DEFAULT FALSE,
  oauth_google_id VARCHAR(255),
  oauth_google_email VARCHAR(255),
  oauth_facebook_id VARCHAR(255),
  oauth_facebook_email VARCHAR(255),
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret VARCHAR(255),
  two_factor_backup_codes JSON,
  login_attempts_count INT DEFAULT 0,
  login_attempts_last_attempt DATETIME,
  login_attempts_locked_until DATETIME,
  email_verification_token VARCHAR(255),
  email_verification_expires DATETIME,
  password_reset_token VARCHAR(255),
  password_reset_expires DATETIME,
  otp_code VARCHAR(6),
  otp_expires DATETIME,
  otp_attempts INT DEFAULT 0,
  otp_type ENUM('email', 'sms', 'login', 'password-reset'),
  refresh_tokens JSON,
  last_login DATETIME,
  last_active_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  login_history JSON,
  preferences JSON DEFAULT '{"theme":"dark","notifications":{"email":true,"sms":false,"push":true},"privacy":{"profile_visibility":"private"}}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Migration Complete!

Your authentication system is now using MySQL instead of MongoDB. All functionality remains the same, but you're now using a relational database with better performance and ACID compliance.