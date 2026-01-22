# Google OAuth Setup - Quick Checklist

Follow these steps to enable Google authentication in your app:

## 🚀 Quick Steps (5 minutes)

### 1. Open Google Cloud Console
**Link:** https://console.cloud.google.com/

### 2. Create Project
- Click "New Project"
- Name: "BioinformaticsHub"
- Click "Create"

### 3. Configure OAuth Consent Screen
- Go to: **APIs & Services > OAuth consent screen**
- Choose: **External**
- Fill in:
  - App name: BioinformaticsHub.io
  - Support email: your-email@example.com
  - Developer email: your-email@example.com
- Save and Continue through all steps

### 4. Create OAuth Client ID
- Go to: **APIs & Services > Credentials**
- Click: **+ Create Credentials > OAuth client ID**
- Application type: **Web application**
- Name: BioinformaticsHub Web Client

#### Add Authorized JavaScript origins:
```
http://localhost:3000
```

#### Add Authorized redirect URIs:
```
http://localhost:3000/api/auth/callback/google
```

- Click **Create**
- **COPY** Client ID and Client Secret

### 5. Update Your .env File

Open `.env` and replace the placeholders:

```env
GOOGLE_CLIENT_ID="paste-your-client-id-here"
GOOGLE_CLIENT_SECRET="paste-your-client-secret-here"
```

### 6. Restart Dev Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

### 7. Test It!

1. Go to: http://localhost:3000/login
2. Click "Sign in with Google"
3. Authorize the app
4. You should be logged in! ✅

---

## 📖 Need More Details?

See the complete guide: `GOOGLE_AUTH_SETUP_GUIDE.md`

## ⚠️ Common Issues

**"redirect_uri_mismatch"**
- Make sure redirect URI is exactly: `http://localhost:3000/api/auth/callback/google`
- Include the `/api/auth/callback/google` path

**Button not appearing**
- Restart dev server after adding credentials
- Clear browser cache

**"This app hasn't been verified"**
- Normal for development
- Click "Advanced" > "Go to BioinformaticsHub (unsafe)"

---

## ✅ Success Indicators

You'll know it's working when:
- ✅ Google button appears on login page
- ✅ Clicking it opens Google login
- ✅ After login, you're redirected back to your app
- ✅ Your name/picture appears in the header
- ✅ You can access protected pages

---

**Need help?** Check `GOOGLE_AUTH_SETUP_GUIDE.md` for troubleshooting!
