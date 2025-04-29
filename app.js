import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.urlencoded());
app.use(express.json())

app.get('/health-check', (req,res) => {

})

app.listen(4000, () => console.log('listening'))