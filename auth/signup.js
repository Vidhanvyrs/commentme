import readline from "readline";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { saveSession } from "../utils/session.js";
import { promptPassword } from "../utils/passwordPrompt.js";
//signup function
export async function signup() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const ask = q => new Promise(res => rl.question(q, res));

  const username = await ask("Username: ");
  const email = await ask("Email: ");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    console.log("Invalid email address");
    return;
  }
  const existinguser = await User.findOne({ email });
  if (existinguser) {
    console.log("User already exists, Try logging in");
    return;
  }
  rl.close();

  const password = await promptPassword("Password: ");

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email, password: hashed });

  saveSession(user._id);
  console.log("✔ Signup successful");
  console.log("✔ Process ran successful");
}
