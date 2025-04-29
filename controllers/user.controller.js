import UserModel from "../models/user.model.js";

const userRegister = async (req,res) => {
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
}

const userLogin = async (req,res) => {
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
}

export {
    userRegister,
    userLogin
}