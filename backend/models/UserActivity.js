const { DataTypes, Model } = require("sequelize")
const { sequelize } = require("../config/database")

class UserActivity extends Model {
  // Method to get formatted activity data
  getFormattedActivity() {
    return {
      id: this.id,
      userId: this.user_id,
      action: this.action,
      description: this.description,
      ipAddress: this.ip_address,
      userAgent: this.user_agent,
      location: this.location,
      timestamp: this.created_at,
      relativeTime: this.getRelativeTime()
    }
  }

  // Method to get relative time (e.g., "2 hours ago")
  getRelativeTime() {
    const now = new Date()
    const diffMs = now - this.created_at
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`
  }

  // Static method to log activity
  static async logActivity(userId, action, description, req = null) {
    try {
      const activityData = {
        user_id: userId,
        action,
        description,
      }

      if (req) {
        activityData.ip_address = req.ip || req.connection.remoteAddress || 'Unknown'
        activityData.user_agent = req.get('User-Agent') || 'Unknown'
        
        // You can integrate with a geolocation service here
        activityData.location = 'Unknown'
      }

      return await UserActivity.create(activityData)
    } catch (error) {
      console.error('Error logging activity:', error)
      return null
    }
  }

  // Static method to get user activity with pagination
  static async getUserActivity(userId, options = {}) {
    const { limit = 10, offset = 0, action = null } = options
    
    const whereClause = { user_id: userId }
    if (action) whereClause.action = action

    return await UserActivity.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit,
      offset
    })
  }

  // Static method to get activity stats
  static async getActivityStats(userId) {
    const totalLogins = await UserActivity.count({
      where: { user_id: userId, action: 'login' }
    })

    const lastLogin = await UserActivity.findOne({
      where: { user_id: userId, action: 'login' },
      order: [['created_at', 'DESC']]
    })

    const firstActivity = await UserActivity.findOne({
      where: { user_id: userId },
      order: [['created_at', 'ASC']]
    })

    let accountAge = 0
    if (firstActivity) {
      const diffMs = new Date() - firstActivity.created_at
      accountAge = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    }

    return {
      totalLogins,
      lastLogin: lastLogin ? lastLogin.getRelativeTime() : 'Never',
      accountAge: `${accountAge}d`,
      lastLoginDate: lastLogin ? lastLogin.created_at : null
    }
  }
}

UserActivity.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    action: {
      type: DataTypes.ENUM(
        'login',
        'logout',
        'register',
        'profile_update',
        'password_change',
        'password_reset',
        'email_verification',
        'phone_verification',
        'oauth_login',
        'failed_login',
        'account_locked',
        'account_unlocked',
        'profile_picture_upload'
      ),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "UserActivity",
    tableName: "user_activities",
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['action'] },
      { fields: ['created_at'] },
      { fields: ['user_id', 'action'] },
    ]
  }
)

// Define associations
UserActivity.associate = (models) => {
  UserActivity.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user'
  })
}

module.exports = UserActivity