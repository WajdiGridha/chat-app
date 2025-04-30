import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: '../../.env' }); // ← pareil ici si nécessaire

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected to MongoDB");
    } catch (error) {
        console.log("❌ Error connecting to MongoDB:", error.message);
    }
};
