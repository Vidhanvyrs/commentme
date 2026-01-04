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

import { CommentStore } from "./models/CommentStore.js";
import path from "path";
import { getCurrentUserId } from "./utils/currentUser.js";

export async function getSpecificComment(key, silent = false, filePath = null) {
  const codebase = filePath ? path.basename(filePath) : "default";
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
}
