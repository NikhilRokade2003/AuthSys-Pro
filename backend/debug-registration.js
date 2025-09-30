const axios = require('axios')

async function debugRegistrationOTP() {
  try {
    console.log('Debugging registration OTP issue...')
    
    // Use a unique email
    const testEmail = `debug${Date.now()}@example.com`
    console.log(`\nRegistering with email: ${testEmail}`)
    
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Debug User',
      email: testEmail,
      password: 'DebugPassword123!',
      phone: '+918956122003'
    })
    
    console.log('\n=== FULL REGISTRATION RESPONSE ===')
    console.log(JSON.stringify(response.data, null, 2))
    
    // Check if the message indicates OTP was sent
    const messageIncludesOTP = response.data.message && response.data.message.includes('OTP')
    console.log('\n=== ANALYSIS ===')
    console.log('Response success:', response.data.success)
    console.log('Message mentions OTP:', messageIncludesOTP)
    console.log('otpSent field:', response.data.otpSent)
    
    if (messageIncludesOTP && !response.data.otpSent) {
      console.log('🔍 ISSUE: Message says OTP sent but otpSent field is missing/false')
    }
    
    // Test sending OTP manually to verify email system works
    console.log('\n--- Testing manual OTP to same email ---')
    try {
      const otpResponse = await axios.post('http://localhost:5000/api/otp/send-email', {
        email: testEmail,
        purpose: 'verification'
      })
      
      console.log('Manual OTP Result:', otpResponse.data)
      
    } catch (otpError) {
      console.log('Manual OTP Error:', otpError.response?.data || otpError.message)
    }
    
  } catch (error) {
    console.error('Registration Error:')
    if (error.response) {
      console.error('Status:', error.response.status)
      console.error('Data:', error.response.data)
    } else {
      console.error('Message:', error.message)
    }
  }
}

debugRegistrationOTP()