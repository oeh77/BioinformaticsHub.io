# GitHub Authentication Setup Guide

This guide will help you configure GitHub OAuth authentication for your BioinformaticsHub.io application.

---

## 📋 Prerequisites

- GitHub account
- Your application running on `http://localhost:3000` (development)
- Access to GitHub Settings

---

## 🔧 Step 1: Go to GitHub Developer Settings

### 1.1 Access GitHub Settings
Visit: [https://github.com/settings/developers](https://github.com/settings/developers)

Or navigate manually:
1. Click your **profile picture** (top right)
2. Select **Settings**
3. Scroll down to **Developer settings** (left sidebar)
4. Click **OAuth Apps**

---

## 🔑 Step 2: Create a New OAuth App

### 2.1 Create Application

1. Click **"New OAuth App"** button (or **"Register a new application"**)
2. Fill in the application details

### 2.2 Application Details

#### **Application name**
```
BioinformaticsHub.io
```

#### **Homepage URL**
For development:
```
http://localhost:3000
```

For production (later):
```
https://yourdomain.com
```

#### **Application description** (Optional)
```
Comprehensive bioinformatics platform for tools, courses, and resources
```

#### **Authorization callback URL** ⚠️ **IMPORTANT**
This MUST be exact:
```
http://localhost:3000/api/auth/callback/github
```

For production (add later):
```
https://yourdomain.com/api/auth/callback/github
```

⚠️ **Critical:** The callback URL MUST include `/api/auth/callback/github` path

### 2.3 Register Application

1. Click **"Register application"**
2. You'll be redirected to your app's settings page

---

## 🎫 Step 3: Get Your Credentials

### 3.1 Copy Client ID

On your OAuth app page, you'll see:
- **Client ID:** Something like `Iv1.a1b2c3d4e5f6g7h8`
- Click the **copy icon** next to it

### 3.2 Generate Client Secret

1. Click **"Generate a new client secret"**
2. **IMPORTANT:** Copy it immediately! You won't be able to see it again
3. Client Secret looks like: `1234567890abcdef1234567890abcdef12345678`

### 3.3 Save Credentials Securely

⚠️ **Warning:** The client secret will only be shown once. Copy it now!

---

## ⚙️ Step 4: Configure Your Application

### 4.1 Update .env File

Open your `.env` file and update the GitHub OAuth section:

```env
# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

Replace with your actual credentials from Step 3.

### 4.2 Complete .env File Example

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="supersecret_dev_key_123"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth
GITHUB_CLIENT_ID="Iv1.a1b2c3d4e5f6g7h8"
GITHUB_CLIENT_SECRET="1234567890abcdef1234567890abcdef12345678"
```

---

## 🔄 Step 5: Restart Your Development Server

1. Stop your current dev server (Ctrl+C if running)
2. Restart it to load the new environment variables:

```bash
npm run dev
```

Wait for the server to start (you'll see "Ready in X.Xs")

---

## ✅ Step 6: Test GitHub Authentication

### 6.1 Navigate to Login Page

Open your browser and go to:
```
http://localhost:3000/login
```

### 6.2 Click "Sign in with GitHub"

1. You should see a GitHub button on the login page
2. Click it
3. You'll be redirected to GitHub's authorization page
4. Click **"Authorize [your-app-name]"**
5. You'll be redirected back to your app
6. You should be logged in! ✅

### 6.3 Verify Your Session

Check if:
- ✅ You're redirected to the dashboard or home page
- ✅ Your GitHub profile picture appears
- ✅ Your GitHub username/name is displayed
- ✅ You can access protected pages

---

## 🔍 What Data GitHub Provides

When users sign in with GitHub, you receive:
- **Email address** (primary email)
- **Name** (display name)
- **Username** (GitHub handle)
- **Avatar URL** (profile picture)
- **Profile URL** (GitHub profile link)

---

## 🐛 Troubleshooting

### Error: "The redirect_uri MUST match the registered callback URL"

**Problem:** Callback URL doesn't match

**Solution:**
1. Go to [https://github.com/settings/developers](https://github.com/settings/developers)
2. Click on your OAuth app
3. Check "Authorization callback URL"
4. Make sure it's exactly: `http://localhost:3000/api/auth/callback/github`
5. Click **"Update application"**

### Error: "Bad credentials" / "Invalid client"

**Problem:** Client ID or Secret is incorrect

**Solution:**
1. Double-check your `.env` file values
2. Make sure there are no extra spaces
3. Verify Client ID matches what's shown on GitHub
4. Regenerate Client Secret if needed
5. Restart dev server after changes

### GitHub Button Not Appearing

**Problem:** Environment variables not loaded

**Solution:**
1. Check `.env` file has correct values
2. Restart dev server completely
3. Clear browser cache
4. Check browser console for errors

### Error: "Email is required"

**Problem:** Your GitHub email is private

**Solution:**
1. Go to [GitHub Email Settings](https://github.com/settings/emails)
2. Either:
   - Uncheck "Keep my email addresses private", OR
   - Use the provided `@users.noreply.github.com` email
3. Our app handles both cases automatically

### Rate Limiting Issues

**Problem:** Too many login attempts

**Solution:**
- GitHub has rate limits for OAuth apps
- Wait 15 minutes and try again
- For production, consider GitHub Apps (higher limits)

---

## 🌐 Production Deployment

When deploying to production:

### 1. Update GitHub OAuth App

1. Go to your [OAuth Apps](https://github.com/settings/developers)
2. Click on your app
3. Update URLs:

**Homepage URL:**
```
https://yourdomain.com
```

**Authorization callback URL:**
Add (keep localhost for development):
```
https://yourdomain.com/api/auth/callback/github
```

Click **"Update application"**

### 2. Update Environment Variables

On your production server (Vercel, Netlify, etc.):
```env
NEXTAUTH_URL="https://yourdomain.com"
GITHUB_CLIENT_ID="your-client-id"
GITHUB_CLIENT_SECRET="your-client-secret"
```

### 3. Optional: Create Separate OAuth App for Production

Recommended approach:
- **Development App:** Use for `localhost:3000`
- **Production App:** Use for `yourdomain.com`

This allows better tracking and security isolation.

---

## 🔐 Security Best Practices

1. ✅ **Never commit** `.env` file to git
2. ✅ Use different OAuth apps for dev/staging/production
3. ✅ Regenerate secrets if accidentally exposed
4. ✅ Use environment-specific callback URLs
5. ✅ Enable 2FA on your GitHub account
6. ✅ Monitor access in GitHub Settings
7. ✅ Review authorized apps regularly
8. ✅ Keep callback URLs up to date

---

## 📊 GitHub OAuth Scopes

By default, NextAuth.js requests these scopes:
- `read:user` - Read user profile data
- `user:email` - Read user email addresses

These are configured in your `lib/auth.ts` file and provide:
- Basic profile information
- Email address (for account creation)
- Avatar/profile picture

---

## 🔄 Managing Multiple OAuth Providers

Your app supports both Google and GitHub authentication:

### Account Linking
- Users can link multiple providers to one account
- Configured with `allowDangerousEmailAccountLinking: true`
- If email matches, accounts are automatically linked

### User Flow
1. User signs in with Google → Account created
2. Same user signs in with GitHub (same email) → Links to existing account
3. User can now use either provider to sign in

---

## 📱 Alternative: GitHub App vs OAuth App

**OAuth App (Current Setup)**
- ✅ Simple to set up
- ✅ Perfect for authentication
- ⚠️ Lower rate limits
- ⚠️ User-level permissions

**GitHub App (Advanced)**
- ✅ Higher rate limits
- ✅ Fine-grained permissions
- ✅ Installation-level access
- ⚠️ More complex setup

For authentication purposes, OAuth App is sufficient.

---

## 🆘 Need Help?

### Resources
- [GitHub OAuth Documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps)
- [NextAuth.js GitHub Provider](https://next-auth.js.org/providers/github)
- [GitHub Developer Settings](https://github.com/settings/developers)

### Common Issues Checklist
- [ ] Callback URL matches exactly
- [ ] Client ID and Secret copied correctly
- [ ] No extra spaces in `.env` file
- [ ] Dev server restarted after changes
- [ ] Browser cache cleared
- [ ] GitHub app is active (not suspended)

---

## 🎨 Customization

### Button Appearance
The GitHub sign-in button is styled in your login component.

### Email Handling
Configure in `lib/auth.ts`:
- Primary email is used by default
- Fallback to `@users.noreply.github.com` if private

### Profile Data
Additional GitHub data available:
- `login` - Username
- `bio` - User bio
- `location` - Location
- `company` - Company
- `blog` - Website/blog URL

---

## 📈 Monitoring

### Track OAuth Usage

1. Go to [GitHub OAuth Apps](https://github.com/settings/developers)
2. Click on your app
3. View authorization statistics

### Revoke Access (Testing)

To test re-authorization:
1. Go to [Authorized OAuth Apps](https://github.com/settings/applications)
2. Find your app
3. Click **"Revoke"**
4. Try signing in again (will request authorization)

---

## ✅ Checklist

Before going live, ensure:

- [ ] GitHub OAuth App created
- [ ] Callback URL configured correctly
- [ ] Client ID copied to `.env`
- [ ] Client Secret copied to `.env`
- [ ] Dev server restarted
- [ ] Login page tested
- [ ] GitHub sign-in working
- [ ] User profile data displayed
- [ ] Session persistence working
- [ ] Production URLs configured (when deploying)

---

## 🎯 Expected User Flow

```
User clicks "Sign in with GitHub"
          ↓
Redirected to GitHub Authorization
          ↓
User authorizes app
          ↓
GitHub redirects to /api/auth/callback/github
          ↓
NextAuth processes callback
          ↓
User created/updated in database
          ↓
Session established
          ↓
User redirected to dashboard
```

---

## 🔒 Privacy & Permissions

### What You Have Access To
- ✅ Public profile information
- ✅ Email address
- ✅ Avatar URL

### What You DON'T Have Access To
- ❌ Private repositories
- ❌ Organizations (unless specifically granted)
- ❌ SSH keys
- ❌ GPG keys
- ❌ Personal access tokens

---

**Happy coding! 🚀**

Your application now supports multiple authentication methods:
- ✅ Email/Password (Credentials)
- ✅ Google OAuth
- ✅ GitHub OAuth

Users can choose their preferred method to sign in!
