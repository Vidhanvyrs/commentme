import fs from "fs";

export function getAllComments() {
  if (!fs.existsSync("output.json")) {
    throw new Error("output.json not found. Run skim first.");
  }

  const raw = fs.readFileSync("output.json", "utf8");
  const comments = JSON.parse(raw);

  console.log(comments);
}
