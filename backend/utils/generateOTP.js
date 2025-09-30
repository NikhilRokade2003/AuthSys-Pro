const crypto = require('crypto')

/**
 * Generate a random OTP code
 * @param {number} length - Length of the OTP (default: 6)
 * @param {string} type - Type of OTP ('numeric', 'alphanumeric', 'alphabetic')
 * @returns {string} Generated OTP
 */
function generateOTP(length = 6, type = 'numeric') {
  let characters = ''
  
  switch (type) {
    case 'numeric':
      characters = '0123456789'
      break
    case 'alphanumeric':
      characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
      break
    case 'alphabetic':
      characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
      break
    case 'uppercase':
      characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      break
    case 'lowercase':
      characters = '0123456789abcdefghijklmnopqrstuvwxyz'
      break
    default:
      throw new Error('Invalid OTP type. Use: numeric, alphanumeric, alphabetic, uppercase, lowercase')
  }

  let otp = ''
  const charactersLength = characters.length
  
  // Use crypto.randomInt for better security
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charactersLength)
    otp += characters.charAt(randomIndex)
  }
  
  return otp
}

/**
 * Generate a secure numeric OTP
 * @param {number} length - Length of the OTP (default: 6)
 * @returns {string} Generated numeric OTP
 */
function generateNumericOTP(length = 6) {
  return generateOTP(length, 'numeric')
}

/**
 * Generate a secure alphanumeric OTP
 * @param {number} length - Length of the OTP (default: 8)
 * @returns {string} Generated alphanumeric OTP
 */
function generateAlphanumericOTP(length = 8) {
  return generateOTP(length, 'alphanumeric')
}

/**
 * Generate a time-based OTP with expiration
 * @param {number} length - Length of the OTP
 * @param {number} expirationMinutes - Expiration time in minutes (default: 5)
 * @param {string} type - Type of OTP
 * @returns {Object} OTP object with code and expiration
 */
function generateOTPWithExpiration(length = 6, expirationMinutes = 5, type = 'numeric') {
  const otp = generateOTP(length, type)
  const expires = new Date(Date.now() + expirationMinutes * 60 * 1000)
  
  return {
    code: otp,
    expires,
    createdAt: new Date(),
    attempts: 0,
    maxAttempts: 3,
    type
  }
}

/**
 * Validate OTP format
 * @param {string} otp - OTP to validate
 * @param {string} type - Expected OTP type
 * @param {number} expectedLength - Expected OTP length
 * @returns {Object} Validation result
 */
function validateOTPFormat(otp, type = 'numeric', expectedLength = 6) {
  if (!otp || typeof otp !== 'string') {
    return {
      isValid: false,
      error: 'OTP is required and must be a string'
    }
  }

  if (otp.length !== expectedLength) {
    return {
      isValid: false,
      error: `OTP must be ${expectedLength} characters long`
    }
  }

  let pattern
  switch (type) {
    case 'numeric':
      pattern = /^\d+$/
      break
    case 'alphanumeric':
      pattern = /^[a-zA-Z0-9]+$/
      break
    case 'alphabetic':
      pattern = /^[a-zA-Z]+$/
      break
    case 'uppercase':
      pattern = /^[A-Z0-9]+$/
      break
    case 'lowercase':
      pattern = /^[a-z0-9]+$/
      break
    default:
      return {
        isValid: false,
        error: 'Invalid OTP type specified'
      }
  }

  if (!pattern.test(otp)) {
    return {
      isValid: false,
      error: `OTP must contain only ${type} characters`
    }
  }

  return {
    isValid: true,
    error: null
  }
}

/**
 * Generate a secure token for email verification, password reset, etc.
 * @param {number} length - Length of the token in bytes (default: 32)
 * @returns {string} Generated secure token
 */
function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Generate a backup code for two-factor authentication
 * @param {number} count - Number of backup codes to generate (default: 10)
 * @returns {Array} Array of backup codes
 */
