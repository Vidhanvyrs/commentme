import * as acorn from "acorn";
import fs from "fs";
import path from "path";
import { getCurrentUserId } from "./utils/currentUser.js";

/**
 * Sanitizes a file for production by removing:
 * 1. Single-line comments (// ...)
 * 2. Block comments (/* ... * /) EXCEPT JSDocs (/** ... * /)
 * 
 * Note: console.log statements are preserved per user request.
 */
export async function sanitizeFile(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }

    // Check authentication
    try {
        getCurrentUserId();
    } catch (e) {
        console.error(e.message);
        return;
    }

    const code = fs.readFileSync(filePath, "utf8");
    const comments = [];

    try {
        acorn.parse(code, {
            ecmaVersion: 2020,
            sourceType: "module",
            locations: true,
            onComment: (isBlock, text, start, end) => {
                const isJSDoc = isBlock && text.startsWith("*");

                // If it's a single-line comment OR a non-JSDoc block comment, mark for removal
                if (!isBlock || !isJSDoc) {
                    comments.push({ start, end });
                }
            }
        });
    } catch (e) {
        console.error(`❌ Error parsing ${filePath}: ${e.message}`);
        console.log("⚠️  Falling back to manual sanitization might be risky. Skipping this file.");
        return;
    }

    // Sort comments in descending order to avoid offset issues while slicing
    comments.sort((a, b) => b.start - a.start);

    let result = code;
    for (const comment of comments) {
        result = result.slice(0, comment.start) + result.slice(comment.end);
    }

    // Optional: Clean up empty lines that only contained comments
    // result = result.replace(/^\s*[\r\n]/gm, "");

    fs.writeFileSync(filePath, result, "utf8");
    console.log(`✅ ${filePath} sanitized (comments removed, documentation preserved)`);
}
