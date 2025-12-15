import fs from "fs";

export function getSpecificComment(key, silent = false) {
  if (!fs.existsSync("output.json")) {
    throw new Error("output.json not found. Run skim first.");
  }

  const raw = fs.readFileSync("output.json", "utf8");
  const comments = JSON.parse(raw);

  if (!comments[key]) {
    throw new Error(`No comment found for key: ${key}`);
  }

  if (!silent) {
    console.log(`✔ Comment for ${key}:`);
    console.log(comments[key]);
  }

  return comments[key]; // IMPORTANT for edit flow
}
