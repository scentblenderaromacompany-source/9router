import fs from "fs";
import path from "path";
import os from "os";

const CONFIG_PATH = path.join(os.homedir(), ".config", "opencode", "opencode.json");

function readConfig() {
  try {
    const content = fs.readFileSync(CONFIG_PATH, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export function getServerCredentials() {
  const config = readConfig();
  const provider = config?.provider?.["9router"];

  return {
    server: provider?.options?.baseURL || process.env.ROUTER_SERVER || "http://localhost:3000",
    token: provider?.options?.apiKey || process.env.ROUTER_API_KEY || "",
    userId: provider?.userId || process.env.ROUTER_USER_ID || "",
  };
}
