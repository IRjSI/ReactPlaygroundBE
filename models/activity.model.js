import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
    index: true
  },
  date: {
    type: String,
    required: true,
    index: true
  },
  count: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

ActivitySchema.index({ userId: 1, date: 1 }, { unique: true });

const ActivityModel = mongoose.model("activity", ActivitySchema);

export default ActivityModel;