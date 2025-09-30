# Hacker-Themed Full-Stack Authentication System

A production-ready authentication system with a cyberpunk/hacker-inspired UI featuring neon glowing effects, terminal aesthetics, and comprehensive security features.

## 🚀 Features

### Authentication
- ✅ Email/Password Signup & Login
- ✅ Google OAuth Login
- ✅ Facebook OAuth Login
- ✅ JWT Authentication with Refresh Tokens
- ✅ Secure Password Hashing (bcrypt)

### Verification & Recovery
- ✅ Email OTP Verification (Nodemailer)
- ✅ SMS OTP Verification (Twilio)
- ✅ Forgot Password (Reset Link + OTP)
- ✅ Account Email Verification

### Profile Management
- ✅ Update Profile Information (Name, Phone, Bio)
- ✅ Profile Picture Upload (Cloudinary)
- ✅ Account Settings & Security

### Security Features
- ✅ Rate Limiting on Authentication Routes
- ✅ CSRF/XSS Protection
- ✅ JWT Token Rotation
- ✅ Password Strength Validation
- ✅ Account Lockout Protection

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **NextAuth.js** - Authentication library
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications

### Backend
- **Express.js** - Node.js web framework
- **MongoDB + Mongoose** - Database and ODM
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Passport.js** - OAuth strategies

### Services
- **Nodemailer** - Email service
- **Twilio** - SMS service
- **Cloudinary** - Image storage and manipulation

## 📂 Project Structure

```
auth-system/
├── frontend/                 # Next.js application
│   ├── pages/               # Page components
│   ├── components/          # Reusable components
│   ├── styles/             # CSS and styling
│   ├── lib/                # Utility functions
│   └── public/             # Static assets
├── backend/                # Express API server
│   ├── routes/             # API routes
│   ├── models/             # Database models
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utility functions
│   └── config/             # Configuration files
└── docs/                   # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- Email service credentials (Gmail/SendGrid)
- SMS service credentials (Twilio)
- OAuth app credentials (Google, Facebook)

### Installation

1. **Clone and setup**
```bash
git clone <repository-url>
cd auth-system
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Configure your environment variables
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Configure your environment variables
npm run dev
```

### Environment Variables

#### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hacker-auth
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env.local)
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
NEXT_PUBLIC_API_URL=http://localhost:5000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
```

## 🎨 UI/UX Features

### Hacker Theme
- **Dark Terminal Aesthetic**: Pure black background with neon accents
- **Neon Glow Effects**: Green (#00ff7f) and blue (#00e0ff) glowing elements
- **Typography**: Source Code Pro for terminal feel
- **Animations**: Glitch effects, smooth transitions, pulse animations

### Responsive Design
- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-friendly interactions

## 🔒 Security Features

- **Password Security**: bcrypt hashing with salt rounds
- **JWT Tokens**: httpOnly cookies with expiration
- **Rate Limiting**: Prevent brute force attacks
- **Input Validation**: Comprehensive server-side validation
- **CORS Protection**: Configured for production
- **XSS Protection**: Helmet.js security headers

## 📱 Pages & Features

1. **Welcome Page** - Animated landing with user greeting
2. **Login Page** - Email/password + OAuth options
3. **Signup Page** - Registration with validation
4. **OTP Verification** - Email and SMS verification
5. **Forgot Password** - Reset via email or SMS
6. **Profile Dashboard** - Account management
7. **Admin Panel** - User management (optional)

## 🚀 Deployment

### Frontend (Vercel)
```bash
# Deploy to Vercel
vercel --prod
```

### Backend (Render/Railway)
```bash
# Configure environment variables on your platform
# Deploy using Git integration
```

### Database (MongoDB Atlas)
- Setup MongoDB Atlas cluster
- Configure network access
- Update connection string

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📖 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token

### OTP Endpoints
- `POST /api/otp/send-email` - Send email OTP
- `POST /api/otp/send-sms` - Send SMS OTP
- `POST /api/otp/verify` - Verify OTP

### Profile Endpoints
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `POST /api/profile/upload` - Upload profile picture

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@hackerauth.com or create an issue on GitHub.

---

**Built with ❤️ and ⚡ by the Hacker Auth Team**