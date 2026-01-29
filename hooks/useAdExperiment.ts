// hooks/useAdExperiment.ts
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Cookies from 'js-cookie';

type ExperimentVariant = 'A' | 'B' | 'control';

interface ExperimentConfig {
  id: string;
  variants: ExperimentVariant[];
  weights?: number[]; // Probability weights for each variant
}

interface UseAdExperimentReturn {
  variant: ExperimentVariant;
  isLoading: boolean;
  trackConversion: (value?: number) => void;
  trackImpression: () => void;
}

// Predefined experiments
export const AD_EXPERIMENTS: Record<string, ExperimentConfig> = {
  'sidebar-position': {
    id: 'sidebar-position',
    variants: ['A', 'B', 'control'],
    weights: [0.4, 0.4, 0.2], // 40% A, 40% B, 20% control
  },
  'footer-ad-format': {
    id: 'footer-ad-format',
    variants: ['A', 'B'],
    weights: [0.5, 0.5],
  },
  'inline-ad-frequency': {
    id: 'inline-ad-frequency',
    variants: ['A', 'B', 'control'],
    weights: [0.33, 0.33, 0.34],
  },
};

/**
 * Select a variant based on weighted random selection
 */
function selectVariant(config: ExperimentConfig): ExperimentVariant {
  const weights = config.weights || config.variants.map(() => 1 / config.variants.length);
  const random = Math.random();
  let cumulative = 0;

  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (random < cumulative) {
      return config.variants[i];
    }
  }

  return config.variants[config.variants.length - 1];
}

/**
 * Hook for A/B testing ad placements
 */
export function useAdExperiment(experimentId: string): UseAdExperimentReturn {
  const [variant, setVariant] = useState<ExperimentVariant>('control');
  const [isLoading, setIsLoading] = useState(true);

  const config = useMemo(() => AD_EXPERIMENTS[experimentId], [experimentId]);
  const cookieName = `ad_exp_${experimentId}`;

  useEffect(() => {
    if (!config) {
      setIsLoading(false);
      return;
    }

    // Check if user already has a variant assigned
    const existingVariant = Cookies.get(cookieName) as ExperimentVariant | undefined;

    if (existingVariant && config.variants.includes(existingVariant)) {
      setVariant(existingVariant);
    } else {
      // Assign a new variant
      const newVariant = selectVariant(config);
      setVariant(newVariant);
      
      // Store for 30 days to ensure consistent experience
      Cookies.set(cookieName, newVariant, {
        expires: 30,
        sameSite: 'Lax',
      });
    }

    setIsLoading(false);
  }, [config, cookieName]);

  const trackImpression = useCallback(() => {
    if (typeof window === 'undefined' || !window.gtag) return;

    window.gtag('event', 'experiment_impression', {
      experiment_id: experimentId,
      variant: variant,
    });
  }, [experimentId, variant]);

  const trackConversion = useCallback((value?: number) => {
    if (typeof window === 'undefined' || !window.gtag) return;

    window.gtag('event', 'experiment_conversion', {
      experiment_id: experimentId,
      variant: variant,
      value: value,
    });
  }, [experimentId, variant]);

  return {
    variant,
    isLoading,
    trackConversion,
    trackImpression,
  };
}

export default useAdExperiment;
