import { createClient } from "redis";

const redis = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false,
  },
});
await redis.connect();

async function enqueueSolution(solutionId, iframeDoc) {
  console.log(solutionId, " :: ", iframeDoc)
  await redis.rPush("solutions_queue", JSON.stringify({ solutionId, iframeDoc }));
  await redis.publish("solution_channel", JSON.stringify({ solutionId }));
  console.log("done queuing")
  return solutionId;
}

export { enqueueSolution };
