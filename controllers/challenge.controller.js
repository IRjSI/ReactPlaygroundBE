import ChallengeModel from "../models/challenge.model.js"
import UserModel from "../models/user.model.js";

const getAllChallenges = async (req,res) => {
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

const getUserChallenges = async (req,res) => {
    try {
        const challenges = await UserModel.findById(req.user?._id).populate('challenges', 'statement');
        if (!challenges) {
            return res.status(404).json({
                message: 'Challenges not found',
                success: false
            })
        }

        res.status(200).json({
            data: challenges,
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

const addChallenges = async (req,res) => {
    try {
        const { statement } = req.body;
        if (!statement) {
            return res.status(400).json({
                message: "challenge required",
                success: false
            })
        }

        const challengeFromDB = await ChallengeModel.findOne({ statement: statement })
        if (!challengeFromDB) {
            return res.status(404).json({
                message: "Challenge not found in database",
                success: false
            });
        }

        const user = await UserModel.findById(req.user?._id)
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }
        
        const challengeId = challengeFromDB._id.toString();

        // to add a challenge only once
        if (user.challenges.map(id => id.toString()).includes(challengeId)) {
            return res.status(200).json({
                message: "Already added",
                success: true
            });
        }
        
        user.challenges.push(challengeId);
        await user.save();

        return res.status(200).json({
            data: user,
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

export {
    getAllChallenges,
    getUserChallenges,
    addChallenges
}