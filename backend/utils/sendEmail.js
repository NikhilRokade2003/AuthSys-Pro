const nodemailer = require('nodemailer')

// Create email transporter
const createTransporter = () => {
  if (process.env.SENDGRID_API_KEY) {
    // SendGrid configuration
    return nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    })
  } else {
    // Gmail configuration - Updated to match .env variables
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    })
  }
}

// Send OTP email
const sendOTPEmail = async (email, otp, purpose = 'verification') => {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: `SecureAuth Pro - Your ${purpose} Code`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>SecureAuth Pro - OTP Verification</title>
          <style>
            body {
              font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
              color: #ffffff;
              margin: 0;
              padding: 20px;
              line-height: 1.6;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: linear-gradient(135deg, rgba(26, 32, 44, 0.95) 0%, rgba(45, 55, 72, 0.95) 100%);
              border: 2px solid #00d4ff;
              border-radius: 20px;
              padding: 40px;
              box-shadow: 0 20px 40px rgba(0, 212, 255, 0.2);
              backdrop-filter: blur(10px);
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
            }
            .logo {
              font-size: 28px;
              font-weight: 700;
              background: linear-gradient(45deg, #00d4ff, #a855f7);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              margin-bottom: 10px;
            }
            .subtitle {
              color: #94a3b8;
              font-size: 16px;
            }
            .otp-container {
              background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
              border: 2px solid rgba(0, 212, 255, 0.3);
              border-radius: 15px;
              padding: 30px;
              text-align: center;
              margin: 30px 0;
              backdrop-filter: blur(5px);
            }
            .otp-code {
              font-size: 36px;
              font-weight: 700;
              color: #00d4ff;
              letter-spacing: 8px;
              margin: 15px 0;
              text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
            }
            .otp-label {
              color: #e2e8f0;
              font-size: 14px;
              margin-bottom: 10px;
            }
            .expiry-info {
              color: #fbbf24;
              font-size: 14px;
              margin-top: 15px;
            }
            .security-notice {
              background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
              border: 1px solid rgba(239, 68, 68, 0.3);
              border-radius: 12px;
              padding: 20px;
              margin: 25px 0;
              color: #fca5a5;
            }
            .security-title {
              font-weight: 600;
              margin-bottom: 10px;
              display: flex;
              align-items: center;
            }
            .security-icon {
              margin-right: 8px;
              font-size: 18px;
            }
            .security-list {
              margin: 10px 0;
              padding-left: 0;
              list-style: none;
            }
            .security-list li {
              margin: 5px 0;
              padding-left: 20px;
              position: relative;
            }
            .security-list li:before {
              content: "•";
              color: #ef4444;
              position: absolute;
              left: 0;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid rgba(0, 212, 255, 0.2);
              color: #64748b;
              font-size: 12px;
            }
            .brand-text {
              color: #00d4ff;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">SecureAuth Pro</div>
              <div class="subtitle">Professional Authentication System</div>
            </div>
            
            <p style="color: #e2e8f0; font-size: 16px;">Hello,</p>
            
            <p style="color: #cbd5e1;">Your ${purpose} code has been generated. Please use this code to complete your authentication process:</p>
            
            <div class="otp-container">
              <div class="otp-label">Verification Code</div>
              <div class="otp-code">${otp}</div>
              <div class="expiry-info">⏰ Valid for 5 minutes</div>
            </div>
            
            <div class="security-notice">
              <div class="security-title">
                <span class="security-icon">🔒</span>
                Security Guidelines
              </div>
              <ul class="security-list">
                <li>This code expires in 5 minutes</li>
                <li>Never share this code with anyone</li>
                <li>Our team will never ask for your verification code</li>
                <li>If you didn't request this, please contact support immediately</li>
              </ul>
            </div>
            
            <div class="footer">
              <p>© 2024 <span class="brand-text">SecureAuth Pro</span>. All rights reserved.</p>
              <p>This is an automated security message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
SecureAuth Pro - Security Verification

Hello,

Your ${purpose} code: ${otp}

This code expires in 5 minutes.

Security Guidelines:
• Never share this code with anyone
• Our team will never ask for your verification code
• If you didn't request this, please contact support immediately

© 2024 SecureAuth Pro. All rights reserved.
      `,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('OTP email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Error sending OTP email:', error)
    throw new Error('Failed to send OTP email')
  }
}

// Send verification email
const sendVerificationEmail = async (email, token) => {
  try {
    const transporter = createTransporter()
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'HackerAuth - Verify Your Email Address',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>HackerAuth - Email Verification</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              background-color: #000000;
              color: #00ff7f;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #0a0a0a;
              border: 2px solid #00ff7f;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 0 20px rgba(0, 255, 127, 0.3);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              text-shadow: 0 0 10px #00ff7f;
            }
            .verify-btn {
              display: inline-block;
              background: linear-gradient(45deg, #00ff7f, #00e0ff);
              color: #000;
              text-decoration: none;
              padding: 15px 30px;
              border-radius: 8px;
              font-weight: bold;
              margin: 20px 0;
              text-align: center;
            }
            .verify-btn:hover {
              transform: scale(1.05);
            }
            .terminal-prompt {
              color: #00ff7f;
            }
            .command {
              color: #00e0ff;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">
                <span class="terminal-prompt">&gt;</span>HACKER<span class="command">AUTH</span>
              </div>
              <p>Account Activation Protocol</p>
            </div>
            
            <p>Welcome to the system!</p>
            
            <p>Please verify your email address to activate your account and gain full access to the HackerAuth system.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" class="verify-btn">VERIFY EMAIL ADDRESS</a>
            </div>
            
            <p>Or copy and paste this link in your browser:</p>
            <p style="background-color: #1a1a1a; padding: 10px; border-radius: 5px; word-break: break-all;">
              ${verificationUrl}
            </p>
            
            <p><strong>Security Notice:</strong> This verification link expires in 24 hours.</p>
            
            <div class="footer">
              <p>© 2024 HackerAuth System. All rights reserved.</p>
              <p>If you didn't create an account, please ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
HackerAuth - Email Verification

Welcome to the system!

Please verify your email address by clicking the link below:
${verificationUrl}

This verification link expires in 24 hours.

If you didn't create an account, please ignore this email.

© 2024 HackerAuth System
      `,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Verification email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Error sending verification email:', error)
    throw new Error('Failed to send verification email')
  }
}

// Send password reset email
const sendPasswordResetEmail = async (email, token) => {
  try {
    const transporter = createTransporter()
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'HackerAuth - Password Reset Request',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>HackerAuth - Password Reset</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              background-color: #000000;
              color: #00ff7f;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #0a0a0a;
              border: 2px solid #00ff7f;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 0 20px rgba(0, 255, 127, 0.3);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              text-shadow: 0 0 10px #00ff7f;
            }
            .reset-btn {
              display: inline-block;
              background: linear-gradient(45deg, #ff6b6b, #ffa500);
              color: #000;
              text-decoration: none;
              padding: 15px 30px;
              border-radius: 8px;
              font-weight: bold;
              margin: 20px 0;
              text-align: center;
            }
            .terminal-prompt {
              color: #00ff7f;
            }
            .command {
              color: #00e0ff;
            }
            .warning {
              background-color: #1a0a0a;
              border: 1px solid #ff6b6b;
              border-radius: 5px;
              padding: 15px;
              margin: 20px 0;
              color: #ff6b6b;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">
                <span class="terminal-prompt">&gt;</span>HACKER<span class="command">AUTH</span>
              </div>
              <p>Password Recovery Protocol</p>
            </div>
            
            <p>A password reset request was initiated for your account.</p>
            
            <p>Click the button below to reset your password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" class="reset-btn">RESET PASSWORD</a>
            </div>
            
            <p>Or copy and paste this link in your browser:</p>
            <p style="background-color: #1a1a1a; padding: 10px; border-radius: 5px; word-break: break-all;">
              ${resetUrl}
            </p>
            
            <div class="warning">
              <strong>⚠️ Security Alert:</strong><br>
              • This reset link expires in 1 hour<br>
              • If you didn't request this, please ignore this email<br>
              • Your password remains unchanged until you click the link
            </div>
            
            <div class="footer">
              <p>© 2024 HackerAuth System. All rights reserved.</p>
              <p>If you didn't request a password reset, no action is needed.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
HackerAuth - Password Reset

A password reset request was initiated for your account.

Reset your password by clicking the link below:
${resetUrl}

This reset link expires in 1 hour.

If you didn't request this, please ignore this email.

© 2024 HackerAuth System
      `,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Password reset email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Error sending password reset email:', error)
    throw new Error('Failed to send password reset email')
  }
}

module.exports = {
  sendOTPEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
}