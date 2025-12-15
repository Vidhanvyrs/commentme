import * as acorn from "acorn";
import fs from "fs";

export function removeCommentsFromFile(filePath) {
  const code = fs.readFileSync(filePath, "utf8");

  const comments = [];
  const commentJSON = {};

  acorn.parse(code, {
    ecmaVersion: 2020,
    locations: true,
    onComment: (isBlock, text, start, end, startLoc, endLoc) => {
      comments.push({
        start,
        end,
        text,
        lineStart: startLoc.line,
        lineEnd: endLoc.line
      });
    }
  });

  for (const c of comments) {
    const key = `${c.lineStart}-${c.lineEnd}`;
    commentJSON[key] = c.text.trim();
  }

  comments.sort((a, b) => b.start - a.start);

  let cleaned = code;
  for (const c of comments) {
    cleaned = cleaned.slice(0, c.start) + cleaned.slice(c.end);
  }

  fs.writeFileSync(filePath, cleaned, "utf8");
  fs.writeFileSync("output.json", JSON.stringify(commentJSON, null, 2));

  return { cleaned, commentJSON };
}
