// import fs from "fs";

// export function editComment(key, newText) {
//   // Ensure output.json exists
//   if (!fs.existsSync("output.json")) {
//     console.error("❌ output.json not found. Run skimcoms.js first.");
//     process.exit(1);
//   }

//   // Read and parse the file
//   const raw = fs.readFileSync("output.json", "utf8");
//   const comments = JSON.parse(raw);

//   // Check if key exists
//   if (!comments[key]) {
//     console.error(`❌ No comment found for key: ${key}`);
//     process.exit(1);
//   }

//   // Update the value
//   comments[key] = newText.trim();

//   // Write updated data back to output.json
//   fs.writeFileSync("output.json", JSON.stringify(comments, null, 2));

//   console.log(`✔ Comment for key ${key} successfully updated.`);
//   console.log(`🆕 New comment: ${comments[key]}`);
// }


import { CommentStore } from "./models/CommentStore.js";
import path from "path";
import { getCurrentUserId } from "./utils/currentUser.js";

export async function editComment(key, value, filePath = null) {
  const codebase = filePath ? path.basename(filePath) : "default";
  const userId = getCurrentUserId();

  const store = await CommentStore.findOne({ userId });

  if (!store) {
    throw new Error("No comments found");
  }

  const codebaseIndex = store.comments.findIndex(c => c.codebase === codebase);

  if (codebaseIndex === -1 || !store.comments[codebaseIndex].filecomment.has(key)) {
    throw new Error(`No comment found for key: ${key}`);
  }
  const codebaseEntry = store.comments[codebaseIndex];
  codebaseEntry.filecomment.set(key, value);
  await store.save();

  console.log(`✔ Comment updated for ${key}`);
}