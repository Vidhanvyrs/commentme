import { getSession } from "./session.js";

export function getCurrentUserId() {
  const session = getSession();
  if (!session) {
    throw new Error("Not authenticated");
  }
  return session.userId;
}
