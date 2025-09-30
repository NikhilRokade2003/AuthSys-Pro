const twilio = require('twilio')

// Initialize Twilio client
const createTwilioClient = () => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    throw new Error('Twilio credentials not configured')
  }
  
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
}

// Send SMS OTP using Twilio
const sendSMSOTP = async (phoneNumber, otp, purpose = 'verification') => {
  try {
    const client = createTwilioClient()
    
    const message = `🔐 HackerAuth Security Code

Your ${purpose} code: ${otp}

⚠️ This code expires in 5 minutes
⚠️ Never share this code with anyone

If you didn't request this, contact support immediately.

- HackerAuth System`

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    })

    console.log('SMS OTP sent successfully:', result.sid)
    return { 
      success: true, 
      messageId: result.sid,
      status: result.status 
    }
  } catch (error) {
    console.error('Error sending SMS OTP:', error)
    
    // Handle specific Twilio errors
    if (error.code === 21211) {
      throw new Error('Invalid phone number format')
    } else if (error.code === 21614) {
      throw new Error('Phone number is not a valid mobile number')
    } else if (error.code === 21408) {
      throw new Error('Permission to send SMS to this number denied')
    } else if (error.code === 30007) {
      throw new Error('Message delivery failed')
    }
    
    throw new Error('Failed to send SMS OTP')
  }
}

// Send SMS notification
const sendSMSNotification = async (phoneNumber, message) => {
  try {
    const client = createTwilioClient()
    
    const result = await client.messages.create({
      body: `🔐 HackerAuth Alert

${message}

- HackerAuth System`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    })

    console.log('SMS notification sent successfully:', result.sid)
    return { 
      success: true, 
      messageId: result.sid,
      status: result.status 
    }
  } catch (error) {
    console.error('Error sending SMS notification:', error)
    throw new Error('Failed to send SMS notification')
  }
}

// Validate phone number format
const validatePhoneNumber = (phoneNumber) => {
  // Remove all non-digit characters except + at the beginning
  const cleaned = phoneNumber.replace(/[^\d+]/g, '')
  
  // Check if it's a valid international format
  const phoneRegex = /^\+[1-9]\d{1,14}$/
  
  return phoneRegex.test(cleaned)
}

// Format phone number for Twilio
const formatPhoneNumber = (phoneNumber) => {
  // Remove all non-digit characters except + at the beginning
  let formatted = phoneNumber.replace(/[^\d+]/g, '')
  
  // Add + if not present and number doesn't start with it
  if (!formatted.startsWith('+')) {
    // Assume US number if no country code
    if (formatted.length === 10) {
      formatted = '+1' + formatted
    } else {
      formatted = '+' + formatted
    }
  }
  
  return formatted
}

// Check SMS delivery status
const checkSMSStatus = async (messageId) => {
  try {
    const client = createTwilioClient()
    const message = await client.messages(messageId).fetch()
    
    return {
      success: true,
      status: message.status,
      errorCode: message.errorCode,
      errorMessage: message.errorMessage,
      dateCreated: message.dateCreated,
      dateSent: message.dateSent,
      dateUpdated: message.dateUpdated,
    }
  } catch (error) {
    console.error('Error checking SMS status:', error)
    throw new Error('Failed to check SMS status')
  }
}

// Get account SMS usage/balance
const getSMSAccountInfo = async () => {
  try {
    const client = createTwilioClient()
    const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch()
    
    return {
      success: true,
      accountSid: account.sid,
      status: account.status,
      type: account.type,
      dateCreated: account.dateCreated,
      dateUpdated: account.dateUpdated,
    }
  } catch (error) {
    console.error('Error getting SMS account info:', error)
    throw new Error('Failed to get SMS account info')
  }
}

module.exports = {
  sendSMSOTP,
  sendSMSNotification,
  validatePhoneNumber,
  formatPhoneNumber,
  checkSMSStatus,
  getSMSAccountInfo,
}