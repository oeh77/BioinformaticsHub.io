// app/api/admin/monetization/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Helper to parse JSON fields safely
function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

// Default settings structure
const defaultSettings = {
  adsEnabled: true,
  adDensity: 'medium' as const,
  debugMode: false,
  carbonEnabled: true,
  adsenseEnabled: true,
  carbonConfig: {
    serveUrl: 'https://cdn.carbonads.com/carbon.js',
    placement: 'bioinformaticshubio',
    serveId: '',
  },
  adsenseConfig: {
    clientId: '',
    slotFooter: '',
    slotInContent: '',
    slotSidebar: '',
    slotHeader: '',
  },
  pageSettings: {
    tools: true,
    blog: true,
    courses: true,
    jobs: true,
    resources: true,
    directory: true,
    compare: true,
    home: true,
  },
  placementSettings: {
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
  abTesting: {
    enabled: false,
    sidebarExperiment: false,
    footerExperiment: false,
    inContentExperiment: false,
  },
  premiumAdFree: false,
  trackImpressions: true,
  trackClicks: true,
  gaPropertyId: '',
};

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create monetization settings
    let dbSettings = await prisma.monetizationSettings.findFirst();

    if (!dbSettings) {
      // Create default settings on first access
      dbSettings = await prisma.monetizationSettings.create({
        data: {
          adsEnabled: defaultSettings.adsEnabled,
          adDensity: defaultSettings.adDensity,
          debugMode: defaultSettings.debugMode,
          carbonEnabled: defaultSettings.carbonEnabled,
          adsenseEnabled: defaultSettings.adsenseEnabled,
          carbonServeUrl: defaultSettings.carbonConfig.serveUrl,
          carbonPlacement: defaultSettings.carbonConfig.placement,
          carbonServeId: process.env.NEXT_PUBLIC_CARBON_SERVE_ID || '',
          adsenseClientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || '',
          adsenseSlotFooter: process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER || '',
          adsenseSlotInContent: process.env.NEXT_PUBLIC_ADSENSE_SLOT_INCONTENT || '',
          pageSettings: JSON.stringify(defaultSettings.pageSettings),
          placementSettings: JSON.stringify(defaultSettings.placementSettings),
          abTestingConfig: JSON.stringify(defaultSettings.abTesting),
          premiumAdFree: defaultSettings.premiumAdFree,
          trackImpressions: defaultSettings.trackImpressions,
          trackClicks: defaultSettings.trackClicks,
        },
      });
    }

    // Transform DB format to API format
    const settings = {
      adsEnabled: dbSettings.adsEnabled,
      adDensity: dbSettings.adDensity,
      debugMode: dbSettings.debugMode,
      carbonEnabled: dbSettings.carbonEnabled,
      adsenseEnabled: dbSettings.adsenseEnabled,
      carbonConfig: {
        serveUrl: dbSettings.carbonServeUrl,
        placement: dbSettings.carbonPlacement,
        serveId: dbSettings.carbonServeId || '',
      },
      adsenseConfig: {
        clientId: dbSettings.adsenseClientId || '',
        slotFooter: dbSettings.adsenseSlotFooter || '',
        slotInContent: dbSettings.adsenseSlotInContent || '',
        slotSidebar: dbSettings.adsenseSlotSidebar || '',
        slotHeader: dbSettings.adsenseSlotHeader || '',
      },
      pageSettings: safeJsonParse(dbSettings.pageSettings, defaultSettings.pageSettings),
      placementSettings: safeJsonParse(dbSettings.placementSettings, defaultSettings.placementSettings),
      abTesting: safeJsonParse(dbSettings.abTestingConfig, defaultSettings.abTesting),
      premiumAdFree: dbSettings.premiumAdFree,
      trackImpressions: dbSettings.trackImpressions,
      trackClicks: dbSettings.trackClicks,
      gaPropertyId: dbSettings.gaPropertyId || '',
    };

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching monetization settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Validate density
    const validDensities = ['low', 'medium', 'high'];
    if (data.adDensity && !validDensities.includes(data.adDensity)) {
      return NextResponse.json(
        { error: 'Invalid ad density value' },
        { status: 400 }
      );
    }

    // Get existing settings or create
    let existingSettings = await prisma.monetizationSettings.findFirst();

    const updateData = {
      adsEnabled: data.adsEnabled ?? defaultSettings.adsEnabled,
      adDensity: data.adDensity ?? defaultSettings.adDensity,
      debugMode: data.debugMode ?? defaultSettings.debugMode,
      carbonEnabled: data.carbonEnabled ?? defaultSettings.carbonEnabled,
      adsenseEnabled: data.adsenseEnabled ?? defaultSettings.adsenseEnabled,
      carbonServeUrl: data.carbonConfig?.serveUrl ?? defaultSettings.carbonConfig.serveUrl,
      carbonPlacement: data.carbonConfig?.placement ?? defaultSettings.carbonConfig.placement,
      carbonServeId: data.carbonConfig?.serveId ?? '',
      adsenseClientId: data.adsenseConfig?.clientId ?? '',
      adsenseSlotFooter: data.adsenseConfig?.slotFooter ?? '',
      adsenseSlotInContent: data.adsenseConfig?.slotInContent ?? '',
      adsenseSlotSidebar: data.adsenseConfig?.slotSidebar ?? '',
      adsenseSlotHeader: data.adsenseConfig?.slotHeader ?? '',
      pageSettings: JSON.stringify(data.pageSettings ?? defaultSettings.pageSettings),
      placementSettings: JSON.stringify(data.placementSettings ?? defaultSettings.placementSettings),
      abTestingConfig: JSON.stringify(data.abTesting ?? defaultSettings.abTesting),
      premiumAdFree: data.premiumAdFree ?? defaultSettings.premiumAdFree,
      trackImpressions: data.trackImpressions ?? defaultSettings.trackImpressions,
      trackClicks: data.trackClicks ?? defaultSettings.trackClicks,
      gaPropertyId: data.gaPropertyId ?? '',
    };

    if (existingSettings) {
      await prisma.monetizationSettings.update({
        where: { id: existingSettings.id },
        data: updateData,
      });
    } else {
      await prisma.monetizationSettings.create({
        data: updateData,
      });
    }

    console.log('Monetization settings saved to database');

    return NextResponse.json({ 
      success: true,
      message: 'Settings saved successfully',
    });
  } catch (error) {
    console.error('Error updating monetization settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
