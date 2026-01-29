/**
 * SEO Module - Main Export
 * 
 * Provides unified access to all SEO utilities
 */

// Configuration & Meta Tags
export {
  siteConfig,
  metaTemplates,
  generateToolMeta,
  generatePostMeta,
  generateCourseMeta,
  generateCategoryMeta,
  generateSearchMeta,
  toNextMetadata,
  type SEOMetadata,
  type ContentType,
} from "./config";

// Schema.org Structured Data
export {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateArticleSchema,
  generateHowToSchema,
  generateToolSchema,
  generateCourseSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateDatasetSchema,
  jsonLdScript,
  combineSchemas,
} from "./schema";

// Content Analysis
export {
  analyzeContent,
  generateImprovementPlan,
  type ContentAnalysis,
  type SEOIssue,
} from "./content-analyzer";

// Internal Linking
export {
  findRelatedContent,
  suggestInternalLinks,
  extractAnchorCandidates,
  findOrphanPages,
  type RelatedContent,
  type LinkSuggestion,
} from "./internal-linking";
