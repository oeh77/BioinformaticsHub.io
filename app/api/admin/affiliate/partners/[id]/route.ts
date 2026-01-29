/**
 * Affiliate Partner API - Get, Update, Delete
 * 
 * GET /api/admin/affiliate/partners/[id] - Get partner details
 * PUT /api/admin/affiliate/partners/[id] - Update partner
 * DELETE /api/admin/affiliate/partners/[id] - Delete partner
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { INDUSTRY_CATEGORIES, COMMISSION_TYPES, PARTNER_STATUSES, PAYMENT_METHODS } from '@/lib/affiliate/types';

// Validation schema for updating a partner
const updatePartnerSchema = z.object({
  companyName: z.string().min(2).optional(),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/).optional(),
  industryCategory: z.enum(INDUSTRY_CATEGORIES as unknown as [string, ...string[]]).optional(),
  websiteUrl: z.string().url().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
  commissionRate: z.number().min(0).max(100).optional(),
  commissionType: z.enum(COMMISSION_TYPES as unknown as [string, ...string[]]).optional(),
  cookieDuration: z.number().min(1).max(365).optional(),
  paymentTerms: z.string().optional().nullable(),
  affiliateNetwork: z.string().optional().nullable(),
  networkAccountId: z.string().optional().nullable(),
  apiKey: z.string().optional().nullable(),
  apiEndpoint: z.string().url().optional().nullable(),
  status: z.enum(PARTNER_STATUSES as unknown as [string, ...string[]]).optional(),
  contractStartDate: z.string().datetime().optional().nullable(),
  contractEndDate: z.string().datetime().optional().nullable(),
  minPayoutThreshold: z.number().min(0).optional(),
  paymentMethod: z.enum(PAYMENT_METHODS as unknown as [string, ...string[]]).optional(),
  contactName: z.string().optional().nullable(),
  contactEmail: z.string().email().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const partner = await prisma.affiliatePartner.findUnique({
      where: { id },
      include: {
        products: {
          take: 10,
          orderBy: { popularityScore: 'desc' },
        },
        _count: {
          select: {
            products: true,
            links: true,
            clicks: true,
            conversions: true,
            payouts: true,
            contentAssets: true,
          },
        },
      },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Get aggregated stats
    const [totalRevenue, pendingCommission, totalCommission] = await Promise.all([
      prisma.affiliateConversion.aggregate({
        where: { partnerId: id, conversionStatus: 'approved' },
        _sum: { saleAmount: true },
      }),
      prisma.affiliateConversion.aggregate({
        where: { partnerId: id, conversionStatus: 'approved', payoutStatus: 'unpaid' },
        _sum: { commissionAmount: true },
      }),
      prisma.affiliateConversion.aggregate({
        where: { partnerId: id, conversionStatus: 'approved' },
        _sum: { commissionAmount: true },
      }),
    ]);

    return NextResponse.json({
      ...partner,
      stats: {
        totalRevenue: totalRevenue._sum.saleAmount || 0,
        pendingCommission: pendingCommission._sum.commissionAmount || 0,
        totalCommission: totalCommission._sum.commissionAmount || 0,
      },
    });
  } catch (error) {
    console.error('Failed to fetch partner:', error);
    return NextResponse.json(
      { error: 'Failed to fetch partner' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updatePartnerSchema.parse(body);

    // Check if partner exists
    const existingPartner = await prisma.affiliatePartner.findUnique({
      where: { id },
    });

    if (!existingPartner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Check for slug conflict if slug is being changed
    if (validatedData.slug && validatedData.slug !== existingPartner.slug) {
      const slugConflict = await prisma.affiliatePartner.findUnique({
        where: { slug: validatedData.slug },
      });
      if (slugConflict) {
        return NextResponse.json(
          { error: 'A partner with this slug already exists' },
          { status: 400 }
        );
      }
    }

    const partner = await prisma.affiliatePartner.update({
      where: { id },
      data: {
        ...validatedData,
        contractStartDate: validatedData.contractStartDate
          ? new Date(validatedData.contractStartDate)
          : undefined,
        contractEndDate: validatedData.contractEndDate
          ? new Date(validatedData.contractEndDate)
          : undefined,
      },
    });

    return NextResponse.json(partner);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Failed to update partner:', error);
    return NextResponse.json(
      { error: 'Failed to update partner' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if partner exists
    const partner = await prisma.affiliatePartner.findUnique({
      where: { id },
      include: {
        _count: {
          select: { conversions: true, payouts: true },
        },
      },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Check for unpaid conversions
    const unpaidConversions = await prisma.affiliateConversion.count({
      where: { partnerId: id, payoutStatus: 'unpaid' },
    });

    if (unpaidConversions > 0) {
      return NextResponse.json(
        { error: `Cannot delete partner with ${unpaidConversions} unpaid conversions` },
        { status: 400 }
      );
    }

    // Soft delete by setting status to terminated (preserves history)
    // For hard delete, use prisma.affiliatePartner.delete()
    await prisma.affiliatePartner.update({
      where: { id },
      data: { status: 'terminated' },
    });

    return NextResponse.json({ message: 'Partner terminated successfully' });
  } catch (error) {
    console.error('Failed to delete partner:', error);
    return NextResponse.json(
      { error: 'Failed to delete partner' },
      { status: 500 }
    );
  }
}
