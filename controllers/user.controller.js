import ActivityModel from "../models/activity.model.js";
import SolutionModel from "../models/solution.model.js";
import UserModel from "../models/user.model.js";
import { getCached, setCached } from "../utils/cache.js";
import { getRedisClient } from "../utils/redis.js";

const userRegister = async (req, res) => {
    // to create a new user
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json(400, {
                message: "All fields required",
                success: false
            })
        }

        const existingUser = await UserModel.findOne({ username });
        if (existingUser) {
            console.log(existingUser)
            return res.status(400).json({
                message: "User already exists",
                success: false
            })
        }

        const newUser = await UserModel.create({
            username,
            email,
            password
        })

        const token = await newUser.generateToken();

        if (newUser) {
            return res.status(201).json({
                data: token,
                message: "User created",
                success: true
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
}

const userLogin = async (req, res) => {
    // to login an existing user
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({
                message: "All fields required",
                success: false
            })
        }

        const existingUser = await UserModel.findOne({ username });
        if (!existingUser) {
            return res.status(400).json({
                message: "User does not exists",
                success: false
            })
        }

        const token = await existingUser.generateToken();

        return res.status(200).json({
            data: token,
            message: "User found",
            success: true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
}

const getUserInfo = async (req, res) => {
    // to get the current user
    try {
        const userId = req.user?._id.toString();

        // cache key
        const cacheKey = `cache:user:${userId}:info`;

        const cachedUserData = await getCached(cacheKey);

        if (cachedUserData) {
            return res.status(200).json({
                data: cachedUserData,
                message: 'user found',
                success: true
            });
        }

        // else 

        const user = await UserModel.findById(userId).lean();
        if (!user) {
            return res.status(404).json({
                message: 'user not found',
                success: false
            })
        }

        const [userActivity, noOfChallenges] = await Promise.all([
            ActivityModel.find({ userId }).lean(),
            SolutionModel.countDocuments({ user: userId, result: "valid" })
        ]);

        const userData = {
            user,
            userActivity,
            noOfChallenges
        }

        // set in redis
        await setCached(cacheKey, userData, 300);

        res.status(200).json({
            data: userData,
            message: 'user found',
            success: true
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'internal server error',
            success: false
        })
    }
}

export {
    userRegister,
    userLogin,
    getUserInfo
}