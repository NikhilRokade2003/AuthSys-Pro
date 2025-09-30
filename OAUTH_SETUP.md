# OAuth Setup Guide

## Google OAuth Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** or select an existing one
3. **Enable Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. **Create OAuth credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:5000/api/oauth/google/callback` (for development)
     - `https://yourdomain.com/api/oauth/google/callback` (for production)
5. **Copy credentials**:
   - Copy the Client ID and Client Secret
   - Add them to your `.env` file in the backend

## Facebook OAuth Setup

1. **Go to Facebook Developers**: https://developers.facebook.com/
2. **Create a new app** or select an existing one
3. **Add Facebook Login product**:
   - Go to "Products" > "Facebook Login" > "Settings"
   - Add valid OAuth Redirect URIs:
     - `http://localhost:5000/api/oauth/facebook/callback` (for development)
     - `https://yourdomain.com/api/oauth/facebook/callback` (for production)
4. **Copy credentials**:
   - Go to "Settings" > "Basic"
   - Copy the App ID and App Secret
   - Add them to your `.env` file in the backend

## Environment Variables

Add these to your backend `.env` file:

```env
# OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
```

## Testing OAuth

1. Start both backend and frontend servers
2. Go to `/auth` page
3. Click on "Continue with Google" or "Continue with Facebook"
4. Complete the OAuth flow
5. You should be redirected back with authentication success

## Production Setup

For production deployment:
1. Update redirect URIs in Google/Facebook consoles with your production domain
2. Update `FRONTEND_URL` and `BACKEND_URL` in environment variables
3. Ensure HTTPS is enabled for OAuth providers

## Troubleshooting

- **"redirect_uri_mismatch"**: Check that your redirect URIs match exactly in the OAuth provider console
- **"invalid_client"**: Verify your Client ID and Client Secret are correct
- **CORS errors**: Ensure your frontend domain is whitelisted in CORS configuration