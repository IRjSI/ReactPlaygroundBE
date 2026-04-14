import mongoose from "mongoose";

const SolutionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    },
    challenge: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'challenge'
    },
    solution: {
        type: String,
        required: true,
        unique: false
    },
    status: {
        type: String,
        enum: ["pending", "processing", "completed", "failed"],
        default: "pending"
    },
    result: {
        type: String,
        enum: ["valid", "invalid"],
    }
})

SolutionSchema.index({ user: 1, challenge: 1 }, { unique: true });

const SolutionModel = mongoose.model('solution', SolutionSchema);

export default SolutionModel;