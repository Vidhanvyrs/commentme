#!/usr/bin/env node

import readline from "readline";
import { getAllComments } from "../getcoms.js";
import { getSpecificComment } from "../getspeccoms.js";
import { addComment } from "../addcoms.js";
import { editComment } from "../editcoms.js";
import { deleteComment } from "../deletecoms.js";
import { removeCommentsFromFile as skim } from "../skimcoms.js";
import { unskimComments as unskim } from "../unskimcoms.js";
import { connectDB } from "../config/db.js";
import { ensureAuth } from "../auth/authGuard.js";

await connectDB();
await ensureAuth();

const args = process.argv.slice(2);
const command = args[0];

function promptInput(defaultValue = "") {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question("> ", answer => {
      rl.close();
      resolve(answer || defaultValue);
    });
  });
}

(async () => {
  try {
    switch (command) {

      case "--get":
        if (args[1] === "lines") {
          getAllComments();
        } else {
          const key = args[1]?.replace("line-", "");
          if (!key) throw new Error("Usage: commentme --get line-1-6");
          getSpecificComment(key);
        }
        break;

      case "--add": {
        const key = args[1];
        if (!key) throw new Error("Usage: commentme --add 1-6");
        console.log("Enter comment:");
        const text = await promptInput();
        addComment(key, text);
        break;
      }

      case "--edit": {
        const key = args[1]?.replace("line-", "");
        if (!key) throw new Error("Usage: commentme --edit line-1-6");

        const existing = getSpecificComment(key, true);
        console.log("Edit comment:");
        const updated = await promptInput(existing);
        editComment(key, updated);
        break;
      }

      case "--delete": {
        const key = args[1]?.replace("line-", "");
        if (!key) throw new Error("Usage: commentme --delete line-1-6");
        deleteComment(key);
        break;
      }

      case "--skim":
        skim(args[1]);
        break;

      case "--unskim":
        unskim(args[1]);
        break;

      default:
        console.log(`
commentme CLI

Commands:
  commentme --get line-1-6
  commentme --get lines
  commentme --add 1-6
  commentme --edit line-1-6
  commentme --delete line-1-6
  commentme --skim <file>
  commentme --unskim <file>
`);
    }
  } catch (err) {
    console.error("❌", err.message);
  }
})();
