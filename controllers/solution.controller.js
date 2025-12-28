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


        // streak

        const getToday = () => {
            return new Date().toISOString().split("T")[0]; 
        };

        const today = getToday();
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

        if (!user.streak.lastSolvedDate) {
            // first ever solve
            user.streak.current = 1;
        } 
        else if (user.streak.lastSolvedDate === today) {
            // already solved today → do nothing
        } 
        else if (user.streak.lastSolvedDate === yesterday) {
            // continues streak
            user.streak.current += 1;
        } 
        else {
            // missed a day — reset
            user.streak.current = 1;
        }

        user.streak.lastSolvedDate = today;
        user.streak.longest = Math.max(user.streak.longest, user.streak.current);


        // activity map
        
        const existingDay = user.activity.find(d => d.date === today);

        if (existingDay) {
            existingDay.active = true;
            existingDay.count += 1;
        } else {
            user.activity.push({
                date: today,
                active: true
            })
        }

        await user.save();

        // if a solution for a particular challenge exists, update it
        const solutionAlready = await SolutionModel.findOne({ 
            user: user?._id,
            statement
         });
        if (solutionAlready) {
            solutionAlready.solution = solution;
            await solutionAlready.save();
            return res.status(200).json({
                data: user,
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