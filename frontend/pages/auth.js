import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import toast from 'react-hot-toast'
import Layout from '../components/Layout'
import TwoFactorVerification from '../components/TwoFactorVerification'
import Link from 'next/link'

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false)
  const [twoFactorEmail, setTwoFactorEmail] = useState('')
  const router = useRouter()
  
  const {
    register,
    handleSubmit: handleFormSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const password = watch('password')

  const onSubmit = async (data) => {
  setIsLoading(true)
  
  try {
    // Step 1: Register user
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
      name: data.name,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      phone: data.phone,
      terms: data.terms,
    })

    if (response.data.success) {
      // Step 2: Manually send OTP (since registration doesn't send it)
      try {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/otp/send-email`, {
          email: data.email,
          purpose: 'verification'
        })
        toast.success('Registration successful! OTP sent to your email.')
      } catch (otpError) {
        toast.success('Registration successful! Please request OTP manually.')
      }
      
      router.push(`/otp?email=${encodeURIComponent(data.email)}&type=email`)
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Registration failed'
    toast.error(errorMessage)
  } finally {
    setIsLoading(false)
  }
}

  const handle2FASuccess = (response) => {
    localStorage.setItem('token', response.token)
    toast.success('Login successful!')
    router.push('/')
  }

  const handle2FABack = () => {
    setRequiresTwoFactor(false)
    setTwoFactorEmail('')
  }

  const handleOAuthLogin = async (provider) => {
    setLoading(true)
    try {
      // Redirect to OAuth provider
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/oauth/${provider}`
    } catch (error) {
      toast.error(`${provider} authentication failed`)
      setLoading(false)
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <Layout title={`${isLogin ? 'Login' : 'Register'} - SecureAuth Pro`}>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        {requiresTwoFactor ? (
          /* 2FA Verification */
          <TwoFactorVerification
            email={twoFactorEmail}
            onSuccess={handle2FASuccess}
            onBack={handle2FABack}
          />
        ) : (
          /* Normal Auth Form */
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
                  {isLogin ? 'access_terminal.exe' : 'register_user.exe'}
                </div>
              </div>
              
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-hacker-green mb-2 title-glitch" data-text={isLogin ? 'ACCESS TERMINAL' : 'USER REGISTRATION'}>
                  {isLogin ? 'ACCESS TERMINAL' : 'USER REGISTRATION'}
                </h1>
                <p className="text-hacker-green/70 font-mono text-sm">
                  {isLogin ? 'Enter your credentials to access the system' : 'Create a new account to join the network'}
                </p>
              </div>

              {/* OAuth Buttons */}
              <motion.div variants={itemVariants} className="space-y-3 mb-6">
                <button
                  onClick={() => handleOAuthLogin('google')}
                  disabled={loading}
                  className="oauth-btn google-btn"
                >
                  <FaGoogle />
                  <span>Continue with Google</span>
                </button>
                
                <button
                  onClick={() => handleOAuthLogin('facebook')}
                  disabled={loading}
                  className="oauth-btn facebook-btn"
                >
                  <FaFacebook />
                  <span>Continue with Facebook</span>
                </button>
              </motion.div>

              {/* Divider */}
              <motion.div variants={itemVariants} className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-hacker-green/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-black text-hacker-green/70 font-mono">OR</span>
                </div>
              </motion.div>

              {/* Auth Form */}
              <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-4">
                {/* Name Field (Register Only) */}
                {!isLogin && (
                  <motion.div variants={itemVariants}>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-hacker-green/70" />
                      <input
                        type="text"
                        placeholder="Full Name"
                        className="input-field pl-10"
                        {...register('name', {
                          required: !isLogin && 'Name is required',
                          minLength: { value: 2, message: 'Name must be at least 2 characters' }
                        })}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-red-400 text-sm font-mono mt-1">{errors.name.message}</p>
                    )}
                  </motion.div>
                )}

                {/* Email Field */}
                <motion.div variants={itemVariants}>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-hacker-green/70" />
                    <input
                      type="email"
                      placeholder="Email Address"
                      className="input-field pl-10"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-400 text-sm font-mono mt-1">{errors.email.message}</p>
                  )}
                </motion.div>

                {/* Phone Field (Register Only) */}
                {!isLogin && (
                  <motion.div variants={itemVariants}>
                    <div className="relative">
                      <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-hacker-green/70" />
                      <input
                        type="tel"
                        placeholder="Phone Number (Optional)"
                        className="input-field pl-10"
                        {...register('phone')}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Password Field */}
                <motion.div variants={itemVariants}>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-hacker-green/70" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      className="input-field pl-10 pr-10"
                      {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 8, message: 'Password must be at least 8 characters' }
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-hacker-green/70 hover:text-hacker-green"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-400 text-sm font-mono mt-1">{errors.password.message}</p>
                  )}
                </motion.div>

                {/* Confirm Password (Register Only) */}
                {!isLogin && (
                  <motion.div variants={itemVariants}>
                    <div className="relative">
                      <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-hacker-green/70" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Confirm Password"
                        className="input-field pl-10"
                        {...register('confirmPassword', {
                          required: !isLogin && 'Please confirm your password',
                          validate: value => isLogin || value === password || 'Passwords do not match'
                        })}
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-400 text-sm font-mono mt-1">{errors.confirmPassword.message}</p>
                    )}
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.button
                  variants={itemVariants}
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    isLogin ? 'ACCESS GRANTED' : 'CREATE ACCOUNT'
                  )}
                </motion.button>
              </form>

              {/* Toggle Login/Register */}
              <motion.div variants={itemVariants} className="mt-6 text-center">
                <p className="text-gray-400 font-mono text-sm">
                  {isLogin ? "New to the system?" : "Already have an account?"}
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="ml-2 text-hacker-green hover:text-white transition-colors font-bold"
                  >
                    {isLogin ? "Register Here" : "Login Here"}
                  </button>
                </p>
              </motion.div>

              {/* Forgot Password Link */}
              {isLogin && (
                <motion.div variants={itemVariants} className="mt-4 text-center">
                  <Link
                    href="/forgot-password"
                    className="text-hacker-blue/70 hover:text-hacker-blue font-mono text-sm transition-colors"
                  >
                    Forgot your access codes?
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </div>
    </Layout>
  )
}

export default AuthPage