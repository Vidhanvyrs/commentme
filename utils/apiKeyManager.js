import fs from "fs";
import path from "path";
import os from "os";

const CONFIG_PATH = path.join(os.homedir(), ".commentme-config.json");

export function saveApiKey(key) {
    const config = loadConfig();
    config.apiKey = key;
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), { mode: 0o600 });


    fs.chmodSync(CONFIG_PATH, 0o600);

    const masked = key.length > 4 ? "****" + key.slice(-4) : "****";
    console.log(`✅ API key saved (${masked})`);
    console.log(`   Stored at: ${CONFIG_PATH} (owner-read-only)`);
}

export function getApiKey() {
    const config = loadConfig();
    return config.apiKey || null;
}

export function clearApiKey() {
    if (fs.existsSync(CONFIG_PATH)) {
        const config = loadConfig();
        delete config.apiKey;


        if (Object.keys(config).length === 0) {
            fs.unlinkSync(CONFIG_PATH);
        } else {
            fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), { mode: 0o600 });
        }

        console.log("✅ API key cleared.");
    } else {
        console.log("ℹ️  No saved API key found.");
    }
}


function loadConfig() {
    if (!fs.existsSync(CONFIG_PATH)) return {};
    try {
        return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
    } catch {
        return {};
    }
}
