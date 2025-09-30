# 🔧 Environment Configuration

## Custom Environment File: `.authsys`

This project uses `.authsys` instead of the standard `.env` file for environment variables.

### Why .authsys?
- Custom naming for your authentication system
- Clear identification of environment files
- Maintains security while being project-specific

### How to Set Up:

1. **Copy the example file:**
   ```bash
   copy .authsys.example .authsys
   ```

2. **Edit the .authsys file** with your actual values:
   - Database credentials
   - JWT secrets
   - API keys
   - Service configurations

3. **Security Note:**
   - The `.authsys` file is already added to `.gitignore`
   - Never commit this file to version control
   - Keep your secrets secure!

### Usage:
The server automatically loads variables from `.authsys` file on startup via:
```javascript
require('dotenv').config({ path: '.authsys' })
```

### Quick Setup Commands:
```bash
# Navigate to backend
cd backend

# Copy example file
copy .authsys.example .authsys

# Edit with your credentials
notepad .authsys

# Start the server
npm start
```

Your authentication system will now use the `.authsys` file for all configuration! 🚀