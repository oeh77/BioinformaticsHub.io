// lib/ads/placements.ts
// Centralized ad placement configuration for all page types

export type AdNetwork = 'carbon' | 'adsense';
export type AdFormat = 'native' | 'display' | 'banner' | 'rectangle' | 'leaderboard' | 'skyscraper' | 'responsive';
export type AdDensity = 'low' | 'medium' | 'high';
export type PageType = 'tools' | 'blog' | 'courses' | 'jobs' | 'resources' | 'directory' | 'compare' | 'home' | 'global';

export interface AdPlacement {
  id: string;
  name: string;
  network: AdNetwork;
  format: AdFormat;
  position: string;
  priority: number; // 1-10, higher = more important, shown at lower densities
  minDensity: AdDensity;
  width?: number;
  height?: number;
  customClass?: string;
}

export interface PageAdConfig {
  pageType: PageType;
  placements: AdPlacement[];
}

// Priority thresholds for density levels
export const DENSITY_THRESHOLDS: Record<AdDensity, number> = {
  low: 7,    // Only show priority 7-10 ads
  medium: 4, // Show priority 4-10 ads
  high: 1,   // Show all ads
};

// ============================================
// GLOBAL AD PLACEMENTS (appear on all pages)
// ============================================

export const GLOBAL_ADS: AdPlacement[] = [
  {
    id: 'global-header',
    name: 'Header Banner',
    network: 'carbon',
    format: 'native',
    position: 'header',
    priority: 9,
    minDensity: 'low',
  },
  {
    id: 'global-footer',
    name: 'Footer Ad',
    network: 'adsense',
    format: 'leaderboard',
    position: 'footer',
    priority: 8,
    minDensity: 'low',
    width: 728,
    height: 90,
  },
];

// ============================================
// TOOL PAGE AD PLACEMENTS
// ============================================

export const TOOL_PAGE_ADS: AdPlacement[] = [
  {
    id: 'tool-hero',
    name: 'Below Tool Hero',
    network: 'carbon',
    format: 'native',
    position: 'after-hero',
    priority: 8,
    minDensity: 'low',
  },
  {
    id: 'tool-sidebar',
    name: 'Tool Sidebar (Sticky)',
    network: 'carbon',
    format: 'skyscraper',
    position: 'sidebar-sticky',
    priority: 9,
    minDensity: 'low',
  },
  {
    id: 'tool-content-1',
    name: 'After First Paragraph',
    network: 'adsense',
    format: 'rectangle',
    position: 'in-content-1',
    priority: 5,
    minDensity: 'medium',
  },
  {
    id: 'tool-content-2',
    name: 'After Third Paragraph',
    network: 'adsense',
    format: 'rectangle',
    position: 'in-content-2',
    priority: 3,
    minDensity: 'high',
  },
  {
    id: 'tool-before-reviews',
    name: 'Before Reviews Section',
    network: 'adsense',
    format: 'leaderboard',
    position: 'before-reviews',
    priority: 6,
    minDensity: 'medium',
  },
  {
    id: 'tool-after-reviews',
    name: 'After Reviews Section',
    network: 'adsense',
    format: 'rectangle',
    position: 'after-reviews',
    priority: 4,
    minDensity: 'medium',
  },
  {
    id: 'tool-related',
    name: 'In Related Tools',
    network: 'adsense',
    format: 'native',
    position: 'between-cards',
    priority: 2,
    minDensity: 'high',
  },
  {
    id: 'tool-end',
    name: 'End of Page',
    network: 'adsense',
    format: 'leaderboard',
    position: 'end-of-page',
    priority: 5,
    minDensity: 'medium',
  },
];

// ============================================
// BLOG PAGE AD PLACEMENTS
// ============================================

