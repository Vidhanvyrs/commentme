import fs from "fs";
import path from "path";
import { getCurrentUserId } from "./utils/currentUser.js";
import { getApiKey } from "./utils/apiKeyManager.js";

// ── Model pool for circuit breaker fallback ──
const FREE_MODELS = [
    "google/gemma-3-27b-it:free",
    "meta-llama/llama-3.2-3b-instruct:free",
    "mistralai/mistral-7b-instruct:free",
    "google/gemma-3-4b-it:free",
    "deepseek/deepseek-r1-0528:free",
];

const MAX_PASSES = 2;           // full cycles through model list
const COOLDOWN_MS = 5000;       // wait between passes

/**
 * Resolve the API key: user config > env var > error
 */
function resolveApiKey() {
    // Priority 1: user's own key from ~/.commentme-config.json
    const userKey = getApiKey();
    if (userKey) return userKey;

    // Priority 2: env var
    if (process.env.OPENROUTER_API_KEY) return process.env.OPENROUTER_API_KEY;

    // No key found
    throw new Error(
        "No API key found. Set one with:\n" +
        "  commentme --set-key          (recommended — stores in ~/.commentme-config.json)\n" +
        "  or set OPENROUTER_API_KEY in your .env file"
    );
}

async function callAI(prompt, code) {
    const apiKey = resolveApiKey();

    for (let pass = 0; pass < MAX_PASSES; pass++) {
        if (pass > 0) {
            console.log(`\n⏳ All models rate-limited. Waiting ${COOLDOWN_MS / 1000}s before retry (pass ${pass + 1}/${MAX_PASSES})...`);
            await new Promise(r => setTimeout(r, COOLDOWN_MS));
        }

        for (const model of FREE_MODELS) {
            console.log(`🔄 Trying model: ${model}...`);

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        {
                            role: "user",
                            content: `${prompt}\n\n---\n\nHere is the code:\n\n${code}`
                        }
                    ]
                })
            });

            // Auth errors → fail immediately (wrong API key)
            if (response.status === 401 || response.status === 403) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Authentication error (${response.status}): Check your API key. ${JSON.stringify(errorData)}`);
            }

            // Any other error (429, 404, 400, 503, 521, etc.) → skip to next model
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const msg = errorData?.error?.message || `${response.status} ${response.statusText}`;
                console.warn(`⚠️  ${model} failed (${response.status}: ${msg}), trying next model...`);
                continue;
            }

            // Success!
            const data = await response.json();
            console.log(`✅ Success with model: ${model}`);
            return data.choices[0]?.message?.content || "";
        }
    }

    throw new Error(
        "All models are rate-limited after " + MAX_PASSES + " passes. " +
        "Please wait a few minutes and try again, or set your own API key with: commentme --set-key"
    );
}


async function processAIResponse(filePath, responseContent) {
    const parts = responseContent.split("#####DOCS_START#####");
    let commentedCode = parts[0].trim();
    const documentation = parts.length > 1 ? parts[1].trim() : "";

    // If the AI returns markdown code blocks, strip them
    if (commentedCode.startsWith("```") && commentedCode.endsWith("```")) {
        const lines = commentedCode.split("\n");
        // Remove first and last lines
        if (lines.length >= 2) {
            commentedCode = lines.slice(1, -1).join("\n");
        }
    }

    // Write commented code back to file
    fs.writeFileSync(filePath, commentedCode, "utf8");
    console.log(`✅ Comments added to ${filePath}`);

    // Write documentation to a new file
    if (documentation) {
        const ext = path.extname(filePath);
        const baseName = path.basename(filePath, ext);
        const docPath = path.join(path.dirname(filePath), `${baseName}_docs.md`);
        fs.writeFileSync(docPath, documentation, "utf8");
        console.log(`✅ Documentation generated at ${docPath}`);
    }
}

export async function generateCommentsPerFunc(filePath, codebase = null) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }

    // Use filename as codebase if not provided
    if (!codebase) {
        codebase = path.basename(filePath);
    }

    // Check authentication (keeping original logic)
    try {
        getCurrentUserId();
    } catch (e) {
        console.error(e.message);
        return;
    }

    const code = fs.readFileSync(filePath, "utf8");
    console.log(`⏳ Generating function comments for ${filePath}...`);

    const prompt = `
  You are an expert AI coding assistant. behavior:
  1. Analyze the provided ${codebase ? codebase : "code"} and take in the reference of the comments if the file already consist comments as understanding the codebase through comments might make you understand the flow as well as the functionality.
  2. Add meaningful JSDoc-style or block comments above EVERY function definition explaining what it does, its parameters, and return value.
  3. Keep the original code EXACTLY as is, only adding comments. Do NOT remove existing comments unless they are redundant.
  4. Generate a comprehensive markdown documentation summarizing each function.
  5. Output the result in two parts separated by the delimiter "#####DOCS_START#####".
     Part 1: The full code with added comments.
     Part 2: The markdown documentation.
  `;

    try {
        const response = await callAI(prompt, code);
        await processAIResponse(filePath, response);
        console.log(`✨ Successfully generated function comments for ${filePath}`);
    } catch (error) {
        console.error("❌ Error generating comments:", error.message);
    }
}

export async function generateCommentsPerClass(filePath, codebase = null) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }

    if (!codebase) {
        codebase = path.basename(filePath);
    }

    try {
        getCurrentUserId();
    } catch (e) {
        console.error(e.message);
        return;
    }

    const code = fs.readFileSync(filePath, "utf8");
    console.log(`⏳ Generating class comments for ${filePath}...`);

    const prompt = `
  You are an expert AI coding assistant. behavior:
  1. Analyze the provided ${codebase ? codebase : "code"}.
  2. Add meaningful JSDoc-style or block comments above EVERY class definition explaining its purpose, constructor, and methods.
  3. Keep the original code EXACTLY as is, only adding comments.
  4. Generate a comprehensive markdown documentation summarizing each class.
  5. Output the result in two parts separated by the delimiter "#####DOCS_START#####".
     Part 1: The full code with added comments.
     Part 2: The markdown documentation.
  `;

    try {
        const response = await callAI(prompt, code);
        await processAIResponse(filePath, response);
        console.log(`✨ Successfully generated function comments for ${filePath}`);
    } catch (error) {
        console.error("❌ Error generating comments:", error.message);
    }
}

export async function generateCommentsPerLine(filePath, codebase = null) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }

    if (!codebase) {
        codebase = path.basename(filePath);
    }

    try {
        getCurrentUserId();
    } catch (e) {
        console.error(e.message);
        return;
    }

    const code = fs.readFileSync(filePath, "utf8");
    console.log(`⏳ Generating line-by-line comments for ${filePath}...`);

    const prompt = `
  You are an expert AI coding assistant. behavior:
  1. Analyze the provided ${codebase ? codebase : "code"}.
  2. Add concise inline comments (// ...) for significant lines of code explaining what they do. Avoid obvious comments.
  3. Keep the original code logic EXACTLY as is, only adding comments.
  4. Generate a comprehensive markdown documentation summarizing the flow of the code line-by-line or block-by-block.
  5. Output the result in two parts separated by the delimiter "#####DOCS_START#####".
     Part 1: The full code with added comments.
     Part 2: The markdown documentation.
  `;

    try {
        const response = await callAI(prompt, code);
        await processAIResponse(filePath, response);
        console.log(`✨ Successfully generated function comments for ${filePath}`);
    } catch (error) {
        console.error("❌ Error generating comments:", error.message);
    }
}

export async function generateExplanation(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }

    try {
        getCurrentUserId();
    } catch (e) {
        console.error(e.message);
        return;
    }

    const code = fs.readFileSync(filePath, "utf8");
    const fileName = path.basename(filePath);
    console.log(`⏳ Generating explanation for ${filePath}...`);

    const prompt = `
  You are an expert AI coding assistant and technical writer. Your task:
  1. Read the provided code file "${fileName}" carefully, including ALL existing comments.
  2. Use the existing comments as references to understand the purpose, flow, and functionality of the code.
  3. Generate a comprehensive, well-structured Markdown document that explains the ENTIRE file.

  The markdown document MUST include:
  - **Overview**: A brief summary of what this file does and its role in the project.
  - **Dependencies / Imports**: List and explain each import and why it's needed.
  - **Architecture & Flow**: Describe the overall execution flow from top to bottom — how the different parts connect and interact.
  - **Functions / Classes**: For each function or class, explain:
    - Purpose
    - Parameters and return values
    - Internal logic (step by step)
    - How it relates to other functions in the file
  - **Key Logic & Patterns**: Highlight any notable patterns, algorithms, error handling strategies, or design decisions.
  - **Summary**: A concise wrap-up of the file's responsibilities.

  IMPORTANT:
  - Output ONLY the markdown documentation, nothing else.
  - Do NOT include the original code in your output.
  - Do NOT wrap the output in a code block.
  - Reference line numbers or function names from the code when explaining.
  - Make it readable for a developer who has never seen this codebase before.
  `;

    try {
        const response = await callAI(prompt, code);

        const ext = path.extname(filePath);
        const baseName = path.basename(filePath, ext);
        const docPath = path.join(path.dirname(filePath), `${baseName}_explained.md`);

        fs.writeFileSync(docPath, response.trim(), "utf8");
        console.log(`✅ Explanation generated at ${docPath}`);
    } catch (error) {
        console.error("❌ Error generating explanation:", error.message);
    }
}
