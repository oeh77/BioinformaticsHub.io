/**
 * Admin API - Individual Campaign Operations
 * 
 * GET /api/admin/affiliate/campaigns/[id] - Get campaign details
 * PUT /api/admin/affiliate/campaigns/[id] - Update campaign
 * DELETE /api/admin/affiliate/campaigns/[id] - Delete campaign
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateCampaignSchema = z.object({
  campaignName: z.string().min(1).optional(),
  description: z.string().optional(),
  campaignType: z.enum(['seasonal', 'product_launch', 'promotion', 'evergreen']).optional(),
  partnerId: z.string().nullable().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().nullable().optional(),
  budgetAmount: z.number().nullable().optional(),
  discountCode: z.string().nullable().optional(),
  discountAmount: z.number().nullable().optional(),
  discountType: z.enum(['percentage', 'fixed']).nullable().optional(),
  bonusCommission: z.number().nullable().optional(),
  targetClicks: z.number().nullable().optional(),
  targetConversions: z.number().nullable().optional(),
  targetRevenue: z.number().nullable().optional(),
  landingPageUrl: z.string().url().nullable().optional(),
  utmSource: z.string().nullable().optional(),
  utmMedium: z.string().nullable().optional(),
  utmCampaign: z.string().nullable().optional(),
  creativesUrls: z.array(z.string()).optional(),
  notificationEmails: z.array(z.string().email()).optional(),
  status: z.enum(['draft', 'active', 'paused', 'completed', 'cancelled']).optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET - Get campaign details with full stats
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

    const campaign = await prisma.affiliateCampaign.findUnique({
      where: { id },
      include: {
        partner: { select: { id: true, companyName: true, slug: true } },
        links: {
          include: {
            product: { select: { id: true, productName: true } },
            _count: { select: { clicks: true } },
          },
          take: 20,
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Get aggregated stats
    const linkIds = campaign.links.map((l) => l.id);
    
    const [clickStats, conversionStats, dailyClicks] = await Promise.all([
      prisma.affiliateClick.aggregate({
        where: { linkId: { in: linkIds } },
        _count: true,
      }),
      prisma.affiliateConversion.aggregate({
        where: { linkId: { in: linkIds } },
        _count: true,
        _sum: { saleAmount: true, commissionAmount: true },
      }),
      prisma.$queryRaw`
        SELECT 
          DATE(clickedAt) as date,
          COUNT(*) as clicks
        FROM AffiliateClick
        WHERE linkId IN (${linkIds.length > 0 ? linkIds.join(',') : "''"})
        GROUP BY DATE(clickedAt)
        ORDER BY date DESC
        LIMIT 30
      ` as Promise<Array<{ date: string; clicks: number }>>,
    ]);

    // Parse JSON fields
    const parseJsonField = (field: string | null) => {
      if (!field) return [];
      try {
        return JSON.parse(field);
      } catch {
        return [];
      }
    };

    // Calculate progress towards targets
    const progress = {
      clicks: campaign.targetClicks 
        ? Math.round((clickStats._count / campaign.targetClicks) * 100) 
        : null,
      conversions: campaign.targetConversions 
        ? Math.round((conversionStats._count / campaign.targetConversions) * 100) 
        : null,
      revenue: campaign.targetRevenue 
        ? Math.round(((conversionStats._sum.saleAmount || 0) / campaign.targetRevenue) * 100)
        : null,
    };

    return NextResponse.json({
      campaign: {
        ...campaign,
        creativesUrls: parseJsonField(campaign.creativesUrls),
        notificationEmails: parseJsonField(campaign.notificationEmails),
        startDate: campaign.startDate.toISOString(),
        endDate: campaign.endDate?.toISOString() || null,
        createdAt: campaign.createdAt.toISOString(),
        updatedAt: campaign.updatedAt.toISOString(),
        links: campaign.links.map((l) => ({
          ...l,
          expiresAt: l.expiresAt?.toISOString() || null,
          createdAt: l.createdAt.toISOString(),
          updatedAt: l.updatedAt.toISOString(),
        })),
      },
      stats: {
        totalClicks: clickStats._count,
        totalConversions: conversionStats._count,
        totalRevenue: conversionStats._sum.saleAmount || 0,
        totalCommission: conversionStats._sum.commissionAmount || 0,
        linksCount: campaign.links.length,
        conversionRate: clickStats._count > 0
          ? ((conversionStats._count / clickStats._count) * 100).toFixed(2)
          : '0.00',
      },
      progress,
      charts: {
        dailyClicks: Array.isArray(dailyClicks) ? dailyClicks : [],
      },
    });
  } catch (error) {
    console.error('Failed to fetch campaign:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    );
  }
}

// PUT - Update campaign
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
    const validation = updateCampaignSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const existing = await prisma.affiliateCampaign.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const data = validation.data;

    const campaign = await prisma.affiliateCampaign.update({
      where: { id },
      data: {
        ...(data.campaignName && { campaignName: data.campaignName }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.campaignType && { campaignType: data.campaignType }),
        ...(data.partnerId !== undefined && { partnerId: data.partnerId }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate !== undefined && { 
          endDate: data.endDate ? new Date(data.endDate) : null 
        }),
        ...(data.budgetAmount !== undefined && { budgetAmount: data.budgetAmount }),
        ...(data.discountCode !== undefined && { discountCode: data.discountCode }),
        ...(data.discountAmount !== undefined && { discountAmount: data.discountAmount }),
        ...(data.discountType !== undefined && { discountType: data.discountType }),
        ...(data.bonusCommission !== undefined && { bonusCommission: data.bonusCommission }),
        ...(data.targetClicks !== undefined && { targetClicks: data.targetClicks }),
        ...(data.targetConversions !== undefined && { targetConversions: data.targetConversions }),
        ...(data.targetRevenue !== undefined && { targetRevenue: data.targetRevenue }),
        ...(data.landingPageUrl !== undefined && { landingPageUrl: data.landingPageUrl }),
        ...(data.utmSource !== undefined && { utmSource: data.utmSource }),
        ...(data.utmMedium !== undefined && { utmMedium: data.utmMedium }),
        ...(data.utmCampaign !== undefined && { utmCampaign: data.utmCampaign }),
        ...(data.creativesUrls && { creativesUrls: JSON.stringify(data.creativesUrls) }),
        ...(data.notificationEmails && { notificationEmails: JSON.stringify(data.notificationEmails) }),
        ...(data.status && { status: data.status }),
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
    console.error('Failed to update campaign:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}

// DELETE - Delete campaign
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const campaign = await prisma.affiliateCampaign.findUnique({
      where: { id },
      include: { _count: { select: { links: true } } },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Only allow deletion if no links are associated
    if (campaign._count.links > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete campaign with existing links. Set status to cancelled instead.',
          linksCount: campaign._count.links,
        },
        { status: 400 }
      );
    }

    await prisma.affiliateCampaign.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete campaign:', error);
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    );
  }
}
