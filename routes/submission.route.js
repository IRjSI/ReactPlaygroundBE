import express from "express";
import { checkSolution } from "../controllers/submission.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const submissionRouter = express.Router();

submissionRouter.post('/submit', verifyToken, checkSolution);

export default submissionRouter;