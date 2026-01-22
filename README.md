# 🧬 BioinformaticsHub.io

> **Your comprehensive platform for bioinformatics tools, courses, and resources**

A modern, full-stack web application built with Next.js 14, TypeScript, Prisma, and NextAuth for managing and discovering bioinformatics resources.

---

## ✨ Features

### 🎯 Core Features
- **📚 Tools Directory** - Curated bioinformatics tools with detailed information
- **🎓 Courses Catalog** - Online courses and tutorials
- **📰 Blog System** - Articles and news about bioinformatics
- **📂 Resources Library** - Databases, datasets, and documentation
- **🏷️ Categories** - Organized content categorization
- **🔖 Bookmarks** - Save favorite items (authenticated users)
- **📧 Newsletter** - Email subscription system

### 🛠️ Admin Panel
- **Dashboard** - Overview of content and statistics
- **Analytics** - Detailed metrics and insights
- **Content Management** - Full CRUD for all content types
- **Rich Text Editor** - Tiptap-powered WYSIWYG editor
- **Image Upload** - Drag-and-drop file upload
- **Bulk Actions** - Multi-select and batch operations
- **Search & Filter** - Global search across all content
- **Pagination** - Efficient data loading (10 items/page)
- **Preview Mode** - Preview content before publishing
- **Scheduled Publishing** - Schedule content for future dates
- **Export Data** - Export to CSV and JSON formats
- **User ManagementNEW** - Role-based access control

### 🔐 Authentication & Authorization
- **NextAuth.js** - Secure authentication
- **OAuth Providers** - Google and GitHub login
- **Role-Based Access** - ADMIN, EDITOR, CONTRIBUTOR, USER roles
- **Granular Permissions** - Fine-grained access control

### ⚡ Performance & SEO
- **Server-Side Rendering** - Fast initial page loads
- **Image Optimization** - Next.js Image component
- **Caching** - Smart caching strategies
- **Code Splitting** - Optimized bundle sizes
- **Dynamic Sitemap** - Auto-generated XML sitemap
- **Meta Tags** - Full OG and Twitter Card support
- **Robots.txt** - Search engine directives

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- npm or yarn
- SQLite (development) / PostgreSQL (production)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/bioinformaticshub

# Navigate to directory
cd bioinformaticshub

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the app!

---

## 📁 Project Structure

```
bioinformaticshub.io/
├── app/                      # Next.js 14 App Router
│   ├── (routes)/            # Public and admin routes
│   │   ├── admin/          # Admin panel pages
│   │   ├── blog/           # Blog pages
│   │   ├── directory/      # Tools directory
│   │   └── learn/          # Courses
│   ├── api/                # API routes
│   │   ├── admin/         # Admin API endpoints
│   │   ├── auth/          # Authentication
│   │   └── upload/        # File upload
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Homepage
├── components/              # React components
│   ├── admin/             # Admin-specific components
│   └── ui/                # Reusable UI components
├── lib/                     # Utilities and helpers
│   ├── auth.ts            # NextAuth configuration
│   ├── permissions.ts     # RBAC system
│   ├── cache.ts           # Caching utilities
│   ├── metadata.ts        # SEO configuration
│   └── email-templates.ts # Email templates
├── prisma/                  # Database
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Migration files
├── public/                  # Static assets
│   ├── uploads/           # User uploads
│   └── robots.txt         # SEO directives
└── tests/                   # Test files
```

---

## 🗄️ Database Schema

### Core Models
- **User** - User accounts with roles
- **Tool** - Bioinformatics tools
- **Course** - Educational courses
- **Post** - Blog articles
- **Resource** - Additional resources
- **Category** - Content categorization
- **Subscriber** - Newsletter subscriptions
- **Bookmark** - User-saved items
- **Settings** - Application settings

---

## 🔑 Environment Variables

```env
# Database
DATABASE_URL="file:./dev.db"  # SQLite for dev
# DATABASE_URL="postgresql://..."  # PostgreSQL for prod

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"

# Application
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
NODE_ENV="development"
```

---

## 🎨 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library
- **Tiptap** - Rich text editor

### Backend
- **Prisma** - Type-safe ORM
- **NextAuth.js** - Authentication
- **SQLite** - Development database
- **PostgreSQL** - Production database

### DevOps
- **Vercel** - Hosting platform
- **GitHub Actions** - CI/CD pipeline
- **ESLint** - Code linting
- **Prettier** - Code formatting

---

## 📝 API Documentation

### Admin Endpoints

#### Tools
- `GET /api/admin/tools` - List all tools
- `POST /api/admin/tools` - Create tool
- `GET /api/admin/tools/[id]` - Get single tool
- `PUT /api/admin/tools/[id]` - Update tool
- `DELETE /api/admin/tools/[id]` - Delete tool

#### Posts
- `GET /api/admin/posts` - List all posts
- `POST /api/admin/posts` - Create post
- `PUT /api/admin/posts/[id]` - Update post
- `DELETE /api/admin/posts/[id]` - Delete post

#### Categories
- `GET /api/admin/categories` - List categories
- `POST /api/admin/categories` - Create category
- `PUT /api/admin/categories/[id]` - Update category
- `DELETE /api/admin/categories/[id]` - Delete category

_Full API documentation available in [API.md](./API.md)_

---

## 🧪 Testing

### Manual Testing
```bash
# Run manual test suite
npm run test:manual

# Check feature completion
npm run test:checklist
```

### Performance Testing
```bash
# Run performance benchmarks
npm run test:performance
```

---

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment instructions.

### Quick Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Prisma for the excellent ORM
- Vercel for hosting
- All contributors and users

---

## 📞 Support

- **Documentation**: [docs.bioinformaticshub.io](https://docs.bioinformaticshub.io)
- **Issues**: [GitHub Issues](https://github.com/yourusername/bioinformaticshub/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/bioinformaticshub/discussions)

---

**Built with ❤️ for the Bioinformatics Community**
