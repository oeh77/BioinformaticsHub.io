// hooks/useAdConsent.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { AD_CONFIG } from '@/lib/adConfig';

type ConsentStatus = 'granted' | 'denied' | 'pending';

interface UseAdConsentReturn {
  consentStatus: ConsentStatus;
  hasConsent: boolean;
  grantConsent: () => void;
  denyConsent: () => void;
  resetConsent: () => void;
}

export const useAdConsent = (): UseAdConsentReturn => {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>('pending');

  // Load consent from cookie on mount
  useEffect(() => {
    const savedConsent = Cookies.get(AD_CONFIG.consent.cookieName);
    if (savedConsent === 'granted' || savedConsent === 'denied') {
      setConsentStatus(savedConsent);
    }
  }, []);

  const grantConsent = useCallback(() => {
    Cookies.set(AD_CONFIG.consent.cookieName, 'granted', {
      expires: AD_CONFIG.consent.cookieExpiry,
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
    });
    setConsentStatus('granted');
    
    // Trigger Google Consent Mode v2
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
        analytics_storage: 'granted',
      });
    }
  }, []);

  const denyConsent = useCallback(() => {
    Cookies.set(AD_CONFIG.consent.cookieName, 'denied', {
      expires: AD_CONFIG.consent.cookieExpiry,
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
    });
    setConsentStatus('denied');
  }, []);

  const resetConsent = useCallback(() => {
    Cookies.remove(AD_CONFIG.consent.cookieName);
    setConsentStatus('pending');
  }, []);

  return {
    consentStatus,
    hasConsent: consentStatus === 'granted',
    grantConsent,
    denyConsent,
    resetConsent,
  };
};
