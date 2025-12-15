import readline from "readline";
import { getSession } from "../utils/session.js";
import { signup } from "./signup.js";
import { login } from "./login.js";

export async function ensureAuth() {
  const session = getSession();
  if (session) return;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const choice = await new Promise(res =>
    rl.question("1. Login\n2. Signup\nChoose: ", res)
  );
  rl.close();

  if (choice === "1") await login();
  else if (choice === "2") await signup();
  else throw new Error("Invalid choice");
}
