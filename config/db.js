import mongoose from "mongoose";

export async function connectDB() {
  await mongoose.connect("mongodb://127.0.0.1:27017/commentme");
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
