import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { motion } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FaQrcode, FaShieldAlt, FaCopy, FaEye, FaEyeSlash, FaDownload, FaKey, FaTrash } from 'react-icons/fa'

const TwoFactorSetup = () => {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [setupStep, setSetupStep] = useState('status') // status, generate, verify, complete
  const [twoFactorData, setTwoFactorData] = useState(null)
  const [verificationToken, setVerificationToken] = useState('')
  const [backupCodes, setBackupCodes] = useState([])
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [twoFactorStatus, setTwoFactorStatus] = useState(null)
  const [disablePassword, setDisablePassword] = useState('')
  const [disableToken, setDisableToken] = useState('')
  const [showDisableForm, setShowDisableForm] = useState(false)

  useEffect(() => {
    checkAuth()
    getTwoFactorStatus()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/auth')
        return
      }

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setUser(response.data.user)
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('token')
      router.push('/auth')
    } finally {
      setLoading(false)
    }
  }

  const getTwoFactorStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/2fa/status`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTwoFactorStatus(response.data.data)
    } catch (error) {
      console.error('Failed to get 2FA status:', error)
    }
  }

  const generateTwoFactorSecret = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/2fa/setup/generate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setTwoFactorData(response.data.data)
      setSetupStep('verify')
      toast.success('QR code generated! Scan it with your authenticator app.')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate 2FA setup')
    } finally {
      setLoading(false)
    }
  }

  const verifyTwoFactorSetup = async () => {
    try {
      if (!verificationToken || verificationToken.length !== 6) {
        toast.error('Please enter a valid 6-digit code')
        return
      }

      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/2fa/setup/verify`,
        { token: verificationToken },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setBackupCodes(response.data.data.backupCodes)
      setSetupStep('complete')
      setShowBackupCodes(true)
      toast.success('2FA has been enabled successfully!')
      getTwoFactorStatus()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to verify 2FA setup')
    } finally {
      setLoading(false)
    }
  }

  const disableTwoFactor = async () => {
    try {
      if (!disablePassword || !disableToken) {
        toast.error('Please enter your password and 2FA code')
        return
      }

      setLoading(true)
      const token = localStorage.getItem('token')
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/2fa/disable`,
        { password: disablePassword, token: disableToken },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      toast.success('2FA has been disabled')
      setShowDisableForm(false)
      setDisablePassword('')
      setDisableToken('')
      getTwoFactorStatus()
      setSetupStep('status')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to disable 2FA')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const downloadBackupCodes = () => {
    const codesText = backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n')
    const element = document.createElement('a')
    const file = new Blob([`SecureAuth Pro 2FA Backup Codes\n\n${codesText}\n\nKeep these codes safe and secure!`], {
      type: 'text/plain'
    })
    element.href = URL.createObjectURL(file)
    element.download = 'SecureAuth-Pro-backup-codes.txt'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    toast.success('Backup codes downloaded!')
  }

  if (loading) {
    return (
      <Layout title="Two-Factor Authentication" user={user}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-hacker-green text-xl font-mono">
            <div className="animate-pulse">Loading 2FA settings...</div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Two-Factor Authentication" user={user}>
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <FaShieldAlt className="text-6xl text-hacker-green mx-auto mb-4" />
            <h1 className="text-4xl font-mono font-bold text-hacker-green mb-4">
              Two-Factor Authentication
            </h1>
            <p className="text-gray-300 font-mono">
              Add an extra layer of security to your account
            </p>
          </motion.div>

          {/* Status Display */}
          {setupStep === 'status' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/50 border border-hacker-green/20 rounded-lg p-8 mb-8"
            >
              <h2 className="text-2xl font-mono font-bold text-hacker-green mb-6">
                Current Status
              </h2>
              
              {twoFactorStatus ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-gray-300">2FA Status:</span>
                    <span className={`font-mono font-bold ${
                      twoFactorStatus.twoFactorEnabled ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {twoFactorStatus.twoFactorEnabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                  
                  {twoFactorStatus.twoFactorEnabled && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-gray-300">Setup Date:</span>
                        <span className="font-mono text-hacker-green">
                          {new Date(twoFactorStatus.setupDate).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-gray-300">Backup Codes:</span>
                        <span className="font-mono text-hacker-green">
                          {twoFactorStatus.backupCodesRemaining} remaining
                        </span>
                      </div>
                      
                      <div className="flex space-x-4 mt-6">
                        <button
                          onClick={() => setShowDisableForm(true)}
                          className="btn-danger flex items-center space-x-2"
                        >
                          <FaTrash />
                          <span>Disable 2FA</span>
                        </button>
                      </div>
                    </>
                  )}
                  
                  {!twoFactorStatus.twoFactorEnabled && (
                    <button
                      onClick={() => setSetupStep('generate')}
                      className="btn-primary flex items-center space-x-2 mt-6"
                    >
                      <FaShieldAlt />
                      <span>Enable 2FA</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-400">Loading status...</div>
              )}
            </motion.div>
          )}

          {/* Setup Steps */}
          {setupStep === 'generate' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/50 border border-hacker-green/20 rounded-lg p-8"
            >
              <h2 className="text-2xl font-mono font-bold text-hacker-green mb-6">
                Step 1: Download Authenticator App
              </h2>
              
              <div className="mb-6">
                <p className="text-gray-300 font-mono mb-4">
                  Download one of these authenticator apps on your phone:
                </p>
                <ul className="space-y-2 text-gray-300 font-mono">
                  <li>• Google Authenticator</li>
                  <li>• Authy</li>
                  <li>• Microsoft Authenticator</li>
                  <li>• 1Password</li>
                </ul>
              </div>
              
              <button
                onClick={generateTwoFactorSecret}
                disabled={loading}
                className="btn-primary flex items-center space-x-2"
              >
                <FaQrcode />
                <span>{loading ? 'Generating...' : 'Generate QR Code'}</span>
              </button>
            </motion.div>
          )}

          {setupStep === 'verify' && twoFactorData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/50 border border-hacker-green/20 rounded-lg p-8"
            >
              <h2 className="text-2xl font-mono font-bold text-hacker-green mb-6">
                Step 2: Scan QR Code
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="bg-white p-4 rounded-lg inline-block mb-4">
                    <img src={twoFactorData.qrCode} alt="2FA QR Code" className="w-64 h-64" />
                  </div>
                  <p className="text-gray-300 font-mono text-sm">
                    Scan with your authenticator app
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-mono font-bold text-hacker-green mb-4">
                    Manual Entry
                  </h3>
                  <div className="bg-black/30 p-4 rounded-lg border border-hacker-green/20 mb-4">
                    <p className="text-gray-300 font-mono text-sm mb-2">Secret Key:</p>
                    <div className="flex items-center space-x-2">
                      <code className="text-hacker-green font-mono text-sm bg-black/50 px-2 py-1 rounded flex-1">
                        {twoFactorData.manualEntryKey}
                      </code>
                      <button
                        onClick={() => copyToClipboard(twoFactorData.manualEntryKey)}
                        className="text-hacker-green hover:text-white transition-colors"
                      >
                        <FaCopy />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-300 font-mono mb-2">
                        Verification Code
                      </label>
                      <input
                        type="text"
                        maxLength="6"
                        value={verificationToken}
                        onChange={(e) => setVerificationToken(e.target.value.replace(/\D/g, ''))}
                        placeholder="000000"
                        className="input-field text-center text-2xl tracking-widest"
                      />
                    </div>
                    
                    <button
                      onClick={verifyTwoFactorSetup}
                      disabled={loading || verificationToken.length !== 6}
                      className="btn-primary w-full"
                    >
                      {loading ? 'Verifying...' : 'Verify & Enable 2FA'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {setupStep === 'complete' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/50 border border-hacker-green/20 rounded-lg p-8"
            >
              <h2 className="text-2xl font-mono font-bold text-green-400 mb-6">
                ✅ 2FA Successfully Enabled!
              </h2>
              
              <div className="bg-yellow-900/20 border border-yellow-400 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-mono font-bold text-yellow-400 mb-4 flex items-center">
                  <FaKey className="mr-2" />
                  Important: Save Your Backup Codes
                </h3>
                <p className="text-yellow-300 font-mono text-sm mb-4">
                  These backup codes can be used to access your account if you lose your authenticator device. 
                  Save them in a secure location!
                </p>
                
                {showBackupCodes && (
                  <div className="bg-black/50 p-4 rounded-lg border border-yellow-400/20">
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {backupCodes.map((code, index) => (
                        <div key={index} className="font-mono text-yellow-400 text-center">
                          {code}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex space-x-4">
                      <button
                        onClick={downloadBackupCodes}
                        className="btn-secondary flex items-center space-x-2"
                      >
                        <FaDownload />
                        <span>Download</span>
                      </button>
                      
                      <button
                        onClick={() => copyToClipboard(backupCodes.join(', '))}
                        className="btn-secondary flex items-center space-x-2"
                      >
                        <FaCopy />
                        <span>Copy All</span>
                      </button>
                      
                      <button
                        onClick={() => setShowBackupCodes(false)}
                        className="btn-secondary flex items-center space-x-2"
                      >
                        <FaEyeSlash />
                        <span>Hide</span>
                      </button>
                    </div>
                  </div>
                )}
                
                {!showBackupCodes && (
                  <button
                    onClick={() => setShowBackupCodes(true)}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <FaEye />
                    <span>Show Backup Codes</span>
                  </button>
                )}
              </div>
              
              <button
                onClick={() => {
                  setSetupStep('status')
                  getTwoFactorStatus()
                }}
                className="btn-primary"
              >
                Continue to Dashboard
              </button>
            </motion.div>
          )}

          {/* Disable 2FA Form */}
          {showDisableForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            >
              <div className="bg-black border border-red-500/50 rounded-lg p-8 max-w-md w-full">
                <h3 className="text-xl font-mono font-bold text-red-400 mb-6">
                  Disable Two-Factor Authentication
                </h3>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-gray-300 font-mono mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={disablePassword}
                      onChange={(e) => setDisablePassword(e.target.value)}
                      className="input-field"
                      placeholder="Enter your password"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 font-mono mb-2">
                      2FA Code
                    </label>
                    <input
                      type="text"
                      maxLength="6"
                      value={disableToken}
                      onChange={(e) => setDisableToken(e.target.value.replace(/\D/g, ''))}
                      className="input-field text-center"
                      placeholder="000000"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={disableTwoFactor}
                    disabled={loading}
                    className="btn-danger flex-1"
                  >
                    {loading ? 'Disabling...' : 'Disable 2FA'}
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowDisableForm(false)
                      setDisablePassword('')
                      setDisableToken('')
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default TwoFactorSetup