export const BLOG_PAGE_ADS: AdPlacement[] = [
  {
    id: 'blog-hero',
    name: 'Below Blog Hero',
    network: 'carbon',
    format: 'native',
    position: 'after-hero',
    priority: 8,
    minDensity: 'low',
  },
  {
    id: 'blog-sidebar',
    name: 'Blog Sidebar',
    network: 'carbon',
    format: 'skyscraper',
    position: 'sidebar',
    priority: 9,
    minDensity: 'low',
  },
  {
    id: 'blog-sidebar-sticky',
    name: 'Blog Sidebar Sticky',
    network: 'adsense',
    format: 'rectangle',
    position: 'sidebar-sticky',
    priority: 7,
    minDensity: 'low',
  },
  {
    id: 'blog-content-1',
    name: 'After First Paragraph',
    network: 'adsense',
    format: 'rectangle',
    position: 'in-content-1',
    priority: 6,
    minDensity: 'medium',
  },
  {
    id: 'blog-content-2',
    name: 'Mid-Article',
    network: 'adsense',
    format: 'rectangle',
    position: 'in-content-2',
    priority: 5,
    minDensity: 'medium',
  },
  {
    id: 'blog-content-3',
    name: 'Near End of Article',
    network: 'adsense',
    format: 'rectangle',
    position: 'in-content-3',
    priority: 3,
    minDensity: 'high',
  },
  {
    id: 'blog-before-comments',
    name: 'Before Comments',
    network: 'adsense',
    format: 'leaderboard',
    position: 'before-comments',
    priority: 4,
    minDensity: 'medium',
  },
  {
    id: 'blog-related',
    name: 'In Related Posts',
    network: 'adsense',
    format: 'native',
    position: 'between-cards',
    priority: 2,
    minDensity: 'high',
  },
  {
    id: 'blog-end',
    name: 'End of Page',
    network: 'adsense',
    format: 'leaderboard',
    position: 'end-of-page',
    priority: 5,
    minDensity: 'medium',
  },
];

// ============================================
// COURSE PAGE AD PLACEMENTS
// ============================================

export const COURSE_PAGE_ADS: AdPlacement[] = [
  {
    id: 'course-hero',
    name: 'Below Course Hero',
    network: 'carbon',
    format: 'native',
    position: 'after-hero',
    priority: 8,
    minDensity: 'low',
  },
  {
    id: 'course-sidebar',
    name: 'Course Sidebar',
    network: 'carbon',
    format: 'rectangle',
    position: 'sidebar',
    priority: 9,
    minDensity: 'low',
  },
  {
    id: 'course-curriculum',
    name: 'After Curriculum',
    network: 'adsense',
    format: 'leaderboard',
    position: 'after-curriculum',
    priority: 5,
    minDensity: 'medium',
  },
  {
    id: 'course-related',
    name: 'In Related Courses',
    network: 'adsense',
    format: 'native',
    position: 'between-cards',
    priority: 4,
    minDensity: 'medium',
  },
  {
    id: 'course-end',
    name: 'End of Page',
    network: 'adsense',
    format: 'leaderboard',
    position: 'end-of-page',
    priority: 6,
    minDensity: 'medium',
  },
];

// ============================================
// JOB PAGE AD PLACEMENTS
// ============================================

export const JOB_PAGE_ADS: AdPlacement[] = [
  {
    id: 'job-hero',
    name: 'Below Job Hero',
    network: 'carbon',
    format: 'native',
    position: 'after-hero',
    priority: 8,
    minDensity: 'low',
  },
  {
    id: 'job-sidebar',
    name: 'Job Sidebar',
    network: 'carbon',
    format: 'skyscraper',
    position: 'sidebar',
    priority: 9,
    minDensity: 'low',
  },
  {
    id: 'job-between-listings',
    name: 'Between Job Listings',
    network: 'adsense',
    format: 'native',
    position: 'between-cards',
    priority: 4,
    minDensity: 'medium',
  },
  {
    id: 'job-sponsored',
    name: 'Sponsored Job Card',
    network: 'adsense',
    format: 'native',
    position: 'sponsored-card',
    priority: 7,
    minDensity: 'low',
  },
  {
    id: 'job-end',
    name: 'End of Page',
    network: 'adsense',
    format: 'leaderboard',
    position: 'end-of-page',
    priority: 5,
    minDensity: 'medium',
  },
];

