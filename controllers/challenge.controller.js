import ChallengeModel from "../models/challenge.model.js"
import SolutionModel from "../models/solution.model.js";

/* Response
{
    data: [
        {
            _id: string,
            statement: string,
            difficulty: string,
            solved: boolean
        }
    ],
    success: boolean
}
*/

const getChallenges = async (req, res) => {
  try {
    const userId = req.user._id;

    const [challenges, solved] = await Promise.all([
      ChallengeModel.find(),
      SolutionModel.find({ user: userId }).select("challenge -_id")
    ]);

    const solvedSet = new Set(
        solved
            .filter(s => s.challenge) // remove bad data
            .map(s => s.challenge.toString())
        );

    const result = challenges.map(ch => ({
      ...ch.toObject(),
      solved: solvedSet.has(ch._id.toString())
    }));

    res.status(200).json({
      data: result,
      success: true
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
};

/* Response
{
    data: [
        {
            _id: string,
            statement: string,
            difficulty: string
        }
    ],
    success: boolean
}
*/
const getAllChallenges = async (req,res) => {
    // to get all the challenges in the database to display on the site
    try {
        const challenges = await ChallengeModel.find();
        if (!challenges) {
            return res.status(404).json({
                message: 'Challenges not found',
                success: false
            })
        }

        res.status(200).json({
            data: challenges,
            success: true
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Internal Server Error',
            success: false
        })
    }
}

/* 
    NOT USED ANYMORE
*/
const getUserChallenges = async (req,res) => {
    // to get all the challenges the user have submitted(correct ones)
    try {
        // populate with challenge statement, this will help in tagging questions with 'solved' or 'unsolved'
        // const challenges = await UserModel.findById(req.user?._id).populate('challenges', 'statement');

        // const challengeIds = await SolutionModel.distinct("challenge", { user: req.user?._id })
        // const challenges = await ChallengeModel.find({
        //     _id: { $in: challengeIds }
        // }).select("statement");
    
        const challenges = await SolutionModel.aggregate([
            { $match: { user: req.user._id } },
            {
                $lookup: {
                    from: "challenges",
                    localField: "challenge",
                    foreignField: "_id",
                    as: "challenge"
                }
            },
            { $unwind: "$challenge" },
            {
                $project: {
                    _id: "$challenge._id",
                    statement: "$challenge.statement"
                }
            } 
        ])

        res.status(200).json({
            data: {
                challenges
            },
            message: 'Challenges found',
            success: true
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Internal Server Error',
            success: false
        })
    }
}

const createChallenge = async (req,res) => {
    // to create a challenge
    try {
        const { statement, difficulty, solution, testcases } = req.body;
        if (!statement) {
            return res.status(400).json({
                message: "challenge required",
                success: false
            })
        }

        const challenge = await ChallengeModel.create({
            statement,
            difficulty,
            solution,
            testcases
        })
        if (!challenge) {
            return res.status(400).json({
                message: "challenge not created",
                success: false
            })
        }

        res.status(201).json({
            data: challenge,
            message: "challenge created",
            success: false
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
    getChallenges,
    getAllChallenges,
    getUserChallenges,
    createChallenge
}