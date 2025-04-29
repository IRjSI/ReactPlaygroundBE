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
    
}, { timestamps: true });

UserSchema.pre("save", async function (next) {
    this.password = bcrypt.hash(this.password, 10);

    next()
})

UserSchema.methods.isPasswordCorrect = function(password) {
    return bcrypt.compare(password, this.password);
}

UserSchema.methods.generateToken = function() {
    return jwt.sign({
        _id: this._id
    }, process.env.JWT_SECRET)
}

const UserModel = mongoose.model('user', UserSchema);

export default UserModel;