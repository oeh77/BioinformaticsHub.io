/**
 * Partner API - Individual Campaign Details
 * 
 * GET /api/partner/campaigns/[id] - Get campaign details for partner
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPartnerSession } from '@/lib/affiliate/partner-auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET - Get campaign details with partner's performance
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const partnerSession = await verifyPartnerSession(request);
    if (!partnerSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '30d';

    // Get campaign
    const campaign = await prisma.affiliateCampaign.findFirst({
      where: {
        id,
        OR: [
          { partnerId: partnerSession.partnerId },
          { partnerId: null },
        ],
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Calculate date range
    let startDate: Date;
    const endDate = new Date();
    
    switch (period) {
      case '7d':
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '14d':
        startDate = new Date(endDate.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        startDate = campaign.startDate;
        break;
      default:
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    if (startDate < campaign.startDate) {
      startDate = campaign.startDate;
    }

    // Get partner's links for this campaign
    const links = await prisma.affiliateLink.findMany({
      where: {
        campaignId: id,
        partnerId: partnerSession.partnerId,
      },
      include: {
        product: { select: { productName: true } },
      },
    });
    const linkIds = links.map(l => l.id);

    // Get overall stats
    let totalClicks = 0;
    let totalConversions = 0;
    let totalRevenue = 0;
    let totalCommission = 0;

    if (linkIds.length > 0) {
      const [clickStats, conversionStats] = await Promise.all([
        prisma.affiliateClick.count({
          where: { 
            linkId: { in: linkIds },
            clickedAt: { gte: startDate, lte: endDate },
          },
        }),
        prisma.affiliateConversion.aggregate({
          where: { 
            linkId: { in: linkIds },
            convertedAt: { gte: startDate, lte: endDate },
          },
          _count: true,
          _sum: { saleAmount: true, commissionAmount: true },
        }),
      ]);

      totalClicks = clickStats;
      totalConversions = conversionStats._count;
      totalRevenue = conversionStats._sum.saleAmount || 0;
      totalCommission = conversionStats._sum.commissionAmount || 0;
    }

    // Get daily performance
    const dailyPerformance = linkIds.length > 0 
      ? await prisma.$queryRaw<Array<{ date: string; clicks: number; conversions: number; revenue: number }>>`
          SELECT 
            DATE(ac.clickedAt) as date,
            COUNT(DISTINCT ac.id) as clicks,
            COUNT(DISTINCT acv.id) as conversions,
            COALESCE(SUM(acv.saleAmount), 0) as revenue
          FROM AffiliateClick ac
          LEFT JOIN AffiliateConversion acv ON ac.linkId = acv.linkId 
            AND DATE(acv.convertedAt) = DATE(ac.clickedAt)
          WHERE ac.linkId IN (${linkIds.join(',')})
            AND ac.clickedAt >= ${startDate.toISOString()}
            AND ac.clickedAt <= ${endDate.toISOString()}
          GROUP BY DATE(ac.clickedAt)
          ORDER BY date ASC
        `
      : [];

    // Get link performance
    const linkPerformance = await Promise.all(
      links.map(async (link) => {
        const [clicks, conversions] = await Promise.all([
          prisma.affiliateClick.count({
            where: { 
              linkId: link.id,
              clickedAt: { gte: startDate, lte: endDate },
            },
          }),
          prisma.affiliateConversion.aggregate({
            where: { 
              linkId: link.id,
              convertedAt: { gte: startDate, lte: endDate },
            },
            _count: true,
            _sum: { commissionAmount: true },
          }),
        ]);

        return {
          id: link.id,
          shortCode: link.shortCode,
          name: link.name,
          productName: link.product?.productName,
          status: link.status,
          clicks,
          conversions: conversions._count,
          commission: conversions._sum.commissionAmount || 0,
          conversionRate: clicks > 0 
            ? parseFloat(((conversions._count / clicks) * 100).toFixed(2)) 
            : 0,
        };
      })
    );

    // Parse JSON fields
    const parseJsonField = (field: string | null) => {
      if (!field) return [];
      try {
        return JSON.parse(field);
      } catch {
        return [];
      }
    };

    // Calculate conversion rate
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    // Check if bonus commission applies
    const effectiveCommission = campaign.bonusCommission
      ? campaign.bonusCommission
      : null;

    return NextResponse.json({
      campaign: {
        id: campaign.id,
        campaignName: campaign.campaignName,
        description: campaign.description,
        campaignType: campaign.campaignType,
        status: campaign.status,
        startDate: campaign.startDate.toISOString(),
        endDate: campaign.endDate?.toISOString() || null,
        discountCode: campaign.discountCode,
        discountAmount: campaign.discountAmount,
        discountType: campaign.discountType,
        bonusCommission: campaign.bonusCommission,
        landingPageUrl: campaign.landingPageUrl,
        utmSource: campaign.utmSource,
        utmMedium: campaign.utmMedium,
        utmCampaign: campaign.utmCampaign,
        creativesUrls: parseJsonField(campaign.creativesUrls),
      },
      partnerStats: {
        totalClicks,
        totalConversions,
        totalRevenue,
        totalCommission,
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        averageOrderValue: totalConversions > 0 
          ? parseFloat((totalRevenue / totalConversions).toFixed(2))
          : 0,
        linksCreated: linkIds.length,
        effectiveBonusCommission: effectiveCommission,
      },
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      charts: {
        dailyPerformance: Array.isArray(dailyPerformance) ? dailyPerformance : [],
      },
      links: linkPerformance,
    });
  } catch (error) {
    console.error('Failed to fetch campaign details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign details' },
      { status: 500 }
    );
  }
}
