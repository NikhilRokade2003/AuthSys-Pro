const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const compression = require('compression')
const { connectDB } = require('./config/database')
require('dotenv').config({ path: '.env' })

const app = express()

// Connect to database
connectDB()

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}))

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}

app.use(cors(corsOptions))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Compression middleware
app.use(compression())

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1)

// Load models with associations
const models = require('./models')

// Routes
app.use('/api/auth', require('./routes/simpleAuth'))
app.use('/api/auth', require('./routes/auth'))
app.use('/api/otp', require('./routes/otp'))
app.use('/api/profile', require('./routes/profile'))
app.use('/api/activity', require('./routes/activity'))
app.use('/api/2fa', require('./routes/twofa'))

// OAuth routes (only if OAuth credentials are configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.FACEBOOK_APP_ID) {
  const passport = require('passport')
  app.use(passport.initialize())
  app.use('/api/oauth', require('./routes/oauth'))
  console.log('OAuth routes enabled')
} else {
  console.log('OAuth routes disabled - missing credentials')
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  })
})

// Test endpoint for activity stats (no auth required for testing)
app.get('/api/test/activity-stats', (req, res) => {
  res.json({
    success: true,
    stats: {
      totalLogins: 127,
      lastLogin: new Date(),
      accountAge: 90,
      totalActivities: 245,
      recentActivityCount: 15,
      weeklyLoginCount: 12,
      monthlyActivityCount: 78
    }
  })
})

// Test endpoint for recent activity (no auth required for testing)
app.get('/api/test/recent-activity', (req, res) => {
  res.json({
    success: true,
    activities: [
      {
        id: 1,
        action: 'login',
        description: 'User logged in successfully',
        ip_address: '192.168.1.100',
        created_at: new Date(),
        timeAgo: 'Just now'
      },
      {
        id: 2,
        action: 'profile_update',
        description: 'Profile information updated',
        ip_address: '192.168.1.100',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
        timeAgo: '2 hours ago'
      },
      {
        id: 3,
        action: 'login',
        description: 'User logged in successfully',
        ip_address: '192.168.1.50',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000),
        timeAgo: '1 day ago'
      }
    ]
  })
})

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'HB Auth System API',
    version: '1.0.0',
    status: 'Active',
    endpoints: {
      auth: '/api/auth',
      otp: '/api/otp',
      profile: '/api/profile',
      activity: '/api/activity',
      health: '/health',
    },
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack)

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => val.message)
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors,
    })
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
    })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
    })
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`📱 API URL: http://localhost:${PORT}`)
})