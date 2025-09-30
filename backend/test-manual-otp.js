const axios = require('axios')

async function testActualOTPVerification() {
  try {
    console.log('=== COMPLETE OTP VERIFICATION TEST ===')
    
    const testEmail = 'nikhilsrokade2203@gmail.com'
    
    // Step 1: Send OTP and get the actual OTP code from email
    console.log('\n🔥 Step 1: Sending OTP to your email...')
    const sendResponse = await axios.post('http://localhost:5000/api/otp/send-email', {
      email: testEmail,
      purpose: 'verification'
    })
    
    if (sendResponse.data.success) {
      console.log('✅ OTP sent successfully!')
      console.log('📧 Check your email: nikhilsrokade2203@gmail.com')
      console.log('⏰ OTP expires in:', sendResponse.data.expiresIn, 'seconds')
      
      console.log('\n🔥 Step 2: Testing verification with WRONG OTP first...')
      
      // Test with wrong OTP to see error handling
      try {
        const wrongResponse = await axios.post('http://localhost:5000/api/otp/verify', {
          otp: '123456',
          identifier: testEmail,
          action: 'email-verification'
        })
        console.log('❌ Wrong OTP accepted (this is a problem!):', wrongResponse.data)
      } catch (wrongError) {
        console.log('✅ Wrong OTP correctly rejected:', wrongError.response.data.message)
      }
      
      console.log('\n🔥 Step 3: Instructions for manual testing...')
      console.log('📧 Get the 6-digit OTP from your email')
      console.log('🧪 Then run this command with YOUR actual OTP:')
      console.log('')
      console.log('curl -X POST http://localhost:5000/api/otp/verify \\')
      console.log('  -H "Content-Type: application/json" \\')
      console.log('  -d \'{"otp":"YOUR_6_DIGIT_OTP","identifier":"nikhilsrokade2203@gmail.com","action":"email-verification"}\'')
      console.log('')
      console.log('📝 Expected success response:')
      console.log('{')
      console.log('  "success": true,')
      console.log('  "message": "OTP verified successfully",')
      console.log('  "user": { ... }')
      console.log('}')
      console.log('')
      console.log('🚨 If you get an error, check:')
      console.log('• OTP is exactly 6 digits')
      console.log('• OTP is not expired (5 minutes)')
      console.log('• Email matches exactly')
      console.log('• No extra spaces in OTP')
      
    } else {
      console.log('❌ Failed to send OTP:', sendResponse.data)
    }
    
  } catch (error) {
    console.error('❌ Test Error:', error.response?.data || error.message)
  }
}

testActualOTPVerification()