import UserModel from "../models/user.model.js";

const userRegister = async (req,res) => {
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
        
        if (newUser) {
            return res.status(201).json({
                data: newUser,
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

const userLogin = async (req,res) => {
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
        
        return res.status(200).json({
            data: existingUser,
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

const addChallenges = async (req,res) => {
    try {
        const { challenge } = req.body;
        if (!challenge) {
            return res.status(400).json({
                message: "challenge required",
                success: false
            })
        }

        const updatedUser = await UserModel.findByIdAndUpdate(
            req.userId,
            { $push: { challenges: challenge } },
            { new: true }
        );
        
        if (!updatedUser) {
            return res.status(400).json({
                message: "error adding challenge",
                success: false
            })
        }

        return res.status(200).json({
            data: updatedUser,
            message: "Challenge added",
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

const getNumberOfChallenges = async (req,res) => {
    try {
        const challenges = await UserModel.findById(req.userId).select("challenges");
        if (!challenges) {
            return res.status(400).json({
                message: "challenges does not exists",
                success: false
            })
        }

        return res.status(200).json({
            data: challenges,
            message: "Challenges found",
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

export {
    userRegister,
    userLogin,
    addChallenges,
    getNumberOfChallenges,

}