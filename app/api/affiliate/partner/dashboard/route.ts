/**
 * Partner Portal API - Dashboard Data
 * 
 * GET /api/affiliate/partner/dashboard - Get partner's performance data
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPartnerSession, unauthorizedResponse } from '@/lib/affiliate/partner-auth';

export async function GET(request: NextRequest) {
  try {
    // Verify partner session
    const session = await verifyPartnerSession(request);
    if (!session) {
      return unauthorizedResponse();
    }

    const { partnerId } = session;
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '30d';

    // Calculate date range
    let startDate: Date;
    const now = new Date();

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0);
    }

    // Get partner details
    const partner = await prisma.affiliatePartner.findUnique({
      where: { id: partnerId },
      select: {
        id: true,
        companyName: true,
        commissionRate: true,
        commissionType: true,
        status: true,
        contractStartDate: true,
        contractEndDate: true,
      },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Get aggregate stats
    const [
      totalClicks,
      totalConversions,
      conversionStats,
      pendingCommission,
      paidCommission,
      topProducts,
      recentConversions,
      clicksByDay,
    ] = await Promise.all([
      // Total clicks (excluding bots)
      prisma.affiliateClick.count({
        where: { 
          partnerId,
          clickedAt: { gte: startDate },
          isBot: false,
        },
      }),

      // Total conversions
      prisma.affiliateConversion.count({
        where: { 
          partnerId,
          convertedAt: { gte: startDate },
        },
      }),

      // Conversion stats (approved only)
      prisma.affiliateConversion.aggregate({
        where: {
          partnerId,
          convertedAt: { gte: startDate },
          conversionStatus: 'approved',
        },
        _sum: { saleAmount: true, commissionAmount: true },
      }),

      // Pending commission (approved but unpaid)
      prisma.affiliateConversion.aggregate({
        where: {
          partnerId,
          conversionStatus: 'approved',
          payoutStatus: 'unpaid',
        },
        _sum: { commissionAmount: true },
      }),

      // Paid commission (all time)
      prisma.affiliateConversion.aggregate({
        where: {
          partnerId,
          payoutStatus: 'paid',
        },
        _sum: { commissionAmount: true },
      }),

      // Top products
      prisma.affiliateProduct.findMany({
        where: { partnerId, status: 'active' },
        include: {
          _count: { select: { clicks: true, conversions: true } },
        },
        orderBy: { clicks: { _count: 'desc' } },
        take: 5,
      }),

      // Recent conversions
      prisma.affiliateConversion.findMany({
        where: { partnerId },
        include: {
          product: { select: { productName: true } },
        },
        orderBy: { convertedAt: 'desc' },
        take: 10,
      }),

      // Clicks by day (for chart)
      prisma.$queryRaw`
        SELECT 
          DATE(clickedAt) as date,
          COUNT(*) as clicks
        FROM AffiliateClick
        WHERE partnerId = ${partnerId}
          AND clickedAt >= ${startDate}
          AND isBot = 0
        GROUP BY DATE(clickedAt)
        ORDER BY date ASC
      ` as Promise<Array<{ date: string; clicks: number }>>,
    ]);

    // Calculate conversion rate
    const conversionRate = totalClicks > 0
      ? ((totalConversions / totalClicks) * 100).toFixed(2)
      : '0.00';

    return NextResponse.json({
      partner: {
        ...partner,
        contractStartDate: partner.contractStartDate?.toISOString(),
        contractEndDate: partner.contractEndDate?.toISOString(),
      },
      overview: {
        totalClicks,
        totalConversions,
        totalRevenue: conversionStats._sum.saleAmount || 0,
        totalCommission: conversionStats._sum.commissionAmount || 0,
        pendingCommission: pendingCommission._sum.commissionAmount || 0,
        paidCommission: paidCommission._sum.commissionAmount || 0,
        conversionRate: parseFloat(conversionRate),
      },
      topProducts: topProducts.map((p) => ({
        id: p.id,
        name: p.productName,
        clicks: p._count.clicks,
        conversions: p._count.conversions,
      })),
      recentConversions: recentConversions.map((c) => ({
        id: c.id,
        product: c.product?.productName,
        orderId: c.orderId,
        saleAmount: c.saleAmount,
        commissionAmount: c.commissionAmount,
        status: c.conversionStatus,
        payoutStatus: c.payoutStatus,
        convertedAt: c.convertedAt.toISOString(),
      })),
      charts: {
        clicksByDay,
      },
      period,
    });
  } catch (error) {
    console.error('Failed to fetch partner dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