// ============================================
// RESOURCE PAGE AD PLACEMENTS
// ============================================

export const RESOURCE_PAGE_ADS: AdPlacement[] = [
  {
    id: 'resource-hero',
    name: 'Below Resource Hero',
    network: 'carbon',
    format: 'native',
    position: 'after-hero',
    priority: 8,
    minDensity: 'low',
  },
  {
    id: 'resource-sidebar',
    name: 'Resource Sidebar',
    network: 'carbon',
    format: 'rectangle',
    position: 'sidebar',
    priority: 9,
    minDensity: 'low',
  },
  {
    id: 'resource-content',
    name: 'In Resource Content',
    network: 'adsense',
    format: 'rectangle',
    position: 'in-content-1',
    priority: 5,
    minDensity: 'medium',
  },
  {
    id: 'resource-between',
    name: 'Between Resources',
    network: 'adsense',
    format: 'native',
    position: 'between-cards',
    priority: 3,
    minDensity: 'high',
  },
  {
    id: 'resource-end',
    name: 'End of Page',
    network: 'adsense',
    format: 'leaderboard',
    position: 'end-of-page',
    priority: 6,
    minDensity: 'medium',
  },
];

// ============================================
// DIRECTORY PAGE AD PLACEMENTS
// ============================================

export const DIRECTORY_PAGE_ADS: AdPlacement[] = [
  {
    id: 'directory-hero',
    name: 'Below Directory Hero',
    network: 'carbon',
    format: 'native',
    position: 'after-hero',
    priority: 8,
    minDensity: 'low',
  },
  {
    id: 'directory-sidebar',
    name: 'Directory Sidebar',
    network: 'carbon',
    format: 'skyscraper',
    position: 'sidebar',
    priority: 9,
    minDensity: 'low',
  },
  {
    id: 'directory-between-1',
    name: 'After 3rd Tool Card',
    network: 'adsense',
    format: 'native',
    position: 'between-cards-1',
    priority: 5,
    minDensity: 'medium',
  },
  {
    id: 'directory-between-2',
    name: 'After 9th Tool Card',
    network: 'adsense',
    format: 'native',
    position: 'between-cards-2',
    priority: 3,
    minDensity: 'high',
  },
  {
    id: 'directory-sponsored',
    name: 'Sponsored Tool Card',
    network: 'adsense',
    format: 'native',
    position: 'sponsored-card',
    priority: 7,
    minDensity: 'low',
  },
  {
    id: 'directory-end',
    name: 'End of Page',
    network: 'adsense',
    format: 'leaderboard',
    position: 'end-of-page',
    priority: 5,
    minDensity: 'medium',
  },
];

// ============================================
// COMPARE PAGE AD PLACEMENTS
// ============================================

export const COMPARE_PAGE_ADS: AdPlacement[] = [
  {
    id: 'compare-hero',
    name: 'Below Compare Hero',
    network: 'carbon',
    format: 'native',
    position: 'after-hero',
    priority: 8,
    minDensity: 'low',
  },
  {
    id: 'compare-sidebar',
    name: 'Compare Sidebar',
    network: 'carbon',
    format: 'rectangle',
    position: 'sidebar',
    priority: 9,
    minDensity: 'low',
  },
  {
    id: 'compare-between-sections',
    name: 'Between Comparison Sections',
    network: 'adsense',
    format: 'leaderboard',
    position: 'between-sections',
    priority: 5,
    minDensity: 'medium',
  },
  {
    id: 'compare-end',
    name: 'End of Page',
    network: 'adsense',
    format: 'leaderboard',
    position: 'end-of-page',
    priority: 6,
    minDensity: 'medium',
  },
];

// ============================================
// HOME PAGE AD PLACEMENTS
// ============================================

