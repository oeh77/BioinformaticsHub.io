/**
 * Affiliate Partners API - List & Create
 * 
 * GET /api/admin/affiliate/partners - List all partners
 * POST /api/admin/affiliate/partners - Create new partner
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { INDUSTRY_CATEGORIES, COMMISSION_TYPES, PARTNER_STATUSES, PAYMENT_METHODS } from '@/lib/affiliate/types';

// Validation schema for creating a partner
const createPartnerSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  industryCategory: z.enum(INDUSTRY_CATEGORIES as unknown as [string, ...string[]]),
  websiteUrl: z.string().url('Invalid website URL').optional().nullable(),
  logoUrl: z.string().url('Invalid logo URL').optional().nullable(),
  description: z.string().optional().nullable(),
  commissionRate: z.number().min(0).max(100).default(10),
  commissionType: z.enum(COMMISSION_TYPES as unknown as [string, ...string[]]).default('percentage'),
  cookieDuration: z.number().min(1).max(365).default(30),
  paymentTerms: z.string().optional().nullable(),
  affiliateNetwork: z.string().optional().nullable(),
  networkAccountId: z.string().optional().nullable(),
  apiKey: z.string().optional().nullable(),
  apiEndpoint: z.string().url().optional().nullable(),
  status: z.enum(PARTNER_STATUSES as unknown as [string, ...string[]]).default('pending'),
  contractStartDate: z.string().datetime().optional().nullable(),
  contractEndDate: z.string().datetime().optional().nullable(),
  minPayoutThreshold: z.number().min(0).default(50),
  paymentMethod: z.enum(PAYMENT_METHODS as unknown as [string, ...string[]]).default('paypal'),
  contactName: z.string().optional().nullable(),
  contactEmail: z.string().email('Invalid email').optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where = {
      ...(status && { status }),
      ...(category && { industryCategory: category }),
      ...(search && {
        OR: [
          { companyName: { contains: search } },
          { description: { contains: search } },
          { contactEmail: { contains: search } },
        ],
      }),
    };

    const [partners, total] = await Promise.all([
      prisma.affiliatePartner.findMany({
        where,
        include: {
          _count: {
            select: {
              products: true,
              links: true,
              conversions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.affiliatePartner.count({ where }),
    ]);

    return NextResponse.json({
      partners,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch partners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch partners' },
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
    const validatedData = createPartnerSchema.parse(body);

    // Check if slug already exists
    const existingPartner = await prisma.affiliatePartner.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingPartner) {
      return NextResponse.json(
        { error: 'A partner with this slug already exists' },
        { status: 400 }
      );
    }

    const partner = await prisma.affiliatePartner.create({
      data: {
        ...validatedData,
        contractStartDate: validatedData.contractStartDate
          ? new Date(validatedData.contractStartDate)
          : null,
        contractEndDate: validatedData.contractEndDate
          ? new Date(validatedData.contractEndDate)
          : null,
      },
    });

    return NextResponse.json(partner, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Failed to create partner:', error);
    return NextResponse.json(
      { error: 'Failed to create partner' },
      { status: 500 }
    );
  }
}
