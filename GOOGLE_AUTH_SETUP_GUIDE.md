# Google Authentication Setup Guide

This guide will help you configure Google OAuth authentication for your BioinformaticsHub.io application.

---

## 📋 Prerequisites

- Google account
- Your application running on `http://localhost:3000` (development)
- Access to Google Cloud Console

---

## 🔧 Step 1: Create Google Cloud Project

### 1.1 Go to Google Cloud Console
Visit: [https://console.cloud.google.com/](https://console.cloud.google.com/)

### 1.2 Create New Project
1. Click on the project dropdown at the top
2. Click **"New Project"**
3. Enter project details:
   - **Project name:** BioinformaticsHub
   - **Organization:** (optional)
4. Click **"Create"**
5. Wait for the project to be created (takes a few seconds)
6. **Select the new project** from the dropdown

---

## 🔐 Step 2: Enable Google+ API (Optional but Recommended)

1. In the Google Cloud Console, go to **"APIs & Services" > "Library"**
2. Search for **"Google+ API"** or **"Google People API"**
3. Click on it and click **"Enable"**
4. This allows your app to access user profile information

---

## 🔑 Step 3: Create OAuth 2.0 Credentials

### 3.1 Configure OAuth Consent Screen

1. Go to **"APIs & Services" > "OAuth consent screen"**
2. Choose **"External"** user type (for public apps)
3. Click **"Create"**

### 3.2 Fill in App Information

#### App Information
- **App name:** BioinformaticsHub.io
- **User support email:** your-email@example.com
- **App logo:** (optional - upload your logo)

#### App Domain (Optional for development)
- **Application home page:** http://localhost:3000
- **Privacy policy:** http://localhost:3000/privacy (create if needed)
- **Terms of service:** http://localhost:3000/terms (create if needed)

#### Developer Contact Information
- **Email addresses:** your-email@example.com

4. Click **"Save and Continue"**

### 3.3 Configure Scopes

1. Click **"Add or Remove Scopes"**
2. Select these scopes:
   - `openid`
   - `email`
   - `profile`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
3. Click **"Update"**
4. Click **"Save and Continue"**

### 3.4 Add Test Users (Development Mode)

1. Click **"Add Users"**
2. Add email addresses of users who can test the app
3. Click **"Add"**
4. Click **"Save and Continue"**
5. Review and click **"Back to Dashboard"**

---

## 🎫 Step 4: Create OAuth Client ID

### 4.1 Create Credentials

1. Go to **"APIs & Services" > "Credentials"**
2. Click **"+ Create Credentials"**
3. Select **"OAuth client ID"**

### 4.2 Configure OAuth Client

1. **Application type:** Web application
2. **Name:** BioinformaticsHub Web Client

### 4.3 Add Authorized JavaScript Origins

Add these URLs:
```
http://localhost:3000
http://localhost:3001
```

For production, you'll add:
```
https://yourdomain.com
```

### 4.4 Add Authorized Redirect URIs

Add these exact URIs:
```
http://localhost:3000/api/auth/callback/google
http://localhost:3001/api/auth/callback/google
```

For production:
```
https://yourdomain.com/api/auth/callback/google
```

⚠️ **IMPORTANT:** The redirect URI MUST match exactly, including the path `/api/auth/callback/google`

### 4.5 Create Client

1. Click **"Create"**
2. A modal will appear with your credentials
3. **COPY BOTH VALUES NOW:**
   - **Client ID:** Something like `123456789-abc...xyz.apps.googleusercontent.com`
   - **Client Secret:** Something like `GOCSPX-...`
4. Click **"OK"**

---

## ⚙️ Step 5: Configure Your Application

### 5.1 Update .env File

Open your `.env` file and add these lines:

```env
# Google OAuth
GOOGLE_CLIENT_ID="your-client-id-here.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret-here"
```

Replace the values with the credentials from Step 4.5.

### 5.2 Your Complete .env File Should Look Like:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="supersecret_dev_key_123"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="123456789-abc...xyz.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-..."

# GitHub OAuth (optional - for future setup)
# GITHUB_CLIENT_ID=""
# GITHUB_CLIENT_SECRET=""
```

---

## 🔄 Step 6: Restart Your Development Server

1. Stop your current dev server (Ctrl+C)
2. Restart it:
   ```bash
   npm run dev
   ```

---

## ✅ Step 7: Test Google Authentication

### 7.1 Navigate to Login Page

Open your browser and go to:
```
http://localhost:3000/login
```

### 7.2 Click "Sign in with Google"

1. You should see a Google button on the login page
2. Click it
3. You'll be redirected to Google's login page
4. Sign in with your Google account
5. Grant permissions to the app
6. You'll be redirected back to your app
7. You should be logged in! ✅

### 7.3 Verify Your Session

Check if:
- ✅ You're redirected to the dashboard or home page
- ✅ Your profile picture appears (if you have one)
- ✅ Your name is displayed
- ✅ You can access protected pages

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"

**Problem:** The redirect URI in your Google Console doesn't match

**Solution:**
1. Go to Google Cloud Console > Credentials
2. Click on your OAuth client
3. Check "Authorized redirect URIs"
4. Make sure it includes exactly: `http://localhost:3000/api/auth/callback/google`
5. Save changes and wait 5 minutes for changes to propagate

### Error: "Access blocked: This app's request is invalid"

**Problem:** OAuth consent screen not configured properly

**Solution:**
1. Go to "OAuth consent screen"
2. Make sure all required fields are filled
3. Add your test email to "Test users"
4. Save changes

### Error: "This app hasn't been verified"

**Problem:** App is in testing mode

**Solution:**
1. This is normal for development
2. Click "Advanced" > "Go to BioinformaticsHub (unsafe)"
3. For production, you'll need to verify your app with Google

### Google Button Not Appearing

**Problem:** Environment variables not loaded

**Solution:**
1. Check `.env` file has correct values
2. Restart dev server
3. Clear browser cache
4. Check browser console for errors

### Database Errors

**Problem:** User table schema issues

**Solution:**
```bash
npx prisma db push
```

---

## 🌐 Production Deployment

When deploying to production:

### 1. Update Google Cloud Console

1. Go to "OAuth consent screen" > "Publishing status"
2. Click "Publish App" (or keep in testing for internal use)
3. Go to "Credentials" > Your OAuth client
4. Add production URLs:
   ```
   Authorized JavaScript origins:
   https://yourdomain.com
   
   Authorized redirect URIs:
   https://yourdomain.com/api/auth/callback/google
   ```

### 2. Update Environment Variables

On your production server (Vercel, Netlify, etc.):
```env
NEXTAUTH_URL="https://yourdomain.com"
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

### 3. Generate Production Secret

```bash
openssl rand -base64 32
```

Use the output for `NEXTAUTH_SECRET` in production.

---

## 📊 User Flow Diagram

```
User clicks "Sign in with Google"
          ↓
Redirected to Google Login
          ↓
User grants permissions
          ↓
Google redirects to /api/auth/callback/google
          ↓
NextAuth creates/updates user in database
          ↓
Session created
          ↓
User redirected to dashboard
```

---

## 🔒 Security Best Practices

1. ✅ **Never commit** `.env` file to git
2. ✅ Use different OAuth clients for dev/staging/production
3. ✅ Rotate secrets regularly
4. ✅ Use environment-specific redirect URIs
5. ✅ Enable 2FA on your Google account
6. ✅ Monitor OAuth usage in Google Console
7. ✅ Keep test users list minimal
8. ✅ Review OAuth scopes regularly

---

## 📱 Alternative: Database Configuration

Your app also supports configuring OAuth through the admin settings panel:

1. Go to `/admin/settings`
2. Find "Integrations" section
3. Configure Google OAuth there
4. This stores credentials in the database (encrypted)

**Note:** Environment variables take precedence over database settings.

---

## 🆘 Need Help?

### Resources
- [NextAuth.js Google Provider](https://next-auth.js.org/providers/google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

### Common Issues
- Make sure redirect URIs match exactly
- Wait 5-10 minutes after changing Google Console settings
- Clear browser cookies/cache if login fails
- Check browser console for error messages
- Verify environment variables are loaded

---

## ✅ Checklist

Before going live, ensure:

- [ ] Google Cloud project created
- [ ] OAuth consent screen configured
- [ ] OAuth client ID created
- [ ] Redirect URIs added correctly
- [ ] Client ID and Secret added to `.env`
- [ ] Dev server restarted
- [ ] Login page tested
- [ ] Google sign-in working
- [ ] User profile data displayed
- [ ] Session persistence working
- [ ] Production URLs configured (when deploying)

---

**Happy coding! 🚀**

If you encounter any issues, check the troubleshooting section or review the error messages in your browser console and server logs.
