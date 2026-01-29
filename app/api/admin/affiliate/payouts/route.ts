/**
 * Admin API - Affiliate Payouts
 * 
 * GET /api/admin/affiliate/payouts - List payouts
 * POST /api/admin/affiliate/payouts - Create payout
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createPayoutSchema = z.object({
  partnerId: z.string().min(1, 'Partner ID is required'),
  conversionIds: z.array(z.string()).optional(),
  payoutMethod: z.string().optional(),
  notes: z.string().optional(),
});

// GET - List payouts
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const partnerId = searchParams.get('partnerId');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (partnerId) where.partnerId = partnerId;
    if (status) where.payoutStatus = status;

    const [payouts, total] = await Promise.all([
      prisma.affiliatePayout.findMany({
        where,
        include: {
          partner: { select: { id: true, companyName: true, contactEmail: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.affiliatePayout.count({ where }),
    ]);

    // Aggregate stats
    const stats = await prisma.affiliatePayout.aggregate({
      _sum: { totalCommission: true },
      _count: true,
    });

    const pendingStats = await prisma.affiliatePayout.aggregate({
      where: { payoutStatus: 'pending' },
      _sum: { totalCommission: true },
      _count: true,
    });

    return NextResponse.json({
      payouts: payouts.map((p) => ({
        ...p,
        payoutPeriodStart: p.payoutPeriodStart.toISOString(),
        payoutPeriodEnd: p.payoutPeriodEnd.toISOString(),
        payoutDate: p.payoutDate?.toISOString() || null,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalPaid: stats._sum.totalCommission || 0,
        totalPayouts: stats._count,
        pendingAmount: pendingStats._sum.totalCommission || 0,
        pendingCount: pendingStats._count,
      },
    });
  } catch (error) {
    console.error('Failed to fetch payouts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payouts' },
      { status: 500 }
    );
  }
}

// POST - Create payout
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createPayoutSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { partnerId, conversionIds, payoutMethod, notes } = validation.data;

    // Get unpaid, approved conversions for the partner
    const whereConversions: Record<string, unknown> = {
      partnerId,
      conversionStatus: 'approved',
      payoutStatus: 'unpaid',
    };

    if (conversionIds && conversionIds.length > 0) {
      whereConversions.id = { in: conversionIds };
    }

    const conversions = await prisma.affiliateConversion.findMany({
      where: whereConversions,
      select: {
        id: true,
        commissionAmount: true,
        saleAmount: true,
        convertedAt: true,
      },
    });

    if (conversions.length === 0) {
      return NextResponse.json(
        { error: 'No eligible conversions found for payout' },
        { status: 400 }
      );
    }

    // Calculate totals
    const totalCommission = conversions.reduce(
      (sum, c) => sum + c.commissionAmount,
      0
    );

    // Find earliest and latest conversion dates for payout period
    const conversionDates = conversions.map((c) => c.convertedAt);
    const periodStart = new Date(Math.min(...conversionDates.map((d) => d.getTime())));
    const periodEnd = new Date(Math.max(...conversionDates.map((d) => d.getTime())));

    // Create payout in a transaction
    const payout = await prisma.$transaction(async (tx) => {
      // Create the payout
      const newPayout = await tx.affiliatePayout.create({
        data: {
          partnerId,
          totalCommission,
          totalConversions: conversions.length,
          payoutPeriodStart: periodStart,
          payoutPeriodEnd: periodEnd,
          payoutStatus: 'pending',
          payoutMethod: payoutMethod || 'paypal',
          notes: notes || null,
        },
      });

      // Update conversions to link to this payout
      await tx.affiliateConversion.updateMany({
        where: { id: { in: conversions.map((c) => c.id) } },
        data: { 
          payoutId: newPayout.id,
          payoutStatus: 'processing',
        },
      });

      return newPayout;
    });

    return NextResponse.json({
      payout: {
        ...payout,
        payoutPeriodStart: payout.payoutPeriodStart.toISOString(),
        payoutPeriodEnd: payout.payoutPeriodEnd.toISOString(),
        createdAt: payout.createdAt.toISOString(),
        updatedAt: payout.updatedAt.toISOString(),
      },
      conversionsCount: conversions.length,
    });
  } catch (error) {
    console.error('Failed to create payout:', error);
    return NextResponse.json(
      { error: 'Failed to create payout' },
      { status: 500 }
    );
  }
}
