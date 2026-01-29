/**
 * Affiliate A/B Testing Framework
 * 
 * Enables testing different:
 * - CTA button texts and styles
 * - Product card layouts
 * - Pricing display formats
 * - Disclosure placements
 */

import { cookies } from 'next/headers';
import crypto from 'crypto';

// Experiment types
export interface Experiment {
  id: string;
  name: string;
  description: string;
  variants: Variant[];
  targetPercentage: number; // Percentage of users in experiment
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
}

export interface Variant {
  id: string;
  name: string;
  weight: number; // Distribution weight (e.g., 50 for 50%)
  config: Record<string, unknown>;
}

export interface UserExperiments {
  userId: string;
  assignments: Record<string, string>; // experimentId -> variantId
  createdAt: Date;
}

// Cookie name for storing experiment assignments
const EXPERIMENTS_COOKIE = 'bh_exp';

// Define active experiments
export const experiments: Record<string, Experiment> = {
  'cta-button-text': {
    id: 'cta-button-text',
    name: 'CTA Button Text',
    description: 'Test different call-to-action button texts',
    variants: [
      { id: 'control', name: 'Control', weight: 50, config: { text: 'View Pricing' } },
      { id: 'action', name: 'Action', weight: 50, config: { text: 'Get Started Now' } },
    ],
    targetPercentage: 100,
    startDate: new Date('2024-01-01'),
    endDate: null,
    isActive: true,
  },
  'product-card-layout': {
    id: 'product-card-layout',
    name: 'Product Card Layout',
    description: 'Test different product card designs',
    variants: [
      { id: 'default', name: 'Default', weight: 50, config: { layout: 'vertical', showRating: true } },
      { id: 'compact', name: 'Compact', weight: 50, config: { layout: 'horizontal', showRating: false } },
    ],
    targetPercentage: 50,
    startDate: new Date('2024-01-01'),
    endDate: null,
    isActive: true,
  },
  'pricing-format': {
    id: 'pricing-format',
    name: 'Pricing Display Format',
    description: 'Test different pricing display formats',
    variants: [
      { id: 'simple', name: 'Simple', weight: 33, config: { format: 'simple', showCurrency: false } },
      { id: 'detailed', name: 'Detailed', weight: 33, config: { format: 'detailed', showCurrency: true } },
      { id: 'savings', name: 'Savings', weight: 34, config: { format: 'savings', showOriginal: true } },
    ],
    targetPercentage: 100,
    startDate: new Date('2024-01-01'),
    endDate: null,
    isActive: true,
  },
  'disclosure-position': {
    id: 'disclosure-position',
    name: 'Disclosure Position',
    description: 'Test where to show affiliate disclosure',
    variants: [
      { id: 'top', name: 'Top Banner', weight: 50, config: { position: 'top', type: 'banner' } },
      { id: 'inline', name: 'Inline', weight: 50, config: { position: 'inline', type: 'subtle' } },
    ],
    targetPercentage: 100,
    startDate: new Date('2024-01-01'),
    endDate: null,
    isActive: true,
  },
};

/**
 * Generate a stable user ID for experiment assignment
 */
