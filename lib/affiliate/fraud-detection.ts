/**
 * Affiliate Fraud Detection
 * 
 * Detects and prevents affiliate fraud including click fraud,
 * fake conversions, and suspicious activity.
 */

import { prisma } from '@/lib/prisma';

// Fraud detection thresholds
const THRESHOLDS = {
  MAX_CLICKS_PER_IP_PER_HOUR: 10,
  MAX_CLICKS_PER_SESSION_PER_HOUR: 20,
  MAX_CLICKS_PER_LINK_PER_HOUR: 100,
  SUSPICIOUS_CONVERSION_DAYS_GAP: 30,
  HIGH_VALUE_CONVERSION_THRESHOLD: 1000,
  MAX_REJECTION_RATE: 0.2, // 20%
};

export interface FraudScore {
  score: number; // 0-100, higher = more suspicious
  reasons: string[];
  recommendation: 'allow' | 'review' | 'block';
}

export interface ClickFraudCheck {
  isAllowed: boolean;
  reason?: string;
  score: number;
}

/**
 * Check click for potential fraud
 */
export async function checkClickFraud(
  ipAddress: string,
  sessionId: string,
  linkId: string,
  userAgent?: string
): Promise<ClickFraudCheck> {
  const reasons: string[] = [];
  let score = 0;
  
  // Get recent clicks from this IP
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  const [ipClicks, sessionClicks, linkClicks] = await Promise.all([
    prisma.affiliateClick.count({
      where: { ipAddress, clickedAt: { gte: hourAgo } },
    }),
    prisma.affiliateClick.count({
      where: { sessionId, clickedAt: { gte: hourAgo } },
    }),
    prisma.affiliateClick.count({
      where: { linkId, clickedAt: { gte: hourAgo } },
    }),
  ]);
  
  // Check IP rate limit
  if (ipClicks >= THRESHOLDS.MAX_CLICKS_PER_IP_PER_HOUR) {
    reasons.push('IP rate limit exceeded');
    score += 40;
  } else if (ipClicks >= THRESHOLDS.MAX_CLICKS_PER_IP_PER_HOUR / 2) {
    reasons.push('High click volume from IP');
    score += 20;
  }
  
  // Check session rate limit
  if (sessionClicks >= THRESHOLDS.MAX_CLICKS_PER_SESSION_PER_HOUR) {
    reasons.push('Session rate limit exceeded');
    score += 30;
  }
  
  // Check link rate limit
  if (linkClicks >= THRESHOLDS.MAX_CLICKS_PER_LINK_PER_HOUR) {
    reasons.push('Unusual traffic spike on link');
    score += 25;
  }
  
  // Check for suspicious user agent patterns
  if (userAgent) {
    const ua = userAgent.toLowerCase();
    
    // Check for empty or very short user agent
    if (userAgent.length < 20) {
      reasons.push('Suspicious user agent (too short)');
      score += 15;
    }
    
    // Check for known automation tools
    const automationSignatures = [
      'selenium',
      'puppeteer',
      'playwright',
      'phantomjs',
      'headless',
      'python-requests',
      'curl',
      'wget',
      'httpie',
      'postman',
    ];
    
    for (const sig of automationSignatures) {
      if (ua.includes(sig)) {
        reasons.push(`Automation tool detected: ${sig}`);
        score += 50;
        break;
      }
    }
  }
  
  // Check for missing required headers (no user agent at all)
  if (!userAgent) {
    reasons.push('Missing user agent');
    score += 25;
  }
  
  // Determine if click should be allowed
  if (score >= 50) {
    return {
      isAllowed: false,
      reason: reasons.join('; '),
      score,
    };
  }
  
  return { isAllowed: true, score };
}

/**
 * Calculate fraud score for a conversion
 */
export async function calculateConversionFraudScore(
  conversionId: string
): Promise<FraudScore> {
  const reasons: string[] = [];
  let score = 0;
  
  const conversion = await prisma.affiliateConversion.findUnique({
    where: { id: conversionId },
    include: {
      partner: true,
      product: true,
    },
  });
  
  if (!conversion) {
    return { score: 100, reasons: ['Conversion not found'], recommendation: 'block' };
  }
  
  // Check if there's an associated click
  if (!conversion.clickId) {
    reasons.push('No associated click');
    score += 30;
  } else {
    // Check time gap between click and conversion
    const click = await prisma.affiliateClick.findUnique({
      where: { id: conversion.clickId },
    });
    
    if (click) {
      const daysDiff = Math.floor(
        (conversion.convertedAt.getTime() - click.clickedAt.getTime()) / 
        (1000 * 60 * 60 * 24)
      );
      
      if (daysDiff > THRESHOLDS.SUSPICIOUS_CONVERSION_DAYS_GAP) {
        reasons.push(`Long delay between click and conversion: ${daysDiff} days`);
        score += 20;
      }
      
      // Check if click was from a bot
      if (click.isBot) {
        reasons.push('Original click was from a bot');
        score += 40;
      }
    }
  }
  
  // Check for high-value conversions
  if (
    conversion.commissionAmount > THRESHOLDS.HIGH_VALUE_CONVERSION_THRESHOLD
  ) {
    reasons.push('High-value conversion - manual review recommended');
    score += 10; // Not necessarily fraud, but warrants review
  }
  
  // Check partner's rejection rate
  const [totalConversions, rejectedConversions] = await Promise.all([
    prisma.affiliateConversion.count({
      where: { 
        partnerId: conversion.partnerId,
        conversionStatus: { in: ['approved', 'rejected'] },
      },
    }),
    prisma.affiliateConversion.count({
      where: { 
        partnerId: conversion.partnerId,
        conversionStatus: 'rejected',
      },
    }),
  ]);
  
  if (totalConversions > 10) {
    const rejectionRate = rejectedConversions / totalConversions;
    if (rejectionRate > THRESHOLDS.MAX_REJECTION_RATE) {
      reasons.push(`Partner has high rejection rate: ${(rejectionRate * 100).toFixed(1)}%`);
      score += 25;
    }
  }
  
  // Check for duplicate order IDs
  if (conversion.orderId) {
    const duplicates = await prisma.affiliateConversion.count({
      where: {
        orderId: conversion.orderId,
        id: { not: conversion.id },
      },
    });
    
    if (duplicates > 0) {
      reasons.push('Duplicate order ID detected');
      score += 50;
    }
  }
  
  // Determine recommendation
  let recommendation: 'allow' | 'review' | 'block';
  if (score >= 50) {
    recommendation = 'block';
  } else if (score >= 25) {
    recommendation = 'review';
  } else {
    recommendation = 'allow';
  }
  
  return { score, reasons, recommendation };
}

