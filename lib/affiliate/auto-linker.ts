/**
 * Auto-Affiliate Link Insertion System
 * 
 * Automatically inserts affiliate links into content based on:
 * - Keyword matching (product names, categories)
 * - Context analysis (sentence structure, intent)
 * - Placement rules (density limits, exclusion zones)
 */

import { prisma } from '@/lib/prisma';
import { generateShortCode, buildShortUrl } from './link-generator';

// Types
export interface LinkRule {
  id: string;
  keyword: string;
  productId: string;
  partnerId: string;
  priority: number;
  caseSensitive: boolean;
  wholeWord: boolean;
  maxPerPage: number;
}

export interface InsertionResult {
  originalContent: string;
  processedContent: string;
  insertedLinks: Array<{
    keyword: string;
    productId: string;
    position: number;
    shortCode: string;
  }>;
  stats: {
    totalKeywordsFound: number;
    linksInserted: number;
    linksSkipped: number;
    processingTimeMs: number;
  };
}

export interface AutoLinkConfig {
  enabled: boolean;
  maxLinksPerPage: number;
  maxLinksPerParagraph: number;
  minWordsBetweenLinks: number;
  excludedElements: string[];
  disclosureRequired: boolean;
  trackingEnabled: boolean;
}

// Default configuration
const DEFAULT_CONFIG: AutoLinkConfig = {
  enabled: true,
  maxLinksPerPage: 10,
  maxLinksPerParagraph: 2,
  minWordsBetweenLinks: 50,
  excludedElements: ['code', 'pre', 'script', 'style', 'a', 'h1', 'h2', 'h3'],
  disclosureRequired: true,
  trackingEnabled: true,
};

/**
 * Get active link rules from the database
 */
export async function getLinkRules(): Promise<LinkRule[]> {
  const products = await prisma.affiliateProduct.findMany({
    where: { status: 'active' },
    select: {
      id: true,
      productName: true,
      partnerId: true,
      slug: true,
      tags: true,
    },
  });

  const rules: LinkRule[] = [];

  for (const product of products) {
    // Add product name as a rule
    rules.push({
      id: `${product.id}-name`,
      keyword: product.productName,
      productId: product.id,
      partnerId: product.partnerId,
      priority: 10,
      caseSensitive: false,
      wholeWord: true,
      maxPerPage: 2,
    });

    // Add tags as rules
    if (product.tags) {
      try {
        const tags = JSON.parse(product.tags) as string[];
        for (const tag of tags) {
          if (tag.length >= 4) { // Only tags with 4+ characters
            rules.push({
              id: `${product.id}-tag-${tag}`,
              keyword: tag,
              productId: product.id,
              partnerId: product.partnerId,
              priority: 5,
              caseSensitive: false,
              wholeWord: true,
              maxPerPage: 1,
            });
          }
        }
      } catch {}
    }
  }

  // Sort by priority (highest first) and keyword length (longest first for better matching)
  return rules.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return b.keyword.length - a.keyword.length;
  });
}

/**
 * Get or create an affiliate link for auto-insertion
 */
async function getOrCreateLink(productId: string, placement: string): Promise<string> {
  // Check if a link already exists for this product and placement
  const existingLink = await prisma.affiliateLink.findFirst({
    where: {
      productId,
      placementType: placement,
      status: 'active',
    },
    select: { shortCode: true },
  });

  if (existingLink) {
    return existingLink.shortCode;
  }

  // Get product details
  const product = await prisma.affiliateProduct.findUnique({
    where: { id: productId },
    select: { affiliateUrl: true, partnerId: true },
  });

  if (!product?.affiliateUrl) {
    throw new Error(`Product ${productId} has no affiliate URL`);
  }

  // Create a new link
  const shortCode = generateShortCode(5);
  
  await prisma.affiliateLink.create({
    data: {
      shortCode,
      originalUrl: product.affiliateUrl,
      partnerId: product.partnerId,
      productId,
      placementType: placement,
      status: 'active',
    },
  });

  return shortCode;
}

/**
 * Build affiliate link HTML
 */
function buildLinkHtml(shortCode: string, text: string, config: AutoLinkConfig): string {
  const url = buildShortUrl(shortCode);
  
  const disclosure = config.disclosureRequired 
    ? ' <span class="affiliate-indicator" title="Affiliate link">*</span>'
    : '';

  return `<a href="${url}" target="_blank" rel="noopener sponsored" class="affiliate-link">${text}</a>${disclosure}`;
}

/**
 * Check if position is within an excluded element
 */
function isInExcludedElement(content: string, position: number, excludedElements: string[]): boolean {
  // Simple check - look for opening tags before this position
  const beforePosition = content.substring(0, position);
  
  for (const element of excludedElements) {
    const openTagRegex = new RegExp(`<${element}[^>]*>`, 'gi');
    const closeTagRegex = new RegExp(`</${element}>`, 'gi');
    
    const openMatches = [...beforePosition.matchAll(openTagRegex)];
    const closeMatches = [...beforePosition.matchAll(closeTagRegex)];
    
    // If we have more opens than closes, we're inside this element
    if (openMatches.length > closeMatches.length) {
      return true;
    }
  }
  
  return false;
}

/**
 * Main function to process content and insert affiliate links
 */
