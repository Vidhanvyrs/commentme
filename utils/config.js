import dotenv from "dotenv";
dotenv.config();

export const API_BASE_URL = process.env.BACKEND_URL || "http://localhost:8080";
