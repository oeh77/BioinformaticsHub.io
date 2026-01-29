/**
 * Admin API - Campaign Analytics
 * 
 * GET /api/admin/affiliate/campaigns/[id]/analytics - Get detailed campaign analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET - Get detailed campaign analytics
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '30d'; // 7d, 14d, 30d, 90d, all

    // Verify campaign exists
    const campaign = await prisma.affiliateCampaign.findUnique({
      where: { id },
      select: { 
        id: true, 
        campaignName: true, 
        startDate: true, 
        endDate: true,
        targetConversions: true,
        targetRevenue: true,
        bonusCommissionRate: true,
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
      default: // 30d
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Use campaign start date if it's more recent
    if (startDate < campaign.startDate) {
      startDate = campaign.startDate;
    }

    // Get campaign links
    const links = await prisma.affiliateLink.findMany({
      where: { campaignId: id },
      select: { id: true },
    });
    const linkIds = links.map(l => l.id);

    if (linkIds.length === 0) {
      return NextResponse.json({
        campaign: {
          id: campaign.id,
          campaignName: campaign.campaignName,
          startDate: campaign.startDate.toISOString(),
          endDate: campaign.endDate?.toISOString() || null,
        },
        analytics: {
          overview: {
            totalClicks: 0,
            uniqueClicks: 0,
            conversions: 0,
            revenue: 0,
            commission: 0,
            conversionRate: 0,
            averageOrderValue: 0,
          },
          charts: {
            clicksOverTime: [],
            conversionsOverTime: [],
            deviceBreakdown: [],
            countryBreakdown: [],
            referrerBreakdown: [],
          },
          topProducts: [],
          topLinks: [],
        },
      });
    }

    // Get overview stats
    const [clickStats, conversionStats] = await Promise.all([
      prisma.affiliateClick.aggregate({
        where: { 
          linkId: { in: linkIds },
          clickedAt: { gte: startDate, lte: endDate },
        },
        _count: true,
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

    // Get unique clicks (by IP)
    const uniqueClicks = await prisma.affiliateClick.groupBy({
      by: ['ipAddress'],
      where: { 
        linkId: { in: linkIds },
        clickedAt: { gte: startDate, lte: endDate },
      },
    });

    // Calculate metrics
    const totalClicks = clickStats._count;
    const totalConversions = conversionStats._count;
    const totalRevenue = conversionStats._sum?.saleAmount || 0;
    const totalCommission = conversionStats._sum?.commissionAmount || 0;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    const averageOrderValue = totalConversions > 0 ? totalRevenue / totalConversions : 0;

    // Get clicks by day (using Prisma aggregation)
    const clicksByDay = await prisma.affiliateClick.findMany({
      where: { 
        linkId: { in: linkIds },
        clickedAt: { gte: startDate, lte: endDate },
      },
      select: { clickedAt: true },
      orderBy: { clickedAt: 'asc' },
    });

    // Aggregate clicks by day in JavaScript
    const clicksOverTime: Record<string, number> = {};
    clicksByDay.forEach(click => {
      const day = click.clickedAt.toISOString().split('T')[0];
      clicksOverTime[day] = (clicksOverTime[day] || 0) + 1;
    });

    // Get conversions by day
    const conversionsByDay = await prisma.affiliateConversion.findMany({
      where: { 
        linkId: { in: linkIds },
        convertedAt: { gte: startDate, lte: endDate },
      },
      select: { convertedAt: true, saleAmount: true },
      orderBy: { convertedAt: 'asc' },
    });

    // Aggregate conversions by day
    const conversionsOverTime: Record<string, { count: number; revenue: number }> = {};
    conversionsByDay.forEach(conv => {
      const day = conv.convertedAt.toISOString().split('T')[0];
      if (!conversionsOverTime[day]) {
        conversionsOverTime[day] = { count: 0, revenue: 0 };
      }
      conversionsOverTime[day].count++;
      conversionsOverTime[day].revenue += conv.saleAmount || 0;
    });

    // Get device breakdown
    const deviceBreakdown = await prisma.affiliateClick.groupBy({
      by: ['deviceType'],
      where: { 
        linkId: { in: linkIds },
        clickedAt: { gte: startDate, lte: endDate },
      },
      _count: true,
    });

    // Get country breakdown
    const countryBreakdown = await prisma.affiliateClick.groupBy({
      by: ['countryCode'],
      where: { 
        linkId: { in: linkIds },
        clickedAt: { gte: startDate, lte: endDate },
      },
      _count: true,
    });

    // Get referrer breakdown
    const referrerData = await prisma.affiliateClick.groupBy({
      by: ['referrer'],
      where: { 
        linkId: { in: linkIds },
        clickedAt: { gte: startDate, lte: endDate },
        referrer: { not: null },
      },
      _count: true,
    });

    // Get top products
    const topProductsData = await prisma.affiliateConversion.groupBy({
      by: ['productId'],
      where: { 
        linkId: { in: linkIds },
        convertedAt: { gte: startDate, lte: endDate },
      },
      _count: true,
      _sum: { saleAmount: true },
    });

    // Get product names
    const productIds = topProductsData.map(p => p.productId).filter(Boolean) as string[];
    const products = await prisma.affiliateProduct.findMany({
      where: { id: { in: productIds } },
      select: { id: true, productName: true },
    });
    const productMap = new Map(products.map(p => [p.id, p.productName]));

    // Get top links
    const topLinksData = await prisma.affiliateClick.groupBy({
      by: ['linkId'],
      where: { 
        linkId: { in: linkIds },
        clickedAt: { gte: startDate, lte: endDate },
      },
      _count: true,
    });

    // Get link details
    const topLinkDetails = await prisma.affiliateLink.findMany({
      where: { id: { in: topLinksData.map(l => l.linkId) } },
      select: { id: true, shortCode: true, name: true },
    });
    const linkMap = new Map(topLinkDetails.map(l => [l.id, { shortCode: l.shortCode, name: l.name }]));

    // Calculate progress toward targets
    const progress = {
      conversions: campaign.targetConversions 
        ? { current: totalConversions, target: campaign.targetConversions, percentage: Math.round((totalConversions / campaign.targetConversions) * 100) }
        : null,
      revenue: campaign.targetRevenue 
        ? { current: totalRevenue, target: campaign.targetRevenue, percentage: Math.round((totalRevenue / campaign.targetRevenue) * 100) }
        : null,
    };

    // Sort arrays by count descending
    const sortedDevices = [...deviceBreakdown].sort((a, b) => b._count - a._count).slice(0, 5);
    const sortedCountries = [...countryBreakdown].sort((a, b) => b._count - a._count).slice(0, 10);
    const sortedReferrers = [...referrerData].sort((a, b) => b._count - a._count).slice(0, 10);
    const sortedProducts = [...topProductsData].sort((a, b) => (b._sum?.saleAmount || 0) - (a._sum?.saleAmount || 0)).slice(0, 10);
    const sortedLinks = [...topLinksData].sort((a, b) => b._count - a._count).slice(0, 10);

    return NextResponse.json({
      campaign: {
        id: campaign.id,
        campaignName: campaign.campaignName,
        startDate: campaign.startDate.toISOString(),
        endDate: campaign.endDate?.toISOString() || null,
        bonusCommissionRate: campaign.bonusCommissionRate,
      },
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days: Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)),
      },
      analytics: {
        overview: {
          totalClicks,
          uniqueClicks: uniqueClicks.length,
          conversions: totalConversions,
          revenue: totalRevenue,
          commission: totalCommission,
          conversionRate: parseFloat(conversionRate.toFixed(2)),
          averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
        },
        progress,
        charts: {
          clicksOverTime: Object.entries(clicksOverTime).map(([date, count]) => ({ date, count })),
          conversionsOverTime: Object.entries(conversionsOverTime).map(([date, data]) => ({ 
            date, 
            count: data.count, 
            revenue: data.revenue 
          })),
          deviceBreakdown: sortedDevices.map((d: { deviceType: string | null; _count: number }) => ({
            device: d.deviceType || 'Unknown',
            count: d._count,
            percentage: totalClicks > 0 ? parseFloat(((d._count / totalClicks) * 100).toFixed(1)) : 0,
          })),
          countryBreakdown: sortedCountries.map((c: { countryCode: string | null; _count: number }) => ({
            country: c.countryCode || 'Unknown',
            count: c._count,
            percentage: totalClicks > 0 ? parseFloat(((c._count / totalClicks) * 100).toFixed(1)) : 0,
          })),
          referrerBreakdown: sortedReferrers.map(r => ({
            referrer: r.referrer || 'Direct',
            count: r._count,
          })),
        },
        topProducts: sortedProducts.map(p => ({
          productId: p.productId,
          productName: p.productId ? productMap.get(p.productId) || 'Unknown' : 'Unknown',
          conversions: p._count,
          revenue: p._sum?.saleAmount || 0,
        })),
        topLinks: sortedLinks.map(l => ({
          linkId: l.linkId,
          shortCode: linkMap.get(l.linkId)?.shortCode || '',
          name: linkMap.get(l.linkId)?.name || '',
          clicks: l._count,
        })),
      },
    });
  } catch (error) {
    console.error('Failed to fetch campaign analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign analytics' },
      { status: 500 }
    );
  }
}
