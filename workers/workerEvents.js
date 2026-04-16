import SolutionModel from "../models/solution.model.js";
import { uploadToS3 } from "../utils/s3.js";
import { QueueEvents, Queue, Job } from "bullmq";
import dotenv from "dotenv";

dotenv.config();

const connection = {
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false,
  },
};

const queueEvents = new QueueEvents("solutions", { connection });
const solutionQueue = new Queue("solutions", { connection });

console.log('worker events reached')

export function attachWorkerEvents(io, clients) {
  queueEvents.on("completed", async ({ jobId, returnvalue }) => {
    const { solutionId, result: status, challengeId, userId } = returnvalue;
    const socketId = clients.get(solutionId);

    try {
      const job = await Job.fromId(solutionQueue, jobId);
      if (!job) return;

      const { iframeDoc } = job.data;
      const key = `solutions/${userId}/${challengeId}.js`;

      if (status === "valid") {
        console.log('Uploading solution to S3:', key);
        await uploadToS3(key, iframeDoc);

        await SolutionModel.findByIdAndUpdate(solutionId, {
          status: "completed",
          result: status,
          solution: key
        });
      } else {
        const existingSolution = await SolutionModel.findById(solutionId).select("result");

        await SolutionModel.findByIdAndUpdate(solutionId, {
          status: "completed",
          ...(existingSolution?.result !== "valid" ? { result: status } : {}),
        });
      }

      if (socketId) {
        io.to(socketId).emit("solutionResult", {
          solutionId,
          result: status
        });
        clients.delete(solutionId);
      }

    } catch (err) {
      console.error("Worker event error:", err);
    }
  });

  queueEvents.on("failed", async ({ jobId, failedReason }) => {
    try {
      const job = await Job.fromId(solutionQueue, jobId);
      if (!job) return;

      const { solutionId } = job.data;
      await SolutionModel.findByIdAndUpdate(solutionId, {
        status: "failed"
      });
    } catch (err) {
      console.error("Worker failed event error:", err);
    }
  });
}
