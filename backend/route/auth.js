import { Router } from "express";
const authRoute=Router();
import authMiddleware from"../middleware/auth.js"

import User from "../model/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;
import { registerSchema } from "../middleware/validate.js";
import { loginSchema } from "../middleware/validate.js";


// ---register---
authRoute.post("/register",registerSchema,async(req,res)=>{
    const parsed=registerSchema.safeParse(req.body);
    if(!parsed.success){
        res.json({
            msg: parsed.error.issues[0].message
        })
        return;
    }
    const {firstName,lastName,email,password,city}=parsed.data;
    try{
    const exist=await User.findOne({
        email:email
    });

    if(exist) {
        res.json({
            msg:"user already have an account"
        })
        return;
    }

    const hashPassword=await bcrypt.hash(password,5);
    const u=new User({
        firstName,
        lastName,
        email,
        hashPassword,
        city
    });
    await u.save();
    res.json({
        msg:"success"
    })
    }
    catch(err){
        console.log(err);
        res.json({
            msg:"error while register"
        })
    }
})
//----login----
authRoute.post("/login",loginSchema,async(req,res)=>{

    const parsed=loginSchema.safeParse(req.body);
    if(!parsed.success){
        res.json({
            msg: parsed.error.issues[0].message
        })
        return;
    }
    const {email,password}=parsed.data;
    try{
    const exist=await User.findOne({
        email:email
    });
    if(!exist) {
        res.json({
            msg:"user don't have an account"
        })
        return;
    }

    const found=await bcrypt.compare(password,exist.hashPassword);

    if(found){
        const token=jwt.sign({userId:exist._id},JWT_SECRET);
        res.cookie("token",token,{httpOnly:true}).json({
            msg:"success"
        })
        return;
    }
    else{
        res.json({
            msg:"passward is wrong"
        })
    }
}
catch(err){
    console.log(err);
    res.json({
        msg:"error while login"
    })
}
})

//---user---
authRoute.get("/me",authMiddleware,(req,res)=>{
})

export default authRoute;