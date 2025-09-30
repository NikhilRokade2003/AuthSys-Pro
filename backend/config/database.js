const { Sequelize } = require('sequelize')

/**
 * Create Sequelize instance for SQLite database (for development)
 */
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.NODE_ENV === 'production' ? './database.sqlite' : './dev-database.sqlite',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
})

/**
 * Connect to MySQL database
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    // Test the connection
    await sequelize.authenticate()
    
    console.log(`✅ SQLite Database Connected`)
    console.log(`📊 Database File: ${sequelize.options.storage}`)
    console.log(`🔗 Connection State: Connected`)

    // Sync database models
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true })
      console.log('🔄 Database synchronized')
    }

    // Set up connection event listeners
    setupConnectionEventListeners()

  } catch (error) {
    console.error('❌ Database Connection Error:', error.message)
    console.error('� Failed to connect to SQLite database')
    
    // Exit process with failure
    process.exit(1)
  }
}

/**
 * Set up MySQL connection event listeners
 */
const setupConnectionEventListeners = () => {
  // Application termination
  process.on('SIGINT', async () => {
    try {
      await sequelize.close()
      console.log('🛑 MySQL connection closed through app termination')
      process.exit(0)
    } catch (error) {
      console.error('❌ Error during graceful shutdown:', error)
      process.exit(1)
    }
  })

  // For nodemon restarts
  process.once('SIGUSR2', async () => {
    try {
      await sequelize.close()
      console.log('🔄 MySQL connection closed for nodemon restart')
      process.kill(process.pid, 'SIGUSR2')
    } catch (error) {
      console.error('❌ Error during nodemon restart:', error)
      process.exit(1)
    }
  })
}

/**
 * Check if database is connected
 * @returns {boolean} Connection status
 */
const isConnected = () => {
  try {
    sequelize.authenticate()
    return true
  } catch (error) {
    return false
  }
}

/**
 * Get database connection info
 * @returns {Object} Connection information
 */
const getConnectionInfo = () => {
  return {
    isConnected: isConnected(),
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_DATABASE || 'hackerauth',
    dialect: 'mysql',
    models: Object.keys(sequelize.models)
  }
}

/**
 * Disconnect from MySQL
 * @returns {Promise<void>}
 */
const disconnectDB = async () => {
  try {
    await sequelize.close()
    console.log('🔌 MySQL disconnected successfully')
  } catch (error) {
    console.error('❌ Error disconnecting from MySQL:', error)
    throw error
  }
}

/**
 * Drop database (use with caution!)
 * @returns {Promise<void>}
 */
const dropDatabase = async () => {
  try {
    await sequelize.drop()
    console.log('🗑️ Database dropped successfully')
  } catch (error) {
    console.error('❌ Error dropping database:', error)
    throw error
  }
}

/**
 * Sync database models
 * @returns {Promise<void>}
 */
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force, alter: !force })
    console.log('✅ Database synchronized successfully')
  } catch (error) {
    console.error('❌ Error synchronizing database:', error)
    throw error
  }
}

/**
 * Get database statistics
 * @returns {Promise<Object>} Database stats
 */
const getDatabaseStats = async () => {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        table_name as tableName,
        table_rows as tableRows,
        data_length as dataLength,
        index_length as indexLength
      FROM information_schema.tables 
      WHERE table_schema = '${process.env.DB_DATABASE || 'hackerauth'}'
    `)

    return {
      database: process.env.DB_DATABASE || 'hackerauth',
      tables: results,
      totalTables: results.length
    }
  } catch (error) {
    console.error('❌ Error getting database stats:', error)
    throw error
  }
}

/**
 * Test database connection
 * @returns {Promise<boolean>} Connection test result
 */
const testConnection = async () => {
  try {
    await sequelize.authenticate()
    return true
  } catch (error) {
    console.error('❌ Database connection test failed:', error)
    return false
  }
}

/**
 * Validate environment variables
 * @returns {boolean} Validation result
 */
const validateEnvironment = () => {
  const required = ['DB_HOST', 'DB_DATABASE', 'DB_USERNAME']
  
  for (const envVar of required) {
    if (!process.env[envVar]) {
      console.error(`❌ ${envVar} environment variable is required`)
      return false
    }
  }
  
  return true
}

module.exports = {
  sequelize,
  connectDB,
  disconnectDB,
  isConnected,
  getConnectionInfo,
  dropDatabase,
  syncDatabase,
  getDatabaseStats,
  testConnection,
  validateEnvironment
}