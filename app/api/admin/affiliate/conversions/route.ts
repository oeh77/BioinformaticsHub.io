/**
 * Affiliate Conversions API
 * 
 * GET /api/admin/affiliate/conversions - List conversions
 * POST /api/admin/affiliate/conversions - Manual conversion entry
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { recordConversion } from '@/lib/affiliate/commission';
import { CONVERSION_TYPES, CONVERSION_STATUSES } from '@/lib/affiliate/types';

const createConversionSchema = z.object({
  partnerId: z.string().cuid('Invalid partner ID'),
  productId: z.string().cuid('Invalid product ID').optional().nullable(),
  clickId: z.string().cuid('Invalid click ID').optional().nullable(),
  orderId: z.string().optional().nullable(),
  transactionId: z.string().optional().nullable(),
  conversionType: z.enum(CONVERSION_TYPES as unknown as [string, ...string[]]).default('sale'),
  saleAmount: z.number().min(0).optional().nullable(),
  currency: z.string().default('USD'),
  notes: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const partnerId = searchParams.get('partnerId');
    const productId = searchParams.get('productId');
    const status = searchParams.get('status');
    const payoutStatus = searchParams.get('payoutStatus');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where = {
      ...(partnerId && { partnerId }),
      ...(productId && { productId }),
      ...(status && { conversionStatus: status }),
      ...(payoutStatus && { payoutStatus }),
      ...(startDate && {
        convertedAt: {
          gte: new Date(startDate),
          ...(endDate && { lte: new Date(endDate) }),
        },
      }),
    };

    const [conversions, total, stats] = await Promise.all([
      prisma.affiliateConversion.findMany({
        where,
        include: {
          partner: {
            select: { id: true, companyName: true },
          },
          product: {
            select: { id: true, productName: true },
          },
        },
        orderBy: { convertedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.affiliateConversion.count({ where }),
      prisma.affiliateConversion.aggregate({
        where,
        _sum: { saleAmount: true, commissionAmount: true },
        _count: { id: true },
      }),
    ]);

    return NextResponse.json({
      conversions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalSales: stats._sum.saleAmount || 0,
        totalCommission: stats._sum.commissionAmount || 0,
        count: stats._count.id,
      },
    });
  } catch (error) {
    console.error('Failed to fetch conversions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createConversionSchema.parse(body);

    // Check if partner exists
    const partner = await prisma.affiliatePartner.findUnique({
      where: { id: validatedData.partnerId },
    });

    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 400 }
      );
    }

    // Record the conversion
    const conversionId = await recordConversion({
      partnerId: validatedData.partnerId,
      productId: validatedData.productId || undefined,
      clickId: validatedData.clickId || undefined,
      orderId: validatedData.orderId || undefined,
      transactionId: validatedData.transactionId || undefined,
      conversionType: validatedData.conversionType as 'sale' | 'lead' | 'signup' | 'trial' | 'download',
      saleAmount: validatedData.saleAmount || undefined,
      currency: validatedData.currency,
    });

    // Update notes separately
    if (validatedData.notes) {
      await prisma.affiliateConversion.update({
        where: { id: conversionId },
        data: { notes: validatedData.notes, validationMethod: 'manual' },
      });
    }

    // Fetch the full conversion
    const conversion = await prisma.affiliateConversion.findUnique({
      where: { id: conversionId },
      include: {
        partner: {
          select: { id: true, companyName: true },
        },
        product: {
          select: { id: true, productName: true },
        },
      },
    });

    return NextResponse.json(conversion, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Failed to create conversion:', error);
    return NextResponse.json(
      { error: 'Failed to create conversion' },
      { status: 500 }
    );
  }
}
