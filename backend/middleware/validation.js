const { body, validationResult } = require('express-validator')

// Common validation rules
const emailValidation = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Please provide a valid email address')

const passwordValidation = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')

const nameValidation = body('name')
  .trim()
  .isLength({ min: 2, max: 50 })
  .withMessage('Name must be between 2 and 50 characters')
  .matches(/^[a-zA-Z\s]+$/)
  .withMessage('Name can only contain letters and spaces')

const phoneValidation = body('phone')
  .optional({ nullable: true, checkFalsy: true })
  .custom((value) => {
    if (!value || value.trim() === '') return true // Allow empty values
    // More flexible phone validation
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,20}$/
    if (!phoneRegex.test(value)) {
      throw new Error('Please provide a valid phone number')
    }
    return true
  })

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value,
      })),
    })
  }
  
  next()
}

// Registration validation
const validateRegistration = [
  nameValidation,
  emailValidation,
  passwordValidation,
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password')
      }
      return true
    }),
  phoneValidation,
  body('terms')
    .custom((value) => {
      // Convert string to boolean if needed
      const boolValue = value === 'true' || value === true || value === 'on'
      if (!boolValue) {
        throw new Error('You must accept the terms and conditions')
      }
      return true
    }),
  validate,
]

// Login validation
const validateLogin = [
  emailValidation,
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate,
]

// Password reset request validation
const validatePasswordResetRequest = [
  emailValidation,
  validate,
]

// Password reset validation
const validatePasswordReset = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  passwordValidation,
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password')
      }
      return true
    }),
  validate,
]

// OTP validation
const validateOTP = [
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be a 6-digit number'),
  body('identifier')
    .notEmpty()
    .withMessage('Email or phone number is required'),
  validate,
]

// Profile update validation
const validateProfileUpdate = [
  nameValidation,
  phoneValidation,
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  validate,
]

// Change password validation
const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  passwordValidation,
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password')
      }
      return true
    }),
  validate,
]

// Email verification validation
const validateEmailVerification = [
  body('token')
    .notEmpty()
    .withMessage('Verification token is required'),
  validate,
]

// Phone verification validation
const validatePhoneVerification = [
  body('phone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  validate,
]

// Admin user creation validation
const validateAdminUserCreation = [
  nameValidation,
  emailValidation,
  body('role')
    .isIn(['user', 'admin', 'moderator'])
    .withMessage('Invalid role specified'),
  validate,
]

// Contact form validation
const validateContactForm = [
  nameValidation,
  emailValidation,
  body('subject')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Subject must be between 5 and 100 characters'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters'),
  validate,
]

// File upload validation
const validateFileUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded',
    })
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid file type. Only JPEG, PNG, and GIF files are allowed',
    })
  }

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024 // 5MB in bytes
  if (req.file.size > maxSize) {
    return res.status(400).json({
      success: false,
      message: 'File size too large. Maximum size is 5MB',
    })
  }

  next()
}

// Sanitize input
const sanitizeInput = (req, res, next) => {
  // Remove any potential HTML/script tags from string inputs
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str
    return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/<[^>]+>/g, '')
              .trim()
  }

  // Recursively sanitize object properties
  const sanitizeObject = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject)
    }
    
    const sanitized = {}
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value)
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeObject(value)
      } else {
        sanitized[key] = value
      }
    }
    return sanitized
  }

  req.body = sanitizeObject(req.body)
  req.query = sanitizeObject(req.query)
  req.params = sanitizeObject(req.params)

  next()
}

module.exports = {
  validate,
  validateRegistration,
  validateLogin,
  validatePasswordResetRequest,
  validatePasswordReset,
  validateOTP,
  validateProfileUpdate,
  validateChangePassword,
  validateEmailVerification,
  validatePhoneVerification,
  validateAdminUserCreation,
  validateContactForm,
  validateFileUpload,
  sanitizeInput,
}