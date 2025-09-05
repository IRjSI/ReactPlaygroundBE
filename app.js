import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./routes/user.route.js";
import { connectToDB } from "./db/config.js";
import challengeRouter from "./routes/challenge.route.js";
import solutionRouter from "./routes/solution.route.js";
import submissionRouter from "./routes/submission.route.js";

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

app.listen(4000, () => console.log('listening'))