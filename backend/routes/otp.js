const express = require('express')
const User = require('../models/User')
const { auth } = require('../middleware/auth')
const { validateOTP, sanitizeInput } = require('../middleware/validation')
const { sendOTPEmail } = require('../utils/sendEmail')
const { sendSMSOTP, validatePhoneNumber, formatPhoneNumber } = require('../utils/sendSMS')

const router = express.Router()

// @route   POST /api/otp/send-email
// @desc    Send OTP via email
// @access  Public
router.post('/send-email', sanitizeInput, async (req, res) => {
  try {
    const { email, purpose = 'verification' } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      })
    }

    // Find user by email
    const user = await User.findByEmail(email)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email address',
      })
    }

    // Check if user is active
    if (!user.is_active || user.is_blocked) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive or blocked',
      })
    }

    // Generate OTP
    const otp = user.generateOTP('email')
    await user.save()

    try {
      // Send OTP email
      await sendOTPEmail(user.email, otp, purpose)
      
      res.json({
        success: true,
        message: 'OTP sent to your email address',
        expiresIn: 5 * 60, // 5 minutes in seconds
      })
    } catch (emailError) {
      // Clear OTP if email sending fails
      user.otp = undefined
      await user.save()
      
      console.error('Email sending failed:', emailError)
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again.',
      })
    }
  } catch (error) {
    console.error('Send email OTP error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while sending OTP',
    })
  }
})

// @route   POST /api/otp/send-sms
// @desc    Send OTP via SMS
// @access  Public
router.post('/send-sms', sanitizeInput, async (req, res) => {
  try {
    const { phone, purpose = 'verification' } = req.body

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      })
    }

    // Validate phone number format
    if (!validatePhoneNumber(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format',
      })
    }

    // Format phone number
    const formattedPhone = formatPhoneNumber(phone)

    // Find user by phone
    const user = await User.findOne({ where: { phone: formattedPhone } })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this phone number',
      })
    }

    // Check if user is active
    if (!user.is_active || user.is_blocked) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive or blocked',
      })
    }

    // Generate OTP
    const otp = user.generateOTP('sms')
    await user.save()

    try {
      // Send SMS OTP
      await sendSMSOTP(user.phone, otp, purpose)
      
      res.json({
        success: true,
        message: 'OTP sent to your phone number',
        expiresIn: 5 * 60, // 5 minutes in seconds
      })
    } catch (smsError) {
      // Clear OTP if SMS sending fails
      user.otp_code = null
      user.otp_expires = null
      user.otp_attempts = 0
      user.otp_type = null
      await user.save()
      
      console.error('SMS sending failed:', smsError)
      res.status(500).json({
        success: false,
        message: 'Failed to send SMS OTP. Please try again.',
      })
    }
  } catch (error) {
    console.error('Send SMS OTP error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while sending OTP',
    })
  }
})

// @route   POST /api/otp/verify
// @desc    Verify OTP
// @access  Public
router.post('/verify', sanitizeInput, validateOTP, async (req, res) => {
  try {
    const { otp, identifier, action = 'verification' } = req.body

    // Find user by email or phone
    const { Op } = require('sequelize')
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: identifier.toLowerCase() },
          { phone: identifier },
        ],
      },
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    // Verify OTP
    const verificationResult = user.verifyOTP(otp)
    
    if (!verificationResult.success) {
      await user.save() // Save updated attempt count
      return res.status(400).json({
        success: false,
        message: verificationResult.message,
      })
    }

    // Handle different verification actions
    switch (action) {
      case 'email-verification':
        user.is_email_verified = true
        user.email_verification_token = null
        user.email_verification_expires = null
        break
        
      case 'phone-verification':
        user.is_phone_verified = true
        break
        
      case 'forgot-password':
        // For password reset, generate a password reset token
        const crypto = require('crypto')
        user.password_reset_token = crypto.randomBytes(32).toString('hex')
        user.password_reset_expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        break
        
      case 'login':
        // For login verification, update last login
        user.last_login = new Date()
        user.last_active_at = new Date()
        break
        
      default:
        // Default verification action
        break
    }

    await user.save()

    let responseData = {
      success: true,
      message: 'OTP verified successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_email_verified: user.is_email_verified,
        is_phone_verified: user.is_phone_verified
      },
    }

    // Add password reset token if needed
    if (action === 'forgot-password') {
      responseData.passwordResetToken = user.password_reset_token
    }

    // Generate auth tokens for login verification
    if (action === 'login') {
      const token = user.generateAuthToken()
      const refreshToken = user.generateRefreshToken(
        req.get('User-Agent'),
        req.ip
      )
      await user.save()

      responseData.token = token
      responseData.refreshToken = refreshToken
    }

    res.json(responseData)
  } catch (error) {
    console.error('OTP verification error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during OTP verification',
    })
  }
})

