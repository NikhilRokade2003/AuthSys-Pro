const axios = require('axios')

async function testOTPVerification() {
  try {
    console.log('Testing complete OTP flow...')
    
    const testEmail = 'nikhilsrokade2203@gmail.com'
    
    // Step 1: Send OTP
    console.log('\n1. Sending OTP to email...')
    const sendResponse = await axios.post('http://localhost:5000/api/otp/send-email', {
      email: testEmail,
      purpose: 'verification'
    })
    
    console.log('✅ OTP Send Response:', sendResponse.data)
    
    // Step 2: Get the OTP from user input (simulating frontend)
    console.log('\n2. Please check your email and enter the 6-digit OTP below')
    console.log('🔍 In a real test, we would get this from the database or user input')
    
    // For testing, let's try to get the OTP from the user record
    // Note: In production, this would come from user input in frontend
    const userResponse = await axios.get(`http://localhost:5000/api/auth/me`, {
      headers: {
        // This would normally have auth token, for demo we'll test verification differently
      }
    })
    
    // Let's test with some common test values to understand the validation
    console.log('\n3. Testing OTP verification with test data...')
    
    const testOTPs = ['123456', '000000', '111111']
    
    for (let testOTP of testOTPs) {
      console.log(`\nTesting OTP: ${testOTP}`)
      try {
        const verifyResponse = await axios.post('http://localhost:5000/api/otp/verify', {
          otp: testOTP,
          identifier: testEmail,
          action: 'email-verification'
        })
        
        console.log('✅ Verification Success:', verifyResponse.data)
        break // If successful, stop testing
        
      } catch (verifyError) {
        if (verifyError.response) {
          console.log('❌ Verification Failed:', verifyError.response.data.message)
        } else {
          console.log('❌ Network Error:', verifyError.message)
        }
      }
    }
    
    console.log('\n📧 Please check your email for the actual OTP and test it manually!')
    console.log('Use this format for manual testing:')
    console.log(`
curl -X POST http://localhost:5000/api/otp/verify \\
  -H "Content-Type: application/json" \\
  -d '{
    "otp": "YOUR_6_DIGIT_OTP",
    "identifier": "${testEmail}",
    "action": "email-verification"
  }'
    `)
    
  } catch (error) {
    console.error('❌ Test Error:', error.response?.data || error.message)
  }
}

testOTPVerification()