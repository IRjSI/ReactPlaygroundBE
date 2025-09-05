import { createClient } from "redis";

const redis = createClient();
await redis.connect();

async function enqueueSolution(solutionId, iframeDoc) {
  await redis.rPush("solutions_queue", JSON.stringify({ solutionId, iframeDoc }));
  await redis.publish("solution_channel", JSON.stringify({ solutionId }));
}

export { enqueueSolution };