function generateBackupCodes(count = 10) {
  const codes = []
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric codes in format: XXXX-XXXX
    const code = generateOTP(4, 'uppercase') + '-' + generateOTP(4, 'uppercase')
    codes.push(code)
  }
  return codes
}

/**
 * Hash an OTP for secure storage
 * @param {string} otp - OTP to hash
 * @returns {string} Hashed OTP
 */
function hashOTP(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex')
}

/**
 * Verify OTP against hash
 * @param {string} otp - OTP to verify
 * @param {string} hash - Stored hash
 * @returns {boolean} Verification result
 */
function verifyOTPHash(otp, hash) {
  const otpHash = hashOTP(otp)
  return crypto.timingSafeEqual(Buffer.from(otpHash), Buffer.from(hash))
}

/**
 * Generate OTP for different purposes with specific configurations
 * @param {string} purpose - Purpose of the OTP ('login', 'verification', 'reset', '2fa')
 * @returns {Object} OTP configuration object
 */
function generatePurposeBasedOTP(purpose) {
  const configs = {
    login: {
      length: 6,
      type: 'numeric',
      expirationMinutes: 5,
      maxAttempts: 3
    },
    verification: {
      length: 6,
      type: 'numeric',
      expirationMinutes: 15,
      maxAttempts: 5
    },
    reset: {
      length: 8,
      type: 'alphanumeric',
      expirationMinutes: 30,
      maxAttempts: 3
    },
    '2fa': {
      length: 6,
      type: 'numeric',
      expirationMinutes: 2,
      maxAttempts: 3
    },
    backup: {
      length: 8,
      type: 'uppercase',
      expirationMinutes: 60,
      maxAttempts: 1
    }
  }

  const config = configs[purpose] || configs.verification
  const otpData = generateOTPWithExpiration(
    config.length,
    config.expirationMinutes,
    config.type
  )

  return {
    ...otpData,
    purpose,
    maxAttempts: config.maxAttempts
  }
}

/**
 * Check if OTP is expired
 * @param {Date} expirationDate - OTP expiration date
 * @returns {boolean} True if expired
 */
function isOTPExpired(expirationDate) {
  return new Date() > new Date(expirationDate)
}

/**
 * Calculate remaining time for OTP
 * @param {Date} expirationDate - OTP expiration date
 * @returns {Object} Remaining time object
 */
function getOTPRemainingTime(expirationDate) {
  const now = new Date()
  const expires = new Date(expirationDate)
  const remainingMs = expires.getTime() - now.getTime()

  if (remainingMs <= 0) {
    return {
      expired: true,
      remainingSeconds: 0,
      remainingMinutes: 0
    }
  }

  const remainingSeconds = Math.floor(remainingMs / 1000)
  const remainingMinutes = Math.floor(remainingSeconds / 60)

  return {
    expired: false,
    remainingSeconds,
    remainingMinutes,
    remainingMs
  }
}

/**
 * Format OTP for display (e.g., 123456 -> 123-456)
 * @param {string} otp - OTP to format
 * @param {string} separator - Separator character (default: '-')
 * @param {number} groupSize - Size of each group (default: 3)
 * @returns {string} Formatted OTP
 */
function formatOTPForDisplay(otp, separator = '-', groupSize = 3) {
  if (!otp || typeof otp !== 'string') {
    return otp
  }

  const groups = []
  for (let i = 0; i < otp.length; i += groupSize) {
    groups.push(otp.slice(i, i + groupSize))
  }

  return groups.join(separator)
}

module.exports = {
  generateOTP,
  generateNumericOTP,
  generateAlphanumericOTP,
  generateOTPWithExpiration,
  validateOTPFormat,
  generateSecureToken,
  generateBackupCodes,
  hashOTP,
  verifyOTPHash,
  generatePurposeBasedOTP,
  isOTPExpired,
  getOTPRemainingTime,
  formatOTPForDisplay
}