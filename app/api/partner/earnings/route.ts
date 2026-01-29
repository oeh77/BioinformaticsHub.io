/**
 * Partner API - Partner Earnings & Payouts
 * 
 * GET /api/partner/earnings - Get earnings summary and payout history
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPartnerSession } from '@/lib/affiliate/partner-auth';

// GET - Get partner's earnings and payout history
export async function GET(request: NextRequest) {
  try {
    const partnerSession = await verifyPartnerSession(request);
    if (!partnerSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '30d';

    // Calculate date ranges
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '14d':
        startDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        startDate = new Date(0);
        break;
      default: // 30d
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get all conversions for the partner
    const conversions = await prisma.affiliateConversion.findMany({
      where: {
        partnerId: partnerSession.partnerId,
        convertedAt: { gte: startDate },
      },
      select: {
        id: true,
        saleAmount: true,
        commissionAmount: true,
        conversionStatus: true,
        convertedAt: true,
      },
      orderBy: { convertedAt: 'desc' },
    });

    // Calculate earnings summary
    const pendingEarnings = conversions
      .filter(c => c.conversionStatus === 'pending')
      .reduce((sum, c) => sum + (c.commissionAmount || 0), 0);

    const approvedEarnings = conversions
      .filter(c => c.conversionStatus === 'approved')
      .reduce((sum, c) => sum + (c.commissionAmount || 0), 0);

    const totalEarnings = conversions
      .filter(c => c.conversionStatus !== 'rejected' && c.conversionStatus !== 'reversed')
      .reduce((sum, c) => sum + (c.commissionAmount || 0), 0);

    const totalSales = conversions
      .filter(c => c.conversionStatus !== 'rejected' && c.conversionStatus !== 'reversed')
      .reduce((sum, c) => sum + (c.saleAmount || 0), 0);

    // Get payout history
    const payouts = await prisma.affiliatePayout.findMany({
      where: { partnerId: partnerSession.partnerId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Calculate paid out total
    const paidOut = payouts
      .filter(p => p.payoutStatus === 'completed')
      .reduce((sum, p) => sum + p.totalCommission, 0);

    // Get partner info for minimum payout threshold
    const partner = await prisma.affiliatePartner.findUnique({
      where: { id: partnerSession.partnerId },
      select: { 
        payoutThreshold: true,
        payoutMethod: true,
        paymentDetails: true,
      },
    });

    const minimumPayout = partner?.payoutThreshold || 50;
    const availableForPayout = approvedEarnings;
    const canRequestPayout = availableForPayout >= minimumPayout;

    // Group earnings by day for chart
    const earningsByDay: Record<string, { revenue: number; commission: number; count: number }> = {};
    conversions
      .filter(c => c.conversionStatus !== 'rejected' && c.conversionStatus !== 'reversed')
      .forEach(c => {
        const day = c.convertedAt.toISOString().split('T')[0];
        if (!earningsByDay[day]) {
          earningsByDay[day] = { revenue: 0, commission: 0, count: 0 };
        }
        earningsByDay[day].revenue += c.saleAmount || 0;
        earningsByDay[day].commission += c.commissionAmount || 0;
        earningsByDay[day].count++;
      });

    return NextResponse.json({
      summary: {
        pendingEarnings,
        approvedEarnings,
        totalEarnings,
        paidOut,
        totalSales,
        availableForPayout,
        minimumPayout,
        canRequestPayout,
        conversionsCount: conversions.length,
      },
      paymentSettings: {
        method: partner?.payoutMethod || null,
        hasPaymentDetails: !!partner?.paymentDetails,
        threshold: minimumPayout,
      },
      earningsChart: Object.entries(earningsByDay)
        .map(([date, data]) => ({
          date,
          revenue: data.revenue,
          commission: data.commission,
          conversions: data.count,
        }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      recentConversions: conversions.slice(0, 10).map(c => ({
        id: c.id,
        saleAmount: c.saleAmount,
        commissionAmount: c.commissionAmount,
        status: c.conversionStatus,
        date: c.convertedAt.toISOString(),
      })),
      payoutHistory: payouts.map(p => ({
        id: p.id,
        amount: p.totalCommission,
        status: p.payoutStatus,
        method: p.payoutMethod,
        requestedAt: p.createdAt.toISOString(),
        paidAt: p.payoutDate?.toISOString() || null,
        transactionRef: p.transactionReference,
      })),
      period: {
        start: startDate.toISOString(),
        end: now.toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to fetch partner earnings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch earnings' },
      { status: 500 }
    );
  }
}
