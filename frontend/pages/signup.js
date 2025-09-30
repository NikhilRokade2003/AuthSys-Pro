import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import axios from 'axios'
import Layout from '../components/Layout'
import Link from 'next/link'

const SignupPage = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const password = watch('password')

  const onSubmit = async (data) => {
    setIsLoading(true)
    
    try {
      // Step 1: Register the user
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        phone: data.phone,
        terms: data.terms,
      })

      if (response.data.success) {
        // Step 2: Ensure OTP is sent (even if registration didn't send it)
        let otpSent = response.data.otpSent || false
        
        if (!otpSent) {
          // Registration didn't send OTP, send it manually
          try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/otp/send-email`, {
              email: data.email,
              purpose: 'email verification'
            })
            otpSent = true
            console.log('🔥 OTP sent manually after registration')
          } catch (otpError) {
            console.error('Failed to send OTP:', otpError)
            toast.error('Registration successful, but failed to send OTP. Please try again.')
            return
          }
        }
        
        if (otpSent) {
          toast.success('Registration successful! OTP sent to your email.')
          // Redirect to OTP verification page
          router.push(`/otp?email=${encodeURIComponent(data.email)}&type=email&action=email-verification`)
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignup = async (provider) => {
    setIsLoading(true)
    try {
      // Redirect to OAuth provider
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/oauth/${provider}`
    } catch (error) {
      toast.error(`${provider} authentication failed`)
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
    <Layout title="Sign Up - SecureAuth Pro">
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </motion.div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Create Account
                </h1>
                <p className="text-dark-300">
                  Join SecureAuth Pro today
                </p>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <motion.div variants={itemVariants}>
                  <label className="block text-white font-medium text-sm mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      {...register('name', {
                        required: 'Name is required',
                        minLength: {
                          value: 2,
                          message: 'Name must be at least 2 characters'
                        }
                      })}
                      type="text"
                      className="input-field w-full pl-12 border-2 border-dark-600 bg-dark-800/70 focus:border-neon-blue focus:shadow-neon transition-all duration-300"
                      placeholder="Enter your full name"
                      disabled={isLoading}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  {errors.name && (
                    <p className="text-error text-sm mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-white font-medium text-sm mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      type="email"
                      className="input-field w-full pl-12 border-2 border-dark-600 bg-dark-800/70 focus:border-neon-blue focus:shadow-neon transition-all duration-300"
                      placeholder="Enter your email address"
                      disabled={isLoading}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                  </div>
                  {errors.email && (
                    <p className="text-error text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-white font-medium text-sm mb-2">
                    Phone Number <span className="text-dark-400">(Optional)</span>
                  </label>
                  <div className="relative">
                    <input
                      {...register('phone', {
                        pattern: {
                          value: /^[\+]?[0-9\s\-\(\)]{10,20}$/,
                          message: 'Invalid phone number format'
                        }
                      })}
                      type="tel"
                      className="input-field w-full pl-12 border-2 border-dark-600 bg-dark-800/70 focus:border-neon-blue focus:shadow-neon transition-all duration-300"
                      placeholder="Enter your phone number"
                      disabled={isLoading}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                  </div>
                  {errors.phone && (
                    <p className="text-error text-sm mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-white font-medium text-sm mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 8,
                          message: 'Password must be at least 8 characters'
                        },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                          message: 'Password must contain uppercase, lowercase, number and special character'
                        }
                      })}
                      type={showPassword ? 'text' : 'password'}
                      className="input-field w-full pl-12 pr-12 border-2 border-dark-600 bg-dark-800/70 focus:border-neon-blue focus:shadow-neon transition-all duration-300"
                      placeholder="Create a strong password"
                      disabled={isLoading}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-neon-blue transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {showPassword ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        )}
                      </svg>
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-error text-sm mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-white font-medium text-sm mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: value => value === password || 'Passwords do not match'
                      })}
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="input-field w-full pl-12 pr-12 border-2 border-dark-600 bg-dark-800/70 focus:border-neon-blue focus:shadow-neon transition-all duration-300"
                      placeholder="Confirm your password"
                      disabled={isLoading}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-neon-blue transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {showConfirmPassword ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        )}
                      </svg>
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-error text-sm mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants} className="flex items-start space-x-3">
                  <input
                    {...register('terms', {
                      required: 'You must accept the terms and conditions'
                    })}
                    type="checkbox"
                    className="w-5 h-5 mt-0.5 rounded border-dark-600 bg-dark-800 text-neon-blue focus:ring-neon-blue focus:ring-offset-0"
                  />
                  <label className="text-sm text-dark-300 leading-relaxed">
                    I agree to the{' '}
                    <Link href="/terms" className="text-neon-blue hover:text-neon-purple transition-colors">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-neon-blue hover:text-neon-purple transition-colors">
                      Privacy Policy
                    </Link>
                  </label>
                </motion.div>
                {errors.terms && (
                  <p className="text-error text-sm">
                    {errors.terms.message}
                  </p>
                )}

                <motion.button
                  variants={itemVariants}
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full flex items-center justify-center space-x-2 py-4 text-lg font-semibold"
                  whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(0, 212, 255, 0.5)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <>
                      <div className="loading-spinner w-6 h-6"></div>
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      <span>Create Account</span>
                    </>
                  )}
                </motion.button>
              </form>

              {/* Divider */}
              <motion.div variants={itemVariants} className="my-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-dark-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-dark-800 text-dark-400">
                      Or continue with
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* OAuth Buttons */}
              <motion.div variants={itemVariants} className="space-y-3">
                <button
                  onClick={() => handleOAuthSignup('google')}
                  disabled={isLoading}
                  className="oauth-btn transform hover:scale-105 transition-all duration-300"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <button
                  onClick={() => handleOAuthSignup('facebook')}
                  disabled={isLoading}
                  className="oauth-btn transform hover:scale-105 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Continue with Facebook</span>
                </button>
              </motion.div>

              {/* Sign In Link */}
              <motion.div variants={itemVariants} className="text-center mt-8">
                <p className="text-dark-300 text-sm">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="text-neon-blue hover:text-neon-purple transition-colors font-medium"
                  >
                    Sign in here
                  </Link>
                </p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  )
}

export default SignupPage