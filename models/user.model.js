import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
    },
    provider: {
        type: String,
        enum: ["local", "google"]
    },
    providerId: {
        type: String
    },
    avatar: {
        type: String
    },
    challenges: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'challenge'
        }
    ],
    solutions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'solution'
        }
    ],
    token: {
        type: String
    }
}, { timestamps: true });

UserSchema.pre("save", async function (next) {
    if (!this.isModified("password") || !this.password) return next();
    
    // if the password is changed, it will be hashed. otherwise skipped
    this.password = await bcrypt.hash(this.password, 10);
    
    next()
})

UserSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
}

UserSchema.methods.generateToken = function() {
    return jwt.sign({
        _id: this._id
    }, process.env.JWT_SECRET)
}

const UserModel = mongoose.model('user', UserSchema);

export default UserModel;