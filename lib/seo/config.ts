/**
 * SEO Configuration & Meta Tag Utilities
 * 
 * Centralized SEO configuration for BioinformaticsHub.io
 * with dynamic meta tag generation for all content types.
 */

// Site-wide SEO defaults
export const siteConfig = {
  name: "BioinformaticsHub.io",
  description: "Your comprehensive resource for bioinformatics tools, tutorials, and research workflows.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://bioinformaticshub.io",
  ogImage: "/og-default.png",
  twitterHandle: "@bioinformaticshub",
  locale: "en_US",
  keywords: [
    "bioinformatics",
    "computational biology",
    "genomics",
    "proteomics",
    "RNA-seq",
    "sequence analysis",
    "bioinformatics tools",
    "research tutorials",
  ],
};

// Page type templates
export const metaTemplates = {
  home: {
    title: "BioinformaticsHub.io - Bioinformatics Tools, Tutorials & Resources",
    description: "Discover the best bioinformatics tools, tutorials, and resources. From RNA-seq analysis to protein structure prediction - everything you need for computational biology.",
  },
  tool: {
    titleTemplate: "{name} - Bioinformatics Tool | BioinformaticsHub.io",
    descriptionTemplate: "{description} Learn how to use {name} for {category} analysis with tutorials and examples.",
  },
  post: {
    titleTemplate: "{title} | BioinformaticsHub.io Blog",
    descriptionTemplate: "{excerpt}",
  },
  course: {
    titleTemplate: "{title} - Bioinformatics Course | BioinformaticsHub.io",
    descriptionTemplate: "Learn {title}. {description} Perfect for {level} learners.",
  },
  category: {
    titleTemplate: "{name} Tools & Resources | BioinformaticsHub.io",
    descriptionTemplate: "Explore the best {name} tools and tutorials. Compare features, pricing, and find the perfect solution for your research.",
  },
  search: {
    titleTemplate: "Search Results for '{query}' | BioinformaticsHub.io",
    descriptionTemplate: "Find bioinformatics tools and resources matching '{query}'. Discover tutorials, datasets, and research tools.",
  },
};

// Content type definitions
export type ContentType = "tool" | "post" | "course" | "category" | "page";

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "profile";
  twitterCard?: "summary" | "summary_large_image";
  publishedTime?: string;
  modifiedTime?: string;
  author?: {
    name: string;
    url?: string;
  };
  noIndex?: boolean;
  noFollow?: boolean;
}

/**
 * Generate meta tags for a tool page
 */
export function generateToolMeta(tool: {
  name: string;
  description: string;
  slug: string;
  category?: { name: string };
  image?: string | null;
  updatedAt?: Date;
}): SEOMetadata {
  const title = metaTemplates.tool.titleTemplate
    .replace("{name}", tool.name);
  
  const description = metaTemplates.tool.descriptionTemplate
    .replace("{description}", truncate(tool.description, 100))
    .replace("{name}", tool.name)
    .replace("{category}", tool.category?.name || "bioinformatics");

  return {
    title: truncate(title, 60),
    description: truncate(description, 160),
    keywords: [tool.name.toLowerCase(), tool.category?.name?.toLowerCase() || "", "bioinformatics tool"],
    canonical: `${siteConfig.url}/directory/tool/${tool.slug}`,
    ogTitle: tool.name,
    ogDescription: truncate(tool.description, 200),
    ogImage: tool.image || siteConfig.ogImage,
    ogType: "website",
    twitterCard: "summary_large_image",
    modifiedTime: tool.updatedAt?.toISOString(),
  };
}

/**
 * Generate meta tags for a blog post
 */
