import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./routes/user.route.js";
import { connectToDB } from "./db/config.js";
import challengeRouter from "./routes/challenge.route.js";
import solutionRouter from "./routes/solution.route.js";
import submissionRouter from "./routes/submission.route.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { subscribeToResults } from "./workers/subscriber.js";

dotenv.config();

connectToDB();

const app = express();

app.use(cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
    credentials: true
}));
app.use(express.urlencoded());
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
  cors: { origin: "http://localhost:5173" }
});

const clients = new Map();

io.on("connection", (socket) => {
    socket.on("register", (solutionId) => {
        clients.set(solutionId, socket.id);
    });

    socket.on("disconnect", () => {
        for (const [solutionId, sId] of clients) {
          if (sId === socket.id) clients.delete(solutionId);
        }
    });
});

// Subscribe to worker results
subscribeToResults((solutionId, result) => {
  const socketId = clients.get(solutionId); // since it is a map, so provide key to get value
  if (socketId) {
    io.to(socketId).emit("solutionResult", { solutionId, result });
    clients.delete(solutionId);
  }
});

server.listen(4000, () => console.log('listening'))