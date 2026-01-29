/**
 * Affiliate Click Tracking
 * 
 * Handles click tracking, session management, and attribution.
 */

import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import type { ClickTrackingData, DeviceType } from './types';
import { incrementLinkClicks } from './link-generator';

// Known bot user agents
const BOT_USER_AGENTS = [
  'googlebot',
  'bingbot',
  'yandexbot',
  'duckduckbot',
  'slurp',
  'baiduspider',
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'embedly',
  'showyoubot',
  'outbrain',
  'pinterest',
  'developers.google.com',
  'slackbot',
  'vkshare',
  'w3c_validator',
  'redditbot',
  'applebot',
  'whatsapp',
  'flipboard',
  'tumblr',
  'bitlybot',
  'skypeuripreview',
  'nuzzel',
  'discordbot',
  'google page speed',
  'qwantify',
  'pinterestbot',
  'bitrix link preview',
  'xing-contenttabreceiver',
  'chrome-lighthouse',
  'telegrambot',
];

/**
 * Generate a session ID for anonymous tracking
 */
export function generateSessionId(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Detect if a user agent is a bot
 */
export function detectBot(userAgent: string): { isBot: boolean; botType?: string } {
  const lowerUA = userAgent.toLowerCase();
  
  for (const bot of BOT_USER_AGENTS) {
    if (lowerUA.includes(bot)) {
      return { isBot: true, botType: bot };
    }
  }
  
  // Check for generic bot patterns
  if (
    lowerUA.includes('bot') ||
    lowerUA.includes('crawler') ||
    lowerUA.includes('spider') ||
    lowerUA.includes('scraper')
  ) {
    return { isBot: true, botType: 'generic' };
  }
  
  return { isBot: false };
}

/**
 * Detect device type from user agent
 */
export function detectDeviceType(userAgent: string): DeviceType {
  const ua = userAgent.toLowerCase();
  
  // Check for tablets first (before mobile)
  if (ua.includes('ipad') || ua.includes('tablet') || ua.includes('playbook')) {
    return 'tablet';
  }
  
  // Check for mobile
  if (
    ua.includes('mobile') ||
    ua.includes('android') ||
    ua.includes('iphone') ||
    ua.includes('ipod') ||
    ua.includes('windows phone') ||
    ua.includes('blackberry')
  ) {
    return 'mobile';
  }
  
  // Check for desktop indicators
  if (
    ua.includes('windows') ||
    ua.includes('macintosh') ||
    ua.includes('linux') ||
    ua.includes('x11')
  ) {
    return 'desktop';
  }
  
  return 'unknown';
}

/**
 * Extract browser name from user agent
 */
export function detectBrowser(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('edg/')) return 'Edge';
  if (ua.includes('chrome') && !ua.includes('chromium')) return 'Chrome';
  if (ua.includes('chromium')) return 'Chromium';
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
  if (ua.includes('opera') || ua.includes('opr')) return 'Opera';
  if (ua.includes('msie') || ua.includes('trident')) return 'Internet Explorer';
  
  return 'Unknown';
}

/**
 * Extract OS from user agent
 */
export function detectOS(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('windows nt 10')) return 'Windows 10';
  if (ua.includes('windows nt 11')) return 'Windows 11';
  if (ua.includes('windows')) return 'Windows';
  if (ua.includes('mac os x')) return 'macOS';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
  if (ua.includes('linux')) return 'Linux';
  if (ua.includes('chromeos')) return 'ChromeOS';
  
  return 'Unknown';
}

/**
 * Anonymize IP address (GDPR compliance)
 */
export function anonymizeIP(ip: string): string {
  if (ip.includes(':')) {
    // IPv6: Keep first 64 bits (4 groups)
    const parts = ip.split(':');
    return parts.slice(0, 4).join(':') + '::';
  } else {
    // IPv4: Zero out last octet
    const parts = ip.split('.');
    if (parts.length === 4) {
      parts[3] = '0';
      return parts.join('.');
    }
  }
  return ip;
}

/**
 * Track an affiliate click
 */
