import express from "express";
import { addChallenges, getNumberOfChallenges, userLogin, userRegister } from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.post('/register', userRegister);
userRouter.post('/login', userLogin);
userRouter.post('/add-challenge', addChallenges);
userRouter.get('/get-challenges', getNumberOfChallenges);

export default userRouter;