// @route   POST /api/otp/resend
// @desc    Resend OTP
// @access  Public
router.post('/resend', sanitizeInput, async (req, res) => {
  try {
    const { identifier, type = 'email', purpose = 'verification' } = req.body

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone number is required',
      })
    }

    // Find user
    const { Op } = require('sequelize')
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: identifier.toLowerCase() },
          { phone: identifier },
        ],
      },
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    // Check if user is active
    if (!user.is_active || user.is_blocked) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive or blocked',
      })
    }

    // Check if enough time has passed since last OTP (prevent spam)
    if (user.otp_expires) {
      const timeSinceLastOTP = Date.now() - (user.otp_expires.getTime() - 5 * 60 * 1000)
      if (timeSinceLastOTP < 60 * 1000) { // 1 minute cooldown
        return res.status(429).json({
          success: false,
          message: 'Please wait before requesting a new OTP',
          retryAfter: Math.ceil((60 * 1000 - timeSinceLastOTP) / 1000),
        })
      }
    }

    // Generate new OTP
    const otp = user.generateOTP(type)
    await user.save()

    try {
      if (type === 'email') {
        await sendOTPEmail(user.email, otp, purpose)
      } else if (type === 'sms') {
        await sendSMSOTP(user.phone, otp, purpose)
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid OTP type. Use "email" or "sms"',
        })
      }

      res.json({
        success: true,
        message: `New OTP sent via ${type}`,
        expiresIn: 5 * 60, // 5 minutes in seconds
      })
    } catch (sendError) {
      // Clear OTP if sending fails
      user.otp = undefined
      await user.save()
      
      console.error('OTP resend failed:', sendError)
      res.status(500).json({
        success: false,
        message: `Failed to resend OTP via ${type}. Please try again.`,
      })
    }
  } catch (error) {
    console.error('OTP resend error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while resending OTP',
    })
  }
})

// @route   GET /api/otp/status
// @desc    Check OTP status for user
// @access  Private
router.get('/status', auth, (req, res) => {
  try {
    const hasActiveOTP = req.user.otp && 
                        req.user.otp.expires && 
                        new Date() < req.user.otp.expires

    res.json({
      success: true,
      hasActiveOTP,
      otpType: hasActiveOTP ? req.user.otp.type : null,
      expiresAt: hasActiveOTP ? req.user.otp.expires : null,
      attemptsUsed: hasActiveOTP ? req.user.otp.attempts : 0,
      maxAttempts: 3,
    })
  } catch (error) {
    console.error('OTP status error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while checking OTP status',
    })
  }
})

// @route   DELETE /api/otp/cancel
// @desc    Cancel active OTP
// @access  Private
router.delete('/cancel', auth, async (req, res) => {
  try {
    // Clear user's OTP
    req.user.otp = undefined
    await req.user.save()

    res.json({
      success: true,
      message: 'OTP cancelled successfully',
    })
  } catch (error) {
    console.error('OTP cancel error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling OTP',
    })
  }
})

module.exports = router