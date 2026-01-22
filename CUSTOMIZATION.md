# 🎨 Customization Guide

## Quick Customizations You Can Make

### 1. **Branding & Colors**

#### Update Primary Colors
File: `app/globals.css`

```css
/* Line 16-30: Update these color values */
:root {
  --primary: 263 70% 50%;        /* Main brand color (purple) */
  --primary-foreground: 0 0% 100%;
  --secondary: 240 4% 16%;
  --accent: 240 5% 26%;
}

/* Example: Change to blue theme */
:root {
  --primary: 210 100% 50%;       /* Blue */
  --primary-foreground: 0 0% 100%;
}
```

#### Update Site Name
Files to change:
- `lib/metadata.ts` - Line 8, 19, 25
- `components/navbar.tsx` - Logo text
- Email templates - `lib/email-templates.ts`

### 2. **Homepage Content**

File: `app/page.tsx`

Update:
- Hero section text (lines ~30-50)
- Feature cards (lines ~80-120)
- Statistics (lines ~140-160)
- CTA sections (lines ~180-200)

### 3. **Add New Category**

```typescript
// In admin panel or via database
await prisma.category.create({
  data: {
    name: "Your Category Name",
    slug: "your-category-slug",
    description: "Description here",
    type: "TOOL", // or "COURSE", "POST"
  }
});
```

### 4. **Custom Admin Dashboard Widgets**

File: `app/(routes)/admin/page.tsx`

Add new widgets around line 80:

```tsx
<div className="glass-card p-6">
  <h3 className="font-semibold mb-2">Your Custom Widget</h3>
  <p className="text-2xl font-bold">{yourData}</p>
</div>
```

### 5. **Email Template Customization**

File: `lib/email-templates.ts`

Update colors (line ~30-35):
```css
background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);
```

### 6. **Add Social Links**

File: `components/footer.tsx`

Add social media links:
```tsx
<a href="https://twitter.com/yourusername">
  <Twitter className="w-5 h-5" />
</a>
```

### 7. **Custom Analytics**

File: `app/(routes)/admin/analytics/page.tsx`

Add custom metrics around line 120:

```tsx
const customMetric = await prisma.yourModel.count({
  where: { yourCondition: true }
});
```

### 8. **Add New User Role**

File: `lib/permissions.ts`

1. Add role to enum (line 7):
```typescript
export enum UserRole {
  ADMIN = "ADMIN",
  EDITOR = "EDITOR",
  CONTRIBUTOR = "CONTRIBUTOR",
  MODERATOR = "MODERATOR",  // New role
  USER = "USER",
}
```

2. Define permissions (line 60):
```typescript
[UserRole.MODERATOR]: [
  Permission.MODERATE_CONTENT,
  Permission.VIEW_ANALYTICS,
],
```

### 9. **Custom Export Formats**

File: `components/admin/advanced-export-button.tsx`

Add PDF export (you'll need a PDF library):
```typescript
if (format === "pdf") {
  // Add your PDF generation logic
  const pdfContent = await generatePDF(items);
  // ... download logic
}
```

### 10. **Add New Content Type**

1. **Update Prisma Schema** (`prisma/schema.prisma`):
```prisma
model YourNewType {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  description String?
  published   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

2. **Run Migration**:
```bash
npx prisma migrate dev --name add_your_new_type
```

3. **Create API Routes** (`app/api/admin/your-type/route.ts`)

4. **Create Admin Pages** (`app/(routes)/admin/your-type/`)

---

## 🎯 Advanced Customizations

### Add Search Filters

File: `app/(routes)/directory/page.tsx`

```tsx
const [filters, setFilters] = useState({
  pricing: 'all',
  featured: false,
  category: 'all'
});

// Apply filters in data fetching
const filteredTools = tools.filter(tool => {
  if (filters.pricing !== 'all' && tool.pricing !== filters.pricing) return false;
  if (filters.featured && !tool.featured) return false;
  return true;
});
```

### Custom Dashboard Metrics

```typescript
// Get custom analytics
const customStats = {
  monthlyGrowth: await prisma.tool.count({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    }
  }),
  topCategory: await prisma.category.findFirst({
    include: {
      _count: { select: { tools: true } }
    },
    orderBy: {
      tools: { _count: 'desc' }
    }
  })
};
```

### Add Notifications System

1. **Create Notification Model** (Prisma schema)
2. **Create API endpoints** (`/api/notifications`)
3. **Add notification component** in navbar
4. **Use toast notifications** for user feedback

### Implement Comments

1. **Add Comment model** to Prisma schema
2. **Create comment API** routes
3. **Add comment component** to posts/tools
4. **Add moderation** in admin panel

---

## 🔧 Configuration Options

### 1. Items Per Page
```typescript
// In admin pages
const ITEMS_PER_PAGE = 10; // Change this value
```

### 2. Upload File Limits
```typescript
// File: app/api/upload/route.ts (line 15)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB - adjust as needed
```

### 3. Cache Duration
```typescript
// File: lib/cache.ts
const CACHE_DURATION = {
  SHORT: 60,      // 1 minute
  MEDIUM: 300,    // 5 minutes - adjust
  LONG: 3600,     // 1 hour - adjust
};
```

### 4. Session Timeout
```typescript
// File: lib/auth.ts
session: {
  maxAge: 30 * 24 * 60 * 60, // 30 days - adjust
}
```

---

## 🎨 UI/UX Enhancements

### Add Dark/Light Mode Toggle
```typescript
// Install next-themes
npm install next-themes

// Add ThemeProvider to layout
// Create theme toggle component
```

### Add Loading States
```tsx
{isLoading ? (
  <Loader2 className="w-6 h-6 animate-spin" />
) : (
  <YourContent />
)}
```

### Add Empty States
```tsx
{items.length === 0 && (
  <div className="text-center py-12">
    <YourIcon className="w-12 h-12 mx-auto opacity-30" />
    <p className="mt-4 text-muted-foreground">No items found</p>
  </div>
)}
```

---

## 📱 Mobile Optimizations

### Responsive Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Your cards */}
</div>
```

### Mobile Navigation
Already implemented in `components/navbar.tsx` with hamburger menu.

---

## 🔌 Integrations

### Add Google Analytics
```tsx
// File: app/layout.tsx
<Script
  src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
  strategy="afterInteractive"
/>
```

### Add Email Service (SendGrid, Mailgun)
```typescript
// Create lib/email.ts
export async function sendEmail(to, subject, html) {
  // Your email service logic
}
```

---

## 🚀 Performance Tweaks

### Enable Redis Caching
```typescript
// Install redis
npm install redis

// Update lib/cache.ts to use Redis instead of Map
```

### Add CDN for Static Assets
- Upload images to Cloudinary/AWS S3
- Update image URLs in database

---

## ✅ Testing Your Customizations

```bash
# 1. Run linter
npm run lint

# 2. Type check
npx tsc --noEmit

# 3. Build for production
npm run build

# 4. Test locally
npm start
```

---

*Happy Customizing! 🎨*
