import express from "express";
import { checkSolution } from "../controllers/submission.controller.js";

const submissionRouter = express.Router();

submissionRouter.post('/submit', checkSolution);

export default submissionRouter;