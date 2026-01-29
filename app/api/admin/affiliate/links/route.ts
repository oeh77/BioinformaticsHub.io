/**
 * Affiliate Links API - List & Create
 * 
 * GET /api/admin/affiliate/links - List all links
 * POST /api/admin/affiliate/links - Generate new link
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { createAffiliateLink } from '@/lib/affiliate/link-generator';
import { LINK_TYPES, PLACEMENT_TYPES } from '@/lib/affiliate/types';

const createLinkSchema = z.object({
  partnerId: z.string().cuid('Invalid partner ID'),
  productId: z.string().cuid('Invalid product ID').optional().nullable(),
  originalUrl: z.string().url('Invalid URL'),
  linkType: z.enum(LINK_TYPES as unknown as [string, ...string[]]).default('product'),
  placementType: z.enum(PLACEMENT_TYPES as unknown as [string, ...string[]]).default('content'),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  customParameters: z.record(z.string(), z.string()).optional(),
  expiresAt: z.string().datetime().optional().nullable(),
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
    const placementType = searchParams.get('placementType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where = {
      ...(partnerId && { partnerId }),
      ...(productId && { productId }),
      ...(status && { status }),
      ...(placementType && { placementType }),
    };

    const [links, total] = await Promise.all([
      prisma.affiliateLink.findMany({
        where,
        include: {
          partner: {
            select: { id: true, companyName: true },
          },
          product: {
            select: { id: true, productName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.affiliateLink.count({ where }),
    ]);

    return NextResponse.json({
      links,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch links:', error);
    return NextResponse.json(
      { error: 'Failed to fetch links' },
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
    const validatedData = createLinkSchema.parse(body);

    // Use the link generator
    const link = await createAffiliateLink({
      partnerId: validatedData.partnerId,
      productId: validatedData.productId || undefined,
      originalUrl: validatedData.originalUrl,
      linkType: validatedData.linkType as 'product' | 'category' | 'homepage' | 'custom',
      placementType: validatedData.placementType as 'content' | 'banner' | 'button' | 'widget' | 'email' | 'sidebar',
      utmSource: validatedData.utmSource,
      utmMedium: validatedData.utmMedium,
      utmCampaign: validatedData.utmCampaign,
      customParameters: validatedData.customParameters,
      expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : undefined,
    });

    // Fetch the full link with relations
    const fullLink = await prisma.affiliateLink.findUnique({
      where: { id: link.id },
      include: {
        partner: {
          select: { id: true, companyName: true },
        },
        product: {
          select: { id: true, productName: true },
        },
      },
    });

    return NextResponse.json(fullLink, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Failed to create link:', error);
    return NextResponse.json(
      { error: 'Failed to create link' },
      { status: 500 }
    );
  }
}
