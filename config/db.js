import mongoose from "mongoose";

export async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    throw new Error("MONGODB_URI environment variable is not set. Please create a .env file with your MongoDB connection string.");
  }
  
  await mongoose.connect(mongoUri);
  
  console.log("✔ Connected to MongoDB");
}

export async function disconnectDB() {
  await mongoose.disconnect();
  console.log("✔ Disconnected from MongoDB");
}

