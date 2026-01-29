/**
 * Affiliate Commission Calculator
 * 
 * Handles commission calculations, conversions, and payout management.
 */

import { prisma } from '@/lib/prisma';
import type { ConversionData, CommissionCalculation } from './types';
import { incrementLinkConversions } from './link-generator';

/**
 * Calculate commission for a conversion
 */
export async function calculateCommission(
  partnerId: string,
  saleAmount: number,
  productId?: string,
  campaignId?: string
): Promise<CommissionCalculation> {
  // Get partner's base commission rate
  const partner = await prisma.affiliatePartner.findUnique({
    where: { id: partnerId },
  });
  
  if (!partner) {
    throw new Error('Partner not found');
  }
  
  const baseRate = partner.commissionRate;
  let productOverride: number | undefined;
  let campaignBonus: number | undefined;
  let tierAdjustment: number | undefined;
  
  // Check for product-specific commission override
  if (productId) {
    const product = await prisma.affiliateProduct.findUnique({
      where: { id: productId },
    });
    if (product?.commissionOverride) {
      productOverride = product.commissionOverride;
    }
  }
  
  // Check for active campaign bonus
  if (campaignId) {
    const campaign = await prisma.affiliateCampaign.findUnique({
      where: { id: campaignId },
    });
    if (campaign?.bonusCommissionRate && campaign.status === 'active') {
      const now = new Date();
      if (now >= campaign.startDate && campaign.endDate && now <= campaign.endDate) {
        campaignBonus = campaign.bonusCommissionRate;
      }
    }
  }
  
  // Handle tiered commissions if applicable
  if (partner.commissionType === 'tiered') {
    tierAdjustment = await calculateTierBonus(partnerId);
  }
  
  // Calculate final rate
  let finalRate = productOverride ?? baseRate;
  if (campaignBonus) finalRate += campaignBonus;
  if (tierAdjustment) finalRate += tierAdjustment;
  
  // Calculate commission amount
  let commissionAmount: number;
  
  if (partner.commissionType === 'fixed') {
    commissionAmount = baseRate; // Fixed amount, not percentage
  } else {
    commissionAmount = (saleAmount * finalRate) / 100;
  }
  
  // Round to 2 decimal places
  commissionAmount = Math.round(commissionAmount * 100) / 100;
  
  return {
    baseRate,
    productOverride,
    campaignBonus,
    tierAdjustment,
    finalRate,
    commissionAmount,
  };
}

/**
 * Calculate tier bonus based on monthly sales volume
 */
async function calculateTierBonus(partnerId: string): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const conversions = await prisma.affiliateConversion.count({
    where: {
      partnerId,
      conversionStatus: 'approved',
      convertedAt: { gte: startOfMonth },
    },
  });
  
  // Tiered structure:
  // 0-10 sales: 0% bonus
  // 11-50 sales: 2% bonus
  // 51-100 sales: 5% bonus
  // 101+ sales: 8% bonus
  
  if (conversions > 100) return 8;
  if (conversions > 50) return 5;
  if (conversions > 10) return 2;
  return 0;
}

/**
 * Record a new conversion
 */
export async function recordConversion(
  data: ConversionData
): Promise<string> {
  // Calculate commission
  const commission = await calculateCommission(
    data.partnerId,
    data.saleAmount || 0,
    data.productId
  );
  
  // Create conversion record
  const conversion = await prisma.affiliateConversion.create({
    data: {
      clickId: data.clickId,
      partnerId: data.partnerId,
      productId: data.productId,
      orderId: data.orderId,
      transactionId: data.transactionId,
      conversionType: data.conversionType,
      saleAmount: data.saleAmount,
      commissionAmount: commission.commissionAmount,
      currency: data.currency || 'USD',
      conversionStatus: 'pending',
      validationMethod: data.clickId ? 'postback' : 'manual',
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    },
  });
  
  // If we have a click, update the link's conversion count
  if (data.clickId) {
    const click = await prisma.affiliateClick.findUnique({
      where: { id: data.clickId },
      select: { linkId: true },
    });
    if (click) {
      incrementLinkConversions(click.linkId).catch(() => {});
    }
  }
  
  return conversion.id;
}

/**
 * Process a postback from a partner/network
 */
