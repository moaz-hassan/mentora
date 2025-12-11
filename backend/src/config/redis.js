import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: 0,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
});

function connectRedis() {
  try {
    const redis = redisClient;
    console.log("✅ Redis client connected");
    return redis;
  } catch (error) {
    console.error("❌ Redis client error:", error);
  }
}

export { connectRedis, redisClient };
