/**
 * Caching Utility
 * Purpose: Simple in-memory caching with TTL support
 * Note: For production, use Redis for distributed caching
 */

class CacheManager {
  constructor() {
    this.cache = new Map();
    this.ttls = new Map();
  }

  /**
   * Set a value in cache with optional TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (default: 3600 = 1 hour)
   */
  set(key, value, ttl = 3600) {
    this.cache.set(key, value);
    
    // Set expiration
    const expiresAt = Date.now() + (ttl * 1000);
    this.ttls.set(key, expiresAt);
    
    // Schedule cleanup
    setTimeout(() => {
      this.delete(key);
    }, ttl * 1000);
    
    return true;
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {any|null} Cached value or null if not found/expired
   */
  get(key) {
    // Check if key exists
    if (!this.cache.has(key)) {
      return null;
    }
    
    // Check if expired
    const expiresAt = this.ttls.get(key);
    if (expiresAt && Date.now() > expiresAt) {
      this.delete(key);
      return null;
    }
    
    return this.cache.get(key);
  }

  /**
   * Delete a value from cache
   * @param {string} key - Cache key
   */
  delete(key) {
    this.cache.delete(key);
    this.ttls.delete(key);
    return true;
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    this.ttls.clear();
    return true;
  }

  /**
   * Check if key exists in cache
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  has(key) {
    if (!this.cache.has(key)) {
      return false;
    }
    
    // Check if expired
    const expiresAt = this.ttls.get(key);
    if (expiresAt && Date.now() > expiresAt) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Get or set pattern (cache-aside)
   * @param {string} key - Cache key
   * @param {Function} fetchFn - Function to fetch data if not in cache
   * @param {number} ttl - Time to live in seconds
   */
  async getOrSet(key, fetchFn, ttl = 3600) {
    // Try to get from cache
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }
    
    // Fetch data
    const data = await fetchFn();
    
    // Store in cache
    this.set(key, data, ttl);
    
    return data;
  }
}

// Create singleton instance
const cacheManager = new CacheManager();

/**
 * Cache key generators for different data types
 */
export const CacheKeys = {
  // Analytics cache keys
  analytics: {
    overview: (startDate, endDate) => `analytics:overview:${startDate}:${endDate}`,
    revenue: (startDate, endDate) => `analytics:revenue:${startDate}:${endDate}`,
    users: (startDate, endDate) => `analytics:users:${startDate}:${endDate}`,
    enrollments: (startDate, endDate) => `analytics:enrollments:${startDate}:${endDate}`,
    courses: () => `analytics:courses`,
  },
  
  // Settings cache keys
  settings: {
    all: () => `settings:all`,
    category: (category) => `settings:category:${category}`,
    key: (key) => `settings:key:${key}`,
  },
  
  // AI response cache keys
  ai: {
    insights: (dataHash) => `ai:insights:${dataHash}`,
    summary: (reportId) => `ai:summary:${reportId}`,
    recommendations: (reportId) => `ai:recommendations:${reportId}`,
    campaign: (campaignId) => `ai:campaign:${campaignId}`,
  },
  
  // Course cache keys
  course: {
    details: (courseId) => `course:${courseId}`,
    list: (filters) => `courses:${JSON.stringify(filters)}`,
    published: () => `courses:published`,
  },
  
  // User cache keys
  user: {
    profile: (userId) => `user:${userId}`,
    enrollments: (userId) => `user:${userId}:enrollments`,
  }
};

/**
 * Cache invalidation patterns
 */
export const invalidateCache = {
  // Invalidate all analytics caches
  analytics: () => {
    const keys = Array.from(cacheManager.cache.keys());
    keys.filter(k => k.startsWith('analytics:')).forEach(k => cacheManager.delete(k));
  },
  
  // Invalidate all settings caches
  settings: () => {
    const keys = Array.from(cacheManager.cache.keys());
    keys.filter(k => k.startsWith('settings:')).forEach(k => cacheManager.delete(k));
  },
  
  // Invalidate specific course cache
  course: (courseId) => {
    cacheManager.delete(CacheKeys.course.details(courseId));
    // Also invalidate course lists
    const keys = Array.from(cacheManager.cache.keys());
    keys.filter(k => k.startsWith('courses:')).forEach(k => cacheManager.delete(k));
  },
  
  // Invalidate user cache
  user: (userId) => {
    const keys = Array.from(cacheManager.cache.keys());
    keys.filter(k => k.startsWith(`user:${userId}`)).forEach(k => cacheManager.delete(k));
  }
};

/**
 * Caching middleware for Express routes
 * @param {number} ttl - Time to live in seconds
 */
export const cacheMiddleware = (ttl = 300) => {
  return (req, res, next) => {
    // Generate cache key from request
    const key = `route:${req.method}:${req.originalUrl}`;
    
    // Try to get from cache
    const cached = cacheManager.get(key);
    if (cached) {
      return res.json(cached);
    }
    
    // Store original send function
    const originalSend = res.json.bind(res);
    
    // Override send function to cache response
    res.json = (data) => {
      // Cache successful responses only
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheManager.set(key, data, ttl);
      }
      return originalSend(data);
    };
    
    next();
  };
};

/**
 * Usage Examples:
 * 
 * 1. Basic caching:
 * ```javascript
 * import cache, { CacheKeys } from './utils/cache.js';
 * 
 * // Set cache
 * cache.set(CacheKeys.analytics.overview('2024-01-01', '2024-01-31'), data, 3600);
 * 
 * // Get cache
 * const cached = cache.get(CacheKeys.analytics.overview('2024-01-01', '2024-01-31'));
 * ```
 * 
 * 2. Cache-aside pattern:
 * ```javascript
 * const data = await cache.getOrSet(
 *   CacheKeys.analytics.overview(startDate, endDate),
 *   async () => {
 *     return await analyticsService.getPlatformOverview({ startDate, endDate });
 *   },
 *   3600
 * );
 * ```
 * 
 * 3. Route caching:
 * ```javascript
 * import { cacheMiddleware } from './utils/cache.js';
 * 
 * router.get('/api/analytics/overview', cacheMiddleware(300), controller.getOverview);
 * ```
 * 
 * 4. Cache invalidation:
 * ```javascript
 * import { invalidateCache } from './utils/cache.js';
 * 
 * // After updating settings
 * invalidateCache.settings();
 * 
 * // After updating course
 * invalidateCache.course(courseId);
 * ```
 */

export default cacheManager;
export { cacheManager as cache };
