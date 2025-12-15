import fs from "fs";

export function addComment(key, value) {
  // Ensure output.json exists (or create one)
  if (!fs.existsSync("output.json")) {
    console.warn("⚠ output.json not found. Creating a new one...");
    fs.writeFileSync("output.json", "{}");
  }

  // Load JSON
  const raw = fs.readFileSync("output.json", "utf8");
  const comments = JSON.parse(raw);

  // Check if key already exists
  if (comments[key]) {
    console.error(`❌ Key ${key} already exists. Use editcoms.js to modify it.`);
    process.exit(1);
  }

  // Add the new key-value pair
  comments[key] = value.trim();

  // Save the file back
  fs.writeFileSync("output.json", JSON.stringify(comments, null, 2));

  console.log(`✔ Added new comment entry:`);
  console.log(`   Key: ${key}`);
  console.log(`   Value: ${comments[key]}`);
}

// -------------------
// CLI Interface
// -------------------
// const key = process.argv[2];
// const value = process.argv.slice(3).join(" ");

// if (!key || !value) {
//   console.error("❌ Usage: node addcoms.js <startLine-endLine> <comment text>");
//   process.exit(1);
// }

// addComment(key, value);
