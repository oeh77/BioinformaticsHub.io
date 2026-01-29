// components/ads/SponsoredCard.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAdConsent } from '@/hooks/useAdConsent';
import { trackAdClick, trackAdImpression } from '@/lib/ads/analytics';
import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';
import styles from '@/styles/ads.module.css';

interface SponsoredCardProps {
  title: string;
  description: string;
  imageUrl?: string;
  href: string;
  sponsor: string;
  category?: string;
  placementId: string;
  pageType?: string;
  className?: string;
}

/**
 * Native-looking sponsored card that blends with regular tool/course cards.
 * Clearly labeled as "Sponsored" for transparency.
 */
export const SponsoredCard: React.FC<SponsoredCardProps> = ({
  title,
  description,
  imageUrl,
  href,
  sponsor,
  category,
  placementId,
  pageType = 'generic',
  className = '',
}) => {
  const { hasConsent } = useAdConsent();
  const [hasImpression, setHasImpression] = useState(false);
  
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });

  // Track impression when card is visible
  useEffect(() => {
    if (inView && hasConsent && !hasImpression) {
      trackAdImpression(placementId, 'carbon', pageType);
      setHasImpression(true);
    }
  }, [inView, hasConsent, placementId, pageType, hasImpression]);

  // Don't render without consent
  if (!hasConsent) {
    return null;
  }

  const handleClick = () => {
    trackAdClick(placementId, 'carbon', pageType);
  };

  return (
    <div ref={ref} className={`${styles.sponsoredCard} ${className}`}>
      <Link 
        href={href} 
        target="_blank" 
        rel="noopener sponsored"
        onClick={handleClick}
        className={styles.sponsoredCardLink}
      >
        {imageUrl && (
          <div className={styles.sponsoredCardImage}>
            <Image
              src={imageUrl}
              alt={title}
              width={300}
              height={160}
              className="object-cover w-full h-full rounded-t-lg"
            />
          </div>
        )}
        
        <div className={styles.sponsoredCardContent}>
          <div className={styles.sponsoredBadge}>
            <span>Sponsored</span>
            {category && <span className={styles.sponsoredCategory}>{category}</span>}
          </div>
          
          <h3 className={styles.sponsoredCardTitle}>{title}</h3>
          <p className={styles.sponsoredCardDescription}>{description}</p>
          
          <div className={styles.sponsoredCardFooter}>
            <span className={styles.sponsoredBy}>by {sponsor}</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default SponsoredCard;
