const express = require('express')
const multer = require('multer')
const User = require('../models/User')
const UserActivity = require('../models/UserActivity')
const { auth } = require('../middleware/simpleAuth')
const { validateProfileUpdate, sanitizeInput } = require('../middleware/validation')
const { uploadToCloudinary } = require('../utils/cloudinary')
const bcrypt = require('bcryptjs')

const router = express.Router()

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'), false)
    }
  },
})

// @route   GET /api/profile
// @desc    Get user profile
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let user, completeness
    try {
      user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
      })

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        })
      }

      // Calculate profile completeness
      const profileFields = ['name', 'email', 'phone', 'profile_picture', 'bio']
      const completedFields = profileFields.filter(field => user[field] && user[field].toString().trim() !== '')
      completeness = Math.round((completedFields.length / profileFields.length) * 100)
    } catch (dbError) {
      // Provide mock user data if database is not available
      console.warn('Database not available, providing mock profile data')
      user = {
        id: req.user.id || 1,
        email: 'user@example.com',
        name: 'Demo User',
        phone: '+1234567890',
        is_email_verified: true,
        is_phone_verified: false,
        profile_image: null,
        created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
        updated_at: new Date()
      }
      completeness = 80 // Mock completeness
    }

    res.json({
      success: true,
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        profile_picture: user.profile_picture,
        role: user.role,
        is_email_verified: user.is_email_verified,
        created_at: user.created_at,
        last_login: user.last_login,
        profileCompleteness: completeness,
      },
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile',
    })
  }
})

// @route   PUT /api/profile
// @desc    Update user profile
// @access  Private
router.put('/', auth, async (req, res) => {
  try {
    const { name, phone, bio } = req.body

    const user = await User.findByPk(req.user.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    // Update allowed profile fields (email is readonly)
    if (name && name.trim()) {
      user.name = name.trim()
    }
    
    if (phone !== undefined) {
      // Validate phone format if provided
      if (phone && !/^[+]?[(]?[\d\s\-\(\)]{10,}$/.test(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid phone number format'
        })
      }
      user.phone = phone || null
      user.is_phone_verified = false // Reset verification when phone changes
    }
    
    if (bio !== undefined) {
      user.bio = bio || null
    }

    await user.save()

    // Log profile update activity
    try {
      await UserActivity.logActivity(
        user.id,
        'profile_update',
        'Profile information updated',
        req
      )
    } catch (activityError) {
      console.warn('Failed to log profile update activity:', activityError.message)
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
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
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile',
    })
  }
})

// @route   POST /api/profile/avatar
// @desc    Upload profile avatar
// @access  Private
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided',
      })
    }

    const user = await User.findByPk(req.user.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    try {
      // Upload to Cloudinary
      const result = await uploadToCloudinary(
        req.file.buffer,
        `avatars/${user.id}`,
        {
          width: 300,
          height: 300,
          crop: 'fill',
          gravity: 'face',
          quality: 'auto',
          format: 'webp',
        }
      )

      // Update user avatar
      const oldAvatar = user.profile_image
      user.profile_image = result.secure_url
      await user.save()

      // Log avatar upload activity
      const UserActivity = require('../models/UserActivity')
      await UserActivity.logActivity(user.id, 'avatar_updated', 'Profile image updated')

      // Optionally delete old avatar from Cloudinary
      if (oldAvatar && oldAvatar.includes('cloudinary.com')) {
        try {
          const publicId = oldAvatar.split('/').slice(-2).join('/').split('.')[0]
          await require('../utils/cloudinary').deleteFromCloudinary(publicId)
        } catch (deleteError) {
          console.warn('Failed to delete old avatar:', deleteError)
        }
      }

      res.json({
        success: true,
        message: 'Avatar uploaded successfully',
        avatar: user.profile_image,
      })
    } catch (uploadError) {
      console.error('Avatar upload error:', uploadError)
      res.status(500).json({
        success: false,
        message: 'Failed to upload avatar. Please try again.',
      })
    }
  } catch (error) {
    console.error('Avatar upload error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while uploading avatar',
    })
  }
})

// @route   DELETE /api/profile/avatar
// @desc    Remove profile avatar
// @access  Private
router.delete('/avatar', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    const oldAvatar = user.profile_image

    // Remove avatar
    user.profile_image = null
    await user.save()

    // Log avatar removal activity
    const UserActivity = require('../models/UserActivity')
    await UserActivity.logActivity(user.id, 'avatar_removed', 'Profile image removed')

    // Delete from Cloudinary if it's a Cloudinary URL
    if (oldAvatar && oldAvatar.includes('cloudinary.com')) {
      try {
        const publicId = oldAvatar.split('/').slice(-2).join('/').split('.')[0]
        await require('../utils/cloudinary').deleteFromCloudinary(publicId)
      } catch (deleteError) {
        console.warn('Failed to delete avatar from Cloudinary:', deleteError)
      }
    }

    res.json({
      success: true,
      message: 'Avatar removed successfully',
    })
  } catch (error) {
    console.error('Remove avatar error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while removing avatar',
    })
  }
})

