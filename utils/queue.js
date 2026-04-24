import { Queue } from "bullmq";
import dotenv from "dotenv";
dotenv.config();

const solution_queue = new Queue("solutions", {
  connection: {
    url: process.env.REDIS_URL,
    socket: {
      tls: true,
      rejectUnauthorized: false,
    },
  }
})

async function enqueueSolution(solutionId, iframeDoc, challengeId, userId) {
  // Store the data with the solutionId as key
  console.log("in queue:", solutionId)

  // replaced by BullMQ
  await solution_queue.add("validate", {
    solutionId,
    iframeDoc,
    challengeId,
    userId
  }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    timeout: 10000,
  })
}

export { enqueueSolution };
