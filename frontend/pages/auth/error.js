import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Layout from '../../components/Layout'

const AuthError = () => {
  const router = useRouter()
  const { error } = router.query
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    switch (error) {
      case 'Configuration':
        setErrorMessage('There is a problem with the server configuration.')
        break
      case 'AccessDenied':
        setErrorMessage('You do not have permission to sign in.')
        break
      case 'Verification':
        setErrorMessage('The verification token has expired or has already been used.')
        break
      case 'OAuthSignin':
        setErrorMessage('Error in constructing an authorization URL.')
        break
      case 'OAuthCallback':
        setErrorMessage('Error in handling the response from an OAuth provider.')
        break
      case 'OAuthCreateAccount':
        setErrorMessage('Could not create OAuth account in the database.')
        break
      case 'EmailCreateAccount':
        setErrorMessage('Could not create email account in the database.')
        break
      case 'Callback':
        setErrorMessage('Error in the OAuth callback handler route.')
        break
      case 'OAuthAccountNotLinked':
        setErrorMessage('Email on the account is already linked, but not with this OAuth account.')
        break
      case 'EmailSignin':
        setErrorMessage('Check your email address.')
        break
      case 'CredentialsSignin':
        setErrorMessage('Sign in failed. Check the details you provided are correct.')
        break
      case 'SessionRequired':
        setErrorMessage('You must be signed in to view this page.')
        break
      default:
        setErrorMessage('An unknown error occurred during authentication.')
    }
  }, [error])

  return (
    <Layout>
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mx-auto h-12 w-12 text-red-500"
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </motion.div>
            <h2 className="mt-6 text-3xl font-extrabold text-green-400 font-mono">
              &lt;ACCESS_DENIED/&gt;
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Authentication Error
            </p>
          </div>

          {/* Error Card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-gray-900 border border-red-500/20 rounded-lg p-6"
          >
            <div className="text-center">
              <div className="text-red-400 mb-4">
                <code className="text-sm">
                  ERROR_CODE: {error || 'UNKNOWN'}
                </code>
              </div>
              <p className="text-gray-300 mb-6">
                {errorMessage}
              </p>
              
              {/* Action Buttons */}
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/login')}
                  className="w-full flex justify-center py-2 px-4 border border-green-500 rounded-md shadow-sm text-sm font-medium text-green-400 bg-transparent hover:bg-green-500/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-900 transition-colors"
                >
                  &lt;RETRY_LOGIN/&gt;
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/')}
                  className="w-full flex justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-400 bg-transparent hover:bg-gray-600/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-900 transition-colors"
                >
                  &lt;RETURN_HOME/&gt;
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-center"
          >
            <p className="text-xs text-gray-500 font-mono">
              # If the problem persists, check your OAuth configuration
            </p>
            <p className="text-xs text-gray-500 font-mono">
              # Ensure redirect URIs are properly set in Google Console
            </p>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  )
}

export default AuthError