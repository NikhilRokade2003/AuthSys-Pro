const { sequelize } = require('./models')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

async function resetDatabase() {
  try {
    console.log('🔄 Resetting SQLite database...')
    
    // Close any existing connections
    await sequelize.close()
    console.log('📤 Closed existing database connections')
    
    // Delete the existing database file
    const dbPath = path.join(__dirname, 'dev-database.sqlite')
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath)
      console.log('🗑️  Deleted existing database file')
    }
    
    // Recreate database with proper schema
    const { sequelize: newSequelize } = require('./models')
    
    console.log('🔨 Creating fresh database schema...')
    
    // Sync database with force: true to recreate all tables
    await newSequelize.sync({ force: true })
    console.log('✅ Database schema created successfully')
    
    // Test database connection
    await newSequelize.authenticate()
    console.log('✅ Database connection verified')
    
    console.log('🎉 Database reset complete!')
    console.log('📋 You can now restart the server with: npm start')
    
    await newSequelize.close()
    
  } catch (error) {
    console.error('❌ Database reset failed:', error.message)
    console.error('Full error:', error)
  }
}

resetDatabase()