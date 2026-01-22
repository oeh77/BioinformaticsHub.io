# Deployment Guide

## Prerequisites

1. **Vercel Account** - Sign up at https://vercel.com
2. **PostgreSQL Database** - Use Vercel Postgres, Supabase, or Neon
3. **OAuth Apps** - Google and GitHub OAuth applications

## Step 1: Database Setup

### Using Vercel Postgres:
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Create Postgres database
vercel postgres create
```

### Using Neon (Recommended):
1. Go to https://neon.tech
2. Create a new project
3. Copy the connection string

## Step 2: Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

```
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<generate-secret>
GOOGLE_CLIENT_ID=<your-id>
GOOGLE_CLIENT_SECRET=<your-secret>
GITHUB_ID=<your-id>
GITHUB_SECRET=<your-secret>
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

## Step 3: Deploy to Vercel

### Option A: Deploy via CLI
```bash
# Install dependencies
npm install

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Option B: Deploy via GitHub
1. Push code to GitHub
2. Go to Vercel Dashboard
3. Import your GitHub repository
4. Configure environment variables
5. Deploy

## Step 4: Database Migration

After first deployment:
```bash
# Set DATABASE_URL in .env
echo "DATABASE_URL=your-production-url" > .env

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

## Step 5: Create Admin User

After deployment, create an admin user:
1. Sign up via the app
2. Access the database and run:
```sql
UPDATE "User" 
SET role = 'ADMIN' 
WHERE email = 'your-email@example.com';
```

## Step 6: Configure OAuth Redirect URLs

### Google OAuth:
- Authorized redirect URIs: 
  - `https://yourdomain.com/api/auth/callback/google`

### GitHub OAuth:
- Authorization callback URL:
  - `https://yourdomain.com/api/auth/callback/github`

## Post-Deployment Checklist

- [ ] Database is accessible and seeded
- [ ] Environment variables are set
- [ ] OAuth providers are configured
- [ ] Admin user is created
- [ ] SSL certificate is active
- [ ] Custom domain is configured (if applicable)
- [ ] Analytics are working (if configured)

## Monitoring & Maintenance

### Performance Monitoring:
- Use Vercel Analytics Dashboard
- Monitor Core Web Vitals
- Check Error Logs regularly

### Database Backups:
```bash
# Backup database
pg_dump $DATABASE_URL > backup.sql

# Restore from backup
psql $DATABASE_URL < backup.sql
```

### Update Dependencies:
```bash
npm update
npm audit fix
```

## Troubleshooting

### Build Errors:
- Check Vercel build logs
- Verify all environment variables are set
- Test build locally: `npm run build`

### Database Connection:
- Verify DATABASE_URL format
- Check database is accessible from Vercel's region
- Test connection: `npx prisma db pull`

### OAuth Issues:
- Verify redirect URLs match exactly
- Check client IDs and secrets
- Ensure NEXTAUTH_URL is correct

## Support

For issues:
1. Check Vercel logs
2. Review error messages
3. Consult documentation
4. Contact support if needed