export async function trackClick(data: ClickTrackingData): Promise<string> {
  // Detect bot
  const botDetection = data.userAgent ? detectBot(data.userAgent) : { isBot: false };
  
  // Detect device info
  const deviceType = data.userAgent 
    ? detectDeviceType(data.userAgent) 
    : 'unknown';
  const browser = data.userAgent 
    ? detectBrowser(data.userAgent) 
    : undefined;
  const os = data.userAgent 
    ? detectOS(data.userAgent) 
    : undefined;
  
  // Anonymize IP for privacy
  const anonymizedIP = data.ipAddress 
    ? anonymizeIP(data.ipAddress) 
    : undefined;
  
  // Create click record
  const click = await prisma.affiliateClick.create({
    data: {
      linkId: data.linkId,
      partnerId: data.partnerId,
      productId: data.productId,
      userId: data.userId,
      sessionId: data.sessionId,
      ipAddress: anonymizedIP,
      userAgent: data.userAgent?.slice(0, 500), // Limit length
      referrer: data.referrer?.slice(0, 1000),
      countryCode: data.countryCode,
      deviceType,
      browser,
      os,
      isBot: botDetection.isBot,
      botType: botDetection.botType,
    },
  });
  
  // Increment link click count (async, non-blocking)
  incrementLinkClicks(data.linkId).catch(() => {
    // Silently fail - not critical
  });
  
  return click.id;
}

/**
 * Check if a session has already clicked a link recently
 * (Deduplication within a time window)
 */
export async function hasRecentClick(
  sessionId: string,
  linkId: string,
  windowMinutes: number = 30
): Promise<boolean> {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
  
  const existingClick = await prisma.affiliateClick.findFirst({
    where: {
      sessionId,
      linkId,
      clickedAt: { gte: windowStart },
    },
  });
  
  return !!existingClick;
}

/**
 * Get clicks from a session (for attribution)
 */
export async function getSessionClicks(
  sessionId: string,
  options?: {
    partnerId?: string;
    daysBack?: number;
  }
): Promise<Array<{ 
  id: string; 
  linkId: string; 
  partnerId: string; 
  productId: string | null;
  clickedAt: Date;
}>> {
  const daysBack = options?.daysBack || 30;
  const windowStart = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
  
  return prisma.affiliateClick.findMany({
    where: {
      sessionId,
      clickedAt: { gte: windowStart },
      ...(options?.partnerId && { partnerId: options.partnerId }),
    },
    select: {
      id: true,
      linkId: true,
      partnerId: true,
      productId: true,
      clickedAt: true,
    },
    orderBy: { clickedAt: 'desc' },
  });
}

/**
 * Get the most recent click for attribution (last-click model)
 */
export async function getLastClick(
  sessionId: string,
  partnerId?: string
): Promise<{
  id: string;
  linkId: string;
  partnerId: string;
  productId?: string | null;
  clickedAt: Date;
} | null> {
  return prisma.affiliateClick.findFirst({
    where: {
      sessionId,
      ...(partnerId && { partnerId }),
    },
    select: {
      id: true,
      linkId: true,
      partnerId: true,
      productId: true,
      clickedAt: true,
    },
    orderBy: { clickedAt: 'desc' },
  });
}

/**
 * Associate a click with a conversion
 */
export async function linkClickToConversion(
  clickId: string,
  conversionId: string
): Promise<void> {
  await prisma.affiliateClick.update({
    where: { id: clickId },
    data: { conversionId },
  });
}

/**
 * Get click statistics for a time period
 */
export async function getClickStats(
  options: {
    startDate?: Date;
    endDate?: Date;
    partnerId?: string;
    productId?: string;
  }
): Promise<{
  totalClicks: number;
  uniqueSessions: number;
  botClicks: number;
  byDevice: Record<string, number>;
  byBrowser: Record<string, number>;
  byCountry: Record<string, number>;
}> {
  const where = {
    ...(options.startDate && { clickedAt: { gte: options.startDate } }),
    ...(options.endDate && { clickedAt: { lte: options.endDate } }),
    ...(options.partnerId && { partnerId: options.partnerId }),
    ...(options.productId && { productId: options.productId }),
  };
  
  const [clicks, botClicks] = await Promise.all([
    prisma.affiliateClick.findMany({
      where,
      select: {
        sessionId: true,
        deviceType: true,
        browser: true,
        countryCode: true,
        isBot: true,
      },
    }),
    prisma.affiliateClick.count({
      where: { ...where, isBot: true },
    }),
  ]);
  
  const uniqueSessions = new Set(clicks.map((c) => c.sessionId)).size;
  
  // Aggregate by device
  const byDevice: Record<string, number> = {};
  const byBrowser: Record<string, number> = {};
  const byCountry: Record<string, number> = {};
  
  clicks.forEach((click) => {
    if (click.deviceType) {
      byDevice[click.deviceType] = (byDevice[click.deviceType] || 0) + 1;
    }
    if (click.browser) {
      byBrowser[click.browser] = (byBrowser[click.browser] || 0) + 1;
    }
    if (click.countryCode) {
      byCountry[click.countryCode] = (byCountry[click.countryCode] || 0) + 1;
    }
  });
  
  return {
    totalClicks: clicks.length,
    uniqueSessions,
    botClicks,
    byDevice,
    byBrowser,
    byCountry,
  };
}
