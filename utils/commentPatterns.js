import path from "path";

// Map file extensions to comment patterns
const commentPatterns = {
  // Hash (#) - Python, Ruby, Shell, etc.
  py: { line: "#", block: { start: '"""', end: '"""' } },
  rb: { line: "#", block: { start: "=begin", end: "=end" } },
  sh: { line: "#", block: null },
  yml: { line: "#", block: null },
  yaml: { line: "#", block: null },
  pl: { line: "#", block: { start: "=pod", end: "=cut" } },
  r: { line: "#", block: null },
  coffee: { line: "#", block: { start: "###", end: "###" } },

  // Double slash (//) - JavaScript, C++, Java, etc.
  js: { line: "//", block: { start: "/*", end: "*/" } },
  jsx: { line: "//", block: { start: "/*", end: "*/" } },
  ts: { line: "//", block: { start: "/*", end: "*/" } },
  tsx: { line: "//", block: { start: "/*", end: "*/" } },
  cpp: { line: "//", block: { start: "/*", end: "*/" } },
  c: { line: "//", block: { start: "/*", end: "*/" } },
  h: { line: "//", block: { start: "/*", end: "*/" } },
  java: { line: "//", block: { start: "/*", end: "*/" } },
  cs: { line: "//", block: { start: "/*", end: "*/" } },
  go: { line: "//", block: { start: "/*", end: "*/" } },
  rs: { line: "//", block: { start: "/*", end: "*/" } },
  php: { line: "//", block: { start: "/*", end: "*/" } },
  swift: { line: "//", block: { start: "/*", end: "*/" } },
  scala: { line: "//", block: { start: "/*", end: "*/" } },
  kt: { line: "//", block: { start: "/*", end: "*/" } },
  dart: { line: "//", block: { start: "/*", end: "*/" } },

  // Tags (<!-- -->) - HTML, XML, etc.
  html: { line: "<!--", block: { start: "<!--", end: "-->" } },
  xml: { line: "<!--", block: { start: "<!--", end: "-->" } },
  htm: { line: "<!--", block: { start: "<!--", end: "-->" } },
  xhtml: { line: "<!--", block: { start: "<!--", end: "-->" } },
  md: { line: "<!--", block: { start: "<!--", end: "-->" } },
  markdown: { line: "<!--", block: { start: "<!--", end: "-->" } },

  // Dashes (--) - SQL, Haskell, etc.
  sql: { line: "--", block: { start: "/*", end: "*/" } },
  hs: { line: "--", block: { start: "{-", end: "-}" } },
  lua: { line: "--", block: { start: "--[[", end: "]]" } },
  elm: { line: "--", block: { start: "{--", end: "--}" } },
  vhdl: { line: "--", block: null },

  // Semicolon (;) - Assembly, Lisp, etc.
  asm: { line: ";", block: null },
  s: { line: ";", block: null },
  clj: { line: ";", block: { start: "#|", end: "|#" } },
  cljs: { line: ";", block: { start: "#|", end: "|#" } },
  lisp: { line: ";", block: { start: "#|", end: "|#" } },

  // Percent (%) - LaTeX, Erlang, etc.
  tex: { line: "%", block: null },
  erl: { line: "%", block: null },
  hrl: { line: "%", block: null },

  // Other patterns
  css: { line: null, block: { start: "/*", end: "*/" } },
  scss: { line: "//", block: { start: "/*", end: "*/" } },
  sass: { line: "//", block: { start: "/*", end: "*/" } },
  less: { line: "//", block: { start: "/*", end: "*/" } },
};

export function getCommentPattern(filePath) {
  const ext = path.extname(filePath).slice(1).toLowerCase();
  return commentPatterns[ext] || commentPatterns.js; // Default to JS if unknown
}

