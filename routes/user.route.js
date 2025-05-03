import express from "express";
import { addChallenges, getChallenges, getUserInfo, userLogin, userRegister } from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const userRouter = express.Router();

userRouter.post('/register', userRegister);
userRouter.post('/login', userLogin);
userRouter.get('/get-user', verifyToken, getUserInfo);
userRouter.post('/add-challenge', verifyToken, addChallenges);
userRouter.get('/get-challenges', verifyToken, getChallenges);

export default userRouter;