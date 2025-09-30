const { sendOTPEmail } = require('./utils/sendEmail')
require('dotenv').config()

// Test OTP email with actual OTP
const testOTPEmail = async () => {
  try {
    console.log('Testing OTP email with actual OTP...')
    
    // Generate a test OTP
    const testOTP = Math.floor(100000 + Math.random() * 900000).toString()
    console.log('Generated test OTP:', testOTP)
    
    // Send OTP email
    const result = await sendOTPEmail(
      'nikhilsrokade2203@gmail.com', // Send to the user's email
      testOTP,
      'registration verification'
    )
    
    console.log('✅ OTP email sent successfully!')
    console.log('Email result:', result)
    console.log('OTP used in email:', testOTP)
    
  } catch (error) {
    console.error('❌ OTP email sending failed:', error)
    console.error('Error details:', error.message)
  }
}

testOTPEmail()