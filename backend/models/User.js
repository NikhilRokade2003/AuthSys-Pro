const { DataTypes, Model } = require("sequelize")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { sequelize } = require("../config/database")

class User extends Model {
  async comparePassword(candidatePassword) {
    if (!this.password) return false
    return bcrypt.compare(candidatePassword, this.password)
  }

  generateAuthToken() {
    const payload = {
      id: this.id,
      email: this.email,
      role: this.role,
    }
    
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || "24h",
    })
  }

  generateOTP(type = "email") {
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiryMinutes = parseInt(process.env.OTP_EXPIRE_MINUTES) || 5
    
    this.otp_code = otp
    this.otp_expires = new Date(Date.now() + expiryMinutes * 60 * 1000)
    this.otp_attempts = 0
    this.otp_type = type
    
    return otp
  }

  verifyOTP(candidateOTP) {
    if (!this.otp_code || !this.otp_expires) {
      return { success: false, message: "No OTP found" }
    }
    
    if (new Date() > this.otp_expires) {
      this.otp_code = null
      this.otp_expires = null
      this.otp_attempts = 0
      this.otp_type = null
      return { success: false, message: "OTP has expired" }
    }
    
    if (this.otp_attempts >= 3) {
      this.otp_code = null
      this.otp_expires = null
      this.otp_attempts = 0
      this.otp_type = null
      return { success: false, message: "Maximum OTP attempts exceeded" }
    }
    
    this.otp_attempts += 1
    
    if (this.otp_code !== candidateOTP) {
      return { success: false, message: "Invalid OTP" }
    }
    
    this.otp_code = null
    this.otp_expires = null
    this.otp_attempts = 0
    this.otp_type = null
    return { success: true, message: "OTP verified successfully" }
  }

  // 2FA Methods
  generateTwoFactorSecret() {
    const speakeasy = require('speakeasy')
    const secret = speakeasy.generateSecret({
      name: `HackerAuth (${this.email})`,
      issuer: 'HackerAuth System',
      length: 32
    })
    
    this.two_factor_secret = secret.base32
    return secret
  }

  verifyTwoFactorToken(token) {
    if (!this.two_factor_secret) {
      return { success: false, message: "2FA not set up" }
    }

    const speakeasy = require('speakeasy')
    const verified = speakeasy.totp.verify({
      secret: this.two_factor_secret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow 60 seconds tolerance
    })

    return {
      success: verified,
      message: verified ? "2FA token verified" : "Invalid 2FA token"
    }
  }

  generateBackupCodes() {
    const crypto = require('crypto')
    const codes = []
    
    for (let i = 0; i < 10; i++) {
      // Generate 8-character backup codes
      const code = crypto.randomBytes(4).toString('hex').toUpperCase()
      codes.push({
        code: code,
        used: false,
        used_at: null
      })
    }
    
    this.two_factor_backup_codes = codes
    return codes.map(c => c.code)
  }

  verifyBackupCode(inputCode) {
    if (!this.two_factor_backup_codes || this.two_factor_backup_codes.length === 0) {
      return { success: false, message: "No backup codes available" }
    }

    const codes = this.two_factor_backup_codes
    const codeIndex = codes.findIndex(c => 
      c.code === inputCode.toUpperCase() && !c.used
    )

    if (codeIndex === -1) {
      return { success: false, message: "Invalid or already used backup code" }
    }

    // Mark code as used
    codes[codeIndex].used = true
    codes[codeIndex].used_at = new Date()
    this.two_factor_backup_codes = codes

    return { 
      success: true, 
      message: "Backup code verified",
      remainingCodes: codes.filter(c => !c.used).length
    }
  }

  disable2FA() {
    this.two_factor_enabled = false
    this.two_factor_secret = null
    this.two_factor_backup_codes = []
    this.two_factor_setup_date = null
  }

  static async findByEmail(email) {
    return this.findOne({ where: { email: email.toLowerCase() } })
  }
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: "Name is required" },
      len: { args: [2, 50], msg: "Name must be between 2 and 50 characters" }
    }
  },
  
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: "Email is required" },
      isEmail: { msg: "Please enter a valid email address" }
    },
    set(value) {
      this.setDataValue("email", value.toLowerCase().trim())
    }
  },
  
  password: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      len: { args: [8, 255], msg: "Password must be at least 8 characters" }
    }
  },
  
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  profile_picture: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  
  role: {
    type: DataTypes.ENUM("user", "admin", "moderator"),
    defaultValue: "user"
  },
  
  is_email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  is_phone_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  is_blocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  oauth_google_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  
  oauth_facebook_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  
  two_factor_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  two_factor_secret: {
    type: DataTypes.STRING(32),
    allowNull: true
  },
  
  two_factor_backup_codes: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const value = this.getDataValue('two_factor_backup_codes')
      return value ? JSON.parse(value) : []
    },
    set(value) {
      this.setDataValue('two_factor_backup_codes', JSON.stringify(value))
    }
  },
  
  two_factor_setup_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  login_attempts_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  
  login_attempts_locked_until: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  otp_code: {
    type: DataTypes.STRING(6),
    allowNull: true
  },
  
  otp_expires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  otp_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  
  otp_type: {
    type: DataTypes.ENUM("email", "sms", "login", "password-reset"),
    allowNull: true
  },
  
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  last_active_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: "User",
  tableName: "users",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
  hooks: {
    beforeSave: async (user) => {
      if (user.changed("password") && user.password) {
        const saltRounds = 12
        user.password = await bcrypt.hash(user.password, saltRounds)
      }
    }
  }
})

// Define associations
User.associate = (models) => {
  User.hasMany(models.UserActivity, {
    foreignKey: 'user_id',
    as: 'activities'
  })
}

module.exports = User
