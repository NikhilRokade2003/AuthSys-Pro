const { sequelize, User } = require('./models')
require('dotenv').config()

async function deleteAllUsers() {
  try {
    console.log('🗑️  Starting user deletion process...')
    
    // First, let's see how many users we have
    const userCount = await User.count()
    console.log(`📊 Found ${userCount} users in the database`)
    
    if (userCount === 0) {
      console.log('✅ No users to delete!')
      return
    }
    
    // List all users before deletion (for confirmation)
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'created_at'],
      order: [['created_at', 'DESC']]
    })
    
    console.log('\n📋 Users to be deleted:')
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id} | ${user.name} | ${user.email} | Created: ${user.created_at}`)
    })
    
    console.log('\n🔥 Deleting all users...')
    
    // Delete all users
    const deletedCount = await User.destroy({
      where: {},
      truncate: true  // This will reset auto-increment counter
    })
    
    console.log(`✅ Successfully deleted ${deletedCount} users`)
    
    // Verify deletion
    const remainingCount = await User.count()
    console.log(`📊 Remaining users in database: ${remainingCount}`)
    
    if (remainingCount === 0) {
      console.log('🎉 All users successfully deleted!')
      console.log('🔄 User ID counter has been reset to 1')
    } else {
      console.log('⚠️  Some users might still remain')
    }
    
  } catch (error) {
    console.error('❌ Error deleting users:', error.message)
    console.error('Full error:', error)
  } finally {
    // Close database connection
    await sequelize.close()
    console.log('🔌 Database connection closed')
  }
}

// Add confirmation prompt
console.log('⚠️  WARNING: This will delete ALL users from the database!')
console.log('📝 This includes:')
console.log('   • All user accounts')
console.log('   • All user data')
console.log('   • All user sessions')
console.log('   • All OTP codes')
console.log('')
console.log('🚀 Starting deletion in 3 seconds...')

setTimeout(() => {
  deleteAllUsers()
}, 3000)