import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import axios from 'axios'
import Layout from '../components/Layout'
import OtpInput from 'react-otp-input'

const OTPPage = () => {
  const router = useRouter()
  const { email, phone, type, action } = router.query
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [canResend, setCanResend] = useState(false)

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [timeLeft])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP')
      return
    }

    setIsLoading(true)
    
    try {
      // Use email or phone as identifier based on type
      const identifier = type === 'email' ? email : phone
      
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/otp/verify`, {
        otp,
        identifier,
        action: action || 'email-verification'
      })

      if (response.data.success) {
        toast.success('OTP verified successfully!')
        
        // Redirect based on action
        if (action === 'forgot-password') {
          router.push(`/reset-password?token=${response.data.resetToken}`)
        } else {
          router.push('/login?verified=true')
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'OTP verification failed'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setIsResending(true)
    
    try {
      const endpoint = type === 'email' ? '/api/otp/send-email' : '/api/otp/send-sms'
      const payload = type === 'email' ? { email } : { phone }
      
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, payload)
      
      if (response.data.success) {
        toast.success(`New OTP sent to your ${type}`)
        setTimeLeft(300)
        setCanResend(false)
        setOtp('')
      }
    } catch (error) {
      toast.error('Failed to resend OTP')
    } finally {
      setIsResending(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <Layout title="OTP Verification - SecureAuth Pro">
      {/* 3D Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-blue/20 rounded-full filter blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/20 rounded-full filter blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-neon-cyan/15 rounded-full filter blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
      </div>
      
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          {/* Professional 3D Form Card */}
          <motion.div 
            variants={itemVariants} 
            className="relative"
          >
            {/* 3D Card Background */}
            <div className="absolute inset-0 bg-gradient-card rounded-2xl transform rotate-1 scale-105 opacity-50"></div>
            <div className="absolute inset-0 bg-gradient-card rounded-2xl transform -rotate-1 scale-102 opacity-30"></div>
            
            {/* Main Card */}
            <div className="relative auth-card backdrop-blur-xl border border-neon-blue/30 shadow-neon">
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="w-16 h-16 bg-gradient-neon rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-neon-strong"
                >
                  <svg className="w-8 h-8 text-dark-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </motion.div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Verify Your Identity
                </h1>
                <p className="text-dark-300">
                  Enter the verification code to continue
                </p>
              </div>

              {/* Security Icon Animation */}
              <motion.div
                variants={itemVariants}
                className="text-center mb-8"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 2, -2, 0]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    repeatType: 'reverse'
                  }}
                  className="w-20 h-20 bg-gradient-to-br from-neon-blue to-neon-purple rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-neon"
                >
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.div>
                <p className="text-white font-medium text-sm mb-2">
                  Verification code sent to:
                </p>
                <p className="text-neon-blue font-semibold break-all">
                  {type === 'email' ? email : phone}
                </p>
              </motion.div>

              {/* OTP Input */}
              <motion.div variants={itemVariants} className="mb-8">
                <label className="block text-white font-medium text-sm mb-4 text-center">
                  Enter 6-digit verification code
                </label>
                <div className="flex justify-center">
                  <OtpInput
                    value={otp}
                    onChange={setOtp}
                    numInputs={6}
                    separator={<span className="mx-2 text-neon-blue">-</span>}
                    renderInput={(props) => (
                      <input
                        {...props}
                        style={{
                          width: '3.5rem',
                          height: '3.5rem',
                          margin: '0 0.3rem',
                          fontSize: '1.5rem',
                          borderRadius: '0.75rem',
                          border: '2px solid rgba(0, 212, 255, 0.3)',
                          backgroundColor: 'rgba(26, 32, 44, 0.8)',
                          color: '#00d4ff',
                          fontFamily: 'Inter, system-ui, sans-serif',
                          fontWeight: '600',
                          textAlign: 'center',
                          outline: 'none',
                          transition: 'all 0.3s ease',
                          backdropFilter: 'blur(10px)',
                        }}
                        onFocus={(e) => {
                          e.target.style.border = '2px solid #00d4ff'
                          e.target.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.4)'
                          e.target.style.backgroundColor = 'rgba(26, 32, 44, 0.9)'
                        }}
                        onBlur={(e) => {
                          e.target.style.border = '2px solid rgba(0, 212, 255, 0.3)'
                          e.target.style.boxShadow = 'none'
                          e.target.style.backgroundColor = 'rgba(26, 32, 44, 0.8)'
                        }}
                      />
                    )}
                  />
                </div>
              </motion.div>

              {/* Timer */}
              <motion.div variants={itemVariants} className="text-center mb-6">
                <div className="text-neon-blue font-medium">
                  {timeLeft > 0 ? (
                    <span>Code expires in: {formatTime(timeLeft)}</span>
                  ) : (
                    <span className="text-error">Code has expired</span>
                  )}
                </div>
              </motion.div>

              {/* Verify Button */}
              <motion.button
                variants={itemVariants}
                onClick={handleVerifyOtp}
                disabled={isLoading || otp.length !== 6}
                className="btn-primary w-full flex items-center justify-center space-x-2 py-4 text-lg font-semibold mb-6"
                whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(0, 212, 255, 0.5)" }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner w-6 h-6"></div>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Verify Code</span>
                  </>
                )}
              </motion.button>

              {/* Resend Button */}
              <motion.div variants={itemVariants} className="text-center mb-6">
                <p className="text-dark-300 text-sm mb-2">
                  Didn't receive the code?
                </p>
                <motion.button
                  onClick={handleResendOtp}
                  disabled={!canResend || isResending}
                  className={`text-sm font-medium transition-colors ${
                    canResend && !isResending
                      ? 'text-neon-blue hover:text-neon-purple cursor-pointer'
                      : 'text-dark-500 cursor-not-allowed'
                  }`}
                  whileHover={canResend && !isResending ? { scale: 1.05 } : {}}
                  whileTap={canResend && !isResending ? { scale: 0.95 } : {}}
                >
                  {isResending ? (
                    <span className="flex items-center justify-center space-x-2">
                      <div className="loading-spinner w-4 h-4"></div>
                      <span>Sending...</span>
                    </span>
                  ) : canResend ? (
                    'Resend Code'
                  ) : (
                    `Resend available in ${formatTime(timeLeft)}`
                  )}
                </motion.button>
              </motion.div>

              {/* Security Notice */}
              <motion.div variants={itemVariants} className="mb-6 p-4 border border-neon-blue/20 rounded-xl bg-dark-800/50 backdrop-blur-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-neon-blue/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">Security Notice</h3>
                    <p className="text-dark-300 text-xs mt-1">
                      Never share this verification code with anyone. Our team will never ask for your OTP.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Back to Login */}
              <motion.div variants={itemVariants} className="text-center">
                <motion.button
                  onClick={() => router.push('/login')}
                  className="text-dark-400 hover:text-neon-blue transition-colors text-sm flex items-center justify-center space-x-2 mx-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Back to Login</span>
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  )
}

export default OTPPage