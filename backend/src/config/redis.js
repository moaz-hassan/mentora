/**
 * Redis Configuration
 * Purpose: Configure Redis client for caching and queue management
 */

import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// Redis client for general caching
export const redisClient = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: 0, // Database 0 for general caching
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false
});

// Redis client for Bull queues
export const redisQueueClient = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: 1, // Database 1 for queues
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: null, // Bull requires this to be null
  enableReadyCheck: true,
  lazyConnect: false
});

// Event handlers for general Redis client
redisClient.on("connect", () => {
  console.log("✅ Redis client connected");
});

redisClient.on("ready", () => {
  console.log("✅ Redis client ready");
});

redisClient.on("error", (err) => {
  console.error("❌ Redis client error:", err);
});

redisClient.on("close", () => {
  console.log("⚠️  Redis client connection closed");
});

// Event handlers for queue Redis client
redisQueueClient.on("connect", () => {
  console.log("✅ Redis queue client connected");
});

redisQueueClient.on("error", (err) => {
  console.error("❌ Redis queue client error:", err);
});


/**
 * Cache helper functions
 */

/**
 * Get value from cache
 * @param {string} key - Cache key
 * @returns {Promise<any>} Cached value or null
 */
export const getCache = async (key) => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Cache get error:", error);
    return null;
  }
};

/**
 * Set value in cache
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds (default: 3600)
 * @returns {Promise<boolean>} Success status
 */
export const setCache = async (key, value, ttl = 3600) => {
  try {
    await redisClient.setex(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error("Cache set error:", error);
    return false;
  }
};

/**
 * Delete value from cache
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} Success status
 */
export const deleteCache = async (key) => {
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error("Cache delete error:", error);
    return false;
  }
};

/**
 * Delete multiple keys matching pattern
 * @param {string} pattern - Key pattern (e.g., "user:*")
 * @returns {Promise<number>} Number of keys deleted
 */
export const deleteCachePattern = async (pattern) => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
      return keys.length;
    }
    return 0;
  } catch (error) {
    console.error("Cache pattern delete error:", error);
    return 0;
  }
};

/**
 * Check if key exists in cache
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} Existence status
 */
export const cacheExists = async (key) => {
  try {
    const exists = await redisClient.exists(key);
    return exists === 1;
  } catch (error) {
    console.error("Cache exists error:", error);
    return false;
  }
};

/**
 * Get cache with fallback
 * @param {string} key - Cache key
 * @param {Function} fallback - Function to call if cache miss
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<any>} Cached or fresh value
 */
export const getCacheOrFetch = async (key, fallback, ttl = 3600) => {
  try {
    // Try to get from cache
    const cached = await getCache(key);
    if (cached !== null) {
      return cached;
    }

    // Cache miss - fetch fresh data
    const fresh = await fallback();
    
    // Store in cache
    await setCache(key, fresh, ttl);
    
    return fresh;
  } catch (error) {
    console.error("Cache or fetch error:", error);
    // On error, try to return fresh data
    return await fallback();
  }
};

/**
 * Graceful shutdown
 */
export const closeRedis = async () => {
  try {
    await redisClient.quit();
    await redisQueueClient.quit();
    console.log("✅ Redis connections closed gracefully");
  } catch (error) {
    console.error("❌ Error closing Redis connections:", error);
  }
};

export default redisClient;
