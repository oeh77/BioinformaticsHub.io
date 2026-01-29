/**
 * Partner API - Partner Links Management
 * 
 * GET /api/partner/links - List partner's links
 * POST /api/partner/links - Create a new affiliate link
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPartnerSession } from '@/lib/affiliate/partner-auth';
import { generateShortCode } from '@/lib/affiliate/link-generator';

// GET - List partner's links
export async function GET(request: NextRequest) {
  try {
    const partnerSession = await verifyPartnerSession(request);
    if (!partnerSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'all';
    const campaignId = searchParams.get('campaign');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build where clause
    const where: Record<string, unknown> = {
      partnerId: partnerSession.partnerId,
    };

    if (status !== 'all') {
      where.status = status;
    }

    if (campaignId) {
      where.campaignId = campaignId;
    }

    // Get links with stats
    const links = await prisma.affiliateLink.findMany({
      where,
      include: {
        product: { select: { productName: true, productUrl: true } },
        campaign: { select: { campaignName: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Get click and conversion stats for each link
    const linksWithStats = await Promise.all(
      links.map(async (link) => {
        const [clickCount, conversionStats] = await Promise.all([
          prisma.affiliateClick.count({ where: { linkId: link.id } }),
          prisma.affiliateConversion.aggregate({
            where: { linkId: link.id },
            _count: true,
            _sum: { commissionAmount: true },
          }),
        ]);

        return {
          id: link.id,
          shortCode: link.shortCode,
          name: link.name,
          originalUrl: link.originalUrl,
          status: link.status,
          createdAt: link.createdAt.toISOString(),
          expiresAt: link.expiresAt?.toISOString() || null,
          product: link.product ? {
            name: link.product.productName,
            url: link.product.productUrl,
          } : null,
          campaign: link.campaign ? {
            name: link.campaign.campaignName,
          } : null,
          stats: {
            clicks: clickCount,
            conversions: conversionStats._count,
            commission: conversionStats._sum?.commissionAmount || 0,
            conversionRate: clickCount > 0 
              ? parseFloat(((conversionStats._count / clickCount) * 100).toFixed(2))
              : 0,
          },
        };
      })
    );

    // Get total count
    const total = await prisma.affiliateLink.count({ where });

    // Get summary stats
    const allLinkIds = linksWithStats.map(l => l.id);
    const [totalClicks, totalConversions] = await Promise.all([
      prisma.affiliateClick.count({ 
        where: { linkId: { in: allLinkIds } } 
      }),
      prisma.affiliateConversion.aggregate({
        where: { linkId: { in: allLinkIds } },
        _count: true,
        _sum: { commissionAmount: true },
      }),
    ]);

    return NextResponse.json({
      links: linksWithStats,
      summary: {
        totalLinks: total,
        activeLinks: linksWithStats.filter(l => l.status === 'active').length,
        totalClicks,
        totalConversions: totalConversions._count,
        totalCommission: totalConversions._sum?.commissionAmount || 0,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch partner links:', error);
    return NextResponse.json(
      { error: 'Failed to fetch links' },
      { status: 500 }
    );
  }
}

// POST - Create a new affiliate link
export async function POST(request: NextRequest) {
  try {
    const partnerSession = await verifyPartnerSession(request);
    if (!partnerSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, campaignId, name, customUrl } = body;

    // Validate product exists
    if (productId) {
      const product = await prisma.affiliateProduct.findUnique({
        where: { id: productId },
      });
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
    }

    // Validate campaign if provided
    if (campaignId) {
      const campaign = await prisma.affiliateCampaign.findFirst({
        where: {
          id: campaignId,
          OR: [
            { partnerIds: { contains: partnerSession.partnerId } },
            { partnerIds: null },
          ],
          status: 'active',
        },
      });
      if (!campaign) {
        return NextResponse.json({ error: 'Campaign not available' }, { status: 404 });
      }
    }

    // Generate short code
    const shortCode = await generateShortCode();

    // Determine the original URL
    let originalUrl = customUrl;
    if (!originalUrl && productId) {
      const product = await prisma.affiliateProduct.findUnique({
        where: { id: productId },
        select: { productUrl: true },
      });
      originalUrl = product?.productUrl;
    }

    if (!originalUrl) {
      return NextResponse.json(
        { error: 'Either productId or customUrl is required' },
        { status: 400 }
      );
    }

    // Create the link
    const link = await prisma.affiliateLink.create({
      data: {
        shortCode,
        originalUrl,
        name: name || null,
        partnerId: partnerSession.partnerId,
        productId: productId || null,
        campaignId: campaignId || null,
        status: 'active',
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    return NextResponse.json({
      success: true,
      link: {
        id: link.id,
        shortCode: link.shortCode,
        shortUrl: `${baseUrl}/go/${link.shortCode}`,
        originalUrl: link.originalUrl,
        name: link.name,
        status: link.status,
        createdAt: link.createdAt.toISOString(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create link:', error);
    return NextResponse.json(
      { error: 'Failed to create link' },
      { status: 500 }
    );
  }
}
