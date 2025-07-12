import mongoose from "mongoose";

const SolutionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    statement: {
        type: String,
        required: true,
        unique: false
    },
    solution: {
        type: String,
        required: true,
        unique: false
    }
})

const SolutionModel = mongoose.model('solution', SolutionSchema);

export default SolutionModel;