import mongoose from "mongoose";

const schema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true },
    hashPassword: { type: String, required: true },
    city: String,
    points: { type: Number, default: 0 },
    badges: [{ type: String }],
    streak: { type: Number, default: 0 },
    lastReportDate: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }
})

const User = mongoose.model("User", schema);

export default User;