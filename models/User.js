import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username : String,
    email : { type: String, required: true, unique: true },
    password : String,
    isPremium: { type: Boolean, default: false },
},{ timestamps: true });

export default mongoose.model("user", userSchema);
    
  


