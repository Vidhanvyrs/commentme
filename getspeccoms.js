// import fs from "fs";

// export function getSpecificComment(key, silent = false) {
//   if (!fs.existsSync("output.json")) {
//     throw new Error("output.json not found. Run skim first.");
//   }

//   const raw = fs.readFileSync("output.json", "utf8");
//   const comments = JSON.parse(raw);

//   if (!comments[key]) {
//     throw new Error(`No comment found for key: ${key}`);
//   }

//   if (!silent) {
//     console.log(`✔ Comment for ${key}:`);
//     console.log(comments[key]);
//   }

//   return comments[key]; // IMPORTANT for edit flow
// }

// import { CommentStore } from "./models/CommentStore.js";
import path from "path";
import { getCurrentUserId } from "./utils/currentUser.js";
import { getSession } from "./utils/session.js";

export async function getSpecificComment(key, silent = false, filePath = null) {
  const codebase = filePath ? path.basename(filePath) : "default";

  // Check authentication
  try {
    getCurrentUserId();
  } catch (e) {
    if (!silent) console.error(e.message);
    throw e;
  }

  const session = getSession();
  const token = session ? session.token : null;

  try {
    const response = await fetch(`http://localhost:8080/comments/${encodeURIComponent(key)}?codebase=${encodeURIComponent(codebase)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : ""
      }
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle error, throw regular error to match previous behavior for catch blocks up the chain
      throw new Error(data.message || `No comment found for key: ${key}`);
    }

    const value = data.comment; // Backend returns { key, comment }

    if (!silent) {
      console.log(`✔ Comment for ${key}:`);
      console.log(value);
    }

    return value;

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      if (!silent) console.error("Error: Could not connect to the backend server. Is it running on port 8080?");
      throw new Error("Connection failed");
    } else {
      // Re-throw so caller can handle "No comment found" etc.
      throw error;
    }
  }

  /*
  const userId = getCurrentUserId();
  const store = await CommentStore.findOne({ userId });

  if (!store) {
    throw new Error(`No comment found for key: ${key}`);
  }

  const codebaseIndex = store.comments.findIndex(c => c.codebase === codebase);

  if (codebaseIndex === -1 || !store.comments[codebaseIndex].filecomment.has(key)) {
    throw new Error(`No comment found for key: ${key}`);
  }
  const codebaseEntry = store.comments[codebaseIndex];
  const value = codebaseEntry.filecomment.get(key);

  if (!silent) {
    console.log(`✔ Comment for ${key}:`);
    console.log(value);
  }

  return value;
  */
}
