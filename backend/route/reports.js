import { Router } from "express";
const reportsRoute = Router();
import { json } from "express";
import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import crypto from "crypto";
import Report from "../model/report.js";
import authMiddleware from "../middleware/auth.js";
reportsRoute.use(authMiddleware);
import upload from "../middleware/multer.js";
import verifySubmission from "../verifyReport/verify.js";
import User from "../model/user.js";
import updateStreak from "../utils/updateStreak.js";


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

//---create report--
reportsRoute.post("/report", upload.fields([
    { name: "beforePhoto", maxCount: 1 },
    { name: "afterPhoto", maxCount: 1 },
    { name: "video", maxCount: 1 },
]), async (req, res) => {
    try {

        const userId = req.user.userId;
        const title = req.body.title;
        const category = req.body.category;
        const description = req.body.description;
        const landmark = req.body.landmark;
        const beforePhotoFile = req.files.beforePhoto?.[0];
        const afterPhotoFile = req.files.afterPhoto?.[0];
        const videoFile = req.files.video?.[0];
        const location = req.body.location;
        if (!beforePhotoFile || !afterPhotoFile || !videoFile) {
            return res.json({ msg: "before and after photos are required" });
        }
        function getHashImage(file) {
            const buffer = fs.readFileSync(file.path);
            return crypto.createHash("sha256").update(buffer).digest("hex");
        }
        const videoBuffer = fs.readFileSync(videoFile.path);
        const beforeBuffer = fs.readFileSync(beforePhotoFile.path);
        const afterBuffer = fs.readFileSync(afterPhotoFile.path);
        const beforePhotoHash = getHashImage(beforePhotoFile);
        const afterPhotoHash = getHashImage(afterPhotoFile);


        const exist = await Report.findOne({
            $or: [
                { afterPhotoHash },
                { beforePhotoHash }
            ]
        })

        if (exist) {
            return res.json({ msg: "this photo has already been reported" });
        }

        const uploadPromises = [
            cloudinary.uploader.upload(beforePhotoFile.path),
            cloudinary.uploader.upload(afterPhotoFile.path),
        ]

        if (videoFile) {
            uploadPromises.push(cloudinary.uploader.upload(videoFile.path, { resource_type: "video", }))
        }
        const results = await Promise.all(uploadPromises);
        const beforePhotoUrl = results[0].secure_url;
        const afterPhotoUrl = results[1].secure_url;
        const videoUrl = videoFile ? results[2].secure_url : null;

        const r = new Report({
            userId,
            title,
            category,
            description,
            landmark,
            beforePhotoUrl,
            afterPhotoUrl,
            videoUrl,
            beforePhotoHash,
            afterPhotoHash,
            location,
        })
        await r.save()

        const claimedLng = req.body.location.coordinates[1]
        const claimedLat = req.body.location.coordinates[0]


        const beforeBuffe = fs.readFileSync(beforePhotoFile.path);
        const afterBuffe = fs.readFileSync(afterPhotoFile.path);

        const verifiedData = await verifySubmission(beforeBuffe, afterBuffe, videoBuffer, videoFile, claimedLat, claimedLng, category);
        await User.findByIdAndUpdate(userId,
            { $inc: { points: verifiedData.pointsAwarded } }
        )
        await Report.findByIdAndUpdate(r._id,
            {
                $inc: { pointsAwarded: verifiedData.pointsAwarded },

                $set: {
                    status: verifiedData.status,
                    trustScore: verifiedData.trustScore
                }
            },

        );

        const user = await User.findById(userId);
        updateStreak(user);
        await user.save();


        res.json({
            msg: "success"
        })

    }
    catch (err) {
        if (req.files) {
            const fileFields = Object.values(req.files).flat(); // Combines beforePhoto, afterPhoto, video arrays
            fileFields.forEach(file => {
                if (fs.existsSync(file.path)) {
                    try {
                        fs.unlinkSync(file.path);
                    } catch (unlinkErr) {
                        console.error(`Failed to delete temporary file ${file.path}:`, unlinkErr);
                    }
                }
            });
        }
        console.log(err)
        res.json({
            msg: "error while report"
        })
    }
})
// -----submited user reports---
reportsRoute.get("/mySubmissions", async (req, res) => {
    try {
        const userId = req.user.userId;
        const resp = await Report.find({ userId });
        res.json({
            resp,
        })
    }
    catch (err) {
        console.error("error while mysubmissions :", err);
        res.json({
            msg: "err in fetching data"
        })
    }
})
//------dashboard---
reportsRoute.get("/dashboard", async (req, res) => {
    try {
        const userId = req.user.userId;

        const u = await User.findById(userId);
        const r = await Report.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("userId", "firstName lastName");

        const verifiedNum = await Report.countDocuments({ userId, status: "Verified" });

        const cityRank = await User.countDocuments({
            city: u.city,
            points: { $gt: u.points }
        }) + 1;

        res.json({
            u: {
                firstName: u.firstName,
                lastName: u.lastName,
                city: u.city,
                points: u.points,
                cityRank,
                verifiedNum,
                streak: u.streak || 0
            },
            r
        })
    }
    catch (err) {
        console.error("error while dashboard :", err);
        res.json({
            msg: "err in fetching data"
        })
    }
})

//------leaderboard---
reportsRoute.get("/leaderboard", async (req, res) => {
    try {
        const userId = req.user.userId;
        const u = await User.findById(userId);
        res.json({
            u
        })
    }
    catch (err) {
        console.error("error while leaderboard :", err);
        res.json({
            msg: "err in fetching data"
        })
    }
})

export default reportsRoute;