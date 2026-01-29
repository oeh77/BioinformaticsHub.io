/**
 * Performance Caching Utilities
 * 
 * In-memory and request-level caching for performance:
 * - Simple in-memory cache with TTL
 * - Request deduplication
 * - Cache headers utility
 */

// In-memory cache store
const memoryCache = new Map<string, { value: unknown; expires: number }>();

/**
 * Simple in-memory cache with TTL
 */
export const performanceCache = {
  /**
   * Get a value from cache
   */
  get<T>(key: string): T | null {
    const entry = memoryCache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() > entry.expires) {
      memoryCache.delete(key);
      return null;
    }
    
    return entry.value as T;
  },

  /**
   * Set a value in cache with TTL
   * @param key Cache key
   * @param value Value to cache
   * @param ttlSeconds Time to live in seconds (default: 5 minutes)
   */
  set<T>(key: string, value: T, ttlSeconds = 300): void {
    memoryCache.set(key, {
      value,
      expires: Date.now() + ttlSeconds * 1000,
    });
  },

  /**
   * Delete a value from cache
   */
  delete(key: string): void {
    memoryCache.delete(key);
  },

  /**
   * Clear all cache entries
   */
  clear(): void {
    memoryCache.clear();
  },

  /**
   * Get cache stats
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: memoryCache.size,
      keys: Array.from(memoryCache.keys()),
    };
  },
};

/**
 * Cache with automatic fetch if not found
 */
export async function cacheGetOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = 300
): Promise<T> {
  const cached = performanceCache.get<T>(key);
  
  if (cached !== null) {
    return cached;
  }

  const value = await fetcher();
  performanceCache.set(key, value, ttlSeconds);
  
  return value;
}

/**
 * Request deduplication for concurrent requests
 */
const pendingRequests = new Map<string, Promise<unknown>>();

export async function dedupedFetch<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  // Check if there's already a pending request
  const pending = pendingRequests.get(key);
  if (pending) {
    return pending as Promise<T>;
  }

  // Create new request and store promise
  const promise = fetcher().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
}

/**
 * HTTP Cache headers for different content types
 */
export const httpCacheHeaders = {
  /**
   * Static asset caching (1 year, immutable)
   */
  static: {
    "Cache-Control": "public, max-age=31536000, immutable",
  },

  /**
   * Dynamic content with revalidation (1 hour)
   */
  dynamic: {
    "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
  },

  /**
   * API response caching (5 minutes)
   */
  api: {
    "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=600",
  },

  /**
   * No cache (real-time data)
   */
  noCache: {
    "Cache-Control": "no-store, no-cache, must-revalidate",
    Pragma: "no-cache",
  },

  /**
   * Private user-specific content
   */
  private: {
    "Cache-Control": "private, max-age=0, must-revalidate",
  },
};

/**
 * Generate ETag from content
 */
export function generateETag(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `"${Math.abs(hash).toString(36)}"`;
}

/**
 * Create cache key from request
 */
export function createCacheKey(prefix: string, params: Record<string, unknown>): string {
  const sortedParams = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
    .join("&");
  
  return `${prefix}:${sortedParams}`;
}
