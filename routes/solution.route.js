import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { getSolutions } from "../controllers/solution.controller.js";

const solutionRouter = express.Router();

solutionRouter.get('/get-solutions', verifyToken, getSolutions);

export default solutionRouter;