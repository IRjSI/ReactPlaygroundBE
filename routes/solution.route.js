import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { addSolution, getSolutions } from "../controllers/user.controller.js";

const solutionRouter = express.Router();

solutionRouter.post('/add-solution', verifyToken, addSolution);
solutionRouter.get('/get-solutions', verifyToken, getSolutions);

export default solutionRouter;