export const HOME_PAGE_ADS: AdPlacement[] = [
  {
    id: 'home-hero',
    name: 'Below Hero Section',
    network: 'carbon',
    format: 'native',
    position: 'after-hero',
    priority: 8,
    minDensity: 'low',
  },
  {
    id: 'home-between-sections-1',
    name: 'After Featured Tools',
    network: 'adsense',
    format: 'leaderboard',
    position: 'between-sections-1',
    priority: 6,
    minDensity: 'medium',
  },
  {
    id: 'home-between-sections-2',
    name: 'After Latest Posts',
    network: 'adsense',
    format: 'leaderboard',
    position: 'between-sections-2',
    priority: 4,
    minDensity: 'medium',
  },
  {
    id: 'home-sidebar',
    name: 'Home Sidebar',
    network: 'carbon',
    format: 'rectangle',
    position: 'sidebar',
    priority: 7,
    minDensity: 'low',
  },
  {
    id: 'home-end',
    name: 'End of Page',
    network: 'adsense',
    format: 'leaderboard',
    position: 'end-of-page',
    priority: 5,
    minDensity: 'medium',
  },
];

// ============================================
// ALL PAGE CONFIGURATIONS
// ============================================

export const PAGE_AD_CONFIGS: PageAdConfig[] = [
  { pageType: 'tools', placements: TOOL_PAGE_ADS },
  { pageType: 'blog', placements: BLOG_PAGE_ADS },
  { pageType: 'courses', placements: COURSE_PAGE_ADS },
  { pageType: 'jobs', placements: JOB_PAGE_ADS },
  { pageType: 'resources', placements: RESOURCE_PAGE_ADS },
  { pageType: 'directory', placements: DIRECTORY_PAGE_ADS },
  { pageType: 'compare', placements: COMPARE_PAGE_ADS },
  { pageType: 'home', placements: HOME_PAGE_ADS },
  { pageType: 'global', placements: GLOBAL_ADS },
];

// All placements indexed by ID for quick lookup
export const ALL_PLACEMENTS: Record<string, AdPlacement> = {};
PAGE_AD_CONFIGS.forEach((config) => {
  config.placements.forEach((placement) => {
    ALL_PLACEMENTS[placement.id] = placement;
  });
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get placements for a specific page type, filtered by density
 */
export function getPagePlacements(pageType: PageType, density: AdDensity = 'medium'): AdPlacement[] {
  const config = PAGE_AD_CONFIGS.find((c) => c.pageType === pageType);
  if (!config) return [];

  const threshold = DENSITY_THRESHOLDS[density];
  return config.placements.filter((p) => p.priority >= threshold);
}

/**
 * Get placements for a specific position across all page types
 */
export function getPositionPlacements(position: string, density: AdDensity = 'medium'): AdPlacement[] {
  const threshold = DENSITY_THRESHOLDS[density];
  return Object.values(ALL_PLACEMENTS).filter(
    (p) => p.position === position && p.priority >= threshold
  );
}

/**
 * Get a specific placement by ID
 */
export function getPlacement(id: string): AdPlacement | undefined {
  return ALL_PLACEMENTS[id];
}

/**
 * Get all placements filtered by density
 */
export function getFilteredPlacements(density: AdDensity = 'medium'): AdPlacement[] {
  const threshold = DENSITY_THRESHOLDS[density];
  return Object.values(ALL_PLACEMENTS).filter((p) => p.priority >= threshold);
}

/**
 * Get ad format dimensions
 */
export function getFormatDimensions(format: AdFormat): { width: number; height: number } | null {
  const dimensions: Record<AdFormat, { width: number; height: number } | null> = {
    native: null, // Responsive
    display: { width: 300, height: 250 },
    banner: { width: 468, height: 60 },
    rectangle: { width: 300, height: 250 },
    leaderboard: { width: 728, height: 90 },
    skyscraper: { width: 160, height: 600 },
    responsive: null,
  };
  return dimensions[format];
}

/**
 * Count placements by density level for a page type
 */
export function countPlacementsByDensity(pageType: PageType): Record<AdDensity, number> {
  return {
    low: getPagePlacements(pageType, 'low').length,
    medium: getPagePlacements(pageType, 'medium').length,
    high: getPagePlacements(pageType, 'high').length,
  };
}
