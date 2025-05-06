import SolutionModel from "../models/solution.model.js"
import UserModel from "../models/user.model.js"

const addSolution = async (req,res) => {
    try {
        const { solution, statement } = req.body
        if (!solution) {
            return res.status(400).json({
                message: 'Solution is required',
                success: false
            })
        }
        
        const user = await UserModel.findById(req.user?._id)
        if (!user) {
            return res.status(404).json({
                message: 'user not found',
                success: false
            })
        }

        const solutionInDb = await SolutionModel.create({
            statement,
            solution
        })

        user.solutions.push(solutionInDb);
        await user.save();

        return res.status(200).json({
            data: user,
            message: "Solution added",
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

const getSolutions = async (req,res) => {
    try {
        const user = await UserModel.findById(req.user?._id).populate('solutions')
        if (!user) {
            return res.status(404).json({
                message: 'user not found',
                success: false
            })
        }

        return res.status(200).json({
            data: user,
            message: "Solutions",
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
    addSolution,
    getSolutions
}