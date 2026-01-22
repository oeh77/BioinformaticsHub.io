/**
 * Cache utilities for performance optimization
 */

const CACHE_DURATION = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
};

/**
 * Memoization cache for expensive operations
 */
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

/**
 * Get cached data or compute and cache it
 */
export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = CACHE_DURATION.MEDIUM
): Promise<T> {
  const now = Date.now();
  const cached = cache.get(key);

  // Return cached data if still valid
  if (cached && now - cached.timestamp < cached.ttl * 1000) {
    return cached.data as T;
  }

  // Fetch new data
  const data = await fetcher();

  // Cache it
  cache.set(key, { data, timestamp: now, ttl });

  return data;
}

/**
 * Invalidate cache for a specific key
 */
export function invalidateCache(key: string) {
  cache.delete(key);
}

/**
 * Invalidate all cache entries matching a pattern
 */
export function invalidateCachePattern(pattern: string) {
  const keys = Array.from(cache.keys()).filter((key) =>
    key.includes(pattern)
  );
  keys.forEach((key) => cache.delete(key));
}

/**
 * Clear entire cache
 */
export function clearCache() {
  cache.clear();
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for scroll events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export { CACHE_DURATION };
