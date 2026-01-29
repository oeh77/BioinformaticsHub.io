/**
 * Affiliate Analytics API
 * 
 * GET /api/admin/affiliate/analytics - Get dashboard statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '30d'; // 7d, 30d, 90d, 1y, all
    
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
        startDate = new Date(0); // All time
    }

    // Get aggregate stats
    const [
      totalClicks,
      totalConversions,
      conversionStats,
      pendingCommission,
      paidCommission,
      topPartners,
      topProducts,
      recentConversions,
      clicksByDay,
      conversionsByDay,
    ] = await Promise.all([
      // Total clicks
      prisma.affiliateClick.count({
        where: { clickedAt: { gte: startDate }, isBot: false },
      }),
      
      // Total conversions
      prisma.affiliateConversion.count({
        where: { convertedAt: { gte: startDate } },
      }),
      
      // Conversion stats (approved only)
      prisma.affiliateConversion.aggregate({
        where: { 
          convertedAt: { gte: startDate },
          conversionStatus: 'approved',
        },
        _sum: { saleAmount: true, commissionAmount: true },
      }),
      
      // Pending commission
      prisma.affiliateConversion.aggregate({
        where: { 
          conversionStatus: 'approved',
          payoutStatus: 'unpaid',
        },
        _sum: { commissionAmount: true },
      }),
      
      // Paid commission
      prisma.affiliateConversion.aggregate({
        where: { 
          conversionStatus: 'approved',
          payoutStatus: 'paid',
        },
        _sum: { commissionAmount: true },
      }),
      
      // Top partners by revenue
      prisma.affiliatePartner.findMany({
        where: { status: 'active' },
        include: {
          _count: { select: { conversions: true, clicks: true } },
          conversions: {
            where: { 
              convertedAt: { gte: startDate },
              conversionStatus: 'approved',
            },
            select: { saleAmount: true, commissionAmount: true },
          },
        },
        orderBy: { conversions: { _count: 'desc' } },
        take: 10,
      }),
      
      // Top products by clicks
      prisma.affiliateProduct.findMany({
        where: { status: 'active' },
        include: {
          partner: { select: { companyName: true } },
          _count: { select: { clicks: true, conversions: true } },
        },
        orderBy: { clicks: { _count: 'desc' } },
        take: 10,
      }),
      
      // Recent conversions
      prisma.affiliateConversion.findMany({
        include: {
          partner: { select: { companyName: true } },
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
        WHERE clickedAt >= ${startDate}
          AND isBot = 0
        GROUP BY DATE(clickedAt)
        ORDER BY date ASC
      ` as Promise<Array<{ date: string; clicks: number }>>,
      
      // Conversions by day (for chart)
      prisma.$queryRaw`
        SELECT 
          DATE(convertedAt) as date,
          COUNT(*) as conversions,
          SUM(saleAmount) as revenue,
          SUM(commissionAmount) as commission
        FROM AffiliateConversion
        WHERE convertedAt >= ${startDate}
        GROUP BY DATE(convertedAt)
        ORDER BY date ASC
      ` as Promise<Array<{ date: string; conversions: number; revenue: number; commission: number }>>,
    ]);

    // Calculate conversion rate
    const conversionRate = totalClicks > 0 
      ? ((totalConversions / totalClicks) * 100).toFixed(2) 
      : '0.00';

    // Process top partners
    const processedTopPartners = topPartners.map((partner) => ({
      id: partner.id,
      name: partner.companyName,
      clicks: partner._count.clicks,
      conversions: partner._count.conversions,
      revenue: partner.conversions.reduce((sum, c) => sum + (c.saleAmount || 0), 0),
      commission: partner.conversions.reduce((sum, c) => sum + c.commissionAmount, 0),
    }));

    // Process top products
    const processedTopProducts = topProducts.map((product) => ({
      id: product.id,
      name: product.productName,
      partner: product.partner.companyName,
      clicks: product._count.clicks,
      conversions: product._count.conversions,
    }));

    return NextResponse.json({
      overview: {
        totalClicks,
        totalConversions,
        totalRevenue: conversionStats._sum.saleAmount || 0,
        totalCommission: conversionStats._sum.commissionAmount || 0,
        pendingCommission: pendingCommission._sum.commissionAmount || 0,
        paidCommission: paidCommission._sum.commissionAmount || 0,
        conversionRate: parseFloat(conversionRate),
      },
      topPartners: processedTopPartners,
      topProducts: processedTopProducts,
      recentConversions: recentConversions.map((c) => ({
        id: c.id,
        partner: c.partner.companyName,
        product: c.product?.productName,
        saleAmount: c.saleAmount,
        commissionAmount: c.commissionAmount,
        status: c.conversionStatus,
        convertedAt: c.convertedAt,
      })),
      charts: {
        clicksByDay,
        conversionsByDay,
      },
      period,
    });
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
