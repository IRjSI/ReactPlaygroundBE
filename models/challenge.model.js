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
    status: {
        type: String,
        enum: ["Done", "Not Yet"]
    }
})

const ChallengeModel = mongoose.model('challenge', ChallengeSchema);

export default ChallengeModel;