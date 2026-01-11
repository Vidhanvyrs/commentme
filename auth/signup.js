import readline from "readline";
// import bcrypt from "bcryptjs";
// import { User } from "../models/User.js";
import { saveSession } from "../utils/session.js";
import { promptPassword } from "../utils/passwordPrompt.js";
import { API_BASE_URL } from "../utils/config.js";

//signup function
export async function signup() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const ask = q => new Promise(res => rl.question(q, res));

  const username = await ask("Username: ");
  const email = await ask("Email: ");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.log("Invalid email address");
    rl.close();
    return;
  }

  // const existinguser = await User.findOne({ email });
  // if (existinguser) {
  //   console.log("User already exists, Try logging in");
  //   rl.close(); 
  //   return;
  // }
  rl.close();

  const password = await promptPassword("Password: ");

  try {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Signup failed");
    }

    saveSession(data);
    console.log("✔ Signup successful");
    console.log("✔ Process ran successful");
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error("Error: Could not connect to the backend server. Is it running on port 8080?");
    } else {
      console.error("Error:", error.message);
    }
  }

  // const hashed = await bcrypt.hash(password, 10);
  // const user = await User.create({ username, email, password: hashed });

  // saveSession(user._id);
  // console.log("✔ Signup successful");
  // console.log("✔ Process ran successful");
}
