import { createClient } from "redis";
import { config } from "./config.js";

export const redis = createClient({ url: config.redisUrl });

redis.on("error", (err) => console.error("Redis error:", err.message));

export async function connectRedis() {
  try {
    if (!redis.isOpen) await redis.connect();
    console.log("Redis connected");
  } catch (err) {
    console.warn("Redis unavailable; continuing without cache:", err.message);
  }
}
