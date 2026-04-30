import dotenv from "dotenv";
dotenv.config();

import { createClient } from "redis";

export const getRedisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false,
    reconnectStrategy: (retries) => {
      console.log("Retrying Redis:", retries);
      return Math.min(retries * 100, 3000);
    }
  },
});

getRedisClient.on("connect", () => console.log("Redis connecting"));
getRedisClient.on("ready", () => console.log("Redis ready"));
getRedisClient.on("reconnecting", () => console.log("Redis reconnecting"));
getRedisClient.on("end", () => console.log("Redis connection closed"));
getRedisClient.on("error", (error) => {
  console.error("Redis client error:", error);
});

getRedisClient.connect().catch(console.error);
