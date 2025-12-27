// import * as acorn from "acorn";
// import fs from "fs";

// export function removeCommentsFromFile(filePath) {
//   const code = fs.readFileSync(filePath, "utf8");

//   const comments = [];
//   const commentJSON = {};

//   acorn.parse(code, {
//     ecmaVersion: 2020,
//     locations: true,
//     onComment: (isBlock, text, start, end, startLoc, endLoc) => {
//       comments.push({
//         start,
//         end,
//         text,
//         lineStart: startLoc.line,
//         lineEnd: endLoc.line
//       });
//     }
//   });

//   for (const c of comments) {
//     const key = `${c.lineStart}-${c.lineEnd}`;
//     commentJSON[key] = c.text.trim();
//   }

//   comments.sort((a, b) => b.start - a.start);

//   let cleaned = code;
//   for (const c of comments) {
//     cleaned = cleaned.slice(0, c.start) + cleaned.slice(c.end);
//   }

//   fs.writeFileSync(filePath, cleaned, "utf8");
//   fs.writeFileSync("output.json", JSON.stringify(commentJSON, null, 2));

//   return { cleaned, commentJSON };
// }
import * as acorn from "acorn";
import fs from "fs";
import { CommentStore } from "./models/CommentStore.js";
import { getCurrentUserId } from "./utils/currentUser.js";

export async function removeCommentsFromFile(filePath, codebase = "default") {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const userId = getCurrentUserId();
  const code = fs.readFileSync(filePath, "utf8");

  const comments = [];
  const commentMap = {};

  // Parse comments (this will skip reference comments since they're not valid JS comments)
  acorn.parse(code, {
    ecmaVersion: 2020,
    locations: true,
    onComment: (isBlock, text, start, end, startLoc, endLoc) => {
      // Skip reference comments
      if (text.trim().startsWith("#refer commentme")) {
        return;
      }
      comments.push({
        start,
        end,
        text,
        lineStart: startLoc.line,
        lineEnd: endLoc.line
      });
    }
  });

  // Build key-value map
  for (const c of comments) {
    const key = `${c.lineStart}-${c.lineEnd}`;
    commentMap[key] = c.text.trim();
  }

  // Replace comments with reference comments (descending order to preserve positions)
  comments.sort((a, b) => b.start - a.start);

  let result = code;
  for (const c of comments) {
    const key = `${c.lineStart}-${c.lineEnd}`;
    const refComment = `// #refer commentme --get line-${key}`;
    // REPLACE the comment with reference comment
    result = result.slice(0, c.start) + refComment + result.slice(c.end);
  }

  // Write file back
  fs.writeFileSync(filePath, result, "utf8");

  // 🔥 SAVE/UPDATE COMMENTS TO MONGODB
  const store = await CommentStore.findOneAndUpdate(
    { userId, codebase },
    { $setOnInsert: { userId, codebase } },
    { new: true, upsert: true }
  );

  // Update existing comments or add new ones
  for (const [key, value] of Object.entries(commentMap)) {
    store.comments.set(key, value);
  }

  await store.save();

  console.log("✔ File skimmed and comments stored in database");

  return { cleaned: result, commentMap };
}
