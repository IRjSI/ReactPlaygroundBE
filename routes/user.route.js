import express from "express";
import { userLogin, userRegister } from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.post('/register', userRegister);
userRouter.post('/login', userLogin);
userRouter.post('/challenges', userLogin);

export default userRouter;