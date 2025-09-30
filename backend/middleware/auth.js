const jwt = require('jsonwebtoken')
const User = require('../models/User')

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.cookies?.token

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findByPk(decoded.id)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.',
      })
    }

    if (!user.is_active || user.is_blocked) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive or blocked.',
      })
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
      })
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.',
      })
    }

    console.error('Auth middleware error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during authentication.',
    })
  }
}

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.cookies?.token

    if (!token) {
      req.user = null
      return next()
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password')

    if (user && user.isActive && !user.isBlocked) {
      req.user = user
    } else {
      req.user = null
    }

    next()
  } catch (error) {
    req.user = null
    next()
  }
}

// Admin role middleware
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    })
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required.',
    })
  }

  next()
}

// Moderator or Admin role middleware
const requireModerator = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    })
  }

  if (!['admin', 'moderator'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Moderator access required.',
    })
  }

  next()
}

// Email verification middleware
const requireEmailVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    })
  }

  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Email verification required.',
    })
  }

  next()
}

// Account owner or admin middleware
const requireOwnerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    })
  }

  const targetUserId = req.params.userId || req.params.id
  const isOwner = req.user._id.toString() === targetUserId
  const isAdmin = req.user.role === 'admin'

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own resources.',
    })
  }

  next()
}

// Two-factor authentication middleware
const requireTwoFactor = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    })
  }

  if (req.user.twoFactorAuth.isEnabled && !req.session.twoFactorVerified) {
    return res.status(403).json({
      success: false,
      message: 'Two-factor authentication required.',
    })
  }

  next()
}

module.exports = {
  auth,
  optionalAuth,
  requireAdmin,
  requireModerator,
  requireEmailVerified,
  requireOwnerOrAdmin,
  requireTwoFactor,
}