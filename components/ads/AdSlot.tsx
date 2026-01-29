// components/ads/AdSlot.tsx
'use client';

import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useAdConsent } from '@/hooks/useAdConsent';
import { AD_CONFIG } from '@/lib/adConfig';
import { getPlacement, DENSITY_THRESHOLDS, type AdDensity } from '@/lib/ads/placements';
import { trackAdImpression, trackAdError } from '@/lib/ads/analytics';
import { CarbonAd } from './CarbonAd';
import { AdSenseUnit } from './AdSenseUnit';
import styles from '@/styles/ads.module.css';

interface AdSlotProps {
  placementId: string;
  pageType?: string;
  density?: AdDensity;
  fallback?: React.ReactNode;
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({
  placementId,
  pageType = 'generic',
  density = 'medium',
  fallback,
  className = '',
}) => {
  const { hasConsent } = useAdConsent();
  const [hasError, setHasError] = useState(false);
  const [hasImpression, setHasImpression] = useState(false);
  
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const placement = getPlacement(placementId);

  // Check if this placement should show based on density
  const shouldShow = placement && placement.priority >= DENSITY_THRESHOLDS[density];

  // Track impression when ad comes into view
  useEffect(() => {
    if (inView && hasConsent && placement && shouldShow && !hasImpression) {
      trackAdImpression(placementId, placement.network, pageType);
      setHasImpression(true);
    }
  }, [inView, hasConsent, placement, placementId, pageType, shouldShow, hasImpression]);

  // Don't render if no consent, ads disabled, or density too low
  if (!hasConsent || !AD_CONFIG.carbon.enabled || !placement || !shouldShow) {
    return fallback ? <>{fallback}</> : null;
  }

  // Show fallback on error
  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  const handleError = () => {
    setHasError(true);
    trackAdError(placementId, placement.network, 'Failed to load');
  };

  return (
    <div
      ref={ref}
      className={`${styles.adSlot} ${className}`}
      data-placement-id={placementId}
      data-page-type={pageType}
    >
      {placement.network === 'carbon' ? (
        <CarbonAd 
          placement={placementId as 'header' | 'sidebar'} 
          className={className}
        />
      ) : (
        <AdSenseUnit
          slot={placement.format === 'native' ? 'inContent' : 'footer'}
          format={
            placement.format === 'rectangle' || placement.format === 'display' ? 'rectangle' :
            placement.format === 'leaderboard' || placement.format === 'banner' ? 'horizontal' :
            placement.format === 'skyscraper' ? 'vertical' : 'auto'
          }
          className={className}
        />
      )}
    </div>
  );
};

export default AdSlot;
