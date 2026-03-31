import mongoose from "mongoose";

const ChallengeSchema = new mongoose.Schema({
    statement: {
        type: String,
        required: true,
        unique: true
    },
    difficulty: {
        type: String
    },
}, { timestamps: true })

const ChallengeModel = mongoose.model('challenge', ChallengeSchema);

export default ChallengeModel;