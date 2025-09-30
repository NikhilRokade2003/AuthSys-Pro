const nodemailer = require('nodemailer')
require('dotenv').config()

// Test email configuration
const testEmail = async () => {
  try {
    console.log('Testing email configuration...')
    console.log('Email Username:', process.env.EMAIL_USERNAME)
    console.log('Email Password exists:', !!process.env.EMAIL_PASSWORD)
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    // Verify the connection
    await transporter.verify()
    console.log('✅ Email configuration is valid!')

    // Send test email
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: process.env.EMAIL_USERNAME, // Send to self for testing
      subject: 'SecureAuth Pro - Email Configuration Test',
      html: `
        <h2>Email Configuration Test</h2>
        <p>If you receive this email, your email configuration is working correctly!</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Test email sent successfully!')
    console.log('Message ID:', result.messageId)
    
  } catch (error) {
    console.error('❌ Email configuration error:', error)
    console.error('Error details:', error.message)
  }
}

testEmail()