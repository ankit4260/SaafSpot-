import mongoose from "mongoose";

const schema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true },
    category: {
        type: String,
        enum: ["Garbage dump", "Overflowing bin", "Open drainage / sewage",
            "Construction debris", "Stagnant water", "Plastic waste", "Other"],
        required: true
    },
    description: { type: String, required: true },

    beforePhotoUrl: { type: String, required: true },
    afterPhotoUrl: { type: String, required: true },
    videoUrl: { type: String, required: true },

    beforePhotoHash: String,
    afterPhotoHash: String,

    location: {
        type: { type: String, default: "Point" },
        coordinates: [Number]
    },
    landmark: String,

    status: {
        type: String,
        enum: ["AI Verifying", "Verified", "Partial Match", "Rejected"],
        default: "AI Verifying"
    },
    trustScore: { type: Number, default: 0 },
    pointsAwarded: { type: Number, default: 0 },
    
    votesCount: { type: Number, default: 0 },
    votedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    createdAt: { type: Date, default: Date.now }
})

schema.index({ location: "2dsphere" });


const Report = mongoose.model("Report", schema);

export default Report;