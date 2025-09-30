const axios = require('axios')

async function testFreshRegistration() {
  try {
    console.log('🚀 Testing Registration with Fresh Email')
    console.log('=' .repeat(40))
    
    // Use a completely fresh email
    const timestamp = Date.now()
    const testEmail = `testuser${timestamp}@example.com`
    
    const userData = {
      name: 'Fresh Test User',
      email: testEmail,
      password: 'TestPassword123!',
      confirmPassword: 'TestPassword123!',
      phone: '+918956122003',
      terms: true
    }
    
    console.log('\n📝 Testing with fresh email:', testEmail)
    
    const registrationResponse = await axios.post('http://localhost:5000/api/auth/register', {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      confirmPassword: userData.confirmPassword,
      phone: userData.phone,
      terms: userData.terms
    })
    
    console.log('\n✅ Fresh Registration Response:')
    console.log('Success:', registrationResponse.data.success)
    console.log('Message:', registrationResponse.data.message)
    console.log('User ID:', registrationResponse.data.user?.id)
    console.log('OTP Sent Field:', registrationResponse.data.otpSent)
    console.log('Full Response:', JSON.stringify(registrationResponse.data, null, 2))
    
    // Now test with your actual email (should send OTP even if user exists)
    console.log('\n🔄 Now testing OTP sending to your actual email...')
    try {
      const actualEmailOTP = await axios.post('http://localhost:5000/api/otp/send-email', {
        email: 'nikhilsrokade2203@gmail.com',
        purpose: 'verification'
      })
      console.log('✅ OTP sent to your email:', actualEmailOTP.data.message)
      console.log('📧 Check nikhilsrokade2203@gmail.com for OTP!')
    } catch (emailError) {
      console.log('❌ Failed to send OTP to your email:', emailError.response?.data?.message)
    }
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message)
  }
}

testFreshRegistration()