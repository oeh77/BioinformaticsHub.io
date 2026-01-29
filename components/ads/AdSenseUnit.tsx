// components/ads/AdSenseUnit.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { AD_CONFIG } from '@/lib/adConfig';
import { useAdConsent } from '@/hooks/useAdConsent';
import styles from '@/styles/ads.module.css';

interface AdSenseUnitProps {
  slot: 'footer' | 'inContent';
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
  responsive?: boolean;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export const AdSenseUnit: React.FC<AdSenseUnitProps> = ({
  slot,
  format = 'auto',
  responsive = true,
  className = '',
}) => {
  const adRef = useRef<HTMLModElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { hasConsent } = useAdConsent();
  
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
    rootMargin: '200px', // Preload when 200px away
  });

  const setRefs = (node: HTMLModElement | null) => {
    adRef.current = node;
    inViewRef(node);
  };

  // Load AdSense script once
  useEffect(() => {
    if (!AD_CONFIG.adsense.enabled || !hasConsent) return;

    const existingScript = document.querySelector(
      'script[src*="adsbygoogle.js"]'
    );
    
    if (!existingScript) {
      const script = document.createElement('script');
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CONFIG.adsense.clientId}`;
      document.head.appendChild(script);
    }
  }, [hasConsent]);

  // Push ad when in view
  useEffect(() => {
    if (!inView || isLoaded || !hasConsent || !AD_CONFIG.adsense.enabled) {
      return;
    }

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
      setIsLoaded(true);
    } catch (error) {
      console.error('[AdSense] Error pushing ad:', error);
    }
  }, [inView, isLoaded, hasConsent]);

  if (!AD_CONFIG.adsense.enabled || !hasConsent) {
    return null;
  }

  const slotId = AD_CONFIG.adsense.slots[slot];

  return (
    <div
      className={`${styles.adsenseContainer} ${styles[slot]} ${className}`}
      data-ad-placement={slot}
      data-ad-network="adsense"
      aria-label="Advertisement"
      role="complementary"
    >
      <ins
        ref={setRefs}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={AD_CONFIG.adsense.clientId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
};

export default AdSenseUnit;
