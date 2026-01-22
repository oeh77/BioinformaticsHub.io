<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
</p>

<h1 align="center">🧬 BioinformaticsHub.io</h1>

<p align="center">
  <strong>Your comprehensive platform for bioinformatics tools, courses, and resources</strong>
</p>

<p align="center">
  <a href="https://github.com/oeh77/BioinformaticsHub.io/stargazers"><img src="https://img.shields.io/github/stars/oeh77/BioinformaticsHub.io?style=social" alt="Stars" /></a>
  <a href="https://github.com/oeh77/BioinformaticsHub.io/network/members"><img src="https://img.shields.io/github/forks/oeh77/BioinformaticsHub.io?style=social" alt="Forks" /></a>
  <a href="https://github.com/oeh77/BioinformaticsHub.io/issues"><img src="https://img.shields.io/github/issues/oeh77/BioinformaticsHub.io" alt="Issues" /></a>
  <a href="https://github.com/oeh77/BioinformaticsHub.io/blob/master/LICENSE"><img src="https://img.shields.io/github/license/oeh77/BioinformaticsHub.io" alt="License" /></a>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-documentation">Documentation</a> •
  <a href="#-deployment">Deployment</a>
</p>

---

## 🌟 Overview

**BioinformaticsHub.io** is a modern, full-stack web application built with Next.js 16, TypeScript, Prisma, and NextAuth. It serves as a comprehensive platform for discovering and managing bioinformatics resources, including tools, courses, blog posts, and more.

<p align="center">
  <img src="https://img.shields.io/badge/Status-Production%20Ready-success?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/Version-0.1.0-blue?style=flat-square" alt="Version" />
</p>

---

## ✨ Features

### 🎯 Core Features

| Feature | Description |
|---------|-------------|
| **📚 Tools Directory** | Curated bioinformatics tools with detailed information, filtering, and search |
| **🎓 Courses Catalog** | Online courses and tutorials from various providers |
| **📰 Blog System** | Articles and news about bioinformatics with rich text editing |
| **📂 Resources Library** | Databases, datasets, and documentation |
| **🏷️ Categories** | Organized content categorization |
| **🔖 Bookmarks** | Save favorite items (authenticated users) |
| **📧 Newsletter** | Email subscription system |

### 🛠️ Admin Panel

| Feature | Description |
|---------|-------------|
| **📊 Dashboard** | Overview of content and statistics |
| **📈 Analytics** | Detailed metrics and insights |
| **✏️ Content Management** | Full CRUD for all content types |
| **📝 Rich Text Editor** | Tiptap-powered WYSIWYG editor with code highlighting |
| **🖼️ Image Upload** | Drag-and-drop file upload |
| **⚡ Bulk Actions** | Multi-select and batch operations |
| **🔍 Search & Filter** | Global search across all content |
| **📄 Pagination** | Efficient data loading |
| **👁️ Preview Mode** | Preview content before publishing |
| **⏰ Scheduled Publishing** | Schedule content for future dates |
| **📤 Export Data** | Export to CSV and JSON formats |
| **👥 User Management** | Role-based access control |
| **🔑 API Keys** | Generate and manage API access tokens |
| **🔗 Webhooks** | Configure event-driven integrations |
| **💳 Payment Methods** | User payment configuration |

### 🔐 Authentication & Authorization

- **NextAuth.js v5** - Secure, modern authentication
- **OAuth Providers** - Google and GitHub login integration
- **Credentials Auth** - Email/password authentication
- **Role-Based Access Control** - ADMIN, EDITOR, CONTRIBUTOR, USER roles
- **Granular Permissions** - Fine-grained access control system

### ⚡ Performance & SEO

- **Server-Side Rendering** - Fast initial page loads
- **React 19** - Latest React features including Server Components
- **Image Optimization** - Next.js Image component
- **Smart Caching** - Optimized caching strategies
- **Code Splitting** - Optimized bundle sizes
- **Dynamic Sitemap** - Auto-generated XML sitemap
- **Meta Tags** - Full Open Graph and Twitter Card support
- **Robots.txt** - Search engine directives

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn**
- **SQLite** (development) / **PostgreSQL** (production)

