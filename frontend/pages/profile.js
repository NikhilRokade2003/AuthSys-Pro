import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
// NextAuth removed - using custom authentication
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import axios from 'axios'
import Image from 'next/image'
import Layout from '../components/Layout'

const ProfilePage = () => {
  // Using custom authentication instead of NextAuth
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [profileImage, setProfileImage] = useState(null)
  const [activityStats, setActivityStats] = useState({
    totalLogins: 0,
    lastLogin: 'Never',
    accountAge: '0d'
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loadingActivity, setLoadingActivity] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm()

  // Check authentication and load user data
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token) {
      router.push('/auth')
      return
    }

    if (userData) {
      const user = JSON.parse(userData)
      setValue('name', user.name || '')
      setValue('email', user.email || '')
      setValue('phone', user.phone || '')
      setValue('bio', user.bio || '')
      setCurrentUser(user)
      
      // Load activity data
      loadActivityData()
    }
  }, [router, setValue])

  // Load current user data from API
  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      
      const response = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        const user = response.data.user
        setValue('name', user.name || '')
        setValue('email', user.email || '')
        setValue('phone', user.phone || '')
        setValue('bio', user.bio || '')
        setProfileImage(user.profile_picture)
        setCurrentUser(user)
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(user))
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/auth')
      }
    }
  }

  useEffect(() => {
    loadUserData()
  }, [])

  // Function to load activity data
  const loadActivityData = async () => {
    setLoadingActivity(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        // Fallback to test endpoints if no auth
        const [statsResponse, activityResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/test/activity-stats'),
          axios.get('http://localhost:5000/api/test/recent-activity')
        ])
        
        if (statsResponse.data.success) {
          setActivityStats(statsResponse.data.stats)
        }
        if (activityResponse.data.success) {
          setRecentActivity(activityResponse.data.activities)
        }
        return
      }

      // Use authenticated endpoints
      const headers = { Authorization: `Bearer ${token}` }
      
      try {
        const [statsResponse, activityResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/activity/stats', { headers }),
          axios.get('http://localhost:5000/api/activity/recent', { headers })
        ])
        
        if (statsResponse.data.success) {
          setActivityStats(statsResponse.data.stats)
        }
        if (activityResponse.data.success) {
          setRecentActivity(activityResponse.data.activities)
        }
      } catch (authError) {
        // Fallback to test endpoints if auth fails
        const [statsResponse, activityResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/test/activity-stats'),
          axios.get('http://localhost:5000/api/test/recent-activity')
        ])
        
        if (statsResponse.data.success) {
          setActivityStats(statsResponse.data.stats)
        }
        if (activityResponse.data.success) {
          setRecentActivity(activityResponse.data.activities)
        }
      }
    } catch (error) {
      console.error('Error loading activity data:', error)
    } finally {
      setLoadingActivity(false)
    }
  }

  // Function to refresh activity data
  const refreshActivityData = () => {
    loadActivityData()
  }

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/auth')
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/auth')
        return
      }

      const response = await axios.put('http://localhost:5000/api/profile', data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        toast.success('Profile updated successfully!')
        
        // Update currentUser state and localStorage with new user data
        setCurrentUser(response.data.user)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        
        // Refresh activity data to show the profile update activity
        loadActivityData()
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile'
      toast.error(errorMessage)
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/auth')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('image', file)

      const token = localStorage.getItem('token')
      const response = await axios.post('http://localhost:5000/api/profile/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        setProfileImage(response.data.imageUrl)
        toast.success('Profile picture updated!')
      }
    } catch (error) {
      toast.error('Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }



  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'activity', label: 'Activity', icon: '📊' },
  ]

  if (!currentUser) {
    return (
      <Layout title="Loading - SecureAuth Pro">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
            <p className="text-hacker-green font-mono">Loading profile data...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Profile Dashboard - SecureAuth Pro" user={currentUser} onLogout={handleLogout}>
      {/* 3D Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-blue/20 rounded-full filter blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/20 rounded-full filter blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-neon-cyan/15 rounded-full filter blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="flex-1 px-4 py-8 relative">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="card-hacker mb-8">
            <div className="flex items-center justify-between border-b border-hacker-green/30 pb-4 mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-hacker-green"></div>
              </div>
              <div className="text-sm text-hacker-green/70 font-mono">
                profile.exe
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
              {/* Profile Image */}
              <div className="relative">
                <div className="profile-avatar relative overflow-hidden">
                  {profileImage ? (
                    <Image
                      src={profileImage}
                      alt="Profile"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-hacker-gray flex items-center justify-center text-4xl">
                      👤
                    </div>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="loading-spinner w-8 h-8"></div>
                    </div>
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 bg-hacker-green text-black w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:bg-hacker-blue transition-colors">
                  <span className="text-sm">📷</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>

              {/* User Info */}
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-hacker-green title-glitch" data-text={currentUser?.name || 'Loading...'}>
                  {currentUser?.name || 'Loading...'}
                </h1>
                <p className="text-hacker-blue font-mono">{currentUser?.email || 'Loading...'}</p>
                <div className="flex items-center justify-center md:justify-start space-x-4 mt-2">
                  <span className="text-hacker-green/70 font-mono text-sm">Status: Online</span>
                  <span className="text-hacker-green animate-pulse">●</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Navigation Tabs */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex space-x-1 bg-hacker-gray/20 p-1 rounded-lg">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-hacker flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg transition-all ${
                    activeTab === tab.id ? 'active bg-hacker-green/10' : ''
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Tab Content */}
          <motion.div variants={itemVariants}>
            {activeTab === 'profile' && (
              <motion.div
                variants={itemVariants}
                className="relative"
              >
                {/* 3D Card Background */}
                <div className="absolute inset-0 bg-gradient-card rounded-2xl transform rotate-1 scale-105 opacity-50"></div>
                <div className="absolute inset-0 bg-gradient-card rounded-2xl transform -rotate-1 scale-102 opacity-30"></div>

                {/* Main Card */}
                <div className="relative auth-card backdrop-blur-xl border border-neon-blue/30 shadow-neon p-8 w-full max-w-4xl">
                  <h2 className="text-3xl font-bold text-white mb-8 text-center">
                    Profile Information
                  </h2>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-white font-medium text-sm mb-2">
                          Full Name
                        </label>
                        <input
                          {...register('name', {
                            required: 'Name is required',
                            minLength: {
                              value: 2,
                              message: 'Name must be at least 2 characters'
                            }
                          })}
                          type="text"
                          className="input-field w-full border-2 border-dark-600 bg-dark-800/70 focus:border-neon-blue focus:shadow-neon transition-all duration-300"
                          disabled={isLoading}
                        />
                        {errors.name && (
                          <p className="text-error text-sm mt-1">
                            {errors.name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-white font-medium text-sm mb-2">
                          Email Address
                        </label>
                        <input
                          {...register('email')}
                          type="email"
                          className="input-field w-full border-2 border-dark-600 bg-dark-800/70 focus:border-neon-blue focus:shadow-neon transition-all duration-300 opacity-50"
                          disabled={true}
                        />
                        <p className="text-dark-400 text-xs mt-1">
                          Email cannot be changed for security reasons
                        </p>
                      </div>

                      <div>
                        <label className="block text-white font-medium text-sm mb-2">
                          Phone Number
                        </label>
                        <input
                          {...register('phone', {
                            pattern: {
                              value: /^[\+]?[1-9][\d]{0,15}$/,
                              message: 'Invalid phone number'
                            }
                          })}
                          type="tel"
                          className="input-field w-full border-2 border-dark-600 bg-dark-800/70 focus:border-neon-blue focus:shadow-neon transition-all duration-300"
                          disabled={isLoading}
                        />
                        {errors.phone && (
                          <p className="text-error text-sm mt-1">
                            {errors.phone.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-white font-medium text-sm mb-2">
                          Account Type
                        </label>
                        <input
                          value={currentUser?.account_type || 'user'}
                          className="input-field w-full border-2 border-dark-600 bg-dark-800/70 focus:border-neon-blue focus:shadow-neon transition-all duration-300 opacity-50"
                          disabled={true}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-white font-medium text-sm mb-2">
                        Bio
                      </label>
                      <textarea
                        {...register('bio')}
                        rows={4}
                        className="input-field w-full resize-none border-2 border-dark-600 bg-dark-800/70 focus:border-neon-blue focus:shadow-neon transition-all duration-300"
                        placeholder="Tell us about yourself..."
                        disabled={isLoading}
                      />
                    </div>

                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary w-full flex items-center justify-center space-x-2 py-4 text-lg font-semibold"
                      whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(0, 212, 255, 0.5)" }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isLoading ? (
                        <>
                          <div className="loading-spinner w-6 h-6"></div>
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <span>💾</span>
                          <span>SAVE CHANGES</span>
                        </>
                      )}
                    </motion.button>
                  </form>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                {/* Password Change */}
                <div className="card-hacker">
                  <h2 className="text-xl font-bold text-hacker-green mb-6">Security Settings</h2>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 border border-hacker-green/30 rounded-lg">
                      <div>
                        <h3 className="text-hacker-green font-mono font-bold">Password</h3>
                        <p className="text-hacker-green/70 text-sm font-mono">Last changed 30 days ago</p>
                      </div>
                      <button className="btn-hacker text-sm">
                        Change Password
                      </button>
                    </div>

                    <div className="flex justify-between items-center p-4 border border-hacker-green/30 rounded-lg">
                      <div>
                        <h3 className="text-hacker-green font-mono font-bold">Two-Factor Authentication</h3>
                        <p className="text-hacker-green/70 text-sm font-mono">
                          {currentUser?.two_factor_enabled ? 'Enabled - Extra security active' : 'Add an extra layer of security'}
                        </p>
                        {currentUser?.two_factor_enabled && (
                          <div className="flex items-center mt-1">
                            <span className="text-green-400 text-xs font-mono">✓ ACTIVE</span>
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => router.push('/two-factor')}
                        className={`text-sm ${currentUser?.two_factor_enabled ? 'btn-hacker' : 'btn-hacker-blue'}`}
                      >
                        {currentUser?.two_factor_enabled ? 'Manage 2FA' : 'Enable 2FA'}
                      </button>
                    </div>

                    <div className="flex justify-between items-center p-4 border border-hacker-green/30 rounded-lg">
                      <div>
                        <h3 className="text-hacker-green font-mono font-bold">Active Sessions</h3>
                        <p className="text-hacker-green/70 text-sm font-mono">Manage your login sessions</p>
                      </div>
                      <button className="btn-hacker text-sm">
                        View Sessions
                      </button>
                    </div>
                  </div>
                </div>

                {/* Account Actions */}
                <div className="card-hacker">
                  <h2 className="text-xl font-bold text-red-400 mb-6">Danger Zone</h2>
                  
                  <div className="space-y-4">
                    <div className="p-4 border border-red-500/30 rounded-lg bg-red-500/5">
                      <h3 className="text-red-400 font-mono font-bold mb-2">Delete Account</h3>
                      <p className="text-red-400/70 text-sm font-mono mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-mono text-sm transition-colors">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="card-hacker">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-hacker-green">Account Activity</h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={refreshActivityData}
                    disabled={loadingActivity}
                    className="flex items-center space-x-2 text-hacker-blue hover:text-hacker-green transition-colors font-mono text-sm"
                  >
                    <span className={loadingActivity ? 'animate-spin' : ''}>🔄</span>
                    <span>Refresh</span>
                  </motion.button>
                </div>
                
                <div className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="stats-card">
                      <h3 className="text-hacker-green font-mono font-bold">Total Logins</h3>
                      {loadingActivity ? (
                        <div className="loading-spinner w-6 h-6 mt-2"></div>
                      ) : (
                        <p className="text-2xl text-hacker-blue font-mono">{activityStats.totalLogins}</p>
                      )}
                    </div>
                    <div className="stats-card">
                      <h3 className="text-hacker-green font-mono font-bold">Last Login</h3>
                      {loadingActivity ? (
                        <div className="loading-spinner w-6 h-6 mt-2"></div>
                      ) : (
                        <p className="text-2xl text-hacker-blue font-mono">{activityStats.lastLogin}</p>
                      )}
                    </div>
                    <div className="stats-card">
                      <h3 className="text-hacker-green font-mono font-bold">Account Age</h3>
                      {loadingActivity ? (
                        <div className="loading-spinner w-6 h-6 mt-2"></div>
                      ) : (
                        <p className="text-2xl text-hacker-blue font-mono">{activityStats.accountAge}</p>
                      )}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div>
                    <h3 className="text-hacker-green font-mono font-bold mb-4">Recent Activity</h3>
                    {loadingActivity ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="loading-spinner w-8 h-8"></div>
                        <span className="ml-3 text-hacker-green font-mono">Loading activity...</span>
                      </div>
                    ) : recentActivity.length > 0 ? (
                      <div className="space-y-3">
                        {recentActivity.map((activity, index) => (
                          <motion.div 
                            key={activity.id || index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex justify-between items-center p-3 border border-hacker-green/20 rounded hover:border-hacker-green/40 transition-colors"
                          >
                            <div>
                              <span className="text-hacker-green font-mono capitalize">
                                {activity.action.replace('_', ' ')}
                              </span>
                              <span className="text-hacker-green/70 font-mono text-sm ml-2">
                                from {activity.ipAddress || 'Unknown IP'}
                              </span>
                              {activity.description && (
                                <div className="text-hacker-green/50 font-mono text-xs mt-1">
                                  {activity.description}
                                </div>
                              )}
                            </div>
                            <span className="text-hacker-blue font-mono text-sm">
                              {activity.relativeTime}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-hacker-green/70 font-mono">No recent activity found</p>
                        <p className="text-hacker-green/50 font-mono text-sm mt-2">
                          Activity tracking starts from your next login
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {recentActivity.length > 0 && (
                    <div className="pt-4 border-t border-hacker-green/20">
                      <p className="text-hacker-green/70 font-mono text-sm text-center">
                        💡 Activity updates automatically. Last updated: {new Date().toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  )
}

export default ProfilePage