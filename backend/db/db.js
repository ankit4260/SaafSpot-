import mongoose from "mongoose";

async function connectDB(){
   await mongoose.connect(process.env.MONGO_URI)
    .then(()=>console.log('connected'))
    .catch((err)=>console.log(err));  
}

export default connectDB;