import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.REDIS_HOST || !process.env.REDIS_PORT) {
  throw new Error("❌ REDIS_HOST or REDIS_PORT is not defined in environment variables");
}

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT), 
  password: process.env.REDIS_PASSWORD || undefined, 
  retryStrategy: (times) => {
    return Math.min(times * 50, 2000);
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
});

redisClient.on("connect", () => {
  console.log("✅ Redis connected");
});

redisClient.on("ready", () => {
  console.log("🚀 Redis is ready to use");
});

redisClient.on("error", (err) => {
  console.error("❌ Redis error:", err.message);
});

async function connectRedis() {
  try {
    await redisClient.ping();
    console.log("🧪 Redis ping OK");
    return redisClient;
  } catch (error) {
    console.error("❌ Redis ping failed:", error.message);
    throw error;
  }
}

export { redisClient, connectRedis };