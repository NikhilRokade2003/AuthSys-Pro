const axios = require('axios')
require('dotenv').config()

// Test registration with OTP
const testRegistrationOTP = async () => {
  try {
    console.log('Testing registration OTP process...')
    
    const testUser = {
      name: 'Test User',
      email: 'nikhilsrokade2203@gmail.com', // Use your email for testing
      password: 'testpassword123',
      confirmPassword: 'testpassword123',
      phone: '+1234567890',
      terms: true
    }
    
    console.log('Attempting registration with email:', testUser.email)
    
    const response = await axios.post('http://localhost:5000/api/auth/register', testUser)
    
    console.log('✅ Registration response:', response.data)
    console.log('OTP Sent?', response.data.otpSent)
    
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
      console.log('ℹ️  User already exists, testing OTP send endpoint instead...')
      
      // Test OTP send endpoint directly
      try {
        const otpResponse = await axios.post('http://localhost:5000/api/otp/send-email', {
          email: 'nikhilsrokade2203@gmail.com',
          purpose: 'verification'
        })
        console.log('✅ OTP Send response:', otpResponse.data)
      } catch (otpError) {
        console.error('❌ OTP Send failed:', otpError.response?.data || otpError.message)
      }
    } else {
      console.error('❌ Registration failed:', error.response?.data || error.message)
    }
  }
}

testRegistrationOTP()