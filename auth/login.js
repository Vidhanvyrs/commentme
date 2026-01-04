import readline from "readline";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { saveSession } from "../utils/session.js";
import { promptPassword } from "../utils/passwordPrompt.js";

async function resetPassword() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const ask = q => new Promise(res => rl.question(q, res));

  const identifier = await ask("Enter your username or email: ");
  rl.close();

  // Try to find user by username or email
  const user = await User.findOne({
    $or: [
      { username: identifier },
      { email: identifier }
    ]
  });

  if (!user) {
    throw new Error("User not found with that username or email");
  }

  console.log("User found. Please enter your new password.");
  const newPassword = await promptPassword("New Password: ");
  const confirmPassword = await promptPassword("Confirm New Password: ");

  if (newPassword !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  if (newPassword.length === 0) {
    throw new Error("Password cannot be empty");
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  user.password = hashed;
  await user.save();

  console.log("✔ Password reset successful");
  console.log("✔ You can now login with your new password");
}

export async function login() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const ask = q => new Promise(res => rl.question(q, res));

  const choice = await ask("1. Login\n2. Forgot Password\nChoose: ");
  rl.close();

  if (choice === "2") {
    try {
      await resetPassword();
      return;
    } catch (error) {
      console.error(`✗ ${error.message}`);
      throw error;
    }
  }

  if (choice !== "1") {
    throw new Error("Invalid choice");
  }

  // Create a new readline interface for username input
  const rl2 = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const ask2 = q => new Promise(res => rl2.question(q, res));
  const username = await ask2("Username: ");
  rl2.close();

  const password = await promptPassword("Password: ");

  const user = await User.findOne({ username });
  if (!user) throw new Error("User not found");

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error("Invalid password");

  saveSession(user._id);
  console.log("✔ Login successful");
  console.log("✔ Process ran successful");

}
