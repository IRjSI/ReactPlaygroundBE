import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { createChallenge, getChallenges, getUserChallenges } from "../controllers/challenge.controller.js";

const challengeRouter = express.Router();

challengeRouter.get('/get-challenges', verifyToken, getChallenges);
challengeRouter.get('/get-user-challenges', verifyToken, getUserChallenges);
challengeRouter.post('/create-challenge', verifyToken, createChallenge);

export default challengeRouter;