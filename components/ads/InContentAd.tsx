// components/ads/InContentAd.tsx
'use client';

import React, { useMemo } from 'react';
import { AdSlot } from './AdSlot';
import type { AdDensity } from '@/lib/ads/placements';

interface InContentAdProps {
  content: string;
  pageType: string;
  density?: AdDensity;
  insertAfterParagraphs?: number[];
  placementPrefix?: string;
}

/**
 * Component that renders content with ads automatically inserted
 * after specified paragraph numbers.
 */
export const InContentAd: React.FC<InContentAdProps> = ({
  content,
  pageType,
  density = 'medium',
  insertAfterParagraphs = [3, 7],
  placementPrefix = 'inline',
}) => {
  const contentWithAds = useMemo(() => {
    // Split content by paragraph breaks
    const paragraphs = content.split(/\n\n+/);
    const result: React.ReactNode[] = [];

    paragraphs.forEach((paragraph, index) => {
      const paragraphNumber = index + 1;
      
      // Add the paragraph
      result.push(
        <div key={`p-${index}`} className="prose-paragraph">
          <p dangerouslySetInnerHTML={{ __html: paragraph }} />
        </div>
      );

      // Check if we should insert an ad after this paragraph
      if (insertAfterParagraphs.includes(paragraphNumber)) {
        const adIndex = insertAfterParagraphs.indexOf(paragraphNumber) + 1;
        result.push(
          <div key={`ad-${index}`} className="my-8">
            <AdSlot
              placementId={`${placementPrefix}-${adIndex}`}
              pageType={pageType}
              density={density}
            />
          </div>
        );
      }
    });

    return result;
  }, [content, pageType, density, insertAfterParagraphs, placementPrefix]);

  return <div className="in-content-wrapper">{contentWithAds}</div>;
};

export default InContentAd;
