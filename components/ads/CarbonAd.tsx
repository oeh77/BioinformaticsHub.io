// components/ads/CarbonAd.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { AD_CONFIG } from '@/lib/adConfig';
import { useAdConsent } from '@/hooks/useAdConsent';
import styles from '@/styles/ads.module.css';

interface CarbonAdProps {
  placement: 'header' | 'sidebar';
  className?: string;
}

export const CarbonAd: React.FC<CarbonAdProps> = ({ 
  placement, 
  className = '' 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { hasConsent } = useAdConsent();
  
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  // Merge refs
  const setRefs = (node: HTMLDivElement | null) => {
    containerRef.current = node;
    inViewRef(node);
  };

  useEffect(() => {
    if (!inView || !hasConsent || isLoaded || !AD_CONFIG.carbon.enabled) {
      return;
    }

    const loadCarbonAd = async () => {
      try {
        // Clean up existing script if any
        const existingScript = document.getElementById('_carbonads_js');
        if (existingScript) {
          existingScript.remove();
        }

        // Create and inject Carbon Ads script
        const script = document.createElement('script');
        script.id = '_carbonads_js';
        script.async = true;
        script.src = `${AD_CONFIG.carbon.serveUrl}?serve=${AD_CONFIG.carbon.serveId}&placement=${AD_CONFIG.carbon.placement}`;
        
        script.onerror = () => {
          setHasError(true);
          console.warn('[CarbonAd] Failed to load - possibly blocked by ad blocker');
        };

        script.onload = () => {
          setIsLoaded(true);
        };

        containerRef.current?.appendChild(script);
      } catch (error) {
        setHasError(true);
        console.error('[CarbonAd] Error loading ad:', error);
      }
    };

    loadCarbonAd();
  }, [inView, hasConsent, isLoaded]);

  // Don't render if no consent or ads disabled
  if (!AD_CONFIG.carbon.enabled || !hasConsent) {
    return null;
  }

  return (
    <div
      ref={setRefs}
      className={`${styles.carbonContainer} ${styles[placement]} ${className}`}
      data-ad-placement={placement}
      data-ad-network="carbon"
      aria-label="Advertisement"
      role="complementary"
    >
      {!isLoaded && !hasError && (
        <div className={styles.adPlaceholder}>
          <span className={styles.adLabel}>Ad</span>
        </div>
      )}
      {hasError && (
        <div className={styles.adFallback}>
          {/* Optional fallback content */}
        </div>
      )}
    </div>
  );
};

export default CarbonAd;
