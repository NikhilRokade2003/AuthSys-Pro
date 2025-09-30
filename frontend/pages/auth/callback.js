import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import Layout from '../../components/Layout'

const OAuthCallback = () => {
  const router = useRouter()
  const { token, provider, error } = router.query

  useEffect(() => {
    if (error) {
      toast.error(`${provider} authentication failed`)
      router.push('/auth')
      return
    }

    if (token) {
      // Store the token
      localStorage.setItem('token', token)
      toast.success(`Successfully authenticated with ${provider}!`)
      router.push('/')
    } else if (router.isReady) {
      // If no token and router is ready, redirect to auth page
      toast.error('Authentication failed')
      router.push('/auth')
    }
  }, [token, provider, error, router])

  return (
    <Layout title="Authenticating - SecureAuth Pro">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="card-hacker text-center">
          <div className="animate-spin text-4xl text-hacker-green mb-4">⚡</div>
          <h2 className="text-xl font-bold text-hacker-green mb-2">
            Processing Authentication...
          </h2>
          <p className="text-hacker-green/70 font-mono">
            Please wait while we complete your {provider} authentication
          </p>
        </div>
      </div>
    </Layout>
  )
}

export default OAuthCallback