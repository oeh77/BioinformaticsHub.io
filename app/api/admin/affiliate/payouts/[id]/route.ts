/**
 * Admin API - Individual Payout Operations
 * 
 * GET /api/admin/affiliate/payouts/[id] - Get payout details
 * PUT /api/admin/affiliate/payouts/[id] - Update payout (mark as paid)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updatePayoutSchema = z.object({
  action: z.enum(['complete', 'cancel']),
  transactionReference: z.string().optional(),
  notes: z.string().optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET - Get payout details
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

    const payout = await prisma.affiliatePayout.findUnique({
      where: { id },
      include: {
        partner: {
          select: {
            id: true,
            companyName: true,
            contactEmail: true,
          },
        },
        conversions: {
          select: {
            id: true,
            orderId: true,
            saleAmount: true,
            commissionAmount: true,
            conversionType: true,
            convertedAt: true,
            product: { select: { productName: true } },
          },
        },
      },
    });

    if (!payout) {
      return NextResponse.json({ error: 'Payout not found' }, { status: 404 });
    }

    return NextResponse.json({
      payout: {
        ...payout,
        payoutPeriodStart: payout.payoutPeriodStart.toISOString(),
        payoutPeriodEnd: payout.payoutPeriodEnd.toISOString(),
        payoutDate: payout.payoutDate?.toISOString() || null,
        createdAt: payout.createdAt.toISOString(),
        updatedAt: payout.updatedAt.toISOString(),
        conversions: payout.conversions.map((c) => ({
          ...c,
          convertedAt: c.convertedAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error('Failed to fetch payout:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payout' },
      { status: 500 }
    );
  }
}

// PUT - Update payout (complete or cancel)
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const validation = updatePayoutSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { action, transactionReference, notes } = validation.data;

    const payout = await prisma.affiliatePayout.findUnique({
      where: { id },
    });

    if (!payout) {
      return NextResponse.json({ error: 'Payout not found' }, { status: 404 });
    }

    if (payout.payoutStatus === 'completed') {
      return NextResponse.json(
        { error: 'Payout has already been completed' },
        { status: 400 }
      );
    }

    if (action === 'complete') {
      // Complete the payout
      const updatedPayout = await prisma.$transaction(async (tx) => {
        const updated = await tx.affiliatePayout.update({
          where: { id },
          data: {
            payoutStatus: 'completed',
            transactionReference: transactionReference || null,
            payoutDate: new Date(),
            notes: notes || payout.notes,
          },
        });

        // Update all conversions to paid
        await tx.affiliateConversion.updateMany({
          where: { payoutId: id },
          data: { payoutStatus: 'paid' },
        });

        return updated;
      });

      return NextResponse.json({
        payout: {
          ...updatedPayout,
          payoutPeriodStart: updatedPayout.payoutPeriodStart.toISOString(),
          payoutPeriodEnd: updatedPayout.payoutPeriodEnd.toISOString(),
          payoutDate: updatedPayout.payoutDate?.toISOString() || null,
          createdAt: updatedPayout.createdAt.toISOString(),
          updatedAt: updatedPayout.updatedAt.toISOString(),
        },
      });
    } else if (action === 'cancel') {
      // Cancel the payout
      const updatedPayout = await prisma.$transaction(async (tx) => {
        const updated = await tx.affiliatePayout.update({
          where: { id },
          data: {
            payoutStatus: 'failed',
            notes: notes || payout.notes,
          },
        });

        // Reset conversions to unpaid
        await tx.affiliateConversion.updateMany({
          where: { payoutId: id },
          data: { 
            payoutId: null,
            payoutStatus: 'unpaid',
          },
        });

        return updated;
      });

      return NextResponse.json({
        payout: {
          ...updatedPayout,
          payoutPeriodStart: updatedPayout.payoutPeriodStart.toISOString(),
          payoutPeriodEnd: updatedPayout.payoutPeriodEnd.toISOString(),
          payoutDate: updatedPayout.payoutDate?.toISOString() || null,
          createdAt: updatedPayout.createdAt.toISOString(),
          updatedAt: updatedPayout.updatedAt.toISOString(),
        },
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Failed to update payout:', error);
    return NextResponse.json(
      { error: 'Failed to update payout' },
      { status: 500 }
    );
  }
}
