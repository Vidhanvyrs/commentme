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
import path from "path";
import { getCurrentUserId } from "./utils/currentUser.js";

export async function getAllComments(filePath = null) {
  const codebase = filePath ? path.basename(filePath) : "default";
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
}