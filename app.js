import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./routes/user.route.js";
import { connectToDB } from "./db/config.js";

dotenv.config();

connectToDB();

const app = express();

app.use(cors());
app.use(express.urlencoded());
app.use(express.json())

app.get('/health-check', (req,res) => {

})

app.use('/api/v1/user', userRouter);

app.listen(4000, () => console.log('listening'))