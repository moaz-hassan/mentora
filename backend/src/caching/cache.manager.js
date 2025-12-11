import { getRedisClient, isRedisAvailable } from "./redis.util.js";

export const generateKey = (req) => {
  return `${req.method}:${req.originalUrl}`;
};

export const getFromCache = async (req) => {
  if (!isRedisAvailable()) return null;
  
  const redis = getRedisClient();
  if (!redis) return null;

  try {
    const key = generateKey(req);
    const cachedData = await redis.get(key);
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (error) {
    console.warn(`Cache get error for ${req.originalUrl}:`, error.message);
    return null;
  }
};

export const setToCache = async (req, data, ttl = 300) => {
  if (!isRedisAvailable()) return;

  const redis = getRedisClient();
  if (!redis) return;

  try {
    const key = generateKey(req);
    await redis.setex(key, ttl, JSON.stringify(data));
  } catch (error) {
    console.warn(`Cache set error for ${req.originalUrl}:`, error.message);
  }
};

export const deleteFromCache = async (req) => {
  if (!isRedisAvailable()) return;

  const redis = getRedisClient();
  if (!redis) return;

  try {
    const key = generateKey(req);
    await redis.del(key);
  } catch (error) {
    console.warn(`Cache delete error for ${req.originalUrl}:`, error.message);
  }
};

export const invalidateCache = async (pattern) => {
  if (!isRedisAvailable()) return;

  const redis = getRedisClient();
  if (!redis) return;

  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.warn(`Cache invalidate error for pattern ${pattern}:`, error.message);
  }
};

