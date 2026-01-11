import fs from "fs";
import path from "path";
// import { CommentStore } from "./models/CommentStore.js";
import { getCurrentUserId } from "./utils/currentUser.js";
import { getSession } from "./utils/session.js";
import { API_BASE_URL } from "./utils/config.js";
import { getCommentPattern, formatComment } from "./utils/commentPatterns.js";

export async function unskimComments(filePath, codebase = null) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  // Use filename as codebase if not provided
  if (!codebase) {
    codebase = path.basename(filePath);
  }

  // Check authentication
  try {
    getCurrentUserId();
  } catch (e) {
    console.error(e.message);
    return;
  }

  const session = getSession();
  const token = session ? session.token : null;

  let comments = {};

  try {
    const response = await fetch(`${API_BASE_URL}/comments?codebase=${encodeURIComponent(codebase)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : ""
      }
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`No comments found for codebase: ${codebase}`);
      }
      throw new Error(data.message || `Failed to fetch comments for codebase: ${codebase}`);
    }

    comments = data;

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error("Error: Could not connect to the backend server. Is it running on port 8080?");
      return;
    } else {
      throw error;
    }
  }


  /*
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
  */

  // Get comment pattern based on file extension
  const pattern = getCommentPattern(filePath);

  // Load file
  const code = fs.readFileSync(filePath, "utf8");
  let lines = code.split("\n");

  // Replace reference comments with actual comments
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Match reference comment pattern (works for different comment styles, including block)
    const refCommentMatch = line.match(/(\/\/|#|--|;|<!--|%|\/\*)\s*#ref\s+(\d+-\d+)\s*(-->|\*\/)?/);

    if (refCommentMatch) {
      const fullMatch = refCommentMatch[0];
      const prefix = refCommentMatch[1];
      const key = refCommentMatch[2];
      const suffix = refCommentMatch[3] || "";
      const commentText = comments[key];

      if (commentText) {
        let restoredComment = "";

        if (prefix === "/*") {
          // Mirror block comment style
          restoredComment = `/* ${commentText} */`;
        } else if (prefix === "<!--") {
          // Mirror HTML comment style
          restoredComment = `<!-- ${commentText} -->`;
        } else {
          // Default to line comment style
          restoredComment = `${prefix} ${commentText}`;
        }

        // Replace only the reference part, preserving everything else on the line
        lines[i] = line.replace(fullMatch, restoredComment);
      } else {
        // Key not found in DB - remove the reference comment part
        lines[i] = line.replace(fullMatch, "").trimEnd();
        // If line is now just whitespace, clear it to preserve line numbers if possible
        if (lines[i].trim().length === 0) lines[i] = "";
      }
    }
  }

  // Write restored file
  fs.writeFileSync(filePath, lines.join("\n"), "utf8");

  console.log(`✔ Comments successfully restored from database (codebase: ${codebase})`);
}
