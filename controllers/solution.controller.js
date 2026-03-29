import SolutionModel from "../models/solution.model.js"
import UserModel from "../models/user.model.js"
const addSolution = async (req, res) => {
  try {
    const { solution, statement } = req.body;

    if (!solution || !statement) {
      return res.status(400).json({
        message: "Solution/statement is required",
        success: false
      });
    }

    const user = await UserModel.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({
        message: "user not found",
        success: false
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const lastSolved = user.streak.lastSolvedDate
      ? new Date(user.streak.lastSolvedDate)
      : null;

    if (!lastSolved) {
      user.streak.current = 1;
    } else if (lastSolved.getTime() === today.getTime()) {
      // already solved today -> do nothing
    } else if (lastSolved.getTime() === yesterday.getTime()) {
      user.streak.current += 1;
    } else {
      user.streak.current = 1;
    }

    user.streak.lastSolvedDate = today;
    user.streak.longest = Math.max(
      user.streak.longest,
      user.streak.current
    );

    await Activity.updateOne(
      { userId: user._id, date: today },
      { $inc: { count: 1 } },
      { upsert: true }
    );

    const existing = await SolutionModel.findOne({
      user: user._id,
      statement
    });

    if (existing) {
      existing.solution = solution;
      await existing.save();
    } else {
      await SolutionModel.create({
        user: user._id,
        statement,
        solution
      });
    }

    await user.save();

    return res.status(200).json({
      data: user,
      message: "Solution processed",
      success: true
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false
    });
  }
};

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