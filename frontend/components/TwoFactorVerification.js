import React, { useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'

const TwoFactorVerification = ({ email, onSuccess, onBack, onError }) => {
  const [token, setToken] = useState('')
  const [backupCode, setBackupCode] = useState('')
  const [useBackupCode, setUseBackupCode] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleVerification = async (e) => {
    e.preventDefault()
    
    if (!useBackupCode && (!token || token.length !== 6)) {
      toast.error('Please enter a valid 6-digit code')
      return
    }
    
    if (useBackupCode && (!backupCode || backupCode.length !== 8)) {
      toast.error('Please enter a valid 8-character backup code')
      return
    }

    try {
      setLoading(true)
      
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/2fa/verify`, {
        email,
        token: useBackupCode ? null : token,
        backupCode: useBackupCode ? backupCode : null
      })

      toast.success('2FA verification successful!')
      
      // Store the token and call success callback
      localStorage.setItem('token', response.data.token)
      onSuccess(response.data)
      
    } catch (error) {
      const message = error.response?.data?.message || 'Verification failed'
      toast.error(message)
      onError && onError(error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, '') // Only digits
    if (useBackupCode) {
      setBackupCode(value.toUpperCase().slice(0, 8))
    } else {
      setToken(value.slice(0, 6))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="auth-card">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="text-6xl text-hacker-green mb-4"
          >
            <FaShieldAlt />
          </motion.div>
          <h2 className="text-3xl font-bold font-mono text-hacker-green mb-2">
            Two-Factor Authentication
          </h2>
          <p className="text-gray-400 font-mono text-sm">
            Enter the 6-digit code from your authenticator app
          </p>
          <p className="text-hacker-green/70 font-mono text-xs mt-2">
            {email}
          </p>
        </div>

        <form onSubmit={handleVerification} className="space-y-6">
          {!useBackupCode ? (
            /* 2FA Token Input */
            <div>
              <label className="block text-gray-300 font-mono mb-2">
                Authenticator Code
              </label>
              <input
                type="text"
                value={token}
                onChange={handleInputChange}
                maxLength="6"
                placeholder="000000"
                className="input-field text-center text-2xl tracking-widest font-mono"
                autoComplete="one-time-code"
                autoFocus
              />
              <div className="text-xs text-gray-400 font-mono mt-1 text-center">
                Enter the 6-digit code from your app
              </div>
            </div>
          ) : (
            /* Backup Code Input */
            <div>
              <label className="block text-gray-300 font-mono mb-2 flex items-center">
                <FaKey className="mr-2" />
                Backup Code
              </label>
              <input
                type="text"
                value={backupCode}
                onChange={handleInputChange}
                maxLength="8"
                placeholder="XXXXXXXX"
                className="input-field text-center text-xl tracking-widest font-mono"
                autoFocus
              />
              <div className="text-xs text-gray-400 font-mono mt-1 text-center">
                Enter one of your 8-character backup codes
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || (!useBackupCode && token.length !== 6) || (useBackupCode && backupCode.length !== 8)}
            className="btn-primary w-full"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Verifying...</span>
              </div>
            ) : (
              `Verify ${useBackupCode ? 'Backup Code' : '2FA Code'}`
            )}
          </button>

          {/* Toggle between 2FA and backup code */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setUseBackupCode(!useBackupCode)
                setToken('')
                setBackupCode('')
              }}
              className="text-hacker-green/70 hover:text-hacker-green font-mono text-sm underline transition-colors"
            >
              {useBackupCode ? 'Use authenticator app instead' : 'Use backup code instead'}
            </button>
          </div>

          {/* Back Button */}
          <button
            type="button"
            onClick={onBack}
            className="btn-secondary w-full flex items-center justify-center space-x-2"
          >
            <FaArrowLeft />
            <span>Back to Login</span>
          </button>
        </form>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <div className="text-xs text-gray-500 font-mono space-y-1">
            <p>• Lost your device? Use a backup code</p>
            <p>• Codes refresh every 30 seconds</p>
            <p>• Contact support if you need help</p>
          </div>
        </div>
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-hacker-green/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-hacker-green/5 rounded-full blur-3xl"></div>
      </div>
    </motion.div>
  )
}

export default TwoFactorVerification