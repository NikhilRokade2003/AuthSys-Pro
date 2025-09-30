const { sequelize } = require('../config/database')

// Import all models
const User = require('./User')
const UserActivity = require('./UserActivity')

// Define associations
const models = {
  User,
  UserActivity
}

// Set up associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models)
  }
})

// Export models and sequelize instance
module.exports = {
  sequelize,
  ...models
}