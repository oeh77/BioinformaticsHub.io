// lib/adConfig.ts
// Centralized configuration for Carbon Ads and Google AdSense

export const AD_CONFIG = {
  carbon: {
    enabled: process.env.NEXT_PUBLIC_ADS_ENABLED === 'true',
    serveUrl: process.env.NEXT_PUBLIC_CARBON_SERVE_URL || 'https://cdn.carbonads.com/carbon.js',
    placement: process.env.NEXT_PUBLIC_CARBON_PLACEMENT || 'bioinformaticshubio',
    serveId: process.env.NEXT_PUBLIC_CARBON_SERVE_ID || 'CKYICKJL',
    refreshInterval: 30000, // 30 seconds
  },
  adsense: {
    enabled: process.env.NEXT_PUBLIC_ADS_ENABLED === 'true',
    clientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-XXXXXXXXXXXXXXXX',
    slots: {
      footer: process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER || '1234567890',
      inContent: process.env.NEXT_PUBLIC_ADSENSE_SLOT_INCONTENT || '0987654321',
    },
  },
  consent: {
    cookieName: 'biohub_ad_consent',
    cookieExpiry: 365, // days
  },
  placements: {
    header: { network: 'carbon' as const, position: 'top-right' },
    sidebar: { network: 'carbon' as const, position: 'sticky-top' },
    footer: { network: 'adsense' as const, position: 'centered' },
    inContent: { network: 'adsense' as const, position: 'after-paragraph-3' },
  },
} as const;

export type AdPlacement = keyof typeof AD_CONFIG.placements;
