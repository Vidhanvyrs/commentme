import fs from "fs";
import path from "path";
import os from "os";

const SESSION_PATH = path.join(os.homedir(), ".commentme-session.json");

export function saveSession(sessionData) {
  fs.writeFileSync(SESSION_PATH, JSON.stringify(sessionData));
}

export function getSession() {
  if (!fs.existsSync(SESSION_PATH)) return null;
  return JSON.parse(fs.readFileSync(SESSION_PATH, "utf8"));
}

export function clearSession() {
  if (fs.existsSync(SESSION_PATH)) fs.unlinkSync(SESSION_PATH);
}
