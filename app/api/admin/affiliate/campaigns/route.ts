/**
 * Admin API - Affiliate Campaigns
 * 
 * GET /api/admin/affiliate/campaigns - List campaigns
 * POST /api/admin/affiliate/campaigns - Create campaign
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createCampaignSchema = z.object({
  campaignName: z.string().min(1, 'Campaign name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  campaignType: z.enum(['seasonal', 'product_launch', 'promotion', 'evergreen']).default('promotion'),
  partnerId: z.string().optional(),
  productIds: z.array(z.string()).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  budgetAmount: z.number().optional(),
  discountCode: z.string().optional(),
  discountAmount: z.number().optional(),
  discountType: z.enum(['percentage', 'fixed']).optional(),
  bonusCommission: z.number().optional(),
  targetClicks: z.number().optional(),
  targetConversions: z.number().optional(),
  targetRevenue: z.number().optional(),
  landingPageUrl: z.string().url().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  creativesUrls: z.array(z.string()).optional(),
  notificationEmails: z.array(z.string().email()).optional(),
});

// GET - List campaigns
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const partnerId = searchParams.get('partnerId');

    const where: Record<string, unknown> = {};
    
    if (status) {
      const now = new Date();
      switch (status) {
        case 'active':
          where.status = 'active';
          where.startDate = { lte: now };
          where.OR = [{ endDate: null }, { endDate: { gte: now } }];
          break;
        case 'scheduled':
          where.status = 'active';
          where.startDate = { gt: now };
          break;
        case 'ended':
          where.OR = [
            { status: 'completed' },
            { status: 'cancelled' },
            { endDate: { lt: now } },
          ];
          break;
        case 'draft':
          where.status = 'draft';
          break;
      }
    }

    if (type) where.campaignType = type;
    if (partnerId) where.partnerId = partnerId;

    const [campaigns, total] = await Promise.all([
      prisma.affiliateCampaign.findMany({
        where,
        include: {
          partner: { select: { id: true, companyName: true } },
          _count: { select: { links: true } },
        },
        orderBy: { startDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.affiliateCampaign.count({ where }),
    ]);

    // Calculate campaign stats
    const campaignsWithStats = await Promise.all(
      campaigns.map(async (campaign) => {
        const linkIds = await prisma.affiliateLink.findMany({
          where: { campaignId: campaign.id },
          select: { id: true },
        });

        const [clicks, conversions] = await Promise.all([
          prisma.affiliateClick.count({
            where: { linkId: { in: linkIds.map((l) => l.id) } },
          }),
          prisma.affiliateConversion.aggregate({
            where: { linkId: { in: linkIds.map((l) => l.id) } },
            _count: true,
            _sum: { saleAmount: true, commissionAmount: true },
          }),
        ]);

        return {
          ...campaign,
          startDate: campaign.startDate.toISOString(),
          endDate: campaign.endDate?.toISOString() || null,
          createdAt: campaign.createdAt.toISOString(),
          updatedAt: campaign.updatedAt.toISOString(),
          stats: {
            clicks,
            conversions: conversions._count,
            revenue: conversions._sum.saleAmount || 0,
            commission: conversions._sum.commissionAmount || 0,
            linksCount: campaign._count.links,
          },
        };
      })
    );

    return NextResponse.json({
      campaigns: campaignsWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

// POST - Create campaign
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createCampaignSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check slug uniqueness
    const existing = await prisma.affiliateCampaign.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A campaign with this slug already exists' },
        { status: 400 }
      );
    }

    const campaign = await prisma.affiliateCampaign.create({
      data: {
        campaignName: data.campaignName,
        campaignCode: data.slug, // Use slug as the campaign code
        slug: data.slug,
        description: data.description || null,
        campaignType: data.campaignType,
        partnerId: data.partnerId || null,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        budgetAmount: data.budgetAmount || null,
        discountCode: data.discountCode || null,
        discountAmount: data.discountAmount || null,
        discountType: data.discountType || null,
        bonusCommission: data.bonusCommission || null,
        targetClicks: data.targetClicks || null,
        targetConversions: data.targetConversions || null,
        targetRevenue: data.targetRevenue || null,
        landingPageUrl: data.landingPageUrl || null,
        utmSource: data.utmSource || null,
        utmMedium: data.utmMedium || null,
        utmCampaign: data.utmCampaign || data.slug,
        creativesUrls: data.creativesUrls ? JSON.stringify(data.creativesUrls) : null,
        notificationEmails: data.notificationEmails ? JSON.stringify(data.notificationEmails) : null,
        status: 'active',
      },
      include: {
        partner: { select: { id: true, companyName: true } },
      },
    });

    return NextResponse.json({
      campaign: {
        ...campaign,
        startDate: campaign.startDate.toISOString(),
        endDate: campaign.endDate?.toISOString() || null,
        createdAt: campaign.createdAt.toISOString(),
        updatedAt: campaign.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to create campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}
