import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import axios from 'axios'
import Layout from '../components/Layout'
import Link from 'next/link'

const ForgotPasswordPage = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [resetMethod, setResetMethod] = useState('email') // 'email' or 'sms'
  const [step, setStep] = useState(1) // 1: Enter email/phone, 2: Success message
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    setIsLoading(true)
    
    try {
      const endpoint = resetMethod === 'email' ? '/api/auth/forgot-password-email' : '/api/auth/forgot-password-sms'
      const payload = resetMethod === 'email' ? { email: data.contact } : { phone: data.contact }
      
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, payload)
      
      if (response.data.success) {
        setStep(2)
        toast.success(`Reset instructions sent to your ${resetMethod}`)
        
        // If using OTP method, redirect to OTP page
        if (resetMethod === 'sms' || response.data.useOtp) {
          setTimeout(() => {
            router.push(`/otp?${resetMethod === 'email' ? 'email' : 'phone'}=${encodeURIComponent(data.contact)}&type=${resetMethod}&action=forgot-password`)
          }, 2000)
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send reset instructions'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  }

  return (
    <Layout title="Forgot Password - SecureAuth Pro">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          {/* Terminal Header */}
          <motion.div variants={itemVariants} className="card-hacker mb-8">
            <div className="flex items-center justify-between border-b border-hacker-green/30 pb-4 mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-hacker-green"></div>
              </div>
              <div className="text-sm text-hacker-green/70 font-mono">
                recovery.exe
              </div>
            </div>

            {step === 1 ? (
              <>
                <div className="text-center mb-6">
                  <h1 className="text-3xl font-bold text-hacker-green title-glitch" data-text="PASSWORD RECOVERY">
                    PASSWORD RECOVERY
                  </h1>
                  <p className="text-hacker-green/70 font-mono mt-2">
                    Initiate security recovery protocol
                  </p>
                </div>

                {/* Recovery Method Selection */}
                <motion.div variants={itemVariants} className="mb-6">
                  <label className="block text-hacker-green font-mono text-sm mb-3">
                    Recovery Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setResetMethod('email')}
                      className={`p-3 border-2 rounded-lg font-mono text-sm transition-all ${
                        resetMethod === 'email'
                          ? 'border-hacker-green bg-hacker-green/10 text-hacker-green'
                          : 'border-hacker-green/30 text-hacker-green/70 hover:border-hacker-green/50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span>📧</span>
                        <span>Email</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setResetMethod('sms')}
                      className={`p-3 border-2 rounded-lg font-mono text-sm transition-all ${
                        resetMethod === 'sms'
                          ? 'border-hacker-blue bg-hacker-blue/10 text-hacker-blue'
                          : 'border-hacker-green/30 text-hacker-green/70 hover:border-hacker-green/50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span>📱</span>
                        <span>SMS</span>
                      </div>
                    </button>
                  </div>
                </motion.div>

                {/* Recovery Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <motion.div variants={itemVariants}>
                    <label className="block text-hacker-green font-mono text-sm mb-2">
                      {resetMethod === 'email' ? 'Email Address' : 'Phone Number'}
                    </label>
                    <input
                      {...register('contact', {
                        required: `${resetMethod === 'email' ? 'Email' : 'Phone number'} is required`,
                        pattern: resetMethod === 'email' 
                          ? {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: 'Invalid email address'
                            }
                          : {
                              value: /^[\+]?[1-9][\d]{0,15}$/,
                              message: 'Invalid phone number'
                            }
                      })}
                      type={resetMethod === 'email' ? 'email' : 'tel'}
                      className="input-hacker w-full"
                      placeholder={resetMethod === 'email' ? 'user@SecureAuth-Pro.com' : '+1234567890'}
                      disabled={isLoading}
                    />
                    {errors.contact && (
                      <p className="text-red-400 text-sm mt-1 font-mono">
                        {errors.contact.message}
                      </p>
                    )}
                  </motion.div>

                  <motion.button
                    variants={itemVariants}
                    type="submit"
                    disabled={isLoading}
                    className="btn-hacker w-full flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? (
                      <>
                        <div className="loading-spinner w-5 h-5"></div>
                        <span>Initiating Recovery...</span>
                      </>
                    ) : (
                      <>
                        <span>🔄</span>
                        <span>INITIATE RECOVERY</span>
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Security Information */}
                <motion.div variants={itemVariants} className="mt-6 p-4 border border-hacker-blue/30 rounded-lg bg-hacker-blue/5">
                  <div className="flex items-start space-x-3">
                    <span className="text-hacker-blue text-xl">🛡️</span>
                    <div>
                      <h3 className="text-hacker-blue font-mono font-bold text-sm">Security Protocol</h3>
                      <ul className="text-hacker-green/70 font-mono text-xs mt-1 space-y-1">
                        <li>• {resetMethod === 'email' ? 'Reset link expires in 1 hour' : 'OTP expires in 5 minutes'}</li>
                        <li>• Only the latest request remains valid</li>
                        <li>• Account remains secure during recovery</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </>
            ) : (
              /* Success Message */
              <>
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="text-6xl mb-4"
                  >
                    ✅
                  </motion.div>
                  <h1 className="text-3xl font-bold text-hacker-green title-glitch" data-text="RECOVERY INITIATED">
                    RECOVERY INITIATED
                  </h1>
                  <p className="text-hacker-green/70 font-mono mt-2">
                    Instructions sent successfully
                  </p>
                </div>

                <motion.div
                  variants={itemVariants}
                  className="text-center space-y-4"
                >
                  <div className="p-4 border border-hacker-green/30 rounded-lg bg-hacker-green/5">
                    <p className="text-hacker-green font-mono text-sm">
                      {resetMethod === 'email' 
                        ? 'A password reset link has been sent to your email address. Please check your inbox and follow the instructions.'
                        : 'An OTP has been sent to your phone number. You will be redirected to the verification page shortly.'
                      }
                    </p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-hacker-green/70 font-mono text-xs">
                      Didn't receive the {resetMethod === 'email' ? 'email' : 'SMS'}? Check your spam folder or try again.
                    </p>
                    
                    <button
                      onClick={() => setStep(1)}
                      className="text-hacker-blue hover:text-hacker-green transition-colors font-mono text-sm"
                    >
                      Try Different Method
                    </button>
                  </div>
                </motion.div>
              </>
            )}

            {/* Back to Login */}
            <motion.div variants={itemVariants} className="text-center mt-6">
              <Link
                href="/login"
                className="text-hacker-green/70 hover:text-hacker-green transition-colors font-mono text-sm"
              >
                ← Back to Login
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  )
}

export default ForgotPasswordPage