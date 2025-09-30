const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const User = require('../models/User')
const UserActivity = require('../models/UserActivity')
const { auth, optionalAuth } = require('../middleware/auth')
const { sendOTPEmail } = require('../utils/sendEmail')
const {
  validateRegistration,
  validateLogin,
  validatePasswordResetRequest,
  validatePasswordReset,
  validateChangePassword,
  sanitizeInput,
} = require('../middleware/validation')

const router = express.Router()

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', sanitizeInput, validateRegistration, async (req, res) => {
  try {
    console.log('🔥 DEBUG: Registration endpoint hit at', new Date().toISOString())
    const { name, email, password, phone } = req.body
    console.log('🔥 DEBUG: Registration data:', { name, email, phone })

    // Check if user already exists
    const existingUser = await User.findByEmail(email)
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email address',
      })
    }

    // Check if phone number is already registered
    if (phone) {
      const existingPhone = await User.findOne({ where: { phone } })
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: 'Phone number is already registered',
        })
      }
    }

    // Create new user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone?.trim(),
    })

    // Generate email verification token
    user.email_verification_token = crypto.randomBytes(32).toString('hex')
    user.email_verification_expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Generate OTP for email verification
    const otp = user.generateOTP('email')

    // Save user to database
    await user.save()

    // Send OTP email for verification
    let otpSent = false
    try {
      await sendOTPEmail(user.email, otp, 'email verification')
      console.log(`🔥 OTP email sent to ${user.email} with code: ${otp}`)
      otpSent = true
    } catch (emailError) {
      console.error('Failed to send OTP email during registration:', emailError)
      // Continue with registration even if email fails
      otpSent = false
    }

    // Generate tokens
    const token = user.generateAuthToken()
    
    // Add login history
    user.last_login = new Date()
    user.last_active_at = new Date()
    await user.save()

    // Log registration activity
    await UserActivity.logActivity(
      user.id,
      'register',
      `User registered with email: ${user.email}`,
      req
    )

    // Send verification email (implement email service)
    // await sendVerificationEmail(user.email, user.emailVerificationToken)

    console.log('🔥 DEBUG: About to send registration success response')
    res.status(201).json({
      success: true,
      message: otpSent 
        ? 'User registered successfully. OTP sent to your email for verification.'
        : 'User registered successfully. Please request OTP for verification.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_email_verified: user.is_email_verified,
        created_at: user.created_at
      },
      token,
      otpSent: otpSent,
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
    })
  }
})

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', sanitizeInput, validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user by email and include password
    const user = await User.findByEmail(email)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      })
    }

    // Check if account is locked
    if (user.login_attempts_locked_until && user.login_attempts_locked_until > new Date()) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed login attempts',
      })
    }

    // Check if account is active
    if (!user.is_active || user.is_blocked) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive or blocked',
      })
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      // Handle failed login attempt
      user.login_attempts_count = (user.login_attempts_count || 0) + 1
      const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5
      const lockoutMinutes = parseInt(process.env.LOCKOUT_TIME_MINUTES) || 30
      
      if (user.login_attempts_count >= maxAttempts) {
        user.login_attempts_locked_until = new Date(Date.now() + lockoutMinutes * 60 * 1000)
      }
      
      await user.save()

      // Log failed login attempt
      await UserActivity.logActivity(
        user.id,
        'failed_login',
        `Failed login attempt for ${user.email}`,
        req
      )

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      })
    }

    // Check if 2FA is enabled
    if (user.two_factor_enabled) {
      // Don't complete login yet - require 2FA verification
      return res.json({
        success: true,
        message: '2FA verification required',
        requiresTwoFactor: true,
        email: user.email
      })
    }

    // Successful login (no 2FA required)
    user.login_attempts_count = 0
    user.login_attempts_locked_until = null
    user.last_login = new Date()
    user.last_active_at = new Date()

    // Generate tokens
    const token = user.generateAuthToken()
    await user.save()

    // Log successful login activity
    await UserActivity.logActivity(
      user.id,
      'login',
      `Successful login for ${user.email}`,
      req
    )

    // Set HTTP-only cookies
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    })

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_email_verified: user.is_email_verified,
        last_login: user.last_login,
        two_factor_enabled: user.two_factor_enabled
      },
      token,
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during login',
    })
  }
})

