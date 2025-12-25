import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";

export const verifyToken = async (req,res,next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(400).json({
                message: 'Unauth'
            })
        }
        
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        const user = await UserModel.findById(decodedToken?.id);

        if (!user) {
            return res.status(401).json({
                message: 'Unautho'
            })
        }        

        req.user = user;
        
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Something went wrong(auth middleware)'
        })
    }
}