function generateUserId(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Hash-based deterministic assignment
 * Ensures consistent variant assignment for the same user
 */
function hashAssignment(userId: string, experimentId: string, variants: Variant[]): Variant {
  const hash = crypto
    .createHash('sha256')
    .update(`${userId}:${experimentId}`)
    .digest('hex');
  
  // Convert first 8 chars of hash to a number between 0-100
  const hashValue = parseInt(hash.slice(0, 8), 16) % 100;
  
  // Calculate cumulative weights
  let cumulative = 0;
  for (const variant of variants) {
    cumulative += variant.weight;
    if (hashValue < cumulative) {
      return variant;
    }
  }
  
  // Fallback to last variant
  return variants[variants.length - 1];
}

/**
 * Check if user is in experiment target group
 */
function isInExperiment(userId: string, experiment: Experiment): boolean {
  if (!experiment.isActive) return false;
  if (experiment.endDate && new Date() > experiment.endDate) return false;
  
  const hash = crypto
    .createHash('sha256')
    .update(`${userId}:${experiment.id}:targeting`)
    .digest('hex');
  
  const hashValue = parseInt(hash.slice(0, 8), 16) % 100;
  return hashValue < experiment.targetPercentage;
}

/**
 * Get or create user experiment assignments
 */
export async function getUserExperiments(): Promise<UserExperiments> {
  const cookieStore = await cookies();
  const existingCookie = cookieStore.get(EXPERIMENTS_COOKIE);
  
  if (existingCookie) {
    try {
      return JSON.parse(existingCookie.value);
    } catch {
      // Invalid cookie, will be regenerated
    }
  }
  
  // Generate new user experiments
  const userId = generateUserId();
  const assignments: Record<string, string> = {};
  
  for (const [expId, experiment] of Object.entries(experiments)) {
    if (isInExperiment(userId, experiment)) {
      const variant = hashAssignment(userId, expId, experiment.variants);
      assignments[expId] = variant.id;
    }
  }
  
  const userExperiments: UserExperiments = {
    userId,
    assignments,
    createdAt: new Date(),
  };
  
  // Save to cookie
  cookieStore.set(EXPERIMENTS_COOKIE, JSON.stringify(userExperiments), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 365 * 24 * 60 * 60, // 1 year
    path: '/',
  });
  
  return userExperiments;
}

/**
 * Get variant for a specific experiment
 */
export async function getExperimentVariant(experimentId: string): Promise<Variant | null> {
  const userExperiments = await getUserExperiments();
  const variantId = userExperiments.assignments[experimentId];
  
  if (!variantId) return null;
  
  const experiment = experiments[experimentId];
  if (!experiment) return null;
  
  return experiment.variants.find(v => v.id === variantId) || null;
}

/**
 * Get all active variant assignments for the current user
 */
export async function getActiveVariants(): Promise<Record<string, Variant>> {
  const userExperiments = await getUserExperiments();
  const result: Record<string, Variant> = {};
  
  for (const [expId, variantId] of Object.entries(userExperiments.assignments)) {
    const experiment = experiments[expId];
    if (experiment) {
      const variant = experiment.variants.find(v => v.id === variantId);
      if (variant) {
        result[expId] = variant;
      }
    }
  }
  
  return result;
}

/**
 * Track experiment conversion
 * Call this when a user completes a desired action
 */
export async function trackExperimentConversion(
  experimentId: string,
  eventType: 'click' | 'conversion' | 'view',
  metadata?: Record<string, unknown>
): Promise<void> {
  const userExperiments = await getUserExperiments();
  const variantId = userExperiments.assignments[experimentId];
  
  if (!variantId) return;
  
  // Log the conversion (integrate with your analytics)
  console.log('[Experiment]', {
    experimentId,
    variantId,
    userId: userExperiments.userId,
    eventType,
    metadata,
    timestamp: new Date().toISOString(),
  });
  
  // TODO: Send to analytics service (e.g., Google Analytics, Mixpanel)
  // TODO: Store in database for experiment analysis
}

/**
 * React hook context for experiments (client-side)
 */
export interface ExperimentContextValue {
  variants: Record<string, Variant>;
  getVariant: (experimentId: string) => Variant | undefined;
  getConfig: <T = unknown>(experimentId: string, key: string, defaultValue: T) => T;
  trackConversion: (experimentId: string, eventType: 'click' | 'conversion' | 'view') => void;
}

/**
 * Helper: Get experiment config value with type safety
 */
export function getExperimentConfig<T>(
  variant: Variant | null | undefined,
  key: string,
  defaultValue: T
): T {
  if (!variant?.config) return defaultValue;
  return (variant.config[key] as T) ?? defaultValue;
}
