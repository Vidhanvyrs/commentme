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
  let inBlockComment = false; // Add this
  let blockStart = null; // Add this
  let blockStartLine = null; // Add this
  let blockText = []; // Add this
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    const lineStartChar = charOffset;
    
    // Handle line comments (including inline)
    if (pattern.line) {
      const commentMarker = pattern.line;
      const commentIndex = line.indexOf(commentMarker);
      
      if (commentIndex !== -1) {
        // Check if it's in a string (simple check)
        const beforeComment = line.substring(0, commentIndex);
        const inString = isInString(beforeComment);
        
        if (!inString) {
          const commentText = line.substring(commentIndex + commentMarker.length).trim();
          
          // Skip reference comments
          if (!commentText.startsWith("#refer commentme")) {
            const commentStartChar = lineStartChar + commentIndex;
            const commentEndChar = lineStartChar + line.length;
            const isInline = commentIndex > 0 && line.substring(0, commentIndex).trim().length > 0;
            
            comments.push({
              start: commentStartChar,
              end: commentEndChar,
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
    
    // Handle block comments
    if (pattern.block) {
      const blockStartPattern = pattern.block.start;
      const blockEndPattern = pattern.block.end;
      
      // Check for block start
      if (!inBlockComment && line.includes(blockStartPattern)) {
        inBlockComment = true;
        blockStart = line.indexOf(blockStartPattern);
        blockStartLine = lineNum;
        blockText = [line];
        
        // Check if block ends on same line
        const blockEnd = line.indexOf(blockEndPattern, blockStart + blockStartPattern.length);
        if (blockEnd !== -1) {
          // Single line block comment
          const commentText = line.substring(
            blockStart + blockStartPattern.length,
            blockEnd
          ).trim();
          comments.push({
            start: getCharPosition(lines, lineNum, blockStart),
            end: getCharPosition(lines, lineNum, blockEnd + blockEndPattern.length),
            text: commentText,
            lineStart: lineNum,
            lineEnd: lineNum,
            isBlock: true
          });
          inBlockComment = false;
          continue;
        }
        continue;
      }
      
      // Check for block end
      if (inBlockComment) {
        blockText.push(line);
        const blockEnd = line.indexOf(blockEndPattern);
        if (blockEnd !== -1) {
          // Extract comment text
          const firstLine = blockText[0];
          const lastLine = blockText[blockText.length - 1];
          const firstLineStart = firstLine.indexOf(pattern.block.start);
          const lastLineEnd = lastLine.indexOf(pattern.block.end);
          
          let commentText = "";
          if (blockText.length === 1) {
            commentText = firstLine.substring(
              firstLineStart + pattern.block.start.length,
              lastLineEnd
            ).trim();
          } else {
            commentText = firstLine.substring(firstLineStart + pattern.block.start.length).trim();
            for (let j = 1; j < blockText.length - 1; j++) {
              commentText += "\n" + blockText[j].trim();
            }
            commentText += "\n" + lastLine.substring(0, lastLineEnd).trim();
          }
          
          comments.push({
            start: getCharPosition(lines, blockStartLine, firstLineStart),
            end: getCharPosition(lines, lineNum, lastLineEnd + pattern.block.end.length),
            text: commentText,
            lineStart: blockStartLine,
            lineEnd: lineNum,
            isBlock: true
          });
          inBlockComment = false;
          blockText = [];
          continue;
        }
        continue;
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

export function formatReferenceComment(key, pattern) {
  if (pattern.line) {
    return `${pattern.line} #refer commentme --get line-${key}`;
  }
  // For block-only languages, use line comment style if available, otherwise use block
  return `/* #refer commentme --get line-${key} */`;
}
