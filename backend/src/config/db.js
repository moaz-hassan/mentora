import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/mentora";

let isMongoConnected = false;

/**
 * Connect to MongoDB using Mongoose.
 */
async function connectDB() {
  if (isMongoConnected) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isMongoConnected = conn.connections[0].readyState === 1;
    console.log(`✅ MongoDB connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    throw error;
  }
}

export { connectDB, mongoose };
export default connectDB;
