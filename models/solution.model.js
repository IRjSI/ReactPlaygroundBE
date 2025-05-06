import mongoose from "mongoose";

const SolutionSchema = new mongoose.Schema({
    statement: {
        type: String,
        required: true,
        unique: true
    },
    solution: {
        type: String,
        required: true
    }
})

const SolutionModel = mongoose.model('solution', SolutionSchema);

export default SolutionModel;