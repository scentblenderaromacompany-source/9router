import { NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/lib/localDb";

const ENCRYPT_ALGO = "aes-256-gcm";
const ENCRYPT_SALT = "9router-tailscale-authkey";

function deriveKey() {
  const crypto = require("crypto");
  try {
    const { machineIdSync } = require("node-machine-id");
    const raw = machineIdSync();
    return crypto.createHash("sha256").update(raw + ENCRYPT_SALT).digest();
  } catch {
    return crypto.createHash("sha256").update(ENCRYPT_SALT).digest();
  }
}

function encryptAuthKey(plaintext) {
  const crypto = require("crypto");
  const key = deriveKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ENCRYPT_ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

function decryptAuthKey(stored) {
  try {
    const crypto = require("crypto");
    const [ivHex, tagHex, dataHex] = stored.split(":");
    if (!ivHex || !tagHex || !dataHex) return null;
    const key = deriveKey();
    const decipher = crypto.createDecipheriv(ENCRYPT_ALGO, key, Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    return decipher.update(Buffer.from(dataHex, "hex")) + decipher.final("utf8");
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const settings = await getSettings();
    const hasKey = !!settings.tailscaleAuthKeyEncrypted;
    return NextResponse.json({ hasKey });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { authKey } = await request.json();
    if (!authKey || typeof authKey !== "string" || !authKey.trim()) {
      return NextResponse.json({ error: "Auth key is required" }, { status: 400 });
    }
    const encrypted = encryptAuthKey(authKey.trim());
    await updateSettings({ tailscaleAuthKeyEncrypted: encrypted });
    return NextResponse.json({ success: true, hasKey: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await updateSettings({ tailscaleAuthKeyEncrypted: "" });
    return NextResponse.json({ success: true, hasKey: false });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
