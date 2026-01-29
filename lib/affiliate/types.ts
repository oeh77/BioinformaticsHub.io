/**
 * Affiliate Marketing System - Type Definitions
 */

// Industry categories for affiliate partners
export const INDUSTRY_CATEGORIES = [
  'software',
  'equipment',
  'services',
  'education',
  'reagents',
  'cloud',
  'consumables',
] as const;

export type IndustryCategory = typeof INDUSTRY_CATEGORIES[number];

// Product categories
export const PRODUCT_CATEGORIES = [
  'sequencer',
  'software',
  'cloud',
  'reagent',
  'course',
  'book',
  'equipment',
  'consumable',
  'service',
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

// Commission types
export const COMMISSION_TYPES = [
  'percentage',
  'fixed',
  'tiered',
  'hybrid',
] as const;

export type CommissionType = typeof COMMISSION_TYPES[number];

// Partner status
export const PARTNER_STATUSES = [
  'active',
  'pending',
  'paused',
  'terminated',
] as const;

export type PartnerStatus = typeof PARTNER_STATUSES[number];

// Product status
export const PRODUCT_STATUSES = [
  'active',
  'inactive',
  'out_of_stock',
] as const;

export type ProductStatus = typeof PRODUCT_STATUSES[number];

// Link types
export const LINK_TYPES = [
  'product',
  'category',
  'homepage',
  'custom',
] as const;

export type LinkType = typeof LINK_TYPES[number];

// Placement types
export const PLACEMENT_TYPES = [
  'content',
  'banner',
  'button',
  'widget',
  'email',
  'sidebar',
] as const;

export type PlacementType = typeof PLACEMENT_TYPES[number];

// Conversion types
export const CONVERSION_TYPES = [
  'sale',
  'lead',
  'signup',
  'trial',
  'download',
] as const;

export type ConversionType = typeof CONVERSION_TYPES[number];

// Conversion statuses
export const CONVERSION_STATUSES = [
  'pending',
  'approved',
  'rejected',
  'reversed',
] as const;

export type ConversionStatus = typeof CONVERSION_STATUSES[number];

// Payout statuses
export const PAYOUT_STATUSES = [
  'unpaid',
  'pending',
  'processing',
  'completed',
  'failed',
] as const;

export type PayoutStatus = typeof PAYOUT_STATUSES[number];

// Payment methods
export const PAYMENT_METHODS = [
  'paypal',
  'bank_transfer',
  'check',
  'network',
] as const;

export type PaymentMethod = typeof PAYMENT_METHODS[number];

// Device types
export const DEVICE_TYPES = [
  'desktop',
  'mobile',
  'tablet',
  'unknown',
] as const;

export type DeviceType = typeof DEVICE_TYPES[number];

// Campaign types
export const CAMPAIGN_TYPES = [
  'seasonal',
  'product_launch',
  'category_promo',
  'general',
] as const;

export type CampaignType = typeof CAMPAIGN_TYPES[number];

// Campaign statuses
export const CAMPAIGN_STATUSES = [
  'draft',
  'active',
  'paused',
  'completed',
  'cancelled',
] as const;

export type CampaignStatus = typeof CAMPAIGN_STATUSES[number];

// Disclosure types
export const DISCLOSURE_TYPES = [
  'banner',
  'inline',
  'popup',
  'page_footer',
] as const;

export type DisclosureType = typeof DISCLOSURE_TYPES[number];

// Asset types
export const ASSET_TYPES = [
  'banner',
  'image',
  'video',
  'logo',
  'pdf',
] as const;

export type AssetType = typeof ASSET_TYPES[number];

// Standard banner sizes (IAB)
export const BANNER_SIZES = {
  leaderboard: '728x90',
  medium_rectangle: '300x250',
  wide_skyscraper: '160x600',
  mobile_banner: '320x50',
  large_rectangle: '336x280',
  half_page: '300x600',
  billboard: '970x250',
  large_leaderboard: '970x90',
} as const;

export type BannerSize = keyof typeof BANNER_SIZES;

// Interface for tracking click data
export interface ClickTrackingData {
  linkId: string;
  partnerId: string;
  productId?: string;
  userId?: string;
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  countryCode?: string;
  deviceType?: DeviceType;
  browser?: string;
  os?: string;
}

// Interface for conversion data
export interface ConversionData {
  clickId?: string;
  partnerId: string;
  productId?: string;
  orderId?: string;
  transactionId?: string;
  conversionType: ConversionType;
  saleAmount?: number;
  currency?: string;
  metadata?: Record<string, unknown>;
}

// Interface for link generation
export interface LinkGenerationOptions {
  partnerId: string;
  productId?: string;
  originalUrl: string;
  linkType?: LinkType;
  placementType?: PlacementType;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  customParameters?: Record<string, string>;
  expiresAt?: Date;
}

// Interface for commission calculation
export interface CommissionCalculation {
  baseRate: number;
  productOverride?: number;
  campaignBonus?: number;
  tierAdjustment?: number;
  finalRate: number;
  commissionAmount: number;
}

// Analytics types
export interface PartnerAnalytics {
  partnerId: string;
  partnerName: string;
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  totalRevenue: number;
  totalCommission: number;
  pendingCommission: number;
}

export interface ProductAnalytics {
  productId: string;
  productName: string;
  partnerId: string;
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  totalRevenue: number;
}

export interface DashboardStats {
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  totalCommission: number;
  pendingCommission: number;
  conversionRate: number;
  topPartners: PartnerAnalytics[];
  topProducts: ProductAnalytics[];
  recentConversions: unknown[];
  clicksOverTime: { date: string; clicks: number }[];
  conversionsOverTime: { date: string; conversions: number }[];
}
