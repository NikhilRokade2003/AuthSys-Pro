const axios = require('axios')

async function testRegistration() {
  try {
    console.log('Testing user registration with OTP email...')
    
    const testUser = {
      name: 'Test User',
      email: 'nikhilsrokade2203@gmail.com',
      password: 'TestPassword123!',
      phone: '+918956122003'
    }
    
    console.log('Registering user:', testUser.email)
    
    const response = await axios.post('http://localhost:5000/api/auth/register', testUser)
    
    console.log('✅ Registration successful!')
    console.log('Response:', {
      success: response.data.success,
      message: response.data.message,
      otpSent: response.data.otpSent,
      userId: response.data.user?.id
    })
    
    if (response.data.otpSent) {
      console.log('📧 OTP email should have been sent to:', testUser.email)
    }
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Registration failed:', error.response.data.message)
      if (error.response.data.message.includes('already exists')) {
        console.log('💡 User already exists. Testing OTP resend...')
        await testOTPResend()
      }
    } else {
      console.error('❌ Network error:', error.message)
    }
  }
}

async function testOTPResend() {
  try {
    console.log('\nTesting OTP resend...')
    
    const response = await axios.post('http://localhost:5000/api/otp/send-email', {
      email: 'nikhilsrokade2203@gmail.com',
      purpose: 'verification'
    })
    
    console.log('✅ OTP resend successful!')
    console.log('Response:', response.data)
    console.log('📧 OTP email should have been sent!')
    
  } catch (error) {
    if (error.response) {
      console.log('❌ OTP resend failed:', error.response.data.message)
    } else {
      console.error('❌ Network error:', error.message)
    }
  }
}

testRegistration()