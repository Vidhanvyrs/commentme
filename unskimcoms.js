// import fs from "fs";

// export function unskimComments(filePath) {
//   if (!fs.existsSync("output.json")) {
//     console.error("output.json not found. Run skimcoms.js first.");
//     process.exit(1);
//   }

//   // Load cleaned file and saved comments
//   const code = fs.readFileSync(filePath, "utf8");
//   const lines = code.split("\n");

//   const raw = fs.readFileSync("output.json", "utf8");
//   const comments = JSON.parse(raw);

//   // entries: [{ startLine, endLine, text }], sorted descending so indices stay valid
//   const entries = Object.entries(comments)
//     .map(([key, text]) => {
//       const [startLine, endLine] = key.split("-").map(Number);
//       return { startLine, endLine, text };
//     })
//     .sort((a, b) => b.startLine - a.startLine);

//   for (const { startLine, text } of entries) {
//     const commentBlock = text.includes("\n") ? `/* ${text} */` : `// ${text}`;
//     const insertIndex = startLine - 1; // insert above original start line
//     lines.splice(insertIndex, 0, commentBlock);
//   }

//   fs.writeFileSync(filePath, lines.join("\n"), "utf8");
//   console.log("✔ Comments successfully restored into the file.");
// }

import fs from "fs";
import { CommentStore } from "./models/CommentStore.js";
import { getCurrentUserId } from "./utils/currentUser.js";

export async function unskimComments(filePath, codebase = "default") {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const userId = getCurrentUserId();

  // Fetch comments from DB
  const store = await CommentStore.findOne({ userId, codebase });

  if (!store || store.comments.size === 0) {
    throw new Error("No comments found for this codebase");
  }

  const comments = Object.fromEntries(store.comments);

  // Load file
  const code = fs.readFileSync(filePath, "utf8");
  let lines = code.split("\n");

  // Replace reference comments with actual comments
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Match reference comment pattern: // #refer commentme --get line-X-Y
    const refCommentMatch = line.match(/\/\/\s*#refer\s+commentme\s+--get\s+line-(\d+-\d+)\s*/);
    
    if (refCommentMatch) {
      const key = refCommentMatch[1];
      const commentText = comments[key];
      
      if (commentText) {
        // Format comment properly
        const commentBlock = commentText.includes("\n")
          ? `/* ${commentText} */`
          : `// ${commentText}`;
        
        // Replace the entire line with the comment
        // Preserve any leading whitespace from the original line
        const leadingWhitespace = line.match(/^\s*/)?.[0] || "";
        lines[i] = leadingWhitespace + commentBlock;
      }
    }
  }

  // Write restored file
  fs.writeFileSync(filePath, lines.join("\n"), "utf8");

  console.log("✔ Comments successfully restored from database");
}