export function generatePostMeta(post: {
  title: string;
  excerpt?: string | null;
  slug: string;
  image?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  author?: { name: string } | null;
}): SEOMetadata {
  const title = metaTemplates.post.titleTemplate
    .replace("{title}", post.title);
  
  const description = post.excerpt || `Read ${post.title} on BioinformaticsHub.io`;

  return {
    title: truncate(title, 60),
    description: truncate(description, 160),
    canonical: `${siteConfig.url}/blog/${post.slug}`,
    ogTitle: post.title,
    ogDescription: truncate(description, 200),
    ogImage: post.image || siteConfig.ogImage,
    ogType: "article",
    twitterCard: "summary_large_image",
    publishedTime: post.createdAt?.toISOString(),
    modifiedTime: post.updatedAt?.toISOString(),
    author: post.author ? { name: post.author.name } : undefined,
  };
}

/**
 * Generate meta tags for a course page
 */
export function generateCourseMeta(course: {
  title: string;
  description: string;
  slug: string;
  level?: string;
  image?: string | null;
  updatedAt?: Date;
}): SEOMetadata {
  const title = metaTemplates.course.titleTemplate
    .replace("{title}", course.title);
  
  const description = metaTemplates.course.descriptionTemplate
    .replace("{title}", course.title)
    .replace("{description}", truncate(course.description, 80))
    .replace("{level}", course.level || "all");

  return {
    title: truncate(title, 60),
    description: truncate(description, 160),
    keywords: [course.title.toLowerCase(), "bioinformatics course", "tutorial", course.level || ""],
    canonical: `${siteConfig.url}/courses/${course.slug}`,
    ogTitle: course.title,
    ogDescription: truncate(course.description, 200),
    ogImage: course.image || siteConfig.ogImage,
    ogType: "website",
    twitterCard: "summary_large_image",
    modifiedTime: course.updatedAt?.toISOString(),
  };
}

/**
 * Generate meta tags for a category page
 */
export function generateCategoryMeta(category: {
  name: string;
  slug: string;
  description?: string | null;
}): SEOMetadata {
  const title = metaTemplates.category.titleTemplate
    .replace("{name}", category.name);
  
  const description = category.description || 
    metaTemplates.category.descriptionTemplate.replace("{name}", category.name);

  return {
    title: truncate(title, 60),
    description: truncate(description, 160),
    keywords: [category.name.toLowerCase(), "bioinformatics", "tools", "resources"],
    canonical: `${siteConfig.url}/directory/category/${category.slug}`,
    ogTitle: category.name,
    ogDescription: truncate(description, 200),
    ogType: "website",
    twitterCard: "summary",
  };
}

/**
 * Generate search results page meta
 */
export function generateSearchMeta(query: string): SEOMetadata {
  const title = metaTemplates.search.titleTemplate.replace("{query}", query);
  const description = metaTemplates.search.descriptionTemplate.replace("{query}", query);

  return {
    title: truncate(title, 60),
    description: truncate(description, 160),
    noIndex: true, // Don't index search result pages
    noFollow: false,
  };
}

// Helper functions
function truncate(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3).trim() + "...";
}

/**
 * Convert SEO metadata to Next.js Metadata format
 */
export function toNextMetadata(seo: SEOMetadata) {
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    authors: seo.author ? [{ name: seo.author.name, url: seo.author.url }] : undefined,
    openGraph: {
      title: seo.ogTitle || seo.title,
      description: seo.ogDescription || seo.description,
      url: seo.canonical,
      siteName: siteConfig.name,
      images: seo.ogImage ? [{ url: seo.ogImage, width: 1200, height: 630 }] : undefined,
      locale: siteConfig.locale,
      type: seo.ogType || "website",
      publishedTime: seo.publishedTime,
      modifiedTime: seo.modifiedTime,
    },
    twitter: {
      card: seo.twitterCard || "summary_large_image",
      site: siteConfig.twitterHandle,
      title: seo.ogTitle || seo.title,
      description: seo.ogDescription || seo.description,
      images: seo.ogImage ? [seo.ogImage] : undefined,
    },
    alternates: {
      canonical: seo.canonical,
    },
    robots: {
      index: !seo.noIndex,
      follow: !seo.noFollow,
    },
  };
}
