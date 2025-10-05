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

const sub = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false,
  },
});

sub.on("error", (err) => console.error("Redis Subscriber Error:", err));

// Wrap in try-catch
try {
  await redis.connect();
  await sub.connect();
  console.log("Both Redis clients connected successfully!");
} catch (error) {
  console.error("Failed to connect to Redis:", error);
  process.exit(1);
}

async function subscribeToResults(callback) {
  await sub.subscribe("results_channel", (message) => {
    const { solutionId, result } = JSON.parse(message);
    callback(solutionId, result);
  });
  console.log("done subscribing");
}

export { subscribeToResults };