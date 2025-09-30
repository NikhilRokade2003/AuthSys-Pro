const express = require('express')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const FacebookStrategy = require('passport-facebook').Strategy
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const UserActivity = require('../models/UserActivity')

const router = express.Router()

// Configure Passport Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL}/api/oauth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this Google ID
    let user = await User.findOne({ where: { oauth_google_id: profile.id } })
    
    if (user) {
      // Log activity
      await UserActivity.logActivity(user.id, 'oauth_login', null, {
        provider: 'google',
        profile_id: profile.id
      })
      return done(null, user)
    }

    // Check if user exists with same email
    user = await User.findByEmail(profile.emails[0].value)
    
    if (user) {
      // Link Google account to existing user
      user.oauth_google_id = profile.id
      user.is_email_verified = true
      await user.save()
      
      await UserActivity.logActivity(user.id, 'oauth_link', null, {
        provider: 'google',
        profile_id: profile.id
      })
      return done(null, user)
    }

    // Create new user
    user = await User.create({
      name: profile.displayName,
      email: profile.emails[0].value,
      oauth_google_id: profile.id,
      profile_picture: profile.photos[0]?.value,
      is_email_verified: true,
      password: null // OAuth users don't have passwords
    })

    await UserActivity.logActivity(user.id, 'oauth_register', req.ip, {
      provider: 'google',
      profile_id: profile.id
    })

    return done(null, user)
  } catch (error) {
    return done(error, null)
  }
}))

// Configure Passport Facebook Strategy
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: `${process.env.BACKEND_URL}/api/oauth/facebook/callback`,
  profileFields: ['id', 'displayName', 'emails', 'picture.type(large)']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this Facebook ID
    let user = await User.findOne({ where: { oauth_facebook_id: profile.id } })
    
    if (user) {
      await UserActivity.logActivity(user.id, 'oauth_login', null, {
        provider: 'facebook',
        profile_id: profile.id
      })
      return done(null, user)
    }

    // Check if user exists with same email
    const email = profile.emails?.[0]?.value
    if (email) {
      user = await User.findByEmail(email)
      
      if (user) {
        // Link Facebook account to existing user
        user.oauth_facebook_id = profile.id
        user.is_email_verified = true
        await user.save()
        
        await UserActivity.logActivity(user.id, 'oauth_link', null, {
          provider: 'facebook',
          profile_id: profile.id
        })
        return done(null, user)
      }
    }

    // Create new user
    user = await User.create({
      name: profile.displayName,
      email: email,
      oauth_facebook_id: profile.id,
      profile_picture: profile.photos?.[0]?.value,
      is_email_verified: true,
      password: null // OAuth users don't have passwords
    })

    await UserActivity.logActivity(user.id, 'oauth_register', req.ip, {
      provider: 'facebook',
      profile_id: profile.id
    })

    return done(null, user)
  } catch (error) {
    return done(error, null)
  }
}))

// Serialize/Deserialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id)
    done(null, user)
  } catch (error) {
    done(error, null)
  }
})

// Google OAuth routes
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}))

router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    try {
      // Generate JWT token
      const token = jwt.sign(
        { 
          id: req.user.id,
          email: req.user.email 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      )

      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&provider=google`)
    } catch (error) {
      console.error('Google OAuth callback error:', error)
      res.redirect(`${process.env.FRONTEND_URL}/auth/error?provider=google`)
    }
  }
)

// Facebook OAuth routes
router.get('/facebook', passport.authenticate('facebook', {
  scope: ['email']
}))

router.get('/facebook/callback',
  passport.authenticate('facebook', { session: false }),
  async (req, res) => {
    try {
      // Generate JWT token
      const token = jwt.sign(
        { 
          id: req.user.id,
          email: req.user.email 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      )

      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&provider=facebook`)
    } catch (error) {
      console.error('Facebook OAuth callback error:', error)
      res.redirect(`${process.env.FRONTEND_URL}/auth/error?provider=facebook`)
    }
  }
)

module.exports = router