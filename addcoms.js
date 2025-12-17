// import fs from "fs";

// export function addComment(key, value) {
//   // Ensure output.json exists (or create one)
//   if (!fs.existsSync("output.json")) {
//     console.warn("⚠ output.json not found. Creating a new one...");
//     fs.writeFileSync("output.json", "{}");
//   }

//   // Load JSON
//   const raw = fs.readFileSync("output.json", "utf8");
//   const comments = JSON.parse(raw);

//   // Check if key already exists
//   if (comments[key]) {
//     console.error(`❌ Key ${key} already exists. Use editcoms.js to modify it.`);
//     process.exit(1);
//   }

//   // Add the new key-value pair
//   comments[key] = value.trim();

//   // Save the file back
//   fs.writeFileSync("output.json", JSON.stringify(comments, null, 2));

//   console.log(`✔ Added new comment entry:`);
//   console.log(`   Key: ${key}`);
//   console.log(`   Value: ${comments[key]}`);
// }


import { CommentStore } from "./models/CommentStore.js";
import { getCurrentUserId } from "./utils/currentUser.js";

export async function addComment(key, value, codebase = "default") {
  const userId = getCurrentUserId();

  const store = await CommentStore.findOneAndUpdate(
    { userId, codebase },
    { $setOnInsert: { userId, codebase } },
    { new: true, upsert: true }
  );

  if (store.comments.has(key)) {
    throw new Error(`Key ${key} already exists`);
  }

  store.comments.set(key, value.trim());
  await store.save();

  console.log(`✔ Added comment for ${key}`);
}
