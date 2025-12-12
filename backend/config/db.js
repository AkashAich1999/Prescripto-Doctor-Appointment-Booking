import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB Connected", conn.connection.host);
    } catch (error) {
        console.error("Error Connecting to MongoDB", error);
        process.exit(1);  // 1 status code means failed, 0 means success.   
    }
}

export default connectDB;