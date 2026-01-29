# SEO & Performance Implementation Guide

## Overview

BioinformaticsHub.io has been equipped with a comprehensive SEO and performance optimization system.

## Phase Implementations

### ✅ Phase 1: Elasticsearch Foundation
- **Status**: Complete
- **Files**: `lib/elasticsearch/`

### ✅ Phase 2: Core SEO Infrastructure
- **Status**: Complete
- **Features**:
  - Dynamic meta tags with templates
  - Schema.org structured data (7+ types)
  - Dynamic sitemaps
  - Robots.txt

### ✅ Phase 3: Content Optimization
- **Status**: Complete
- **Features**:
  - SEO content analyzer
  - Keyword density analysis
  - Readability scoring
  - Internal linking engine
  - Orphan page detection

### ✅ Phase 4: Performance Optimization
- **Status**: Complete
- **Features**:
  - Optimized image components
  - In-memory caching with TTL
  - Request deduplication
  - HTTP cache headers
  - Core Web Vitals monitoring

### ✅ Phase 5: Advanced Search
- **Status**: Complete
- **Features**:
  - Full-text search with highlighting
  - Faceted search (filters)
  - Autocomplete suggestions
  - Related content recommendations
  - Search analytics tracking

---

## File Structure

```
lib/
├── seo/
│   ├── index.ts           # Main exports
│   ├── config.ts          # SEO configuration & meta tags
│   ├── schema.ts          # Schema.org JSON-LD generators
│   ├── sitemap.ts         # Sitemap utilities
│   ├── content-analyzer.ts # SEO content analysis
│   └── internal-linking.ts # Related content & linking
├── elasticsearch/
│   ├── client.ts          # ES client configuration
│   ├── mappings.ts        # Index schemas
│   ├── indexing.ts        # Data sync operations
│   ├── search.ts          # Search queries
│   └── index.ts           # Unified exports
├── performance-cache.ts   # Caching utilities
└── cache.ts               # (existing) base caching

components/
├── seo/
│   └── json-ld.tsx        # Structured data component
├── analytics/
│   └── web-vitals.tsx     # Core Web Vitals monitoring
├── search/
│   └── advanced-search.tsx # Enhanced search UI
├── content/
│   └── related-content.tsx # Related content display
└── ui/
    └── optimized-image.tsx # Performance-optimized images

app/
├── robots.ts              # Dynamic robots.txt
├── sitemap.ts             # Dynamic sitemap
├── sitemap_*.xml/         # Category-specific sitemaps
└── api/
    ├── search/
    │   ├── route.ts       # Basic search API
    │   └── advanced/route.ts # Enhanced search API
    └── content/
        └── related/route.ts # Related content API
```

---

## Usage Examples

### 1. Meta Tags in Pages

```tsx
// app/(routes)/blog/[slug]/page.tsx
import { generatePostMeta, toNextMetadata } from "@/lib/seo";

export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  const seo = generatePostMeta(post);
  return toNextMetadata(seo);
}
```

### 2. Structured Data

```tsx
// In any page component
import { JsonLd } from "@/components/seo/json-ld";
import { generateArticleSchema } from "@/lib/seo";

export default function BlogPost({ post }) {
  return (
    <>
      <JsonLd data={generateArticleSchema(post)} />
      {/* page content */}
    </>
  );
}
```

### 3. Content Analysis

```typescript
import { analyzeContent, generateImprovementPlan } from "@/lib/seo";

const analysis = analyzeContent({
  title: "RNA-seq Analysis Guide",
  description: "Learn RNA-seq...",
  body: articleContent,
  targetKeyword: "rna-seq analysis",
});

console.log(`SEO Score: ${analysis.score}/100`);
console.log(generateImprovementPlan(analysis));
```

### 4. Related Content

```tsx
import { RelatedContent } from "@/components/content/related-content";

export default function ToolPage({ tool }) {
  return (
    <div>
      {/* Tool content */}
      <RelatedContent
        contentId={tool.id}
        contentType="tool"
        title={tool.name}
        content={tool.description}
        limit={4}
      />
    </div>
  );
}
```

### 5. Advanced Search

```tsx
import { AdvancedSearch } from "@/components/search/advanced-search";

export default function SearchPage() {
  return (
    <div className="container py-8">
      <h1>Search</h1>
      <AdvancedSearch showFilters={true} />
    </div>
  );
}
```

### 6. Web Vitals Monitoring

```tsx
// app/layout.tsx
import { WebVitalsProvider } from "@/components/analytics/web-vitals";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <WebVitalsProvider>
          {children}
        </WebVitalsProvider>
      </body>
    </html>
  );
}
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/search` | GET | Basic search |
| `/api/search/advanced` | GET | Enhanced search with facets |
| `/api/content/related` | GET | Find related content |
| `/sitemap.xml` | GET | Dynamic sitemap |
| `/robots.txt` | GET | Dynamic robots.txt |
| `/sitemap_tools.xml` | GET | Tools sitemap |
| `/sitemap_posts.xml` | GET | Posts sitemap |
| `/sitemap_courses.xml` | GET | Courses sitemap |

### Search API Parameters

```
GET /api/search/advanced?
  q=search+term
  &type=tools|posts|courses|all
  &category=rna-seq-analysis
  &pricing=Free|Paid|Freemium
  &level=Beginner|Intermediate|Advanced
  &page=1
  &limit=12
  &sort=relevance|newest|name
  &mode=search|autocomplete|suggest
```

---

## Environment Variables

```env
# SEO
NEXT_PUBLIC_SITE_URL=https://bioinformaticshub.io
GOOGLE_SITE_VERIFICATION=your_verification_code

# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_INDEX_PREFIX=biohub
ELASTICSEARCH_ENABLED=true

# Analytics (optional)
NEXT_PUBLIC_ANALYTICS_ENDPOINT=/api/analytics
```

---

## SEO Checklist

- [x] Dynamic meta tags (title, description)
- [x] Open Graph tags
- [x] Twitter Cards
- [x] Canonical URLs
- [x] Schema.org structured data
  - [x] Organization
  - [x] WebSite with SearchAction
  - [x] Article
  - [x] SoftwareApplication
  - [x] Course
  - [x] HowTo
  - [x] FAQPage
  - [x] BreadcrumbList
- [x] Dynamic sitemap
- [x] Robots.txt
- [x] Internal linking suggestions
- [x] Content quality analyzer
- [x] Keyword density analysis
- [x] Readability scoring

## Performance Checklist

- [x] Lazy loading images
- [x] Blur-up placeholders
- [x] Response caching
- [x] Request deduplication
- [x] Core Web Vitals monitoring
- [x] HTTP cache headers
- [ ] CDN configuration (Vercel handles this)
- [ ] Service Worker (optional)

---

## Next Steps

1. **Add Google Search Console**: Verify domain and monitor indexing
2. **Add Google Analytics 4**: Track user behavior and conversions
3. **Build Link**: Submit to directories, guest posts, etc.
4. **Monitor Performance**: Review Core Web Vitals regularly
5. **Content Optimization**: Use the analyzer for all new content
