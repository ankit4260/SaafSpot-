import sharp from "sharp";
import exifr from "exifr";
import { GoogleGenAI } from "@google/genai";
import Report from "../model/report.js";
const ai = new GoogleGenAI({ apiKey: process.env.apiKey });

//------------distance checking------
async function getDistanceKm(lat1, lng1, lat2, lng2) {
    try {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
    catch (err) {
        console.error("getDistanceKm failed :", err);
        return //???????
    }
}
//-----check metadata------
async function checkMetaData(buffer, claimedlat, claimedlng) {
    try {
        const gps = await exifr.gps(buffer);
        if (!gps) {
            return { hasGPS: false, locationMatch: null };
        }
        const distanceKm = getDistanceKm(gps.latitude, gps.longitude, claimedlat, claimedlng);
        const locationMatch = distanceKm < 0.5;
        return { hasGPS: true, distanceKm, locationMatch };
    }
    catch (err) {
        console.error("checkMetaData failed :", err);
        return //???????
    }
}
//----visual difference-------
async function visualDifference(beforeBuffer, afterBuffer) {
    try {
        
        const beforeStats = await sharp(beforeBuffer).stats();
        const afterStats = await sharp(afterBuffer).stats();

        let sum = 0;
        function avgBrightness(stats) {
            for (let i = 0; i < stats.channels.length; i++) {
                sum += stats.channels[i].mean;
            }
            return sum / stats.channels.length;
        }
        const beforeBrightness = avgBrightness(beforeStats);
        const afterBrightness = avgBrightness(afterStats);
        const brightnessDiff = Math.abs(afterBrightness - beforeBrightness);
        const looksChanged= brightnessDiff > 10
        return {
            beforeBrightness,
            afterBrightness,
            brightnessDiff,
            looksChanged: brightnessDiff > 10
        }
    }
    catch (err) {
        console.error("visualDifference failed :", err);
        return //???????
    }
}
//------cooldown check-----
async function cooldownCheck(lat, lng) {
    try {
        const cuttof = new Date(Date.now() - 18 * 24 * 60 * 60 * 1000);
        const nearby = await Report.findOne({
            location: {
                $near: { $geometry: { type: "Point", coordinates: [lng, lat] }, $maxDistance: 100 }
            },
            status: "Verified",
            createdAt: { $gte: cuttof }
        })
        return { isCooldown: nearby };
    }
    catch (err) {
        console.error("cooldownCheck failed :", err);
        return { isCooldown: false };
    }
}
//-----gemini-validation---
async function geminiCheck(beforeBuffer, afterBuffer, videoBuffer, videoFile) {
    try {

        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: "You are reviewing a civic cleanup submission. You're given a before photo, an after photo, and a video of the cleanup happening. Judge whether genuine cleaning occurred, whether the video matches the same location as the photos, and estimate the scale of the cleanup. Respond ONLY with JSON, no markdown: {\"cleaned\": boolean, \"videoMatchesPhotos\": boolean, \"scale\": \"small\" or \"medium\" or \"large\", \"confidence\": number from 0 to 100, \"reason\": short string}" },
                        { inlineData: { mimeType: "image/jpeg", data: beforeBuffer.toString("base64") } },
                        { inlineData: { mimeType: "image/jpeg", data: afterBuffer.toString("base64") } },
                        { inlineData: { mimeType: videoFile.mimetype, data: videoBuffer.toString("base64") } }
                    ]
                }
            ]
        });
        const text = response.text;
        const clean = text.replace(/```json|```/g, "").trim();
        return JSON.parse(clean);
    }
    catch (err) {
        console.error("Gemini check failed:", err);
        return { cleaned: null, videoMatchesPhotos: null, confidence: 0, reason: "AI check unavailable" };
    }
}

//-----rewardPoints------
function rewardPoint(trustScore, category, s) {
    const categoryPoints = {
        "Garbage dump": { min: 20, max: 100 },
        "Construction debris": { min: 20, max: 100 },
        "Open drainage / sewage": { min: 25, max: 90 },
        "Stagnant water": { min: 20, max: 80 },
        "Overflowing bin": { min: 10, max: 50 },
        "Plastic waste": { min: 10, max: 50 },
        "Other": { min: 10, max: 40 }
    };
    const scale = {
        small: 0.3,
        medium: 0.65,
        large: 1.0
    };

    const range = categoryPoints[category] || categoryPoints["Other"];
    const scaleM = scale[s] || scale.small;

    const basePoints = range.min + (range.max - range.min) * scaleM;
    const finalPoints = Math.round(basePoints * (trustScore / 100));
    return Math.max(0, finalPoints);
}


async function verifySubmission(
    beforeBuffer, afterBuffer, videoBuffer, videoFile,
    claimedLat, claimedLng, category
) {
   
    const [beforGps, afterGps, visualDiff, cooldown, gemini] = await Promise.all([
        checkMetaData(beforeBuffer, claimedLat, claimedLng),
        checkMetaData(afterBuffer, claimedLat, claimedLng),
        visualDifference(beforeBuffer, afterBuffer),
        cooldownCheck(claimedLat, claimedLng),
        geminiCheck(beforeBuffer, afterBuffer, videoBuffer,videoFile)
    ])
    //------trustscore----------
    let trustScore = 50;
    if (beforGps.hasGPS) trustScore += beforGps.locationMatch ? 8 : -10;
    if (afterGps.hasGPS) trustScore += afterGps.locationMatch ? 8 : -10;
    if (beforGps.hasGPS && beforGps.distanceKm < 0.2) trustScore += 10; // extra bonus, on top
    if (afterGps.hasGPS && afterGps.distanceKm < 0.2) trustScore += 10;
    trustScore += visualDiff.looksChanged ? 8 : -10;
    if (gemini.cleaned === true) trustScore += gemini.confidence * 0.4;
    if (gemini.cleaned === false) trustScore -= 20;
    if (gemini.videoMatchesPhotos === false) trustScore -= 15;

    if (cooldown.isCooldown) trustScore = 0;
    trustScore = Math.max(0, Math.min(100, Math.round(trustScore)));
    //------status-------
    let status;
    if (cooldown.isCooldown) {
        status = "Rejected";
    } else if (trustScore >= 70) {
        status = "Verified";
    } else if (trustScore >= 40) {
        status = "Partial Match";
    } else {
        status = "Rejected";
    }
    const pointsAwarded = rewardPoint(trustScore, category, gemini.scale);
    return {
        pointsAwarded,
        status,
        trustScore
    }

}

export default verifySubmission;