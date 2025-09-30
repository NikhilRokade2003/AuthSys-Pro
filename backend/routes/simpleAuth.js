const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const UserActivity = require('../models/UserActivity')

const router = express.Router()

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      })
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email)
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      })
    }

    // Create new user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      account_type: 'user'
    })

    // Log registration activity
    try {
      await UserActivity.logActivity(user.id, 'registration', 'User account created', req)
    } catch (activityError) {
      console.warn('Failed to log registration activity:', activityError.message)
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        account_type: user.account_type || 'user',
        is_email_verified: user.is_email_verified,
        created_at: user.created_at
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    })
  }
})

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      })
    }

    // Find user
    const user = await User.findByEmail(email)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      // Log failed login attempt
      try {
        await UserActivity.logActivity(user.id, 'login_failed', 'Failed login attempt', req)
      } catch (activityError) {
        console.warn('Failed to log login attempt:', activityError.message)
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Update last login
    user.last_login = new Date()
    await user.save()

    // Log successful login
    try {
      await UserActivity.logActivity(user.id, 'login', 'User logged in successfully', req)
    } catch (activityError) {
      console.warn('Failed to log login activity:', activityError.message)
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        account_type: user.account_type || 'user',
        is_email_verified: user.is_email_verified,
        is_phone_verified: user.is_phone_verified,
        profile_picture: user.profile_picture,
        last_login: user.last_login,
        created_at: user.created_at
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    })
  }
})

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    const user = await User.findByPk(decoded.id)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      })
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        account_type: user.account_type || 'user',
        is_email_verified: user.is_email_verified,
        is_phone_verified: user.is_phone_verified,
        profile_picture: user.profile_picture,
        last_login: user.last_login,
        created_at: user.created_at
      }
    })
  } catch (error) {
    console.error('Auth check error:', error)
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    })
  }
})

module.exports = router