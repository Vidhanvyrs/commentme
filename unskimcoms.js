// import fs from "fs";

// export function unskimComments(filePath) {
//   // Check output.json exists
//   if (!fs.existsSync("output.json")) {
//     console.error("❌ output.json not found. Run skimcoms.js first.");
//     process.exit(1);
//   }

//   // Read the cleaned file
//   let code = fs.readFileSync(filePath, "utf8");

//   // Split into lines for easy insertion
//   let lines = code.split("\n");

//   // Load comments
//   const raw = fs.readFileSync("output.json", "utf8");
//   const comments = JSON.parse(raw);

//   // Convert keys back to structured info
//   const entries = Object.entries(comments)
//     .map(([key, text]) => {
//       const [startLine, endLine] = key.split("-").map(Number);
//       return { startLine, endLine, text };
//     })
//     // Insert from bottom to top so line numbers don’t shift
//     .sort((a, b) => b.startLine - a.startLine);

//   // Insert each comment back
//   for (const entry of entries) {
//     const { startLine, text } = entry;

//     const commentBlock =
//       text.includes("\n")
//         ? `/* ${text} */`
//         : `// ${text}`;

//     // Insert comment ABOVE the startLine
//     const insertIndex = startLine - 1;
//     lines.splice(insertIndex, 0, commentBlock);
//   }

//   // Rejoin and save file
//   const restored = lines.join("\n");
//   fs.writeFileSync(filePath, restored, "utf8");

//   console.log("✔ Comments successfully restored into the file.");
// }

// // ---------------------------
// // CLI Argument
// // ---------------------------
// // const filePath = process.argv[2];

// // if (!filePath) {
// //   console.error("Usage: node unskimcoms.js <path-to-file>");
// //   process.exit(1);
// // }

// // unskimComments(filePath);
import fs from "fs";

export function unskimComments(filePath) {
  if (!fs.existsSync("output.json")) {
    console.error("output.json not found. Run skimcoms.js first.");
    process.exit(1);
  }

  // Load cleaned file and saved comments
  const code = fs.readFileSync(filePath, "utf8");
  const lines = code.split("\n");

  const raw = fs.readFileSync("output.json", "utf8");
  const comments = JSON.parse(raw);

  // entries: [{ startLine, endLine, text }], sorted descending so indices stay valid
  const entries = Object.entries(comments)
    .map(([key, text]) => {
      const [startLine, endLine] = key.split("-").map(Number);
      return { startLine, endLine, text };
    })
    .sort((a, b) => b.startLine - a.startLine);

  for (const { startLine, text } of entries) {
    const commentBlock = text.includes("\n") ? `/* ${text} */` : `// ${text}`;
    const insertIndex = startLine - 1; // insert above original start line
    lines.splice(insertIndex, 0, commentBlock);
  }

  fs.writeFileSync(filePath, lines.join("\n"), "utf8");
  console.log("✔ Comments successfully restored into the file.");
}

