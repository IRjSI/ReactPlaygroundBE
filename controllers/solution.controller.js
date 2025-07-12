import SolutionModel from "../models/solution.model.js"
import UserModel from "../models/user.model.js"

const addSolution = async (req,res) => {
    // to add the solution(correct one) of the user in the Solution model
    try {
        // take statement and solution
        const { solution, statement } = req.body
        if (!solution || !statement) {
            return res.status(400).json({
                message: 'Solution/statement is required',
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

        // if a solution for a particular challenge exists, update it
        const solutionAlready = await SolutionModel.findOne({ 
            user: user?._id,
            statement
         });
        if (solutionAlready) {
            solutionAlready.solution = solution;
            await solutionAlready.save();
            return res.status(204).json({
                message: 'solution updated',
                success: true
            });
        }

        const solutionInDb = await SolutionModel.create({
            user,
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
    // to get the solutions of the user to display on the editor(frontend)
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