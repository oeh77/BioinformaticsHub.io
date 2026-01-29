/**
 * Admin API - Individual Link Operations
 * 
 * GET /api/admin/affiliate/links/[id] - Get link details
 * PUT /api/admin/affiliate/links/[id] - Update link
 * DELETE /api/admin/affiliate/links/[id] - Delete link
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateLinkSchema = z.object({
  status: z.enum(['active', 'paused', 'expired']).optional(),
  placementType: z.string().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  customParameters: z.record(z.string(), z.string()).optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET - Get link details with click statistics
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

    const link = await prisma.affiliateLink.findUnique({
      where: { id },
      include: {
        partner: { select: { id: true, companyName: true } },
        product: { select: { id: true, productName: true } },
        _count: { select: { clicks: true } },
      },
    });

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    // Get click statistics
    const clickStats = await prisma.affiliateClick.groupBy({
      by: ['deviceType'],
      where: { linkId: id },
      _count: true,
    });

    // Get recent clicks
    const recentClicks = await prisma.affiliateClick.findMany({
      where: { linkId: id },
      orderBy: { clickedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        clickedAt: true,
        ipAddress: true,
        countryCode: true,
        deviceType: true,
        browser: true,
        isBot: true,
      },
    });

    // Parse custom parameters
    let customParameters = {};
    if (link.customParameters) {
      try {
        customParameters = JSON.parse(link.customParameters);
      } catch {}
    }

    return NextResponse.json({
      link: {
        ...link,
        customParameters,
        expiresAt: link.expiresAt?.toISOString() || null,
        createdAt: link.createdAt.toISOString(),
        updatedAt: link.updatedAt.toISOString(),
      },
      stats: {
        totalClicks: link._count.clicks,
        totalConversions: link.totalConversions, // Use cached value from Link model
        conversionRate: link._count.clicks > 0 
          ? ((link.totalConversions / link._count.clicks) * 100).toFixed(2) 
          : '0.00',
        deviceBreakdown: clickStats,
      },
      recentClicks: recentClicks.map((c) => ({
        ...c,
        clickedAt: c.clickedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Failed to fetch link:', error);
    return NextResponse.json(
      { error: 'Failed to fetch link' },
      { status: 500 }
    );
  }
}

// PUT - Update link
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
    const validation = updateLinkSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const existing = await prisma.affiliateLink.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    const data = validation.data;

    const link = await prisma.affiliateLink.update({
      where: { id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.placementType && { placementType: data.placementType }),
        ...(data.expiresAt !== undefined && { 
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : null 
        }),
        ...(data.customParameters && { customParameters: JSON.stringify(data.customParameters) }),
      },
    });

    return NextResponse.json({
      link: {
        ...link,
        expiresAt: link.expiresAt?.toISOString() || null,
        createdAt: link.createdAt.toISOString(),
        updatedAt: link.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to update link:', error);
    return NextResponse.json(
      { error: 'Failed to update link' },
      { status: 500 }
    );
  }
}

// DELETE - Delete link
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

    const link = await prisma.affiliateLink.findUnique({
      where: { id },
      include: { _count: { select: { clicks: true } } },
    });

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    // Prevent deletion if there are conversions (check totalConversions cached field)
    if (link.totalConversions > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete link with existing conversions. Pause it instead.',
          conversions: link.totalConversions,
        },
        { status: 400 }
      );
    }

    // Delete the link (will cascade to clicks)
    await prisma.affiliateLink.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete link:', error);
    return NextResponse.json(
      { error: 'Failed to delete link' },
      { status: 500 }
    );
  }
}
