/**
 * Affiliate Products API - List & Create
 * 
 * GET /api/admin/affiliate/products - List all products
 * POST /api/admin/affiliate/products - Create new product
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { PRODUCT_CATEGORIES, PRODUCT_STATUSES } from '@/lib/affiliate/types';

const createProductSchema = z.object({
  partnerId: z.string().cuid('Invalid partner ID'),
  productName: z.string().min(2, 'Product name must be at least 2 characters'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  productCategory: z.enum(PRODUCT_CATEGORIES as unknown as [string, ...string[]]),
  subcategory: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  features: z.array(z.string()).optional().nullable(),
  price: z.number().min(0).optional().nullable(),
  currency: z.string().default('USD'),
  pricingModel: z.enum(['one_time', 'subscription', 'usage_based']).default('one_time'),
  productUrl: z.string().url('Invalid product URL').optional().nullable(),
  affiliateUrl: z.string().url('Invalid affiliate URL').optional().nullable(),
  imageUrls: z.array(z.string().url()).optional().nullable(),
  videoUrl: z.string().url().optional().nullable(),
  datasheetUrl: z.string().url().optional().nullable(),
  isFeatured: z.boolean().default(false),
  commissionOverride: z.number().min(0).max(100).optional().nullable(),
  trackingEnabled: z.boolean().default(true),
  status: z.enum(PRODUCT_STATUSES as unknown as [string, ...string[]]).default('active'),
  tags: z.array(z.string()).optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const partnerId = searchParams.get('partnerId');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where = {
      ...(partnerId && { partnerId }),
      ...(category && { productCategory: category }),
      ...(status && { status }),
      ...(featured === 'true' && { isFeatured: true }),
      ...(search && {
        OR: [
          { productName: { contains: search } },
          { description: { contains: search } },
        ],
      }),
    };

    const [products, total] = await Promise.all([
      prisma.affiliateProduct.findMany({
        where,
        include: {
          partner: {
            select: { id: true, companyName: true, slug: true },
          },
          _count: {
            select: { links: true, clicks: true, conversions: true },
          },
        },
        orderBy: [{ isFeatured: 'desc' }, { popularityScore: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.affiliateProduct.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
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
    const validatedData = createProductSchema.parse(body);

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

    // Check if slug already exists
    const existingProduct = await prisma.affiliateProduct.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: 'A product with this slug already exists' },
        { status: 400 }
      );
    }

    const product = await prisma.affiliateProduct.create({
      data: {
        ...validatedData,
        features: validatedData.features ? JSON.stringify(validatedData.features) : null,
        imageUrls: validatedData.imageUrls ? JSON.stringify(validatedData.imageUrls) : null,
        tags: validatedData.tags ? JSON.stringify(validatedData.tags) : null,
      },
      include: {
        partner: {
          select: { id: true, companyName: true, slug: true },
        },
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Failed to create product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
