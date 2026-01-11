// import fs from "fs";

// export function getAllComments() {
//   if (!fs.existsSync("output.json")) {
//     throw new Error("output.json not found. Run skim first.");
//   }

//   const raw = fs.readFileSync("output.json", "utf8");
//   const comments = JSON.parse(raw);

//   console.log(comments);
// }
// import { CommentStore } from "./models/CommentStore.js";
import path from "path";
import { getCurrentUserId } from "./utils/currentUser.js";
import { getSession } from "./utils/session.js";
import { API_BASE_URL } from "./utils/config.js";


export async function getAllComments(filePath = null) {
  const codebase = filePath ? path.basename(filePath) : "default";

  // Check if user is logged in
  try {
    getCurrentUserId();
  } catch (e) {
    console.error(e.message);
    return;
  }

  const session = getSession();
  const token = session.token; // Try to get token if saved, though current saveSession only saves userId. 
  // If auth middleware requires token, this needs to be updated. 
  // However, the user instruction implies we just need to hit the API. 
  // We'll pass the token in Authorization header if it exists.

  try {
    const response = await fetch(`${API_BASE_URL}/comments?codebase=${encodeURIComponent(codebase)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : "" // Sending token if available
      }
    });

    const data = await response.json();

    if (!response.ok) {
      // Gracefully handle empty or error
      if (response.status === 404) {
        console.log("{}");
        return;
      }
      throw new Error(data.message || "Failed to fetch comments");
    }

    console.log(data); // The API returns the comments object directly

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error("Error: Could not connect to the backend server. Is it running on port 8080?");
    } else {
      console.error("Error:", error.message);
    }
  }

  /*
  const userId = getCurrentUserId();
  const store = await CommentStore.findOne({ userId });

  if (!store) {
    console.log("{}");
    return;
  }

  const codebaseIndex= store.comments.findIndex(c => c.codebase === codebase);

  if (codebaseIndex === -1 || !store.comments[codebaseIndex].filecomment) {
    console.log("{}");
    return;
  }
  const codebaseEntry = store.comments[codebaseIndex];

  console.log(Object.fromEntries(codebaseEntry.filecomment));
  */
}