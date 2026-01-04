import { clearSession } from "../utils/session.js";

export function logout() {
  clearSession();
  console.log("✔ Logged out successfully");
}
