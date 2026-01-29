// lib/ads/analytics.ts
// Ad analytics and revenue tracking

export interface AdEvent {
  type: 'impression' | 'click' | 'error';
  placementId: string;
  network: 'carbon' | 'adsense';
  pageType: string;
  pagePath: string;
  timestamp: number;
}

// Track ad impression
export function trackAdImpression(
  placementId: string,
  network: 'carbon' | 'adsense',
  pageType: string
): void {
  if (typeof window === 'undefined') return;
  
  const event: AdEvent = {
    type: 'impression',
    placementId,
    network,
    pageType,
    pagePath: window.location.pathname,
    timestamp: Date.now(),
  };

  // Send to Google Analytics 4
  if (window.gtag) {
    window.gtag('event', 'ad_impression', {
      placement_id: placementId,
      ad_network: network,
      page_type: pageType,
    });
  }

  // Log for debugging in development
  if (process.env.NEXT_PUBLIC_AD_DEBUG_MODE === 'true') {
    console.log('[AdAnalytics] Impression:', event);
  }
}

// Track ad click
export function trackAdClick(
  placementId: string,
  network: 'carbon' | 'adsense',
  pageType: string
): void {
  if (typeof window === 'undefined') return;

  if (window.gtag) {
    window.gtag('event', 'ad_click', {
      placement_id: placementId,
      ad_network: network,
      page_type: pageType,
    });
  }

  if (process.env.NEXT_PUBLIC_AD_DEBUG_MODE === 'true') {
    console.log('[AdAnalytics] Click:', { placementId, network, pageType });
  }
}

// Track ad load error
export function trackAdError(
  placementId: string,
  network: 'carbon' | 'adsense',
  error: string
): void {
  if (typeof window === 'undefined') return;

  if (window.gtag) {
    window.gtag('event', 'ad_error', {
      placement_id: placementId,
      ad_network: network,
      error_message: error,
    });
  }

  if (process.env.NEXT_PUBLIC_AD_DEBUG_MODE === 'true') {
    console.warn('[AdAnalytics] Error:', { placementId, network, error });
  }
}

// Track consent events
export function trackConsentEvent(action: 'granted' | 'denied'): void {
  if (typeof window === 'undefined') return;

  if (window.gtag) {
    window.gtag('event', `consent_${action}`, {
      event_category: 'ads',
    });
  }
}
