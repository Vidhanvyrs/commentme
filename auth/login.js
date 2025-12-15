import readline from "readline";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { saveSession } from "../utils/session.js";

export async function login() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const ask = q => new Promise(res => rl.question(q, res));

  const username = await ask("Username: ");
  const password = await ask("Password: ");
  rl.close();

  const user = await User.findOne({ username });
  if (!user) throw new Error("User not found");

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error("Invalid password");

  saveSession(user._id);
  console.log("✔ Login successful");
}
