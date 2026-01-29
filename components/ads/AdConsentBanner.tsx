// components/ads/AdConsentBanner.tsx
'use client';

import { useAdConsent } from '@/hooks/useAdConsent';
import styles from '@/styles/ads.module.css';

export const AdConsentBanner: React.FC = () => {
  const { consentStatus, grantConsent, denyConsent } = useAdConsent();

  if (consentStatus !== 'pending') {
    return null;
  }

  return (
    <div className={styles.consentBanner} role="dialog" aria-modal="true" aria-labelledby="consent-title">
      <div className={styles.consentContent}>
        <h3 id="consent-title">🍪 Cookie & Ad Preferences</h3>
        <p>
          BioinformaticsHub uses cookies and displays ads from trusted partners 
          (Carbon Ads & Google AdSense) to support free access to our tools and 
          resources. These ads help us maintain and improve the platform.
        </p>
        <div className={styles.consentActions}>
          <button
            onClick={denyConsent}
            className={styles.consentBtnSecondary}
            type="button"
          >
            Decline Non-Essential
          </button>
          <button
            onClick={grantConsent}
            className={styles.consentBtnPrimary}
            type="button"
          >
            Accept All
          </button>
        </div>
        <a href="/privacy-policy" className={styles.consentLink}>
          Learn more in our Privacy Policy
        </a>
      </div>
    </div>
  );
};

export default AdConsentBanner;
