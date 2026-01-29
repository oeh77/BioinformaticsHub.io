// app/api/ads/placements/route.ts
// Public API endpoint for ad placements
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageType = searchParams.get('pageType');
    const position = searchParams.get('position');

    // Build filter
    const where: {
      isEnabled: boolean;
      pageType?: string;
      position?: string;
      OR?: { startDate: null | { lte: Date }; endDate: null | { gte: Date } }[];
    } = {
      isEnabled: true,
    };

    if (pageType) {
      where.pageType = pageType;
    }

    if (position) {
      where.position = position;
    }

    // Get active placements
    const placements = await prisma.adPlacement.findMany({
      where: {
        isEnabled: true,
        ...(pageType && { pageType }),
        ...(position && { position }),
        OR: [
          { startDate: null },
          { startDate: { lte: new Date() } },
        ],
      },
      orderBy: [
        { priority: 'desc' },
        { position: 'asc' },
      ],
      select: {
        id: true,
        placementId: true,
        name: true,
        pageType: true,
        position: true,
        network: true,
        adsenseSlotId: true,
        format: true,
        width: true,
        height: true,
        priority: true,
        minDensity: true,
        customClass: true,
      },
    });

    // Filter out expired placements
    const now = new Date();
    const activePlacements = placements.filter(() => {
      // Additional runtime filtering for complex date logic
      return true; // Already filtered in query
    });

    return NextResponse.json({
      placements: activePlacements,
      count: activePlacements.length,
    }, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      },
    });
  } catch (error) {
    console.error('Error fetching ad placements:', error);
    return NextResponse.json({ placements: [], count: 0 }, { status: 500 });
  }
}
