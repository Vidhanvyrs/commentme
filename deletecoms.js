// import fs from "fs";

// export function deleteComment(key) {
//   // Check that output.json exists
//   if (!fs.existsSync("output.json")) {
//     console.error("❌ output.json not found. Run skimcoms.js first.");
//     process.exit(1);
//   }

//   // Load and parse JSON
//   const raw = fs.readFileSync("output.json", "utf8");
//   const comments = JSON.parse(raw);

//   // Check if this key exists
//   if (!comments[key]) {
//     console.error(`❌ No comment found for key: ${key}`);
//     process.exit(1);
//   }

//   // Delete the entry
//   delete comments[key];

//   // Save updated JSON back to file
//   fs.writeFileSync("output.json", JSON.stringify(comments, null, 2));

//   console.log(`✔ Comment for key ${key} has been deleted.`);
// }


import { CommentStore } from "./models/CommentStore.js";
import { getCurrentUserId } from "./utils/currentUser.js";

export async function deleteComment(key, codebase = "default") {
  const userId = getCurrentUserId();

  const store = await CommentStore.findOne({ userId, codebase });

  if (!store || !store.comments.has(key)) {
    throw new Error(`No comment found for key: ${key}`);
  }

  store.comments.delete(key);
  await store.save();

  console.log(`✔ Deleted comment for ${key}`);
}
