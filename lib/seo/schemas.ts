/**
 * Schema.org Structured Data Generator
 * 
 * Generates JSON-LD structured data for SEO optimization.
 * Supports: SoftwareApplication, Course, JobPosting, FAQPage, Organization, BreadcrumbList
 * 
 * @see https://schema.org
 * @see https://developers.google.com/search/docs/appearance/structured-data
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bioinformaticshub.io';
const SITE_NAME = 'BioinformaticsHub.io';

// ============================================
// TYPES
// ============================================

export interface ToolSchemaInput {
  name: string;
  slug: string;
  description: string;
  category?: string;
  subcategory?: string;
  pricing?: string;
  website?: string;
  logo?: string;
  rating?: number;
  reviewCount?: number;
  authorName?: string;
  datePublished?: Date;
  dateModified?: Date;
  features?: string[];
  platforms?: string[];
  license?: string;
}

export interface CourseSchemaInput {
  title: string;
  slug: string;
  description: string;
  provider?: string;
  instructor?: string;
  price?: number;
  currency?: string;
  duration?: string;
  level?: string;
  language?: string;
  rating?: number;
  reviewCount?: number;
  image?: string;
  datePublished?: Date;
}

export interface JobSchemaInput {
  title: string;
  slug: string;
  description: string;
  company: string;
  companyLogo?: string;
  location?: string;
  locationType?: 'REMOTE' | 'ONSITE' | 'HYBRID';
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
    period?: string;
  };
  employmentType?: string;
  datePosted?: Date;
  validThrough?: Date;
  skills?: string[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface BlogPostSchemaInput {
  title: string;
  slug: string;
  description: string;
  content?: string;
  author?: string;
  authorUrl?: string;
  image?: string;
  datePublished?: Date;
  dateModified?: Date;
  tags?: string[];
}

// ============================================
// ORGANIZATION SCHEMA
// ============================================

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: 'Your comprehensive resource for bioinformatics tools, tutorials, and research workflows.',
    sameAs: [
      'https://twitter.com/bioinformaticshub',
      'https://github.com/bioinformaticshub',
      'https://linkedin.com/company/bioinformaticshub',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      url: `${SITE_URL}/contact`,
    },
  };
}

// ============================================
// WEBSITE SCHEMA
// ============================================

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'Discover and compare bioinformatics tools, courses, and resources.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// ============================================
// TOOL/SOFTWARE SCHEMA
// ============================================

export function generateToolSchema(tool: ToolSchemaInput) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    url: `${SITE_URL}/directory/tool/${tool.slug}`,
    description: tool.description,
    applicationCategory: tool.category ? `Bioinformatics > ${tool.category}` : 'Bioinformatics',
    operatingSystem: tool.platforms?.join(', ') || 'Cross-platform',
  };

  // Add optional fields
  if (tool.logo) {
    schema.image = tool.logo;
  }

  if (tool.website) {
    schema.sameAs = tool.website;
  }

  if (tool.pricing) {
    schema.offers = {
      '@type': 'Offer',
      price: tool.pricing.toLowerCase() === 'free' ? '0' : undefined,
      priceCurrency: 'USD',
      availability: 'https://schema.org/OnlineOnly',
      category: tool.pricing,
    };
  }

  if (tool.rating && tool.reviewCount) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: tool.rating.toFixed(1),
      bestRating: '5',
      worstRating: '1',
      ratingCount: tool.reviewCount,
    };
  }

  if (tool.features && tool.features.length > 0) {
    schema.featureList = tool.features.join(', ');
  }

  if (tool.license) {
    schema.license = tool.license;
  }

  if (tool.datePublished) {
    schema.datePublished = tool.datePublished.toISOString();
  }

  if (tool.dateModified) {
    schema.dateModified = tool.dateModified.toISOString();
  }

  // Publisher info
  schema.publisher = {
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
  };

  return schema;
}

// ============================================
// COURSE SCHEMA
// ============================================

export function generateCourseSchema(course: CourseSchemaInput) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    url: `${SITE_URL}/courses/${course.slug}`,
    description: course.description,
    provider: {
      '@type': 'Organization',
      name: course.provider || SITE_NAME,
      url: SITE_URL,
    },
  };

  if (course.instructor) {
    schema.instructor = {
      '@type': 'Person',
      name: course.instructor,
    };
  }

  if (course.image) {
    schema.image = course.image;
  }

  if (course.price !== undefined) {
    schema.offers = {
      '@type': 'Offer',
      price: course.price.toString(),
      priceCurrency: course.currency || 'USD',
      availability: 'https://schema.org/OnlineOnly',
      category: course.price === 0 ? 'Free' : 'Paid',
    };
  }

  if (course.duration) {
    schema.timeRequired = course.duration;
  }

  if (course.level) {
    schema.educationalLevel = course.level;
  }

  if (course.language) {
    schema.inLanguage = course.language;
  }

  if (course.rating && course.reviewCount) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: course.rating.toFixed(1),
      bestRating: '5',
      worstRating: '1',
      ratingCount: course.reviewCount,
    };
  }

  if (course.datePublished) {
    schema.datePublished = course.datePublished.toISOString();
  }

  return schema;
}

// ============================================
// JOB POSTING SCHEMA
// ============================================

export function generateJobSchema(job: JobSchemaInput) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    url: `${SITE_URL}/jobs/${job.slug}`,
    description: job.description,
    datePosted: job.datePosted?.toISOString() || new Date().toISOString(),
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company,
      logo: job.companyLogo,
    },
  };

  // Location
  if (job.locationType === 'REMOTE') {
    schema.jobLocationType = 'TELECOMMUTE';
    schema.applicantLocationRequirements = {
      '@type': 'Country',
      name: 'Worldwide',
    };
  } else if (job.location) {
    schema.jobLocation = {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location,
      },
    };
  }

  // Salary
  if (job.salary) {
    schema.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: job.salary.currency || 'USD',
      value: {
        '@type': 'QuantitativeValue',
        minValue: job.salary.min,
        maxValue: job.salary.max,
        unitText: job.salary.period || 'YEAR',
      },
    };
  }

  // Employment type
  if (job.employmentType) {
    const typeMap: Record<string, string> = {
      'full-time': 'FULL_TIME',
      'part-time': 'PART_TIME',
      'contract': 'CONTRACTOR',
      'internship': 'INTERN',
      'temporary': 'TEMPORARY',
    };
    schema.employmentType = typeMap[job.employmentType.toLowerCase()] || 'FULL_TIME';
  }

  // Valid through
  if (job.validThrough) {
    schema.validThrough = job.validThrough.toISOString();
  }

  // Skills
  if (job.skills && job.skills.length > 0) {
    schema.skills = job.skills.join(', ');
  }

  return schema;
}

// ============================================
// FAQ SCHEMA
// ============================================

export function generateFAQSchema(faqs: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// ============================================
// BREADCRUMB SCHEMA
// ============================================

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

// ============================================
// BLOG POST / ARTICLE SCHEMA
// ============================================

export function generateArticleSchema(post: BlogPostSchemaInput) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    url: `${SITE_URL}/blog/${post.slug}`,
    description: post.description,
    author: {
      '@type': 'Person',
      name: post.author || 'BioinformaticsHub Team',
      url: post.authorUrl || SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    datePublished: post.datePublished?.toISOString() || new Date().toISOString(),
    dateModified: post.dateModified?.toISOString() || post.datePublished?.toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${post.slug}`,
    },
  };

  if (post.image) {
    schema.image = post.image;
  }

  if (post.tags && post.tags.length > 0) {
    schema.keywords = post.tags.join(', ');
  }

  return schema;
}

// ============================================
// PRODUCT / TOOL COMPARISON SCHEMA
// ============================================

export function generateComparisonSchema(tools: ToolSchemaInput[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Bioinformatics Tool Comparison',
    description: `Comparison of ${tools.length} bioinformatics tools`,
    numberOfItems: tools.length,
    itemListElement: tools.map((tool, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'SoftwareApplication',
        name: tool.name,
        url: `${SITE_URL}/directory/tool/${tool.slug}`,
        description: tool.description,
        aggregateRating: tool.rating ? {
          '@type': 'AggregateRating',
          ratingValue: tool.rating.toFixed(1),
          ratingCount: tool.reviewCount || 0,
        } : undefined,
      },
    })),
  };
}

// ============================================
// HELPER: Generate JSON-LD Script Tag
// ============================================

export function generateJsonLd(schema: Record<string, unknown> | Record<string, unknown>[]) {
  return JSON.stringify(schema);
}

// ============================================
// HELPER: Combine Multiple Schemas
// ============================================

export function combineSchemas(...schemas: Record<string, unknown>[]) {
  return schemas;
}