// @route   POST /api/auth/oauth
// @desc    OAuth login (Google/Facebook)
// @access  Public
router.post('/oauth', sanitizeInput, async (req, res) => {
  try {
    const { provider, providerAccountId, email, name, image } = req.body

    if (!['google', 'facebook'].includes(provider)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OAuth provider',
      })
    }

    const { Op } = require('sequelize')
    
    // Find user by email or OAuth ID
    let user = await User.findOne({
      where: {
        [Op.or]: [
          { email: email.toLowerCase() },
          { [`oauth_${provider}_id`]: providerAccountId },
        ],
      },
    })

    if (user) {
      // Update OAuth information if user exists
      if (!user[`oauth_${provider}_id`]) {
        user[`oauth_${provider}_id`] = providerAccountId
        user[`oauth_${provider}_email`] = email.toLowerCase()
        
        // Update profile picture if not set
        if (!user.profile_picture && image) {
          user.profile_picture = image
        }
        
        await user.save()
      }
    } else {
      // Create new user for OAuth
      user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        profile_picture: image,
        is_email_verified: true, // OAuth emails are pre-verified
        [`oauth_${provider}_id`]: providerAccountId,
        [`oauth_${provider}_email`]: email.toLowerCase(),
      })
    }

    // Check if account is active
    if (!user.is_active || user.is_blocked) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive or blocked',
      })
    }

    // Handle successful login
    user.login_attempts_count = 0
    user.login_attempts_locked_until = null
    user.last_login = new Date()
    user.last_active_at = new Date()

    // Generate tokens
    const token = user.generateAuthToken()
    await user.save()

    // Log OAuth login activity
    await UserActivity.logActivity(
      user.id,
      'oauth_login',
      `OAuth login via ${provider} for ${user.email}`,
      req
    )

    res.json({
      success: true,
      message: `${provider} login successful`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_email_verified: user.is_email_verified,
        last_login: user.last_login
      },
      token,
    })
  } catch (error) {
    console.error('OAuth error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during OAuth login',
    })
  }
})

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body || req.cookies

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required',
      })
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    
    // Find user
    const user = await User.findByPk(decoded.id)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      })
    }

    // Generate new access token
    const newToken = user.generateAuthToken()

    res.json({
      success: true,
      token: newToken,
      expiresIn: 24 * 60 * 60, // 24 hours in seconds
    })
  } catch (error) {
    console.error('Token refresh error:', error)
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
    })
  }
})

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    const { refreshToken } = req.body || req.cookies

    if (refreshToken) {
      // Remove refresh token from user's tokens
      req.user.invalidateRefreshToken(refreshToken)
      await req.user.save()
    }

    // Clear cookies
    res.clearCookie('token')
    res.clearCookie('refreshToken')

    res.json({
      success: true,
      message: 'Logout successful',
    })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during logout',
    })
  }
})

// @route   POST /api/auth/logout-all
// @desc    Logout from all devices
// @access  Private
router.post('/logout-all', auth, async (req, res) => {
  try {
    // Clear all refresh tokens
    req.user.refreshTokens = []
    await req.user.save()

    // Clear cookies
    res.clearCookie('token')
    res.clearCookie('refreshToken')

    res.json({
      success: true,
      message: 'Logged out from all devices',
    })
  } catch (error) {
    console.error('Logout all error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during logout',
    })
  }
})

// @route   POST /api/auth/forgot-password-email
// @desc    Request password reset via email
// @access  Public
router.post('/forgot-password-email', sanitizeInput, validatePasswordResetRequest, async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findByEmail(email)
    if (!user) {
      // Don't reveal if user exists
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      })
    }

    // Generate reset token
    user.passwordResetToken = crypto.randomBytes(32).toString('hex')
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    await user.save()

    // Send reset email (implement email service)
    // await sendPasswordResetEmail(user.email, user.passwordResetToken)

    res.json({
      success: true,
      message: 'Password reset link has been sent to your email.',
    })
  } catch (error) {
    console.error('Password reset request error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during password reset request',
    })
  }
})

// @route   POST /api/auth/forgot-password-sms
// @desc    Request password reset via SMS
// @access  Public
router.post('/forgot-password-sms', sanitizeInput, async (req, res) => {
  try {
    const { phone } = req.body

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      })
    }

    const user = await User.findOne({ where: { phone } })
    if (!user) {
      // Don't reveal if user exists
      return res.json({
        success: true,
        message: 'If an account with that phone number exists, an OTP has been sent.',
        useOtp: true,
      })
    }

    // Generate OTP
    const otp = user.generateOTP('password-reset')
    await user.save()

    // Send SMS OTP (implement SMS service)
    // await sendSMSOTP(user.phone, otp)

    res.json({
      success: true,
      message: 'OTP has been sent to your phone number.',
      useOtp: true,
    })
  } catch (error) {
    console.error('SMS password reset error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during password reset request',
    })
  }
})

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', sanitizeInput, validatePasswordReset, async (req, res) => {
  try {
    const { token, password } = req.body

    const { Op } = require('sequelize')
    const user = await User.findOne({
      where: {
        password_reset_token: token,
        password_reset_expires: { [Op.gt]: new Date() },
      }
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token',
      })
    }

    // Set new password
    user.password = password
    user.password_reset_token = null
    user.password_reset_expires = null
    
    await user.save()

    res.json({
      success: true,
      message: 'Password has been reset successfully',
    })
  } catch (error) {
    console.error('Password reset error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during password reset',
    })
  }
})

// @route   POST /api/auth/change-password
// @desc    Change password (authenticated user)
// @access  Private
router.post('/change-password', auth, sanitizeInput, validateChangePassword, async (req, res) => {
  try {
    const { currentPassword, password } = req.body

    // Get user with password
    const user = await User.findByPk(req.user.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword)
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      })
    }

    // Set new password
    user.password = password
    
    await user.save()

    // Log password change activity
    await UserActivity.logActivity(
      user.id,
      'password_change',
      `Password changed for ${user.email}`,
      req
    )

    res.json({
      success: true,
      message: 'Password changed successfully',
    })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during password change',
    })
  }
})

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, (req, res) => {
  res.json({
    success: true,
    user: req.user.profile,
  })
})

// @route   GET /api/auth/verify-token
// @desc    Verify if token is valid
// @access  Public
router.get('/verify-token', optionalAuth, (req, res) => {
  res.json({
    success: true,
    valid: !!req.user,
    user: req.user?.profile || null,
  })
})

module.exports = router