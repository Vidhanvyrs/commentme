import fs from "fs";

export function editComment(key, newText) {
  // Ensure output.json exists
  if (!fs.existsSync("output.json")) {
    console.error("❌ output.json not found. Run skimcoms.js first.");
    process.exit(1);
  }

  // Read and parse the file
  const raw = fs.readFileSync("output.json", "utf8");
  const comments = JSON.parse(raw);

  // Check if key exists
  if (!comments[key]) {
    console.error(`❌ No comment found for key: ${key}`);
    process.exit(1);
  }

  // Update the value
  comments[key] = newText.trim();

  // Write updated data back to output.json
  fs.writeFileSync("output.json", JSON.stringify(comments, null, 2));

  console.log(`✔ Comment for key ${key} successfully updated.`);
  console.log(`🆕 New comment: ${comments[key]}`);
}

// ----------------------
// CLI Interface
// ----------------------
// const key = process.argv[2];
// const newText = process.argv.slice(3).join(" ");

// if (!key || !newText) {
//   console.error("❌ Usage: node editcoms.js <startLine-endLine> <new comment text>");
//   process.exit(1);
// }

// editComment(key, newText);
