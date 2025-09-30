import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import CredentialsProvider from 'next-auth/providers/credentials'
import axios from 'axios'

export const authOptions = {
  providers: [
    // Credentials Provider for email/password login
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
            email: credentials.email,
            password: credentials.password,
          })

          if (response.data.success && response.data.user) {
            return {
              id: response.data.user.id,
              email: response.data.user.email,
              name: response.data.user.name,
              image: response.data.user.profilePicture,
              phone: response.data.user.phone,
              bio: response.data.user.bio,
              role: response.data.user.role,
              accessToken: response.data.token,
              refreshToken: response.data.refreshToken,
            }
          }
          return null
        } catch (error) {
          console.error('Auth error:', error.response?.data?.message || error.message)
          return null
        }
      }
    }),

    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: 'openid email profile',
        },
      },
    }),

    // Facebook OAuth Provider
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle OAuth sign-in
      if (account?.provider === 'google' || account?.provider === 'facebook') {
        try {
          // Validate required fields
          if (!user?.email || !user?.name) {
            console.error('OAuth sign-in error: Missing required user data')
            return false
          }

          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/oauth`, {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            email: user.email,
            name: user.name,
            image: user.image,
          }, {
            timeout: 10000, // 10 second timeout
          })

          if (response.data.success) {
            user.id = response.data.user.id
            user.accessToken = response.data.token
            user.refreshToken = response.data.refreshToken
            user.phone = response.data.user.phone
            user.bio = response.data.user.bio
            user.role = response.data.user.role
            return true
          } else {
            console.error('OAuth backend error:', response.data.message)
            return false
          }
        } catch (error) {
          console.error('OAuth sign-in error:', {
            message: error.response?.data?.message || error.message,
            status: error.response?.status,
            provider: account?.provider,
            url: `${process.env.NEXT_PUBLIC_API_URL}/api/auth/oauth`
          })
          return false
        }
      }
      return true
    },

    async jwt({ token, user, account }) {
      // Persist the OAuth access_token and refresh_token to the token right after signin
      if (user) {
        token.accessToken = user.accessToken
        token.refreshToken = user.refreshToken
        token.id = user.id
        token.phone = user.phone
        token.bio = user.bio
        token.role = user.role
      }

      // Handle token refresh
      if (token.refreshToken && Date.now() < token.accessTokenExpires) {
        return token
      }

      // Access token has expired, try to update it
      return await refreshAccessToken(token)
    },

    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken
      session.user.id = token.id
      session.user.phone = token.phone
      session.user.bio = token.bio
      session.user.role = token.role
      return session
    },
  },

  pages: {
    signIn: '/login',
    error: '/auth/error',
  },

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },

  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === 'development',
}

// Function to refresh access token
async function refreshAccessToken(token) {
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`, {
      refreshToken: token.refreshToken,
    })

    const refreshedTokens = response.data

    if (!refreshedTokens.success) {
      throw refreshedTokens
    }

    return {
      ...token,
      accessToken: refreshedTokens.token,
      accessTokenExpires: Date.now() + refreshedTokens.expiresIn * 1000,
      refreshToken: refreshedTokens.refreshToken ?? token.refreshToken,
    }
  } catch (error) {
    console.error('Error refreshing access token:', error)

    return {
      ...token,
      error: 'RefreshAccessTokenError',
    }
  }
}

export default NextAuth(authOptions)