export function detectComments(code, pattern) {
  const comments = [];
  const lines = code.split("\n");

  let charOffset = 0;
  let inBlockComment = false;
  let blockStart = null;
  let blockStartLine = null;
  let blockText = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    const lineStartChar = charOffset;

    // Handle block comments first (they take precedence)
    if (pattern.block) {
      const blockStartPattern = pattern.block.start;
      const blockEndPattern = pattern.block.end;

      if (!inBlockComment) {
        // Look for block start
        const startIndex = line.indexOf(blockStartPattern);
        if (startIndex !== -1) {
          // Double check it's not in a string
          const beforeStart = line.substring(0, startIndex);
          if (!isInString(beforeStart)) {
            inBlockComment = true;
            blockStart = startIndex;
            blockStartLine = lineNum;
            blockText = [line];

            // Check if it ends on the same line
            const endIndex = line.indexOf(blockEndPattern, startIndex + blockStartPattern.length);
            if (endIndex !== -1) {
              const commentText = line.substring(startIndex + blockStartPattern.length, endIndex).trim();
              comments.push({
                start: lineStartChar + startIndex,
                end: lineStartChar + endIndex + blockEndPattern.length,
                text: commentText,
                lineStart: lineNum,
                lineEnd: lineNum,
                isBlock: true,
                isInline: startIndex > 0 && line.substring(0, startIndex).trim().length > 0
              });
              inBlockComment = false;
              blockText = [];
            }
          }
        }
      } else {
        // Already inside a block comment, look for end
        blockText.push(line);
        const endIndex = line.indexOf(blockEndPattern);
        if (endIndex !== -1) {
          const firstLine = blockText[0];
          const lastLine = blockText[blockText.length - 1];
          const firstLineStart = firstLine.indexOf(blockStartPattern);

          let commentText = "";
          if (blockText.length === 1) {
            commentText = firstLine.substring(firstLineStart + blockStartPattern.length, endIndex).trim();
          } else {
            commentText = firstLine.substring(firstLineStart + blockStartPattern.length).trim();
            for (let j = 1; j < blockText.length - 1; j++) {
              commentText += "\n" + blockText[j].trim();
            }
            commentText += "\n" + lastLine.substring(0, endIndex).trim();
          }

          comments.push({
            start: getCharPosition(lines, blockStartLine, firstLineStart),
            end: lineStartChar + endIndex + blockEndPattern.length,
            text: commentText.trim(),
            lineStart: blockStartLine,
            lineEnd: lineNum,
            isBlock: true,
            isInline: firstLineStart > 0 && firstLine.substring(0, firstLineStart).trim().length > 0
          });
          inBlockComment = false;
          blockText = [];
        }
      }
    }

    // Handle line comments only if NOT inside a block comment
    if (!inBlockComment && pattern.line) {
      const commentMarker = pattern.line;
      const commentIndex = line.indexOf(commentMarker);

      if (commentIndex !== -1) {
        const beforeComment = line.substring(0, commentIndex);
        if (!isInString(beforeComment)) {
          const commentText = line.substring(commentIndex + commentMarker.length).trim();
          if (!commentText.startsWith("#ref")) {
            const isInline = commentIndex > 0 && beforeComment.trim().length > 0;
            comments.push({
              start: lineStartChar + commentIndex,
              end: lineStartChar + line.length,
              text: commentText,
              lineStart: lineNum,
              lineEnd: lineNum,
              isBlock: false,
              isInline: isInline
            });
          }
        }
      }
    }

    charOffset += line.length + 1;
  }

  return comments;
}

function getCharPosition(lines, lineNum, column) {
  let pos = 0;
  for (let i = 0; i < lineNum - 1; i++) {
    pos += lines[i].length + 1; // +1 for newline
  }
  return pos + column;
}

function isInString(text) {
  // Simple check: count quotes (not perfect but works for most cases)
  let inSingle = false;
  let inDouble = false;

  for (let i = 0; i < text.length; i++) {
    if (text[i] === "'" && !inDouble) inSingle = !inSingle;
    if (text[i] === '"' && !inSingle) inDouble = !inDouble;
  }

  return inSingle || inDouble;
}

export function formatComment(text, pattern, isBlock) {
  if (isBlock && pattern.block) {
    return `${pattern.block.start} ${text} ${pattern.block.end}`;
  } else if (pattern.line) {
    return `${pattern.line} ${text}`;
  }
  return text;
}

export function formatReferenceComment(key, pattern, isBlock = false) {
  if (isBlock && pattern.block) {
    return `${pattern.block.start} #ref ${key} ${pattern.block.end}`;
  }

  if (pattern.line) {
    return `${pattern.line} #ref ${key}`;
  }

  // For block-only languages, use block if line is not available
  if (pattern.block) {
    return `${pattern.block.start} #ref ${key} ${pattern.block.end}`;
  }

  return `// #ref ${key}`;
}
