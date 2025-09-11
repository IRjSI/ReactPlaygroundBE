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
await redis.connect();

const sub = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false,
  },
});
await sub.connect();

async function subscribeToResults(callback) {
  await sub.subscribe("results_channel", (message) => {
    const { solutionId, result } = JSON.parse(message);
    callback(solutionId, result);
  });

  console.log("done subscribing")
}

export { subscribeToResults };
