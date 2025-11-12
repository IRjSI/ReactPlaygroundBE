import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import userRouter from "./routes/user.route.js";
import { connectToDB } from "./db/config.js";
import challengeRouter from "./routes/challenge.route.js";
import solutionRouter from "./routes/solution.route.js";
import submissionRouter from "./routes/submission.route.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { subscribeToResults } from "./workers/subscriber.js";

if (process.env.RUN_WORKER === "true") {
  import("./workers/solutionWorker.js")
    .then(() => console.log("Worker started"))
    .catch((err) => console.error("Worker failed:", err));
}


connectToDB();

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "https://reactpg.vercel.app", "https://react-playground-git-solution-rjss-projects.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
  credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json())

app.get("/", (_,res) => {
  res.send("restening")
})

app.use('/api/v1/user', userRouter);
app.use('/api/v1/challenges', challengeRouter);
app.use('/api/v1/solutions', solutionRouter);
app.use('/api/v1/submission', submissionRouter);

// Create HTTP server
const server = createServer(app);

// Attach socket.io
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://reactpg.vercel.app", "https://react-playground-git-solution-rjss-projects.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
    credentials: true
  }
});

const clients = new Map();

io.on("connection", (socket) => {
  socket.on("register", (solutionId) => {
    console.log("io connection has been made")
    clients.set(solutionId, socket.id);
  });

  socket.on("disconnect", () => {
    for (const [solutionId, sId] of clients) {
      if (sId === socket.id) clients.delete(solutionId);
    }
  });
});

// Subscribe to worker results
await subscribeToResults((solutionId, result) => {
  const socketId = clients.get(solutionId);
  if (socketId) {
    io.to(socketId).emit("solutionResult", { solutionId, result });
    console.log("result sent to FE")
    clients.delete(solutionId);
  }
});

const PORT = process.env.PORT
console.log(PORT)
server.listen(PORT || 5000, () => console.log('listening'))