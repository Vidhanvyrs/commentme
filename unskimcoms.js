import fs from "fs";
import { CommentStore } from "./models/CommentStore.js";
import { getCurrentUserId } from "./utils/currentUser.js";
import { getCommentPattern, formatComment } from "./utils/commentPatterns.js";

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

  // Get comment pattern based on file extension
  const pattern = getCommentPattern(filePath);

  // Load file
  const code = fs.readFileSync(filePath, "utf8");
  let lines = code.split("\n");

  // Replace reference comments with actual comments
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Match reference comment pattern (works for different comment styles)
    const refCommentMatch = line.match(/(\/\/|#|--|;|<!--|%)\s*#refer\s+commentme\s+--get\s+line-(\d+-\d+)\s*(-->)?/);
    
    if (refCommentMatch) {
      const key = refCommentMatch[2];
      const commentText = comments[key];
      
      if (commentText) {
        // Determine if it was a block comment (has newlines)
        const isBlock = commentText.includes("\n");
        
        // Format comment properly based on file type
        const commentBlock = formatComment(commentText, pattern, isBlock);
        
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
