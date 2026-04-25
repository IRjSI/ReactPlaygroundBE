import dotenv from "dotenv";
dotenv.config();

import { createClient } from "redis";

export const getRedisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false,
  },
});

getRedisClient.on("error", (error) => {
  console.error("Redis client error:", error);
});

getRedisClient.connect().catch(console.error);
