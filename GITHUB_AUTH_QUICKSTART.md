# GitHub OAuth Setup - Quick Checklist

Follow these steps to enable GitHub authentication in your app:

## 🚀 Quick Steps (3 minutes)

### 1. Go to GitHub Developer Settings
**Link:** https://github.com/settings/developers

Or: Profile → Settings → Developer settings → OAuth Apps

### 2. Create New OAuth App
- Click: **"New OAuth App"** or **"Register a new application"**

### 3. Fill Application Details

**Application name:**
```
BioinformaticsHub.io
```

**Homepage URL:**
```
http://localhost:3000
```

**Authorization callback URL:** (⚠️ MUST BE EXACT)
```
http://localhost:3000/api/auth/callback/github
```

- Click: **"Register application"**

### 4. Get Your Credentials

1. **Copy Client ID** - Shows immediately
2. **Click "Generate a new client secret"**
3. **Copy Client Secret** - ⚠️ Only shown once!

Example format:
- Client ID: `Iv1.a1b2c3d4e5f6g7h8`
- Client Secret: `1234567890abcdef1234567890abcdef12345678`

### 5. Update Your .env File

Open `.env` and uncomment/update the GitHub section:

```env
# GitHub OAuth
GITHUB_CLIENT_ID="paste-your-client-id-here"
GITHUB_CLIENT_SECRET="paste-your-client-secret-here"
```

### 6. Restart Dev Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

### 7. Test It!

1. Go to: http://localhost:3000/login
2. Click "Sign in with GitHub"
3. Authorize the app
4. You should be logged in! ✅

---

## 📖 Need More Details?

See the complete guide: `GITHUB_AUTH_SETUP_GUIDE.md`

---

## ⚠️ Common Issues

**"redirect_uri MUST match"**
- Callback URL must be exactly: `http://localhost:3000/api/auth/callback/github`
- Include the full path

**"Bad credentials"**
- Check Client ID and Secret are copied correctly
- No extra spaces in `.env` file
- Restart dev server

**Button not appearing**
- Restart dev server after adding credentials
- Clear browser cache
- Check console for errors

**"Email is required"**
- Your GitHub email might be private
- Go to GitHub Settings → Emails
- Uncheck "Keep my email addresses private"

---

## ✅ Success Indicators

You'll know it's working when:
- ✅ GitHub button appears on login page
- ✅ Clicking it opens GitHub authorization
- ✅ After authorization, you're redirected back
- ✅ Your GitHub name/picture appears in header
- ✅ You can access protected pages

---

## 🎯 Quick Comparison

| Feature | Google OAuth | GitHub OAuth |
|---------|-------------|--------------|
| Setup Time | ~5 min | ~3 min |
| User Base | General users | Developers |
| Profile Data | Name, Email, Photo | Username, Email, Photo |
| Best For | All users | Developer tools |

---

## 🔐 Your .env File Should Look Like:

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
GITHUB_CLIENT_ID="Iv1.your-client-id"
GITHUB_CLIENT_SECRET="your-client-secret"
```

---

## 🎉 Multiple Auth Providers

Your app now supports **3 authentication methods**:
- ✅ **Email/Password** - Traditional login
- ✅ **Google** - For general users
- ✅ **GitHub** - For developers

Users can choose their preferred method!

---

## 🔗 Account Linking

If a user signs in with GitHub using the same email as their Google account:
- ✅ Accounts are automatically linked
- ✅ They can use either provider to sign in
- ✅ Single user profile across all providers

---

**Need help?** Check `GITHUB_AUTH_SETUP_GUIDE.md` for detailed troubleshooting!
