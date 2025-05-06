import express from "express";
import { addSolution, getSolutions, getUserInfo, userLogin, userRegister } from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const userRouter = express.Router();

userRouter.post('/register', userRegister);
userRouter.post('/login', userLogin);
userRouter.get('/get-user', verifyToken, getUserInfo);
userRouter.post('/add-solution', verifyToken, addSolution);
userRouter.get('/get-solutions', verifyToken, getSolutions);

export default userRouter;