const express = require('express')
const router = express.Router()
const { auth } = require('../middleware/auth')
const User = require('../models/User')
const UserActivity = require('../models/UserActivity')
const speakeasy = require('speakeasy')
const QRCode = require('qrcode')

/**
 * @route   GET /api/2fa/status
 * @desc    Get 2FA status for current user
 * @access  Private
 */
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id)
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    const backupCodesCount = user.two_factor_backup_codes 
      ? user.two_factor_backup_codes.filter(c => !c.used).length 
      : 0

    res.json({
      success: true,
      data: {
        twoFactorEnabled: user.two_factor_enabled,
        setupDate: user.two_factor_setup_date,
        backupCodesRemaining: backupCodesCount,
        hasBackupCodes: backupCodesCount > 0
      }
    })
  } catch (error) {
    console.error('2FA Status Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while checking 2FA status'
    })
  }
})

/**
 * @route   POST /api/2fa/setup/generate
 * @desc    Generate 2FA secret and QR code
 * @access  Private
 */
router.post('/setup/generate', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id)
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    if (user.two_factor_enabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is already enabled. Disable it first to set up again.'
      })
    }

    // Generate new secret
    const secret = user.generateTwoFactorSecret()
    
    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url)
    
    // Don't save to database yet - only after verification
    res.json({
      success: true,
      message: '2FA secret generated. Please verify with your authenticator app.',
      data: {
        secret: secret.base32,
        qrCode: qrCodeUrl,
        manualEntryKey: secret.base32,
        appName: 'HackerAuth System',
        accountName: user.email
      }
    })

    // Log activity
    await UserActivity.logActivity(
      user.id,
      'profile_update',
      '2FA setup initiated',
      req
    )

  } catch (error) {
    console.error('2FA Setup Generate Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while generating 2FA setup'
    })
  }
})

/**
 * @route   POST /api/2fa/setup/verify
 * @desc    Verify 2FA setup with token
 * @access  Private
 */
router.post('/setup/verify', auth, async (req, res) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({
        success: false,
        message: '2FA token is required'
      })
    }

    const user = await User.findByPk(req.user.id)
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    if (user.two_factor_enabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is already enabled'
      })
    }

    if (!user.two_factor_secret) {
      return res.status(400).json({
        success: false,
        message: 'No 2FA secret found. Please generate a new secret first.'
      })
    }

    // Verify the token
    const verification = user.verifyTwoFactorToken(token)
    
    if (!verification.success) {
      return res.status(400).json({
        success: false,
        message: verification.message
      })
    }

    // Generate backup codes
    const backupCodes = user.generateBackupCodes()

    // Enable 2FA
    user.two_factor_enabled = true
    user.two_factor_setup_date = new Date()
    
    await user.save()

    res.json({
      success: true,
      message: '2FA has been successfully enabled!',
      data: {
        backupCodes: backupCodes,
        warning: 'Save these backup codes in a secure location. They can only be viewed once.'
      }
    })

    // Log activity
    await UserActivity.logActivity(
      user.id,
      'profile_update',
      '2FA enabled successfully',
      req
    )

  } catch (error) {
    console.error('2FA Setup Verify Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while verifying 2FA setup'
    })
  }
})

/**
 * @route   POST /api/2fa/verify
 * @desc    Verify 2FA token during login
 * @access  Public (used during login)
 */
router.post('/verify', async (req, res) => {
  try {
    const { email, token, backupCode } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      })
    }

    if (!token && !backupCode) {
      return res.status(400).json({
        success: false,
        message: '2FA token or backup code is required'
      })
    }

    const user = await User.findByEmail(email)
    
    if (!user || !user.two_factor_enabled) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request'
      })
    }

    let verification = { success: false }

    // Try token first, then backup code
    if (token) {
      verification = user.verifyTwoFactorToken(token)
    } else if (backupCode) {
      verification = user.verifyBackupCode(backupCode)
      
      if (verification.success) {
        await user.save() // Save the used backup code
      }
    }

    if (!verification.success) {
      // Log failed attempt
      await UserActivity.logActivity(
        user.id,
        'failed_login',
        `2FA verification failed: ${verification.message}`,
        req
      )

      return res.status(400).json({
        success: false,
        message: verification.message
      })
    }

    // Generate auth token
    const authToken = user.generateAuthToken()
    
    // Update last login
    user.last_login = new Date()
    user.last_active_at = new Date()
    user.login_attempts_count = 0
    user.login_attempts_locked_until = null
    
    await user.save()

    res.json({
      success: true,
      message: '2FA verification successful',
      token: authToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile_picture: user.profile_picture,
        two_factor_enabled: user.two_factor_enabled
      }
    })

    // Log successful login
    await UserActivity.logActivity(
      user.id,
      'login',
      backupCode ? '2FA login with backup code' : '2FA login with authenticator',
      req
    )

  } catch (error) {
    console.error('2FA Verify Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during 2FA verification'
    })
  }
})

/**
 * @route   POST /api/2fa/disable
 * @desc    Disable 2FA for user
 * @access  Private
 */
router.post('/disable', auth, async (req, res) => {
  try {
    const { password, token } = req.body

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to disable 2FA'
      })
    }

    const user = await User.findByPk(req.user.id)
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    if (!user.two_factor_enabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is not enabled'
      })
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid password'
      })
    }

    // If 2FA is enabled, require 2FA token to disable
    if (token) {
      const verification = user.verifyTwoFactorToken(token)
      if (!verification.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid 2FA token'
        })
      }
    } else {
      return res.status(400).json({
        success: false,
        message: '2FA token is required to disable 2FA'
      })
    }

    // Disable 2FA
    user.disable2FA()
    await user.save()

    res.json({
      success: true,
      message: '2FA has been disabled successfully'
    })

    // Log activity
    await UserActivity.logActivity(
      user.id,
      'profile_update',
      '2FA disabled',
      req
    )

  } catch (error) {
    console.error('2FA Disable Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while disabling 2FA'
    })
  }
})

/**
 * @route   POST /api/2fa/backup-codes/regenerate
 * @desc    Regenerate backup codes
 * @access  Private
 */
router.post('/backup-codes/regenerate', auth, async (req, res) => {
  try {
    const { password, token } = req.body

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      })
    }

    const user = await User.findByPk(req.user.id)
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    if (!user.two_factor_enabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is not enabled'
      })
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid password'
      })
    }

    // Verify 2FA token
    if (token) {
      const verification = user.verifyTwoFactorToken(token)
      if (!verification.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid 2FA token'
        })
      }
    } else {
      return res.status(400).json({
        success: false,
        message: '2FA token is required'
      })
    }

    // Generate new backup codes
    const backupCodes = user.generateBackupCodes()
    await user.save()

    res.json({
      success: true,
      message: 'Backup codes regenerated successfully',
      data: {
        backupCodes: backupCodes,
        warning: 'Save these backup codes in a secure location. Old backup codes are no longer valid.'
      }
    })

    // Log activity
    await UserActivity.logActivity(
      user.id,
      'profile_update',
      'Backup codes regenerated',
      req
    )

  } catch (error) {
    console.error('Backup Codes Regenerate Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while regenerating backup codes'
    })
  }
})

module.exports = router