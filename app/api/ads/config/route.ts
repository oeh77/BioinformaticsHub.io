// app/api/ads/config/route.ts
// Public API endpoint for client-side ad configuration
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Cache for settings (5 minutes TTL)
let cachedSettings: { data: unknown; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper to parse JSON fields safely
function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

// Default public settings
const defaultPublicSettings = {
  adsEnabled: true,
  adDensity: 'medium',
  carbonEnabled: true,
  adsenseEnabled: true,
  carbon: {
    serveUrl: 'https://cdn.carbonads.com/carbon.js',
    placement: 'bioinformaticshubio',
    serveId: '',
  },
  adsense: {
    clientId: '',
    slots: {
      footer: '',
      inContent: '',
      sidebar: '',
      header: '',
    },
  },
  pages: {
    tools: true,
    blog: true,
    courses: true,
    jobs: true,
    resources: true,
    directory: true,
    compare: true,
    home: true,
  },
  placements: {
    header: true,
    footer: true,
    sidebar: true,
    sidebarSticky: true,
    inContent: true,
    beforeComments: false,
    afterHero: true,
    betweenCards: true,
    endOfPage: true,
  },
  premiumAdFree: false,
};

export async function GET() {
  try {
    // Check cache first
    if (cachedSettings && Date.now() - cachedSettings.timestamp < CACHE_TTL) {
      return NextResponse.json(cachedSettings.data, {
        headers: {
          'Cache-Control': 'public, max-age=300, s-maxage=300',
        },
      });
    }

    // Get settings from database
    const dbSettings = await prisma.monetizationSettings.findFirst();

    if (!dbSettings) {
      // Return defaults with environment variables
      const settings = {
        ...defaultPublicSettings,
        carbon: {
          ...defaultPublicSettings.carbon,
          serveId: process.env.NEXT_PUBLIC_CARBON_SERVE_ID || '',
        },
        adsense: {
          clientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || '',
          slots: {
            footer: process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER || '',
            inContent: process.env.NEXT_PUBLIC_ADSENSE_SLOT_INCONTENT || '',
            sidebar: '',
            header: '',
          },
        },
      };

      cachedSettings = { data: settings, timestamp: Date.now() };
      return NextResponse.json(settings, {
        headers: {
          'Cache-Control': 'public, max-age=300, s-maxage=300',
        },
      });
    }

    // Transform DB settings to public format (safe for client-side)
    const pageSettings = safeJsonParse(dbSettings.pageSettings, defaultPublicSettings.pages);
    const placementSettings = safeJsonParse(dbSettings.placementSettings, defaultPublicSettings.placements);

    const settings = {
      adsEnabled: dbSettings.adsEnabled,
      adDensity: dbSettings.adDensity,
      carbonEnabled: dbSettings.carbonEnabled,
      adsenseEnabled: dbSettings.adsenseEnabled,
      carbon: {
        serveUrl: dbSettings.carbonServeUrl,
        placement: dbSettings.carbonPlacement,
        serveId: dbSettings.carbonServeId || '',
      },
      adsense: {
        clientId: dbSettings.adsenseClientId || '',
        slots: {
          footer: dbSettings.adsenseSlotFooter || '',
          inContent: dbSettings.adsenseSlotInContent || '',
          sidebar: dbSettings.adsenseSlotSidebar || '',
          header: dbSettings.adsenseSlotHeader || '',
        },
      },
      pages: pageSettings,
      placements: placementSettings,
      premiumAdFree: dbSettings.premiumAdFree,
    };

    // Update cache
    cachedSettings = { data: settings, timestamp: Date.now() };

    return NextResponse.json(settings, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      },
    });
  } catch (error) {
    console.error('Error fetching public ad config:', error);
    
    // Return safe defaults on error
    return NextResponse.json(defaultPublicSettings, {
      headers: {
        'Cache-Control': 'public, max-age=60',
      },
    });
  }
}

// Invalidate cache endpoint (admin only, called when settings are updated)
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const expectedKey = process.env.CACHE_INVALIDATION_KEY;
    
    if (!expectedKey || authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Clear cache
    cachedSettings = null;

    return NextResponse.json({ success: true, message: 'Cache invalidated' });
  } catch (error) {
    console.error('Error invalidating cache:', error);
    return NextResponse.json({ error: 'Failed to invalidate cache' }, { status: 500 });
  }
}
