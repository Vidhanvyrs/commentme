import readline from "readline";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { saveSession } from "../utils/session.js";

export async function signup() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const ask = q => new Promise(res => rl.question(q, res));

  const username = await ask("Username: ");
  const password = await ask("Password: ");
  rl.close();

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    password: hashed
  });

  saveSession(user._id);
  console.log("✔ Signup successful");
}
