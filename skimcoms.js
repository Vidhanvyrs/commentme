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
import path from "path";
import { CommentStore } from "./models/CommentStore.js";
import { getCurrentUserId } from "./utils/currentUser.js";
import { getCommentPattern, detectComments, formatReferenceComment } from "./utils/commentPatterns.js";

export async function removeCommentsFromFile(filePath, codebase = null) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  // Use filename as codebase if not provided
  if (!codebase) {
    codebase = path.basename(filePath);
  }

  const userId = getCurrentUserId();
  const code = fs.readFileSync(filePath, "utf8");

  const comments = [];
  const commentMap = {};
  const ext = path.extname(filePath).slice(1).toLowerCase();

  // Use acorn for JavaScript files (more accurate), regex for others
  if (ext === "js" || ext === "jsx" || ext === "ts" || ext === "tsx") {
    // Parse comments using acorn (existing working code)
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
  } else {
    // Use regex-based detection for other file types
    const pattern = getCommentPattern(filePath);
    const detectedComments = detectComments(code, pattern);
    comments.push(...detectedComments);
  }

  // Build key-value map
  for (const c of comments) {
    const key = `${c.lineStart}-${c.lineEnd}`;
    commentMap[key] = c.text.trim();
  }

  // Replace comments with reference comments (descending order to preserve positions)
  comments.sort((a, b) => b.start - a.start);

  let result = code;
  const pattern = getCommentPattern(filePath);
  
  for (const c of comments) {
    const key = `${c.lineStart}-${c.lineEnd}`;
    const refComment = formatReferenceComment(key, pattern);
    // REPLACE the comment with reference comment
    result = result.slice(0, c.start) + refComment + result.slice(c.end);
  }

  // Write file back
  fs.writeFileSync(filePath, result, "utf8");

  // 🔥 SAVE/UPDATE COMMENTS TO MONGODB
  let store = await CommentStore.findOne({ userId });

  if (!store) {
    store = await CommentStore.create({ userId, comments: [] });
  }

  // Find codebase index
  let codebaseIndex = store.comments.findIndex(c => c.codebase === codebase);
  
  if (codebaseIndex === -1) {
    // Create new codebase entry
    store.comments.push({
      codebase,
      filecomment: new Map()
    });
    codebaseIndex = store.comments.length - 1;
    await store.save(); // Save to get the new entry properly initialized
    store = await CommentStore.findById(store._id); // Re-fetch to get proper Mongoose document
  }

  // Get the codebase entry
  const codebaseEntry = store.comments[codebaseIndex];
  
  // Ensure filecomment is a Map
  if (!(codebaseEntry.filecomment instanceof Map)) {
    codebaseEntry.filecomment = new Map(Object.entries(codebaseEntry.filecomment || {}));
  }

  // Update existing comments or add new ones
  for (const [key, value] of Object.entries(commentMap)) {
    codebaseEntry.filecomment.set(key, value);
  }

  // Mark as modified and save
  store.markModified(`comments.${codebaseIndex}.filecomment`);
  await store.save();

  console.log(`✔ File skimmed and comments stored in database (codebase: ${codebase})`);

  return { cleaned: result, commentMap };
}
