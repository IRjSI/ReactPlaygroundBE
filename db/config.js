import mongoose from "mongoose";

export async function connectToDB() {
  if (mongoose.connection.readyState >= 1) return;

  try {
    await mongoose.connect(`${process.env.MONGO_URL}/reactPg`);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}