### Installation

```bash
# Clone the repository
git clone https://github.com/oeh77/BioinformaticsHub.io.git

# Navigate to directory
cd BioinformaticsHub.io

# Install dependencies
npm install

# Set up environment variables
cp .env.production.template .env
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

Visit `http://localhost:3000` to see the app! 🎉

---

## 📁 Project Structure

```
BioinformaticsHub.io/
├── 📂 app/                      # Next.js 16 App Router
│   ├── 📂 (routes)/             # Public and admin routes
│   │   ├── 📂 admin/            # Admin panel pages
│   │   │   ├── 📂 analytics/    # Analytics dashboard
│   │   │   ├── 📂 api-keys/     # API key management
│   │   │   ├── 📂 categories/   # Category management
│   │   │   ├── 📂 courses/      # Course management
│   │   │   ├── 📂 posts/        # Blog post management
│   │   │   ├── 📂 resources/    # Resource management
│   │   │   ├── 📂 settings/     # Admin settings
│   │   │   ├── 📂 tools/        # Tool management
│   │   │   ├── 📂 users/        # User management
│   │   │   └── 📂 webhooks/     # Webhook configuration
│   │   ├── 📂 blog/             # Blog pages
│   │   ├── 📂 directory/        # Tools directory
│   │   ├── 📂 learn/            # Courses catalog
│   │   ├── 📂 profile/          # User profile & settings
│   │   └── 📂 resources/        # Resources library
│   ├── 📂 api/                  # API routes
│   │   ├── 📂 admin/            # Admin API endpoints
│   │   ├── 📂 auth/             # Authentication
│   │   └── 📂 upload/           # File upload
│   ├── 📄 layout.tsx            # Root layout
│   ├── 📄 page.tsx              # Homepage
│   └── 📄 globals.css           # Global styles
├── 📂 components/               # React components
│   ├── 📂 admin/                # Admin-specific components
│   └── 📂 ui/                   # Reusable UI components (shadcn/ui)
├── 📂 lib/                      # Utilities and helpers
│   ├── 📄 auth.ts               # NextAuth configuration
│   ├── 📄 permissions.ts        # RBAC system
│   ├── 📄 cache.ts              # Caching utilities
│   ├── 📄 metadata.ts           # SEO configuration
│   └── 📄 email-templates.ts    # Email templates
├── 📂 prisma/                   # Database
│   ├── 📄 schema.prisma         # Database schema
│   ├── 📄 seed.ts               # Database seeding
│   └── 📂 migrations/           # Migration files
├── 📂 public/                   # Static assets
│   ├── 📂 uploads/              # User uploads
│   └── 📄 robots.txt            # SEO directives
├── 📂 hooks/                    # Custom React hooks
├── 📂 types/                    # TypeScript type definitions
└── 📂 scripts/                  # Utility scripts
```

---

## 🗄️ Database Schema

### Core Models

| Model | Description |
|-------|-------------|
| **User** | User accounts with roles and authentication |
| **Tool** | Bioinformatics tools catalog |
| **Course** | Educational courses from various providers |
| **Post** | Blog articles with rich content |
| **Resource** | Additional resources and datasets |
| **Category** | Content categorization |
| **Subscriber** | Newsletter subscriptions |
| **Bookmark** | User-saved items |
| **Settings** | Application configuration |

### Advanced Models

| Model | Description |
|-------|-------------|
| **ApiKey** | API access tokens with scopes and rate limiting |
| **ApiKeyUsage** | API usage tracking and analytics |
| **Webhook** | Event-driven integration endpoints |
| **WebhookDelivery** | Webhook delivery logs |
| **Integration** | Third-party service connections |
| **PaymentMethod** | User payment information |