export async function insertAffiliateLinks(
  content: string,
  config: Partial<AutoLinkConfig> = {}
): Promise<InsertionResult> {
  const startTime = Date.now();
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  
  if (!fullConfig.enabled) {
    return {
      originalContent: content,
      processedContent: content,
      insertedLinks: [],
      stats: {
        totalKeywordsFound: 0,
        linksInserted: 0,
        linksSkipped: 0,
        processingTimeMs: Date.now() - startTime,
      },
    };
  }

  const rules = await getLinkRules();
  const insertedLinks: InsertionResult['insertedLinks'] = [];
  let processedContent = content;
  let totalFound = 0;
  let skipped = 0;

  // Track insertions to avoid overlaps
  const insertedPositions: Array<{ start: number; end: number }> = [];
  const productCounts: Record<string, number> = {};
  const pageLinkCount = { count: 0 };

  for (const rule of rules) {
    if (pageLinkCount.count >= fullConfig.maxLinksPerPage) break;
    
    // Check product count
    if ((productCounts[rule.productId] || 0) >= rule.maxPerPage) continue;

    // Build regex for finding keyword
    const flags = rule.caseSensitive ? 'g' : 'gi';
    const boundary = rule.wholeWord ? '\\b' : '';
    const escapedKeyword = rule.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`${boundary}${escapedKeyword}${boundary}`, flags);

    let match: RegExpExecArray | null;
    while ((match = regex.exec(processedContent)) !== null) {
      totalFound++;
      
      // Check if we've hit limits
      if (pageLinkCount.count >= fullConfig.maxLinksPerPage) {
        skipped++;
        continue;
      }
      
      if ((productCounts[rule.productId] || 0) >= rule.maxPerPage) {
        skipped++;
        continue;
      }

      // Check if in excluded element
      if (isInExcludedElement(processedContent, match.index, fullConfig.excludedElements)) {
        skipped++;
        continue;
      }

      // Check if overlapping with existing insertion
      const matchEnd = match.index + match[0].length;
      const matchIndex = match.index;
      const overlaps = insertedPositions.some(
        pos => !(matchEnd <= pos.start || matchIndex >= pos.end)
      );
      
      if (overlaps) {
        skipped++;
        continue;
      }

      // Check minimum distance from other links
      const tooClose = insertedPositions.some(pos => {
        const distance = Math.min(
          Math.abs(matchIndex - pos.end),
          Math.abs(pos.start - matchEnd)
        );
        return distance < fullConfig.minWordsBetweenLinks * 5; // Approximate chars
      });

      if (tooClose) {
        skipped++;
        continue;
      }

      try {
        // Get or create the link
        const shortCode = await getOrCreateLink(rule.productId, 'auto_insert');
        const linkHtml = buildLinkHtml(shortCode, match[0], fullConfig);

        // Replace the match with the link
        processedContent = 
          processedContent.substring(0, match.index) +
          linkHtml +
          processedContent.substring(matchEnd);

        // Track the insertion
        insertedLinks.push({
          keyword: match[0],
          productId: rule.productId,
          position: match.index,
          shortCode,
        });

        insertedPositions.push({
          start: match.index,
          end: match.index + linkHtml.length,
        });

        productCounts[rule.productId] = (productCounts[rule.productId] || 0) + 1;
        pageLinkCount.count++;

        // Update regex index since content length changed
        regex.lastIndex = match.index + linkHtml.length;
      } catch (error) {
        console.error('Failed to create affiliate link:', error);
        skipped++;
      }
    }
  }

  return {
    originalContent: content,
    processedContent,
    insertedLinks,
    stats: {
      totalKeywordsFound: totalFound,
      linksInserted: insertedLinks.length,
      linksSkipped: skipped,
      processingTimeMs: Date.now() - startTime,
    },
  };
}

/**
 * Process a blog post and insert affiliate links
 */
export async function processPostContent(
  postId: string,
  saveChanges: boolean = false
): Promise<InsertionResult | null> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, content: true },
  });

  if (!post?.content) return null;

  const result = await insertAffiliateLinks(post.content);

  if (saveChanges && result.insertedLinks.length > 0) {
    await prisma.post.update({
      where: { id: postId },
      data: { content: result.processedContent },
    });
  }

  return result;
}

/**
 * Batch process multiple posts
 */
export async function batchProcessPosts(
  postIds: string[],
  saveChanges: boolean = false
): Promise<Map<string, InsertionResult>> {
  const results = new Map<string, InsertionResult>();

  for (const postId of postIds) {
    const result = await processPostContent(postId, saveChanges);
    if (result) {
      results.set(postId, result);
    }
  }

  return results;
}

/**
 * Preview affiliate link insertions without saving
 */
export async function previewInsertions(content: string): Promise<InsertionResult> {
  return insertAffiliateLinks(content, { trackingEnabled: false });
}

/**
 * Get CSS for affiliate link styling
 */
export function getAffiliateStyles(): string {
  return `
    .affiliate-link {
      color: #10b981;
      text-decoration: none;
      border-bottom: 1px dashed #10b98180;
    }
    .affiliate-link:hover {
      border-bottom-color: #10b981;
    }
    .affiliate-indicator {
      font-size: 0.7em;
      color: #9ca3af;
      vertical-align: super;
      cursor: help;
    }
  `;
}
