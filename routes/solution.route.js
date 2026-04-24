import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { getSolutionByChallengeId, getSolutions } from "../controllers/solution.controller.js";

const solutionRouter = express.Router();

solutionRouter.get('/get-solutions', verifyToken, getSolutions);
solutionRouter.get('/get-solution/:challengeId', verifyToken, getSolutionByChallengeId);

export default solutionRouter;