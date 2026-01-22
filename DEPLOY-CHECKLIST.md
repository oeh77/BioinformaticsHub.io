# 🚀 DEPLOYMENT CHECKLIST - BioinformaticsHub.io

## ✅ COMPLETED STEPS

- [x] Vercel CLI installed
- [x] Application tested locally
- [x] Database seeded with sample data
- [x] All features verified working

---

## 📋 BEFORE YOU DEPLOY - REQUIRED SETUP

### 1. Create PostgreSQL Database (Choose One)

#### Option A: Neon (Recommended - Free Tier)
1. Go to: https://neon.tech
2. Sign up with GitHub/Google
3. Click "Create Project"
4. Name: `bioinformaticshub`
5. Region: Choose closest to you
6. Copy the connection string (looks like):
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb
   ```
7. Save this for later!

#### Option B: Vercel Postgres
```bash
# After logging into Vercel
vercel postgres create bioinformaticshub
```

#### Option C: Supabase
1. Go to: https://supabase.com
2. New Project → Get connection string
3. Settings → Database → Connection String

---

### 2. Set Up Google OAuth

1. Go to: https://console.cloud.google.com
2. Create new project or select existing
3. Navigate to: **APIs & Services** → **Credentials**
4. Click: **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Name: `BioinformaticsHub`
7. **Authorized redirect URIs** - Add:
   ```
   http://localhost:3000/api/auth/callback/google
   https://your-app-name.vercel.app/api/auth/callback/google
   ```
   (You'll update the Vercel URL after deployment)
8. Click **Create**
9. **SAVE THESE:**
   - Client ID: `xxx.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-xxx`

---

### 3. Set Up GitHub OAuth

1. Go to: https://github.com/settings/developers
2. Click: **New OAuth App**
3. Fill in:
   - Application name: `BioinformaticsHub`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Click **Register application**
5. Click **Generate a new client secret**
6. **SAVE THESE:**
   - Client ID: `Iv1.xxx`
   - Client Secret: `xxx`

---

### 4. Generate NextAuth Secret

Run this command:
```bash
openssl rand -base64 32
```

Or use this PowerShell command:
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**SAVE THIS SECRET!**

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Login to Vercel
```bash
vercel login
```
Follow the prompts to authenticate.

### Step 2: Deploy
```bash
vercel
```

This will:
1. Ask you questions about the project
2. Create a new Vercel project
3. Deploy your application
4. Give you a preview URL

**Answer the prompts:**
- Set up and deploy? **Y**
- Which scope? Choose your account
- Link to existing project? **N**
- Project name? `bioinformaticshub` (or your choice)
- Directory? `.` (press Enter)
- Override settings? **N**

### Step 3: Set Environment Variables

After deployment, go to:
https://vercel.com/dashboard → Your Project → Settings → Environment Variables

Add these variables:

```env
# Database
DATABASE_URL=postgresql://your-connection-string-here

# NextAuth
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-generated-secret-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-google-secret

# GitHub OAuth
GITHUB_ID=Iv1.your-github-client-id
GITHUB_SECRET=your-github-secret

# Application
NEXT_PUBLIC_BASE_URL=https://your-app-name.vercel.app
NODE_ENV=production
```

### Step 4: Update OAuth Redirect URLs

Now that you have your Vercel URL, update:

**Google OAuth:**
1. Go back to Google Cloud Console
2. Edit your OAuth client
3. Add to Authorized redirect URIs:
   ```
   https://your-actual-vercel-url.vercel.app/api/auth/callback/google
   ```

**GitHub OAuth:**
1. Go back to GitHub OAuth Apps
2. Edit your app
3. Update Authorization callback URL:
   ```
   https://your-actual-vercel-url.vercel.app/api/auth/callback/github
   ```

### Step 5: Deploy to Production
```bash
vercel --prod
```

### Step 6: Run Database Migrations

After production deployment:
```bash
# Set your production DATABASE_URL
$env:DATABASE_URL="your-production-database-url"

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

---

## ✅ POST-DEPLOYMENT CHECKLIST

- [ ] Visit your Vercel URL
- [ ] Test Google login
- [ ] Test GitHub login
- [ ] Access admin panel at `/admin`
- [ ] Create your admin user
- [ ] Verify sitemap at `/sitemap.xml`
- [ ] Check robots.txt at `/robots.txt`
- [ ] Test creating a tool/post
- [ ] Test image upload
- [ ] Verify email subscription works

---

## 🎯 QUICK REFERENCE

### Your URLs (Update after deployment)
- Production: `https://your-app.vercel.app`
- Admin Panel: `https://your-app.vercel.app/admin`
- Sitemap: `https://your-app.vercel.app/sitemap.xml`

### Vercel Commands
```bash
vercel login          # Login to Vercel
vercel                # Deploy preview
vercel --prod         # Deploy to production
vercel env ls         # List environment variables
vercel logs           # View deployment logs
vercel domains        # Manage custom domains
```

---

## 🆘 TROUBLESHOOTING

### Build Fails
```bash
# Check logs
vercel logs

# Common fixes:
# 1. Verify all env variables are set
# 2. Check DATABASE_URL format
# 3. Ensure Prisma schema is correct
```

### OAuth Not Working
- Verify redirect URLs match exactly (including https://)
- Check client IDs and secrets are correct
- Ensure NEXTAUTH_URL matches your domain

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check database is accessible from Vercel's region
- Ensure SSL mode is correct (usually `?sslmode=require`)

---

## 📞 NEED HELP?

- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- Check deployment logs: `vercel logs`

---

## 🎉 YOU'RE READY!

All prerequisites are documented above. Once you have:
1. ✅ Database connection string
2. ✅ Google OAuth credentials
3. ✅ GitHub OAuth credentials
4. ✅ NextAuth secret generated

Run: `vercel` and follow the prompts!

---

*Last Updated: January 20, 2026*
*Status: Ready to Deploy! 🚀*