/**
 * Get partner reputation score
 */
export async function getPartnerReputationScore(
  partnerId: string
): Promise<{
  score: number;
  totalConversions: number;
  approvedConversions: number;
  rejectedConversions: number;
  approvalRate: number;
  flags: string[];
}> {
  const [total, approved, rejected, reversed] = await Promise.all([
    prisma.affiliateConversion.count({
      where: { partnerId },
    }),
    prisma.affiliateConversion.count({
      where: { partnerId, conversionStatus: 'approved' },
    }),
    prisma.affiliateConversion.count({
      where: { partnerId, conversionStatus: 'rejected' },
    }),
    prisma.affiliateConversion.count({
      where: { partnerId, conversionStatus: 'reversed' },
    }),
  ]);
  
  const flags: string[] = [];
  let score = 100; // Start with perfect score
  
  // Calculate approval rate
  const decided = approved + rejected;
  const approvalRate = decided > 0 ? approved / decided : 1;
  
  if (total > 10) {
    // Penalize for rejections
    if (approvalRate < 0.8) {
      score -= 30;
      flags.push('Low approval rate');
    } else if (approvalRate < 0.9) {
      score -= 15;
      flags.push('Below average approval rate');
    }
    
    // Penalize for reversals
    const reversalRate = reversed / total;
    if (reversalRate > 0.1) {
      score -= 25;
      flags.push('High reversal rate');
    }
  }
  
  return {
    score: Math.max(0, score),
    totalConversions: total,
    approvedConversions: approved,
    rejectedConversions: rejected,
    approvalRate,
    flags,
  };
}

/**
 * Get suspicious clicks for review
 */
export async function getSuspiciousClicks(options?: {
  limit?: number;
  offset?: number;
}): Promise<Array<{
  id: string;
  linkId: string;
  ipAddress: string | null;
  clickedAt: Date;
  isBot: boolean;
  botType: string | null;
  reason: string;
}>> {
  // Find clicks from bots
  const botClicks = await prisma.affiliateClick.findMany({
    where: { isBot: true },
    take: options?.limit || 50,
    skip: options?.offset || 0,
    orderBy: { clickedAt: 'desc' },
    select: {
      id: true,
      linkId: true,
      ipAddress: true,
      clickedAt: true,
      isBot: true,
      botType: true,
    },
  });
  
  return botClicks.map((click) => ({
    ...click,
    reason: click.botType ? `Bot detected: ${click.botType}` : 'Bot detected',
  }));
}

/**
 * Get suspicious conversions for review
 */
export async function getSuspiciousConversions(options?: {
  limit?: number;
  offset?: number;
}): Promise<Array<{
  id: string;
  partnerId: string;
  orderId: string | null;
  saleAmount: number | null;
  commissionAmount: number;
  fraudScore: FraudScore;
}>> {
  const pendingConversions = await prisma.affiliateConversion.findMany({
    where: { conversionStatus: 'pending' },
    take: options?.limit || 50,
    skip: options?.offset || 0,
    orderBy: { convertedAt: 'desc' },
  });
  
  const results = await Promise.all(
    pendingConversions.map(async (conversion) => {
      const fraudScore = await calculateConversionFraudScore(conversion.id);
      return {
        id: conversion.id,
        partnerId: conversion.partnerId,
        orderId: conversion.orderId,
        saleAmount: conversion.saleAmount,
        commissionAmount: conversion.commissionAmount,
        fraudScore,
      };
    })
  );
  
  // Only return those with fraud concerns
  return results.filter((r) => r.fraudScore.score >= 25);
}

/**
 * Block an IP address
 */
export async function blockIP(ipAddress: string, reason: string): Promise<void> {
  // For now, we'll use the Settings model to store blocked IPs
  // In production, you might want a dedicated model
  const key = 'blocked_ips';
  
  const existing = await prisma.settings.findUnique({
    where: { key },
  });
  
  const blockedIPs: Record<string, { reason: string; blockedAt: string }> = 
    existing ? JSON.parse(existing.value) : {};
  
  blockedIPs[ipAddress] = {
    reason,
    blockedAt: new Date().toISOString(),
  };
  
  await prisma.settings.upsert({
    where: { key },
    update: { value: JSON.stringify(blockedIPs) },
    create: { key, value: JSON.stringify(blockedIPs) },
  });
}

/**
 * Check if an IP is blocked
 */
export async function isIPBlocked(ipAddress: string): Promise<boolean> {
  const setting = await prisma.settings.findUnique({
    where: { key: 'blocked_ips' },
  });
  
  if (!setting) return false;
  
  const blockedIPs = JSON.parse(setting.value);
  return ipAddress in blockedIPs;
}
