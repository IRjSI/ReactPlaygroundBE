import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { addChallenges, createChallenge, getAllChallenges, getUserChallenges } from "../controllers/challenge.controller.js";

const challengeRouter = express.Router();

challengeRouter.get('/get-challenges', verifyToken, getAllChallenges);
challengeRouter.get('/get-user-challenges', verifyToken, getUserChallenges);
challengeRouter.post('/add-challenge', verifyToken, addChallenges);
challengeRouter.post('/create-challenge', verifyToken, createChallenge);

export default challengeRouter;