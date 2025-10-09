import dotenv from "dotenv";
dotenv.config();

import { createClient } from "redis";

const redis = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false,
  },
});
redis.on("connect", () => console.log("Connected to Redis!"));
redis.on("ready", () => console.log("Redis ready!"));
redis.on("error", (err) => console.error("Redis Client Error:", err));

await redis.connect();

async function enqueueSolution(solutionId, iframeDoc) {
  // Store the data with the solutionId as key
  await redis.set(`solution:${solutionId}`, JSON.stringify({ solutionId, iframeDoc }));
  // Notify that this specific solution is ready
  await redis.publish("solution_channel", JSON.stringify({ solutionId }));
  return solutionId;
}

export { enqueueSolution };
