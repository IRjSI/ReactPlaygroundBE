import ActivityModel from "../models/activity.model.js"
import SolutionModel from "../models/solution.model.js"
import UserModel from "../models/user.model.js"
import { getSignedS3Url, uploadToS3 } from "../utils/s3.js"

/* Response
{
  message: string,
  success: boolean
}
*/
const addSolution = async (req, res) => {
  try {
    const { solution, challengeId } = req.body;

    if (!solution) {
      return res.status(400).json({
        message: "Solution is required",
        success: false
      });
    }
    if (!challengeId) {
      return res.status(400).json({
        message: "Challenge Id is required",
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
    
    const key = `solutions/${user._id}/${challengeId}.js`;

    await uploadToS3(key, solution);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await SolutionModel.findOne({
      user: user._id,
      challenge: challengeId
    });

    if (!existing) {
      // streak
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      const lastSolved = user.streak.lastSolvedDate
        ? new Date(user.streak.lastSolvedDate)
        : null;

      if (lastSolved) {
        lastSolved.setHours(0, 0, 0, 0);
      }

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

      await SolutionModel.create({
        user: user._id,
        challenge: challengeId,
        solution: key
      });
    } else {
      existing.solution = key;
      await existing.save();
    }

    // activity
    await ActivityModel.updateOne(
      { userId: user._id, date: today },
      { $inc: { count: 1 } },
      { upsert: true }
    );

    await user.save();

    return res.status(200).json({
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


/* Response
{
  data: [
    {
      challenge: string,
      solution: string
    }
  ],
  success: boolean
}
*/
const getSolutions = async (req,res) => {
    // to get the solutions of the user to display on the editor(frontend)
    try {
        const solutions = await SolutionModel.find({
          user: req.user?._id
        }).select("challenge solution");

        const updatedSolutions = await Promise.all(
          solutions.map(async (sol) => {
            const signedUrl = await getSignedS3Url(sol.solution);

            return {
              challenge: sol.challenge,
              solution: signedUrl,
            }
          })
        )
        
        return res.status(200).json({
            data: updatedSolutions,
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