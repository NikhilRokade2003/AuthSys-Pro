const axios = require('axios')

async function testCompleteRegistrationFlow() {
  try {
    console.log('Testing complete registration flow with OTP...')
    
    // Use a unique email to avoid "user exists" errors
    const uniqueEmail = `testuser${Date.now()}@example.com`
    console.log(`Using test email: ${uniqueEmail}`)
    
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Test User OTP',
      email: uniqueEmail,
      password: 'TestPassword123!',
      phone: '+918956122003'
    })
    
    console.log('✅ Registration Response:')
    console.log('Success:', response.data.success)
    console.log('Message:', response.data.message)
    console.log('OTP Sent:', response.data.otpSent)
    console.log('User ID:', response.data.user?.id)
    
    if (response.data.otpSent) {
      console.log('📧 OTP email should have been sent during registration!')
    } else {
      console.log('❌ OTP was NOT sent during registration')
    }
    
    // Now test manual OTP sending for your actual email
    console.log('\n--- Testing manual OTP send for your email ---')
    
    const otpResponse = await axios.post('http://localhost:5000/api/otp/send-email', {
      email: 'nikhilsrokade2203@gmail.com',
      purpose: 'verification'
    })
    
    console.log('✅ Manual OTP Response:')
    console.log('Success:', otpResponse.data.success)
    console.log('Message:', otpResponse.data.message)
    console.log('Expires In:', otpResponse.data.expiresIn, 'seconds')
    console.log('📧 OTP email sent to: nikhilsrokade2203@gmail.com')
    
  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.data)
    } else {
      console.error('❌ Network Error:', error.message)
    }
  }
}

testCompleteRegistrationFlow()