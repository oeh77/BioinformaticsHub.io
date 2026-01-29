/**
 * Structured Data (Schema.org JSON-LD) Generator
 * 
 * Generates rich snippets for Google Search Results:
 * - Organization
 * - WebSite with SearchAction
 * - Article / HowTo
 * - SoftwareApplication (Tools)
 * - Course
 * - BreadcrumbList
 * - FAQPage
 */

import { siteConfig } from "./config";

// Base types
interface SchemaBase {
  "@context": "https://schema.org";
  "@type": string;
}

/**
 * Organization schema (site-wide)
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    description: siteConfig.description,
    sameAs: [
      "https://twitter.com/bioinformaticshub",
      "https://github.com/bioinformaticshub",
      "https://linkedin.com/company/bioinformaticshub",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      email: "support@bioinformaticshub.io",
      availableLanguage: ["English"],
    },
  };
}

/**
 * WebSite schema with SearchAction (for sitelinks searchbox)
 */
export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Article schema for blog posts
 */
export function generateArticleSchema(post: {
  title: string;
  excerpt?: string | null;
  content?: string | null;
  slug: string;
  image?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  author?: { name: string; image?: string | null } | null;
  category?: { name: string } | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || "",
    image: post.image || `${siteConfig.url}/og-default.png`,
    url: `${siteConfig.url}/blog/${post.slug}`,
    datePublished: post.createdAt?.toISOString(),
    dateModified: post.updatedAt?.toISOString() || post.createdAt?.toISOString(),
    author: {
      "@type": "Person",
      name: post.author?.name || "BioinformaticsHub Team",
      url: siteConfig.url,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/blog/${post.slug}`,
    },
    articleSection: post.category?.name || "Bioinformatics",
    keywords: siteConfig.keywords.join(", "),
  };
}

/**
 * HowTo schema for tutorials
 */
export function generateHowToSchema(tutorial: {
  title: string;
  description: string;
  slug: string;
  image?: string | null;
  steps?: Array<{ name: string; text: string; image?: string }>;
  totalTime?: string; // ISO 8601 duration, e.g., "PT30M"
  tools?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: tutorial.title,
    description: tutorial.description,
    image: tutorial.image || `${siteConfig.url}/og-default.png`,
    totalTime: tutorial.totalTime || "PT30M",
    tool: tutorial.tools?.map((tool) => ({
      "@type": "HowToTool",
      name: tool,
    })),
    step: tutorial.steps?.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      image: step.image,
    })) || [],
    url: `${siteConfig.url}/tutorials/${tutorial.slug}`,
  };
}

/**
 * SoftwareApplication schema for tools
 */
export function generateToolSchema(tool: {
  name: string;
  description: string;
  slug: string;
  url?: string | null;
  image?: string | null;
  pricing?: string | null;
  category?: { name: string } | null;
}) {
  const offers = tool.pricing === "Free" ? {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  } : tool.pricing === "Freemium" ? {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free tier available with premium options",
  } : tool.pricing === "Paid" ? {
    "@type": "Offer",
    price: "varies",
    priceCurrency: "USD",
  } : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    url: tool.url || `${siteConfig.url}/directory/tool/${tool.slug}`,
    image: tool.image || `${siteConfig.url}/og-default.png`,
    applicationCategory: tool.category?.name || "Bioinformatics",
    operatingSystem: "Web, Linux, macOS, Windows",
    offers,
    review: {
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: "4.5",
        bestRating: "5",
      },
      author: {
        "@type": "Organization",
        name: siteConfig.name,
      },
    },
  };
}

/**
 * Course schema
 */
export function generateCourseSchema(course: {
  title: string;
  description: string;
  slug: string;
  provider?: string | null;
  url?: string | null;
  image?: string | null;
  level?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description,
    url: course.url || `${siteConfig.url}/courses/${course.slug}`,
    image: course.image,
    provider: {
      "@type": "Organization",
      name: course.provider || siteConfig.name,
      sameAs: siteConfig.url,
    },
    educationalLevel: course.level || "Beginner",
    inLanguage: "en",
    isAccessibleForFree: true,
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Online",
    },
  };
}

/**
 * BreadcrumbList schema
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${siteConfig.url}${item.url}`,
    })),
  };
}

/**
 * FAQPage schema
 */
export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Dataset schema (for research data)
 */
export function generateDatasetSchema(dataset: {
  name: string;
  description: string;
  url: string;
  license?: string;
  creator?: string;
  datePublished?: Date;
  keywords?: string[];
  downloadUrl?: string;
  format?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: dataset.name,
    description: dataset.description,
    url: dataset.url,
    license: dataset.license || "https://creativecommons.org/licenses/by/4.0/",
    creator: {
      "@type": "Organization",
      name: dataset.creator || siteConfig.name,
    },
    datePublished: dataset.datePublished?.toISOString(),
    keywords: dataset.keywords?.join(", ") || siteConfig.keywords.join(", "),
    distribution: dataset.downloadUrl ? {
      "@type": "DataDownload",
      contentUrl: dataset.downloadUrl,
      encodingFormat: dataset.format || "application/json",
    } : undefined,
  };
}

/**
 * JSON-LD script tag component helper
 */
export function jsonLdScript(schema: Record<string, unknown>): string {
  return JSON.stringify(schema);
}

/**
 * Combine multiple schemas into an array
 */
export function combineSchemas(...schemas: Record<string, unknown>[]): string {
  return JSON.stringify(schemas);
}