export async function processPostback(payload: {
  orderId: string;
  transactionId?: string;
  amount: number;
  clickId?: string;
  subId?: string;
  partnerId?: string;
  productId?: string;
  currency?: string;
}): Promise<{ success: boolean; conversionId?: string; error?: string }> {
  try {
    // Try to find the click/session from subId (usually our shortCode)
    let clickInfo = null;
    
    if (payload.clickId) {
      clickInfo = await prisma.affiliateClick.findUnique({
        where: { id: payload.clickId },
        select: {
          id: true,
          partnerId: true,
          productId: true,
          linkId: true,
        },
      });
    }
    
    const partnerId = payload.partnerId || clickInfo?.partnerId;
    
    if (!partnerId) {
      return { success: false, error: 'Unable to determine partner' };
    }
    
    // Check for duplicate conversion
    const existingConversion = await prisma.affiliateConversion.findFirst({
      where: { orderId: payload.orderId },
    });
    
    if (existingConversion) {
      return { 
        success: false, 
        error: 'Duplicate conversion', 
        conversionId: existingConversion.id 
      };
    }
    
    // Record the conversion
    const conversionId = await recordConversion({
      clickId: clickInfo?.id,
      partnerId,
      productId: payload.productId || clickInfo?.productId || undefined,
      orderId: payload.orderId,
      transactionId: payload.transactionId,
      conversionType: 'sale',
      saleAmount: payload.amount,
      currency: payload.currency,
    });
    
    return { success: true, conversionId };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Approve a pending conversion
 */
export async function approveConversion(
  conversionId: string,
  notes?: string
): Promise<void> {
  await prisma.affiliateConversion.update({
    where: { id: conversionId },
    data: {
      conversionStatus: 'approved',
      approvedAt: new Date(),
      notes,
    },
  });
}

/**
 * Reject a pending conversion
 */
export async function rejectConversion(
  conversionId: string,
  notes?: string
): Promise<void> {
  await prisma.affiliateConversion.update({
    where: { id: conversionId },
    data: {
      conversionStatus: 'rejected',
      notes,
    },
  });
}

/**
 * Reverse a conversion (e.g., for refunds)
 */
export async function reverseConversion(
  conversionId: string,
  reason?: string
): Promise<void> {
  const conversion = await prisma.affiliateConversion.findUnique({
    where: { id: conversionId },
  });
  
  if (!conversion) {
    throw new Error('Conversion not found');
  }
  
  if (conversion.payoutStatus === 'paid') {
    throw new Error('Cannot reverse a paid conversion');
  }
  
  await prisma.affiliateConversion.update({
    where: { id: conversionId },
    data: {
      conversionStatus: 'reversed',
      notes: reason || 'Reversed',
    },
  });
}

/**
 * Get pending conversions for review
 */
export async function getPendingConversions(options?: {
  partnerId?: string;
  limit?: number;
  offset?: number;
}): Promise<Array<{
  id: string;
  partnerId: string;
  partnerName: string;
  productId?: string | null;
  productName?: string | null;
  orderId?: string | null;
  saleAmount?: number | null;
  commissionAmount: number;
  conversionType: string;
  convertedAt: Date;
}>> {
  const conversions = await prisma.affiliateConversion.findMany({
    where: {
      conversionStatus: 'pending',
      ...(options?.partnerId && { partnerId: options.partnerId }),
    },
    include: {
      partner: { select: { companyName: true } },
      product: { select: { productName: true } },
    },
    take: options?.limit || 50,
    skip: options?.offset || 0,
    orderBy: { convertedAt: 'desc' },
  });
  
  return conversions.map((c) => ({
    id: c.id,
    partnerId: c.partnerId,
    partnerName: c.partner.companyName,
    productId: c.productId,
    productName: c.product?.productName,
    orderId: c.orderId,
    saleAmount: c.saleAmount,
    commissionAmount: c.commissionAmount,
    conversionType: c.conversionType,
    convertedAt: c.convertedAt,
  }));
}

/**
 * Get total pending commissions
 */
export async function getTotalPendingCommissions(
  partnerId?: string
): Promise<number> {
  const result = await prisma.affiliateConversion.aggregate({
    where: {
      conversionStatus: 'approved',
      payoutStatus: 'unpaid',
      ...(partnerId && { partnerId }),
    },
    _sum: { commissionAmount: true },
  });
  
  return result._sum.commissionAmount || 0;
}

/**
 * Get conversions ready for payout
 */
export async function getUnpaidConversions(
  partnerId: string
): Promise<Array<{
  id: string;
  saleAmount: number | null;
  commissionAmount: number;
  convertedAt: Date;
}>> {
  return prisma.affiliateConversion.findMany({
    where: {
      partnerId,
      conversionStatus: 'approved',
      payoutStatus: 'unpaid',
    },
    select: {
      id: true,
      saleAmount: true,
      commissionAmount: true,
      convertedAt: true,
    },
    orderBy: { convertedAt: 'asc' },
  });
}

/**
 * Create a payout for a partner
 */
export async function createPayout(
  partnerId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<string> {
  const partner = await prisma.affiliatePartner.findUnique({
    where: { id: partnerId },
  });
  
  if (!partner) {
    throw new Error('Partner not found');
  }
  
  // Get all approved, unpaid conversions in the period
  const conversions = await prisma.affiliateConversion.findMany({
    where: {
      partnerId,
      conversionStatus: 'approved',
      payoutStatus: 'unpaid',
      convertedAt: { gte: periodStart, lte: periodEnd },
    },
  });
  
  if (conversions.length === 0) {
    throw new Error('No conversions to pay out');
  }
  
  const totalCommission = conversions.reduce(
    (sum, c) => sum + c.commissionAmount,
    0
  );
  
  if (totalCommission < partner.minPayoutThreshold) {
    throw new Error(
      `Total commission ($${totalCommission.toFixed(2)}) below minimum threshold ($${partner.minPayoutThreshold.toFixed(2)})`
    );
  }
  
  // Create payout
  const payout = await prisma.affiliatePayout.create({
    data: {
      partnerId,
      payoutPeriodStart: periodStart,
      payoutPeriodEnd: periodEnd,
      totalConversions: conversions.length,
      totalCommission,
      payoutMethod: partner.paymentMethod,
      payoutStatus: 'pending',
    },
  });
  
  // Link conversions to payout
  await prisma.affiliateConversion.updateMany({
    where: { id: { in: conversions.map((c) => c.id) } },
    data: {
      payoutId: payout.id,
      payoutStatus: 'processing',
    },
  });
  
  return payout.id;
}

/**
 * Mark a payout as completed
 */
export async function completePayout(
  payoutId: string,
  transactionReference: string
): Promise<void> {
  await prisma.$transaction([
    prisma.affiliatePayout.update({
      where: { id: payoutId },
      data: {
        payoutStatus: 'completed',
        payoutDate: new Date(),
        transactionReference,
      },
    }),
    prisma.affiliateConversion.updateMany({
      where: { payoutId },
      data: { payoutStatus: 'paid' },
    }),
  ]);
}
