const axios = require('axios')

async function testFrontendBackendConnection() {
  try {
    console.log('Testing connection from frontend perspective...')
    
    const API_URL = 'http://localhost:5000'
    
    // Test 1: Basic health check
    console.log('\n1. Testing backend health check...')
    try {
      const healthResponse = await axios.get(`${API_URL}/health`)
      console.log('✅ Backend is reachable:', healthResponse.data)
    } catch (error) {
      console.log('❌ Backend health check failed:', error.message)
    }
    
    // Test 2: Test registration endpoint with a new email
    console.log('\n2. Testing registration with new email...')
    try {
      const testEmail = `test${Date.now()}@example.com`
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        name: 'Test User',
        email: testEmail,
        password: 'TestPassword123!',
        phone: '+918956122003'
      })
      
      console.log('✅ Registration test successful!')
      console.log('Response:', {
        success: response.data.success,
        message: response.data.message,
        otpSent: response.data.otpSent
      })
      
      if (response.data.otpSent) {
        console.log('📧 OTP email should have been sent to:', testEmail)
      }
      
    } catch (error) {
      if (error.response) {
        console.log('❌ Registration failed:', error.response.data)
      } else {
        console.log('❌ Network error:', error.message)
      }
    }
    
    // Test 3: Test OTP sending to your actual email
    console.log('\n3. Testing OTP sending to your email...')
    try {
      const response = await axios.post(`${API_URL}/api/otp/send-email`, {
        email: 'nikhilsrokade2203@gmail.com',
        purpose: 'verification'
      })
      
      console.log('✅ OTP send test successful!')
      console.log('Response:', response.data)
      console.log('📧 OTP email should have been sent to nikhilsrokade2203@gmail.com')
      
    } catch (error) {
      if (error.response) {
        console.log('❌ OTP send failed:', error.response.data)
      } else {
        console.log('❌ Network error:', error.message)
      }
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message)
  }
}

testFrontendBackendConnection()