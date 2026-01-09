import readline from "readline";
// import bcrypt from "bcryptjs";
// import { User } from "../models/User.js";
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

  /*
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
  */

  // console.log("User found. Please enter your new password.");
  const new_password = await promptPassword("New Password: ");
  const confirm_password = await promptPassword("Confirm New Password: ");

  if (new_password !== confirm_password) {
    throw new Error("Passwords do not match");
  }

  if (new_password.length === 0) {
    throw new Error("Password cannot be empty");
  }

  /*
  const hashed = await bcrypt.hash(newPassword, 10);
  user.password = hashed;
  await user.save();

  console.log("✔ Password reset successful");
  console.log("✔ You can now login with your new password");
  */

  try {
    const response = await fetch("http://localhost:8080/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ "identifier": identifier, "newPassword": new_password, "confirmPassword": confirm_password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Password reset failed");
    }

    console.log("✔ Password reset successful");
    console.log("✔ You can now login with your new password");
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error("Error: Could not connect to the backend server. Is it running on port 8080?");
      throw new Error("Connection Refused");
    } else {
      throw error;
    }
  }
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
      // console.error(`✗ ${error.message}`);
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

  /*
  const user = await User.findOne({ username });
  if (!user) throw new Error("User not found");

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error("Invalid password");

  saveSession(user._id);
  console.log("✔ Login successful");
  console.log("✔ Process ran successful");
  */

  try {
    const response = await fetch("http://localhost:8080/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    saveSession({
      ...data,
      token: data.accessToken
    });
    console.log("✔ Login successful");
    console.log("✔ Process ran successful");
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error("Error: Could not connect to the backend server. Is it running on port 8080?");
      throw new Error("Connection Refused");
    } else {
      throw error;
    }
  }

}