---

## 🔑 Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="file:./dev.db"                    # SQLite for development
# DATABASE_URL="postgresql://..."               # PostgreSQL for production

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

> 💡 **Tip**: Generate a secure secret with `openssl rand -base64 32`

---

## 🎨 Tech Stack

<table>
<tr>
<td>

### Frontend

| Technology | Version |
|------------|---------|
| Next.js | 16.1.1 |
| React | 19.2.3 |
| TypeScript | 5.x |
| Tailwind CSS | 4.x |
| Framer Motion | 12.x |
| Lucide Icons | 0.562.0 |
| Tiptap Editor | 3.15.3 |

</td>
<td>

### Backend

| Technology | Version |
|------------|---------|
| Prisma ORM | 5.22.0 |
| NextAuth.js | 5.0.0-beta.30 |
| SQLite | Dev DB |
| PostgreSQL | Production |
| Zod | 4.2.1 |
| bcryptjs | 3.0.3 |

</td>
</tr>
</table>

### DevOps & Tools

- **Vercel** - Hosting platform
- **GitHub Actions** - CI/CD pipeline
- **ESLint** - Code linting
- **Prettier** - Code formatting

---

## 📝 API Documentation

### Admin Endpoints

#### Tools API
```
GET    /api/admin/tools          # List all tools
POST   /api/admin/tools          # Create a new tool
GET    /api/admin/tools/[id]     # Get single tool
PUT    /api/admin/tools/[id]     # Update tool
DELETE /api/admin/tools/[id]     # Delete tool
```

#### Posts API
```
GET    /api/admin/posts          # List all posts
POST   /api/admin/posts          # Create a new post
GET    /api/admin/posts/[id]     # Get single post
PUT    /api/admin/posts/[id]     # Update post
DELETE /api/admin/posts/[id]     # Delete post
```

#### Courses API
```
GET    /api/admin/courses        # List all courses
POST   /api/admin/courses        # Create a new course
PUT    /api/admin/courses/[id]   # Update course
DELETE /api/admin/courses/[id]   # Delete course
```

#### Categories API
```
GET    /api/admin/categories     # List all categories
POST   /api/admin/categories     # Create a new category
PUT    /api/admin/categories/[id] # Update category
DELETE /api/admin/categories/[id] # Delete category
```

#### Users API
```
GET    /api/admin/users          # List all users
PUT    /api/admin/users/[id]     # Update user
DELETE /api/admin/users/[id]     # Delete user
```

### Public Endpoints

```
GET    /api/tools                # List published tools
GET    /api/courses              # List published courses
GET    /api/posts                # List published posts
POST   /api/newsletter/subscribe # Subscribe to newsletter
```

---

## 🧪 Testing

```bash
# Run manual test suite
npm run test:manual

# Check feature completion
npm run test:checklist

# Run linting
npm run lint
```

---

## 🚢 Deployment

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/oeh77/BioinformaticsHub.io)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Setup for Production

1. Set up a **PostgreSQL** database (e.g., Neon, Supabase, Railway)
2. Configure **OAuth providers** (Google, GitHub)
3. Set environment variables in Vercel dashboard
4. Deploy!

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Style

- Use **TypeScript** for type safety
- Follow **ESLint** rules
- Use **Prettier** for formatting
- Write meaningful commit messages

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [NextAuth.js](https://next-auth.js.org/) - Authentication for Next.js
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Tiptap](https://tiptap.dev/) - Headless editor framework
- [Vercel](https://vercel.com/) - Deployment platform

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/oeh77/BioinformaticsHub.io/issues)
- **Discussions**: [GitHub Discussions](https://github.com/oeh77/BioinformaticsHub.io/discussions)

---

<p align="center">
  <strong>Built with ❤️ for the Bioinformatics Community</strong>
</p>

<p align="center">
  <sub>Made by <a href="https://github.com/oeh77">@oeh77</a></sub>
</p>
