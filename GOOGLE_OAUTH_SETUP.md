# Google OAuth Setup Guide

## Overview
To enable Google authentication in your authentication system, you need to set up OAuth credentials through Google Cloud Console.

## Step-by-Step Setup

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name (e.g., "Auth System") and click "Create"
4. Select your newly created project

### 2. Enable Google+ API
1. Go to "APIs & Services" → "Library"
2. Search for "Google+ API" and enable it
3. Also enable "Google People API" (recommended)

### 3. Configure OAuth Consent Screen
1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" user type (unless you have a Google Workspace account)
3. Fill in required information:
   - **App name**: Your Auth System
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Add scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `openid`
5. Add test users (your email addresses for testing)
6. Click "Save and Continue"

### 4. Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Enter name: "Auth System Frontend"
5. **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   ```
6. **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. Click "Create"
8. **IMPORTANT**: Copy the Client ID and Client Secret

### 5. Update Environment Variables
Add your actual credentials to `frontend/.env.local`:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-actual-google-client-id-here
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret-here
```

## Production Setup
For production deployment, update:

### Google Cloud Console:
- **Authorized JavaScript origins**: Add your production domain
- **Authorized redirect URIs**: Add your production callback URL

### Environment Variables:
```bash
NEXTAUTH_URL=https://yourdomain.com
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret
```

## Common Issues & Solutions

### 400 Error: "The server cannot process the request"
- **Cause**: Incorrect redirect URI or missing OAuth credentials
- **Solution**: Verify redirect URI matches exactly: `http://localhost:3000/api/auth/callback/google`

### "redirect_uri_mismatch" Error
- **Cause**: Redirect URI in Google Console doesn't match the one being used
- **Solution**: Add all possible redirect URIs to Google Console

### OAuth Consent Screen Issues
- **Cause**: App not properly configured or still in testing mode
- **Solution**: Complete OAuth consent screen setup and add test users

## Testing
1. Restart your frontend server after updating environment variables
2. Navigate to login page
3. Click "Sign in with Google"
4. Should redirect to Google's OAuth consent screen

## Security Notes
- Never commit real OAuth credentials to version control
- Use different credentials for development and production
- Regularly rotate client secrets
- Monitor OAuth usage in Google Cloud Console