import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import Layout from '../components/Layout'
import Link from 'next/link'

const WelcomePage = () => {
  const [currentUser, setCurrentUser] = useState(null)
  const [currentTime, setCurrentTime] = useState('')
  const [terminalText, setTerminalText] = useState('')
  const [loading, setLoading] = useState(true)
  
  const welcomeMessage = currentUser 
    ? `Welcome back, ${currentUser.name || 'Hacker'}!`
    : 'Welcome to SecureAuth Pro System'

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (response.data.success) {
            setCurrentUser(response.data.user)
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error)
        // Remove invalid token
        localStorage.removeItem('token')
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [])

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token')
    setCurrentUser(null)
    window.location.href = '/'
  }

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString())
    }, 1000)

    // Typing animation effect
    let i = 0
    const typeWriter = () => {
      if (i < welcomeMessage.length) {
        setTerminalText(welcomeMessage.substring(0, i + 1))
        i++
        setTimeout(typeWriter, 100)
      }
    }
    typeWriter()

    return () => clearInterval(timer)
  }, [welcomeMessage])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  }

  if (loading) {
    return (
      <Layout title="Welcome - SecureAuth Pro" user={currentUser}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-hacker-green animate-pulse">Loading...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Welcome - SecureAuth Pro" user={currentUser} onLogout={handleLogout}>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl w-full"
        >
          {/* Terminal Header */}
          <motion.div variants={itemVariants} className="card-hacker mb-8">
            <div className="flex items-center justify-between border-b border-hacker-green/30 pb-4 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-hacker-green"></div>
              </div>
              <div className="text-sm text-hacker-green/70 font-mono">
                user@SecureAuth-Pro:~$ {currentTime}
              </div>
            </div>
            
            <div className="font-mono text-lg">
              <span className="text-hacker-blue">$</span>{' '}
              <span className="text-hacker-green">{terminalText}</span>
              <span className="terminal-cursor"></span>
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* System Status */}
            <motion.div variants={itemVariants} className="card-hacker">
              <h2 className="text-xl font-bold text-hacker-green mb-4 title-glitch" data-text="SYSTEM STATUS">
                SYSTEM STATUS
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-hacker-green/70">Authentication:</span>
                  <span className="text-hacker-green animate-pulse">● ONLINE</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-hacker-green/70">Database:</span>
                  <span className="text-hacker-green animate-pulse">● CONNECTED</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-hacker-green/70">Security:</span>
                  <span className="text-hacker-green animate-pulse">● ACTIVE</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-hacker-green/70">Encryption:</span>
                  <span className="text-hacker-green animate-pulse">● AES-256</span>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants} className="card-hacker">
              <h2 className="text-xl font-bold text-hacker-blue mb-4">
                QUICK ACCESS
              </h2>
              <div className="space-y-4">
                {currentUser ? (
                  <>
                    <Link href="/profile" className="block">
                      <div className="p-3 border border-hacker-green/30 rounded hover:border-hacker-green transition-all hover:shadow-neon-green cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <span className="text-hacker-green">👤</span>
                          <span>Profile Management</span>
                        </div>
                      </div>
                    </Link>
                    <div 
                      className="p-3 border border-hacker-green/30 rounded hover:border-hacker-green transition-all hover:shadow-neon-green cursor-pointer"
                      onClick={() => alert('Security Settings feature coming soon!')}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-hacker-green">🔒</span>
                        <span>Security Settings</span>
                      </div>
                    </div>
                    <div 
                      className="p-3 border border-hacker-green/30 rounded hover:border-hacker-green transition-all hover:shadow-neon-green cursor-pointer"
                      onClick={() => alert('Activity Logs feature coming soon!')}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-hacker-green">📊</span>
                        <span>Activity Logs</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <Link href="/auth" className="block">
                      <div className="p-3 border border-hacker-green/30 rounded hover:border-hacker-green transition-all hover:shadow-neon-green cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <span className="text-hacker-green">🚪</span>
                          <span>Access Terminal</span>
                        </div>
                      </div>
                    </Link>
                    <Link href="/auth" className="block">
                      <div className="p-3 border border-hacker-blue/30 rounded hover:border-hacker-blue transition-all hover:shadow-neon-blue cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <span className="text-hacker-blue">➕</span>
                          <span>Register New User</span>
                        </div>
                      </div>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </div>

          {/* Features Grid */}
          <motion.div variants={itemVariants} className="mt-8">
            <h2 className="text-2xl font-bold text-center text-hacker-green mb-8 title-glitch" data-text="SECURITY FEATURES">
              SECURITY FEATURES
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card-hacker text-center">
                <div className="text-4xl mb-4">🔐</div>
                <h3 className="text-lg font-bold text-hacker-green mb-2">Multi-Factor Auth</h3>
                <p className="text-sm text-hacker-green/70">
                  Email & SMS OTP verification for enhanced security
                </p>
              </div>
              
              <div className="card-hacker text-center">
                <div className="text-4xl mb-4">🛡️</div>
                <h3 className="text-lg font-bold text-hacker-blue mb-2">OAuth Integration</h3>
                <p className="text-sm text-hacker-green/70">
                  Google & Facebook login with secure token handling
                </p>
              </div>
              
              <div className="card-hacker text-center">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-lg font-bold text-hacker-green mb-2">Real-time Security</h3>
                <p className="text-sm text-hacker-green/70">
                  JWT tokens with automatic refresh and rate limiting
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  )
}

export default WelcomePage