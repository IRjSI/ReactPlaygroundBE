import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import userRouter from "./routes/user.route.js";
import { connectToDB } from "./db/config.js";
import challengeRouter from "./routes/challenge.route.js";
import solutionRouter from "./routes/solution.route.js";
import submissionRouter from "./routes/submission.route.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { subscribeToResults } from "./workers/subscriber.js";

import passport from "passport";
import "./utils/passport.js";

import { fork } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workerPath = path.join(__dirname, "workers", "solutionWorker.js");
const worker = fork(workerPath);

worker.on("error", (err) => console.error("Worker error:", err));
worker.on("exit", (code) => console.log("Worker exited with code", code));

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

app.get(
  "/api/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/api/auth/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const user = req.user;

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // redirect to frontend with token or send JSON
    res.redirect(`http://localhost:5173/auth/success?token=${token}`);
  }
);

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
// await subscribeToResults((solutionId, result) => {
//   const socketId = clients.get(solutionId);
//   if (socketId) {
//     io.to(socketId).emit("solutionResult", { solutionId, result });
//     console.log("result sent to FE")
//     clients.delete(solutionId);
//   }
// });

const PORT = process.env.PORT

server.listen(PORT || 5000, async () => {
  console.log('Server listening on port', PORT || 5000);
  
  try {
    await subscribeToResults((solutionId, result) => {
      const socketId = clients.get(solutionId);
      if (socketId) {
        io.to(socketId).emit("solutionResult", { solutionId, result });
        console.log("result sent to FE");
        clients.delete(solutionId);
      }
    });
    console.log("✅ Redis subscriber connected");
  } catch (error) {
    console.error("❌ Redis subscriber error:", error);
  }
});