import fs from "fs";

export function deleteComment(key) {
  // Check that output.json exists
  if (!fs.existsSync("output.json")) {
    console.error("❌ output.json not found. Run skimcoms.js first.");
    process.exit(1);
  }

  // Load and parse JSON
  const raw = fs.readFileSync("output.json", "utf8");
  const comments = JSON.parse(raw);

  // Check if this key exists
  if (!comments[key]) {
    console.error(`❌ No comment found for key: ${key}`);
    process.exit(1);
  }

  // Delete the entry
  delete comments[key];

  // Save updated JSON back to file
  fs.writeFileSync("output.json", JSON.stringify(comments, null, 2));

  console.log(`✔ Comment for key ${key} has been deleted.`);
}

// ----------------------
// CLI Interface
// ----------------------
// const key = process.argv[2];

// if (!key) {
//   console.error("❌ Usage: node deletecoms.js <startLine-endLine>");
//   process.exit(1);
// }

// deleteComment(key);
    