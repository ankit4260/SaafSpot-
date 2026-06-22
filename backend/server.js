import express from "express";
import cookieParser from "cookie-parser";
import { json } from "express";
import reportsRoute from "./route/reports.js";
import authRoute from "./route/auth.js";
import connectDB from "./db/db.js";
import dns from 'node:dns';
import cors from "cors";
const app = express();
app.use(cors());

if (!fs.existsSync("./uploads")) {
    fs.mkdirSync("./uploads");
}

app.use(express.json()); 
app.use(cookieParser());
app.use(express.static("."));

dns.setServers(['8.8.8.8', '8.8.4.4']);
connectDB();


app.use("/route/auth", authRoute);
app.use("/route/reports", reportsRoute);


app.listen(3000, () => console.log("Server running on port 3000"));