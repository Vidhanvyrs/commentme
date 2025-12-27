// import fs from "fs";

// export function getAllComments() {
//   if (!fs.existsSync("output.json")) {
//     throw new Error("output.json not found. Run skim first.");
//   }

//   const raw = fs.readFileSync("output.json", "utf8");
//   const comments = JSON.parse(raw);

//   console.log(comments);
// }
import { CommentStore } from "./models/CommentStore.js";
import { getCurrentUserId } from "./utils/currentUser.js";

export async function getAllComments(codebase = "default") {
  const userId = getCurrentUserId();

  const store = await CommentStore.findOne({ userId });

  if (!store) {
    console.log("{}");
    return;
  }

  const codebaseEntry = store.comments.find(c => c.codebase === codebase);

  if (!codebaseEntry || codebaseEntry.filecomment.size === 0) {
    console.log("{}");
    return;
  }

  console.log(Object.fromEntries(codebaseEntry.filecomment));
}