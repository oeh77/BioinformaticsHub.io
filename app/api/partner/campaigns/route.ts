/**
 * Partner API - Partner Campaign Dashboard
 * 
 * GET /api/partner/campaigns - List campaigns available to partner
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPartnerSession } from '@/lib/affiliate/partner-auth';

// GET - List campaigns for the logged-in partner
export async function GET(request: NextRequest) {
  try {
    const partnerSession = await verifyPartnerSession(request);
    if (!partnerSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'active';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get partner's campaigns (or campaigns with no specific partner = available to all)
    const campaigns = await prisma.affiliateCampaign.findMany({
      where: {
        OR: [
          { partnerId: partnerSession.partnerId },
          { partnerId: null }, // Available to all partners
        ],
        status: status === 'all' ? undefined : status,
      },
      orderBy: { startDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Get campaign stats for each
    const campaignsWithStats = await Promise.all(
      campaigns.map(async (campaign) => {
        // Get links for this campaign belonging to this partner
        const links = await prisma.affiliateLink.findMany({
          where: {
            campaignId: campaign.id,
            partnerId: partnerSession.partnerId,
          },
          select: { id: true },
        });
        const linkIds = links.map(l => l.id);

        let stats = {
          clicks: 0,
          conversions: 0,
          revenue: 0,
          commission: 0,
        };

        if (linkIds.length > 0) {
          const [clickStats, conversionStats] = await Promise.all([
            prisma.affiliateClick.count({
              where: { linkId: { in: linkIds } },
            }),
            prisma.affiliateConversion.aggregate({
              where: { linkId: { in: linkIds } },
              _count: true,
              _sum: { saleAmount: true, commissionAmount: true },
            }),
          ]);

          stats = {
            clicks: clickStats,
            conversions: conversionStats._count,
            revenue: conversionStats._sum.saleAmount || 0,
            commission: conversionStats._sum.commissionAmount || 0,
          };
        }

        return {
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
          linksCount: linkIds.length,
          stats,
          isPartnerSpecific: campaign.partnerId === partnerSession.partnerId,
        };
      })
    );

    // Get total count
    const total = await prisma.affiliateCampaign.count({
      where: {
        OR: [
          { partnerId: partnerSession.partnerId },
          { partnerId: null },
        ],
        status: status === 'all' ? undefined : status,
      },
    });

    return NextResponse.json({
      campaigns: campaignsWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch partner campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}
