import fs from "fs";
import path from "path";
import { CommentStore } from "./models/CommentStore.js";
import { getCurrentUserId } from "./utils/currentUser.js";
import { getCommentPattern, formatComment } from "./utils/commentPatterns.js";

export async function unskimComments(filePath, codebase = null) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  // Use filename as codebase if not provided
  if (!codebase) {
    codebase = path.basename(filePath);
  }

  const userId = getCurrentUserId();

  // Fetch comments from DB
  const store = await CommentStore.findOne({ userId });

  if (!store) {
    throw new Error("No comments found for this user");
  }

  // Find the specific codebase
  const codebaseEntry = store.comments.find(c => c.codebase === codebase);

  if (!codebaseEntry) {
    throw new Error(`No comments found for codebase: ${codebase}`);
  }

  // Ensure filecomment is a Map
  let filecommentMap;
  if (codebaseEntry.filecomment instanceof Map) {
    filecommentMap = codebaseEntry.filecomment;
  } else {
    filecommentMap = new Map(Object.entries(codebaseEntry.filecomment || {}));
  }

  if (filecommentMap.size === 0) {
    throw new Error(`No comments found for codebase: ${codebase}`);
  }

  const comments = Object.fromEntries(filecommentMap);

  // Get comment pattern based on file extension
  const pattern = getCommentPattern(filePath);

  // Load file
  const code = fs.readFileSync(filePath, "utf8");
  let lines = code.split("\n");

  // Replace reference comments with actual comments
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Match reference comment pattern (works for different comment styles)
    const refCommentMatch = line.match(/(\/\/|#|--|;|<!--|%)\s*#ref\s+(\d+-\d+)\s*(-->)?/);
    
    if (refCommentMatch) {
      const key = refCommentMatch[2];
      const commentText = comments[key];
      
      if (commentText) {
        // Determine if it was a block comment (has newlines)
        const isBlock = commentText.includes("\n");
        
        // Format comment properly based on file type
        const commentBlock = formatComment(commentText, pattern, isBlock);
        
        // Check if reference comment is inline (has code before it)
        const leadingWhitespace = line.match(/^\s*/)?.[0] || "";
        const codeBeforeComment = line.substring(0, refCommentMatch.index).trimEnd();
        
        if (codeBeforeComment && !codeBeforeComment.startsWith("//") && !codeBeforeComment.startsWith("#")) {
          // Inline comment - preserve code before
          lines[i] = codeBeforeComment + " " + commentBlock;
        } else {
          // Full line comment
          lines[i] = leadingWhitespace + commentBlock;
        }
      }
    }
  }

  // Write restored file
  fs.writeFileSync(filePath, lines.join("\n"), "utf8");

  console.log(`✔ Comments successfully restored from database (codebase: ${codebase})`);
}
