/**
 * Affiliate Link Generator
 * 
 * Utilities for generating, managing, and validating affiliate links.
 */

import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import type { LinkGenerationOptions } from './types';

// Base URL for short links
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://bioinformaticshub.io';

/**
 * Generate a unique short code for affiliate links
 */
export function generateShortCode(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[randomBytes[i] % chars.length];
  }
  return result;
}

/**
 * Generate a readable short code based on partner and product
 */
export function generateReadableShortCode(
  partnerSlug: string,
  productSlug?: string
): string {
  const prefix = 'bh'; // BioinformaticsHub
  const partnerCode = partnerSlug.slice(0, 4).toLowerCase();
  const productCode = productSlug ? productSlug.slice(0, 4).toLowerCase() : '';
  const random = generateShortCode(4);
  
  return productCode 
    ? `${prefix}-${partnerCode}-${productCode}-${random}`
    : `${prefix}-${partnerCode}-${random}`;
}

/**
 * Build a tracking URL with UTM parameters
 */
export function buildTrackingUrl(
  originalUrl: string,
  options: {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    shortCode?: string;
    customParams?: Record<string, string>;
  }
): string {
  const url = new URL(originalUrl);
  
  // Add UTM parameters
  if (options.utmSource) {
    url.searchParams.set('utm_source', options.utmSource);
  }
  if (options.utmMedium) {
    url.searchParams.set('utm_medium', options.utmMedium);
  }
  if (options.utmCampaign) {
    url.searchParams.set('utm_campaign', options.utmCampaign);
  }
  
  // Add custom tracking parameter
  if (options.shortCode) {
    url.searchParams.set('ref', options.shortCode);
  }
  
  // Add any custom parameters
  if (options.customParams) {
    Object.entries(options.customParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  
  return url.toString();
}

/**
 * Generate the short URL for a link
 */
export function buildShortUrl(shortCode: string): string {
  return `${BASE_URL}/go/${shortCode}`;
}

/**
 * Create a new affiliate link
 */
export async function createAffiliateLink(
  options: LinkGenerationOptions
): Promise<{
  id: string;
  shortCode: string;
  shortUrl: string;
  trackingUrl: string;
}> {
  // Get partner info
  const partner = await prisma.affiliatePartner.findUnique({
    where: { id: options.partnerId },
  });
  
  if (!partner) {
    throw new Error('Partner not found');
  }
  
  // Get product info if provided
  let product = null;
  if (options.productId) {
    product = await prisma.affiliateProduct.findUnique({
      where: { id: options.productId },
    });
  }
  
  // Generate short code
  const shortCode = generateReadableShortCode(
    partner.slug,
    product?.slug
  );
  
  // Build URLs
  const trackingUrl = buildTrackingUrl(options.originalUrl, {
    utmSource: options.utmSource || 'bioinformaticshub',
    utmMedium: options.utmMedium || options.placementType || 'affiliate',
    utmCampaign: options.utmCampaign,
    shortCode,
    customParams: options.customParameters,
  });
  
  const shortUrl = buildShortUrl(shortCode);
  
  // Create the link in database
  const link = await prisma.affiliateLink.create({
    data: {
      shortCode,
      partnerId: options.partnerId,
      productId: options.productId,
      originalUrl: options.originalUrl,
      trackingUrl,
      shortUrl,
      linkType: options.linkType || 'product',
      placementType: options.placementType || 'content',
      utmSource: options.utmSource || 'bioinformaticshub',
      utmMedium: options.utmMedium || 'affiliate',
      utmCampaign: options.utmCampaign,
      customParameters: options.customParameters 
        ? JSON.stringify(options.customParameters) 
        : null,
      expiresAt: options.expiresAt,
      status: 'active',
    },
  });
  
  return {
    id: link.id,
    shortCode: link.shortCode,
    shortUrl: link.shortUrl || shortUrl,
    trackingUrl: link.trackingUrl || trackingUrl,
  };
}

/**
 * Get affiliate link by short code
 */
export async function getLinkByShortCode(shortCode: string) {
  return prisma.affiliateLink.findUnique({
    where: { shortCode },
    include: {
      partner: true,
      product: true,
    },
  });
}

/**
 * Check if a link is valid and active
 */
export async function isLinkValid(shortCode: string): Promise<boolean> {
  const link = await prisma.affiliateLink.findUnique({
    where: { shortCode },
    include: {
      partner: true,
    },
  });
  
  if (!link) return false;
  if (link.status !== 'active') return false;
  if (link.expiresAt && new Date(link.expiresAt) < new Date()) return false;
  if (link.partner.status !== 'active') return false;
  
  return true;
}

/**
 * Increment click count for a link
 */
export async function incrementLinkClicks(linkId: string): Promise<void> {
  await prisma.affiliateLink.update({
    where: { id: linkId },
    data: {
      totalClicks: { increment: 1 },
    },
  });
}

/**
 * Increment conversion count for a link
 */
export async function incrementLinkConversions(linkId: string): Promise<void> {
  await prisma.affiliateLink.update({
    where: { id: linkId },
    data: {
      totalConversions: { increment: 1 },
    },
  });
}

/**
 * Validate a URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check link health (HTTP status)
 */
export async function checkLinkHealth(
  url: string
): Promise<{ status: number; healthy: boolean }> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
    });
    return {
      status: response.status,
      healthy: response.status >= 200 && response.status < 400,
    };
  } catch {
    return {
      status: 0,
      healthy: false,
    };
  }
}

/**
 * Bulk check link health for all active links
 */
export async function checkAllLinksHealth(): Promise<{
  total: number;
  healthy: number;
  unhealthy: Array<{ id: string; shortCode: string; url: string; status: number }>;
}> {
  const activeLinks = await prisma.affiliateLink.findMany({
    where: { status: 'active' },
    select: {
      id: true,
      shortCode: true,
      originalUrl: true,
    },
  });
  
  const results = await Promise.all(
    activeLinks.map(async (link) => {
      const health = await checkLinkHealth(link.originalUrl);
      return {
        ...link,
        url: link.originalUrl,
        ...health,
      };
    })
  );
  
  const unhealthy = results.filter((r) => !r.healthy);
  
  return {
    total: results.length,
    healthy: results.length - unhealthy.length,
    unhealthy: unhealthy.map(({ id, shortCode, url, status }) => ({
      id,
      shortCode,
      url,
      status,
    })),
  };
}
