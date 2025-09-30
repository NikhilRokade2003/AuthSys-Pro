@echo off
echo.
echo ============================================
echo   GOOGLE OAUTH SETUP HELPER
echo ============================================
echo.
echo This script will help you set up Google OAuth for your authentication system.
echo.
echo IMPORTANT: You need to complete these steps first:
echo 1. Follow the instructions in GOOGLE_OAUTH_SETUP.md
echo 2. Get your Google OAuth credentials from Google Cloud Console
echo 3. Have your Client ID and Client Secret ready
echo.
pause
echo.
echo Current environment file location:
echo %~dp0frontend\.env.local
echo.
echo Opening the environment file for editing...
echo.
start notepad "%~dp0frontend\.env.local"
echo.
echo INSTRUCTIONS:
echo 1. Replace 'your-actual-google-client-id-from-google-console' with your real Client ID
echo 2. Replace 'your-actual-google-client-secret-from-google-console' with your real Client Secret
echo 3. Save the file and close the editor
echo 4. Restart your frontend server: cd frontend && npm run dev
echo.
echo REMINDER: Make sure your Google OAuth redirect URI is set to:
echo http://localhost:3000/api/auth/callback/google
echo.
pause
echo.
echo Setup helper completed! 
echo Don't forget to restart your frontend server after updating the environment variables.
pause