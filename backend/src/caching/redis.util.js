import { redisClient } from "../config/redis.js";

const CHAT_CACHE_LIMIT = 100;

const getChatCacheKey = (roomId) => `chat:room:${roomId}:messages`;

export const getRedisClient = () => redisClient;

export const isRedisAvailable = () => redisClient.status === "ready";

export const getCachedMessages = async (roomId, limit = 50) => {
  if (!isRedisAvailable()) return null;
  try {
    const key = getChatCacheKey(roomId);
    const messages = await redisClient.lrange(key, 0, limit - 1);
    return messages.map((m) => JSON.parse(m));
  } catch (error) {
    console.warn("Redis chat get error:", error.message);
    return null;
  }
};

export const addMessageToCache = async (roomId, message) => {
  if (!isRedisAvailable()) return;
  try {
    const key = getChatCacheKey(roomId);
    await redisClient.lpush(key, JSON.stringify(message));
    await redisClient.ltrim(key, 0, CHAT_CACHE_LIMIT - 1);
    await redisClient.expire(key, 86400);
  } catch (error) {
    console.warn("Redis chat add error:", error.message);
  }
};

export const clearChatCache = async (roomId) => {
  if (!isRedisAvailable()) return;
  try {
    await redisClient.del(getChatCacheKey(roomId));
  } catch (error) {
    console.warn("Redis chat clear error:", error.message);
  }
};

export default {
  getRedisClient,
  isRedisAvailable,
  getCachedMessages,
  addMessageToCache,
  clearChatCache,
};
