import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    challenges: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'challenge'
        }
    ],
    token: {
        type: String
    }
}, { timestamps: true });

UserSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    
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