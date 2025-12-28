#!/usr/bin/env node

// import readline from "readline";
// import { getAllComments } from "../getcoms.js";
// import { getSpecificComment } from "../getspeccoms.js";
// import { addComment } from "../addcoms.js";
// import { editComment } from "../editcoms.js";
// import { deleteComment } from "../deletecoms.js";
// import { removeCommentsFromFile as skim } from "../skimcoms.js";
// import { unskimComments as unskim } from "../unskimcoms.js";
// import { connectDB, disconnectDB } from "../config/db.js";
// import { ensureAuth } from "../auth/authGuard.js";
// import { logout } from "../auth/logout.js";


// function promptInput(defaultValue = "") {
//   const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
//   });

//   return new Promise(resolve => {
//     rl.question("> ", answer => {
//       rl.close();
//       resolve(answer || defaultValue);
//     });
//   });
// }

// async function main() {
//   const args = process.argv.slice(2);
//   const command = args[0];

//   try {
//     await connectDB();
//     await ensureAuth();

//     switch (command) {

//       case "--get":
//         if (args[1] === "lines") {
//           getAllComments();
//         } else {
//           const key = args[1]?.replace("line-", "");
//           if (!key) throw new Error("Usage: commentme --get line-1-6");
//           getSpecificComment(key);
//         }
//         break;

//       case "--add": {
//         const key = args[1];
//         if (!key) throw new Error("Usage: commentme --add 1-6");
//         console.log("Enter comment:");
//         const text = await promptInput();
//         addComment(key, text);
//         break;
//       }

//       case "--edit": {
//         const key = args[1]?.replace("line-", "");
//         if (!key) throw new Error("Usage: commentme --edit line-1-6");

//         const existing = getSpecificComment(key, true);
//         console.log("Edit comment:");
//         const updated = await promptInput(existing);
//         editComment(key, updated);
//         break;
//       }

//       case "--delete": {
//         const key = args[1]?.replace("line-", "");
//         if (!key) throw new Error("Usage: commentme --delete line-1-6");
//         deleteComment(key);
//         break;
//       }

//       case "--skim":
//         if (!args[1]) throw new Error("Usage: commentme --skim <file>");
//         await skim(args[1]);
//         break;

//       case "--unskim":
//         if (!args[1]) throw new Error("Usage: commentme --unskim <file>");
//         await unskim(args[1]);
//         break;
      
//         case "--logout":
//           logout();
//           break;        

//       default:
//         console.log(`
// commentme CLI

// Commands:
//   commentme --get line-1-6
//   commentme --get lines
//   commentme --add 1-6
//   commentme --edit line-1-6
//   commentme --delete line-1-6
//   commentme --skim <file>
//   commentme --unskim <file>
// `);
//     }

//   } catch (err) {
//     console.error("❌", err.message);
//   } finally {
//     await disconnectDB();
//     process.exit(0);
//   }
// }

// main();


import readline from "readline";
import { getAllComments } from "../getcoms.js";
import { getSpecificComment } from "../getspeccoms.js";
import { editComment } from "../editcoms.js";
import { deleteComment } from "../deletecoms.js";
import { removeCommentsFromFile as skim } from "../skimcoms.js";
import { unskimComments as unskim } from "../unskimcoms.js";
import { connectDB, disconnectDB } from "../config/db.js";
import { ensureAuth } from "../auth/authGuard.js";
import { logout } from "../auth/logout.js";
import dotenv from "dotenv";
dotenv.config();

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

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    // Show help without connecting to DB or requiring auth
    if (command === "--help" || command === "-h" || !command) {
      console.log(`
commentme CLI

Commands:
  commentme --get line-7-7 <file>      Get a specific comment by line range
  commentme --get lines <file>         Get all comments
  commentme --edit line-7-7 <file>      Edit an existing comment
  commentme --delete line-7-7 <file>    Delete a comment
  commentme --skim <file>        Redact comments from a file and store them
  commentme --unskim <file>      Restore comments to a file
  commentme --logout             Log out from your session
  commentme --help               Show this help message
`);
      return;
    }

    await connectDB();

    // 🔐 Skip auth ONLY for logout
    if (command !== "--logout") {
      await ensureAuth();
    }

    switch (command) {

      case "--get":
        if (args[1] === "lines" && args[2]) {
          await getAllComments(args[2]);
        } else {
          const key = args[1]?.replace("line-", "");
          if (!key) throw new Error("Usage: commentme --get line-1-6");
          await getSpecificComment(key, false, args[2]);
        }
        break;


      case "--edit": {
        const key = args[1]?.replace("line-", "");
        if (!key) throw new Error("Usage: commentme --edit line-1-6");

        const existing = await getSpecificComment(key, true, args[2]);
        console.log("Edit comment:");
        const updated = await promptInput(existing);
        await editComment(key, updated, args[2]);
        break;
      }

      case "--delete": {
        const key = args[1]?.replace("line-", "");
        if (!key) throw new Error("Usage: commentme --delete line-1-6");
        await deleteComment(key, args[2]);
        break;
      }

      case "--skim":
        if (!args[1]) throw new Error("Usage: commentme --skim <file>");
        await skim(args[1]);
        break;

      case "--unskim":
        if (!args[1]) throw new Error("Usage: commentme --unskim <file>");
        await unskim(args[1]);
        break;

      case "--logout":
        logout();
        break;

      default:
        console.log(`
commentme CLI

Commands:
  commentme --get line-1-6
  commentme --get lines <file>
  commentme --edit line-1-6
  commentme --delete line-1-6
  commentme --skim <file>
  commentme --unskim <file>
  commentme --logout
`);
    }

  } catch (err) {
    console.error("❌", err.message);
  } finally {
    if (command !== "--help" && command !== "-h" && command) {
      await disconnectDB();
    }
    process.exit(0);
  }
}

main();
