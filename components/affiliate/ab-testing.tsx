/**
 * A/B Testing React Context and Hooks
 * 
 * Provides client-side access to experiment variants
 */

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface Variant {
  id: string;
  name: string;
  weight: number;
  config: Record<string, unknown>;
}

interface ExperimentContextValue {
  variants: Record<string, Variant>;
  loading: boolean;
  getVariant: (experimentId: string) => Variant | undefined;
  getConfig: <T = unknown>(experimentId: string, key: string, defaultValue: T) => T;
  trackConversion: (experimentId: string, eventType: 'click' | 'conversion' | 'view') => void;
}

const ExperimentContext = createContext<ExperimentContextValue | null>(null);

interface ExperimentProviderProps {
  children: React.ReactNode;
  initialVariants?: Record<string, Variant>;
}

export function ExperimentProvider({ children, initialVariants = {} }: ExperimentProviderProps) {
  const [variants, setVariants] = useState<Record<string, Variant>>(initialVariants);
  const [loading, setLoading] = useState(Object.keys(initialVariants).length === 0);

  useEffect(() => {
    // If we have initial variants from server, don't fetch
    if (Object.keys(initialVariants).length > 0) return;

    // Fetch variants from API (optional - for client-only scenarios)
    async function fetchVariants() {
      try {
        const response = await fetch('/api/affiliate/experiments');
        if (response.ok) {
          const data = await response.json();
          setVariants(data.variants || {});
        }
      } catch (error) {
        console.error('Failed to fetch experiments:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchVariants();
  }, [initialVariants]);

  const getVariant = useCallback(
    (experimentId: string): Variant | undefined => {
      return variants[experimentId];
    },
    [variants]
  );

  const getConfig = useCallback(
    <T = unknown>(experimentId: string, key: string, defaultValue: T): T => {
      const variant = variants[experimentId];
      if (!variant?.config) return defaultValue;
      return (variant.config[key] as T) ?? defaultValue;
    },
    [variants]
  );

  const trackConversion = useCallback(
    (experimentId: string, eventType: 'click' | 'conversion' | 'view') => {
      const variant = variants[experimentId];
      if (!variant) return;

      // Send tracking event
      fetch('/api/affiliate/experiments/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experimentId,
          variantId: variant.id,
          eventType,
          timestamp: new Date().toISOString(),
        }),
      }).catch(console.error);

      // Also track via Google Analytics if available
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', `experiment_${eventType}`, {
          experiment_id: experimentId,
          variant_id: variant.id,
          variant_name: variant.name,
        });
      }
    },
    [variants]
  );

  return (
    <ExperimentContext.Provider
      value={{ variants, loading, getVariant, getConfig, trackConversion }}
    >
      {children}
    </ExperimentContext.Provider>
  );
}

/**
 * Hook to access experiment variants
 */
export function useExperiments(): ExperimentContextValue {
  const context = useContext(ExperimentContext);
  if (!context) {
    throw new Error('useExperiments must be used within an ExperimentProvider');
  }
  return context;
}

/**
 * Hook for a specific experiment
 */
export function useExperiment(experimentId: string) {
  const { getVariant, getConfig, trackConversion, loading } = useExperiments();
  const variant = getVariant(experimentId);

  return {
    variant,
    loading,
    isControl: variant?.id === 'control',
    config: variant?.config || {},
    getConfig: <T = unknown>(key: string, defaultValue: T) =>
      getConfig(experimentId, key, defaultValue),
    trackClick: () => trackConversion(experimentId, 'click'),
    trackConversion: () => trackConversion(experimentId, 'conversion'),
    trackView: () => trackConversion(experimentId, 'view'),
  };
}

/**
 * Component that renders different content based on variant
 */
interface VariantProps {
  experimentId: string;
  variants: Record<string, React.ReactNode>;
  fallback?: React.ReactNode;
}

export function Variant({ experimentId, variants, fallback }: VariantProps) {
  const { getVariant, loading } = useExperiments();
  const variant = getVariant(experimentId);

  if (loading) {
    return fallback || null;
  }

  if (variant && variants[variant.id]) {
    return <>{variants[variant.id]}</>;
  }

  // Return control variant or first variant as fallback
  return <>{variants.control || Object.values(variants)[0] || fallback}</>;
}

/**
 * A/B tested CTA button
 */
interface ABTestButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  experimentId: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function ABTestButton({
  experimentId,
  children,
  onClick,
  ...props
}: ABTestButtonProps) {
  const { getConfig, trackClick } = useExperiment(experimentId);
  const buttonText = getConfig('text', children);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    trackClick();
    onClick?.(e);
  };

  return (
    <button {...props} onClick={handleClick}>
      {buttonText as React.ReactNode}
    </button>
  );
}
