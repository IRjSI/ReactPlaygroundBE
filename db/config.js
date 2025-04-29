import mongoose from "mongoose";

export async function connectToDB() {
    try {
        await mongoose.connect(`${process.env.MONGO_URL}/reactPg`).then(() => console.log('DB connected'))
    } catch (error) {
        console.log(error)
    }
}