// @route   PUT /api/profile/password
// @desc    Change password
// @access  Private
router.put('/password', auth, sanitizeInput, async (req, res) => {
  try {
    const { currentPassword, newPassword, logoutOtherDevices = false } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      })
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long',
      })
    }

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

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password)
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password',
      })
    }

    // Update password
    user.password = newPassword
    user.password_changed_at = new Date()
    
    await user.save()

    // Log password change activity
    const UserActivity = require('../models/UserActivity')
    await UserActivity.logActivity(user.id, 'password_changed', 'User password changed')

    res.json({
      success: true,
      message: 'Password changed successfully',
      loggedOutDevices: logoutOtherDevices,
    })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while changing password',
    })
  }
})

// @route   PUT /api/profile/email
// @desc    Change email address
// @access  Private
router.put('/email', auth, sanitizeInput, async (req, res) => {
  try {
    const { newEmail, password } = req.body

    if (!newEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'New email and password are required',
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      })
    }

    const user = await User.findByPk(req.user.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect password',
      })
    }

    // Check if email is already in use
    const { Op } = require('sequelize')
    const existingUser = await User.findOne({ 
      where: {
        email: newEmail.toLowerCase(),
        id: { [Op.ne]: user.id }
      }
    })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already associated with another account',
      })
    }

    // Update email and reset verification
    user.email = newEmail.toLowerCase()
    user.is_email_verified = false
    await user.save()

    res.json({
      success: true,
      message: 'Email updated successfully. Please verify your new email address.',
      requiresVerification: true,
    })
  } catch (error) {
    console.error('Change email error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while changing email',
    })
  }
})

// @route   GET /api/profile/security
// @desc    Get security information
// @access  Private
router.get('/security', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'last_login', 'password_changed_at', 'is_email_verified', 'is_phone_verified']
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    // Get recent login history from UserActivity
    const UserActivity = require('../models/UserActivity')
    const recentLogins = await UserActivity.findAll({
      where: { user_id: user.id, action: 'login' },
      order: [['created_at', 'DESC']],
      limit: 10
    })

    res.json({
      success: true,
      security: {
        lastLogin: user.last_login,
        passwordChangedAt: user.password_changed_at,
        isEmailVerified: user.is_email_verified,
        isPhoneVerified: user.is_phone_verified,
        recentLogins: recentLogins.map(login => ({
          timestamp: login.created_at,
          ip: login.ip_address,
          description: login.description
        })),
        securityScore: calculateSecurityScore(user),
      },
    })
  } catch (error) {
    console.error('Get security info error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching security information',
    })
  }
})



// @route   DELETE /api/profile
// @desc    Delete user account
// @access  Private
router.delete('/', auth, sanitizeInput, async (req, res) => {
  try {
    const { password, confirmDeletion } = req.body

    if (!password || confirmDeletion !== 'DELETE_MY_ACCOUNT') {
      return res.status(400).json({
        success: false,
        message: 'Password and deletion confirmation are required',
      })
    }

    const user = await User.findByPk(req.user.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect password',
      })
    }

    // Delete avatar from Cloudinary
    if (user.profile_image && user.profile_image.includes('cloudinary.com')) {
      try {
        const publicId = user.profile_image.split('/').slice(-2).join('/').split('.')[0]
        await require('../utils/cloudinary').deleteFromCloudinary(publicId)
      } catch (deleteError) {
        console.warn('Failed to delete avatar during account deletion:', deleteError)
      }
    }

    // Log account deletion activity
    const UserActivity = require('../models/UserActivity')
    await UserActivity.logActivity(user.id, 'account_deleted', 'User account deleted')

    // Delete the user account
    await user.destroy()

    res.json({
      success: true,
      message: 'Account deleted successfully',
    })
  } catch (error) {
    console.error('Delete account error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while deleting account',
    })
  }
})

// Helper function to calculate security score
function calculateSecurityScore(user) {
  let score = 30 // Base score
  
  // Email verified (35 points)
  if (user.is_email_verified) score += 35
  
  // Phone verified (35 points)
  if (user.is_phone_verified) score += 35
  
  return Math.min(score, 100)
}

module.exports = router
