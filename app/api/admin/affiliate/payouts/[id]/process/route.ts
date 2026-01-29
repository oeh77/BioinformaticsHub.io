/**
 * Admin API - Process Payout Payment
 * 
 * POST /api/admin/affiliate/payouts/[id]/process - Process payment via Stripe/PayPal
 * GET /api/admin/affiliate/payouts/[id]/process - Get available payment methods
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { processPayment, getPartnerPaymentMethods } from '@/lib/affiliate/payments';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// POST - Process payment for a payout
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    // Check payout exists
    const payout = await prisma.affiliatePayout.findUnique({
      where: { id },
      include: { partner: { select: { companyName: true } } },
    });

    if (!payout) {
      return NextResponse.json({ error: 'Payout not found' }, { status: 404 });
    }

    if (payout.payoutStatus === 'completed') {
      return NextResponse.json(
        { error: 'Payout has already been paid' },
        { status: 400 }
      );
    }

    // Process the payment
    const result = await processPayment(id);

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.error || 'Payment processing failed',
          provider: result.provider,
        },
        { status: 400 }
      );
    }

    // Get updated payout
    const updatedPayout = await prisma.affiliatePayout.findUnique({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      provider: result.provider,
      transactionId: result.transactionId,
      metadata: result.metadata,
      payout: updatedPayout ? {
        ...updatedPayout,
        payoutPeriodStart: updatedPayout.payoutPeriodStart.toISOString(),
        payoutPeriodEnd: updatedPayout.payoutPeriodEnd.toISOString(),
        payoutDate: updatedPayout.payoutDate?.toISOString() || null,
        createdAt: updatedPayout.createdAt.toISOString(),
        updatedAt: updatedPayout.updatedAt.toISOString(),
      } : null,
    });
  } catch (error) {
    console.error('Failed to process payment:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}

// GET - Get available payment methods for the payout's partner
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
      select: { partnerId: true },
    });

    if (!payout) {
      return NextResponse.json({ error: 'Payout not found' }, { status: 404 });
    }

    if (!payout.partnerId) {
      return NextResponse.json({ 
        methods: {
          stripe: { available: false },
          paypal: { available: false },
          manual: { available: true },
        }
      });
    }

    const methods = await getPartnerPaymentMethods(payout.partnerId);

    return NextResponse.json({ methods });
  } catch (error) {
    console.error('Failed to get payment methods:', error);
    return NextResponse.json(
      { error: 'Failed to get payment methods' },
      { status: 500 }
    );
  }
}
