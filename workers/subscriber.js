import { createClient } from "redis";

const redis = createClient();
await redis.connect();

const sub = redis.duplicate();
await sub.connect();

async function subscribeToResults(callback) {
  await sub.subscribe("results_channel", (message) => {
    const { solutionId, result } = JSON.parse(message);
    callback(solutionId, result);
  });
}

export { subscribeToResults };
