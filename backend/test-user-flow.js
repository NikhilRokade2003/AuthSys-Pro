const axios = require('axios')

async function testCompleteUserFlow() {
  try {
    console.log('🚀 Testing Complete User Registration Flow')
    console.log('=' .repeat(50))
    
    // Test data - simulating what user enters on signup form
    const userData = {
      name: 'Test User Flow',
      email: 'nikhilsrokade2203@gmail.com', // Use your actual email
      password: 'TestPassword123!',
      confirmPassword: 'TestPassword123!',
      phone: '+918956122003',
      terms: true
    }
    
    console.log('\n📝 Step 1: User fills signup form')
    console.log('Name:', userData.name)
    console.log('Email:', userData.email)
    console.log('Phone:', userData.phone)
    
    console.log('\n🔥 Step 2: User clicks "Create Account" button')
    console.log('Sending registration request...')
    
    const registrationResponse = await axios.post('http://localhost:5000/api/auth/register', {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      confirmPassword: userData.confirmPassword,
      phone: userData.phone,
      terms: userData.terms
    })
    
    console.log('\n✅ Registration Response:')
    console.log('Success:', registrationResponse.data.success)
    console.log('Message:', registrationResponse.data.message)
    console.log('User ID:', registrationResponse.data.user?.id)
    console.log('Email Verified:', registrationResponse.data.user?.is_email_verified)
    console.log('OTP Sent:', registrationResponse.data.otpSent)
    
    if (registrationResponse.data.success) {
      console.log('\n📧 Step 3: Check your email for OTP')
      console.log('Expected: OTP email should be sent to', userData.email)
      
      if (registrationResponse.data.otpSent) {
        console.log('✅ Backend confirms OTP was sent!')
      } else {
        console.log('❌ Backend says OTP was NOT sent - this is the problem!')
        
        // Try manual OTP sending as fallback
        console.log('\n🔧 Step 4: Trying manual OTP send as fallback...')
        try {
          const manualOTP = await axios.post('http://localhost:5000/api/otp/send-email', {
            email: userData.email,
            purpose: 'verification'
          })
          console.log('✅ Manual OTP sent:', manualOTP.data.message)
        } catch (manualError) {
          console.log('❌ Manual OTP also failed:', manualError.response?.data?.message)
        }
      }
      
      console.log('\n🧪 Step 5: Testing OTP verification (simulation)')
      console.log('Once you receive the OTP email, you can verify it using:')
      console.log('')
      console.log('curl -X POST http://localhost:5000/api/otp/verify \\')
      console.log('  -H "Content-Type: application/json" \\')
      console.log(`  -d '{"otp":"YOUR_6_DIGIT_OTP","identifier":"${userData.email}","action":"email-verification"}'`)
      console.log('')
      
      console.log('📱 Step 6: Frontend should redirect to OTP page')
      console.log(`Expected URL: /otp?email=${encodeURIComponent(userData.email)}&type=email`)
      
    } else {
      console.log('❌ Registration failed:', registrationResponse.data.message)
    }
    
  } catch (error) {
    if (error.response) {
      console.log('\n❌ Registration Error:')
      console.log('Status:', error.response.status)
      console.log('Message:', error.response.data.message)
      
      if (error.response.data.message.includes('already exists')) {
        console.log('\n💡 User already exists - testing with existing user...')
        
        // Test OTP resend for existing user
        console.log('\n🔄 Testing OTP resend for existing user...')
        try {
          const resendResponse = await axios.post('http://localhost:5000/api/otp/send-email', {
            email: 'nikhilsrokade2203@gmail.com',
            purpose: 'verification'
          })
          console.log('✅ OTP resent to existing user:', resendResponse.data.message)
          console.log('📧 Check your email for the new OTP!')
        } catch (resendError) {
          console.log('❌ OTP resend failed:', resendError.response?.data?.message)
        }
      }
    } else {
      console.log('❌ Network Error:', error.message)
    }
  }
}

testCompleteUserFlow()