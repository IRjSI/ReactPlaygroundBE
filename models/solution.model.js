import mongoose from "mongoose";

const SolutionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    challenge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'challenge'
    },
    solution: {
        type: String,
        required: true,
        unique: false
    }
})

SolutionSchema.index({ user: 1, challenge: 1 }, { unique: true });

const SolutionModel = mongoose.model('solution', SolutionSchema);

export default SolutionModel;