// Insert exec route implementation
import { NextResponse } from "next/server";
import { parseTokenFromCookie, verifyToken } from "@/lib/auth";
import child_process from "child_process";
import { promisify } from "util";

const execAsync = promisify(child_process.exec);
const ALLOWED_REGEX = /^(echo|whoami|dir|ls|Get-Process|Get-Service)\b/i;

function isAllowedCommand(cmd) {
  if (!cmd) return false;
  return ALLOWED_REGEX.test(cmd.trim());
}

export async function POST(req) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const token = parseTokenFromCookie(cookie);
    const payload = verifyToken(token);
    if (!payload) return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    const body = await req.json();
    const { command } = body || {};
    if (!command) return new NextResponse(JSON.stringify({ error: "Missing command" }), { status: 400 });

    const mode = process.env.EXEC_MODE || "mock";
    if (mode === "mock") {
      const now = new Date().toISOString();
      const simulated = [
        `PS MockShell> ${command}`,
        `Simulated execution at ${now}`,
        `Note: server running in mock mode. Set EXEC_MODE=real to enable real execution (dangerous).`
      ].join("\n");
      return new NextResponse(JSON.stringify({ ok: true, output: simulated }), { status: 200 });
    }

    if (!isAllowedCommand(command)) {
      return new NextResponse(JSON.stringify({ error: "Command not allowed" }), { status: 403 });
    }

    try {
      const shell = process.platform === "win32" ? "powershell.exe" : "sh";
      const shellArg = process.platform === "win32" ? `-Command "${command.replace(/"/g, "'")}"` : `-c "${command.replace(/"/g, '\\"')}"`;
      const full = `${shell} ${shellArg}`;

      const { stdout, stderr } = await execAsync(full, { timeout: 10_000, maxBuffer: 64 * 1024 });
      return new NextResponse(JSON.stringify({ ok: true, output: stdout || stderr }), { status: 200 });
    } catch (err) {
      return new NextResponse(JSON.stringify({ error: "Execution error", detail: String(err) }), { status: 500 });
    }
  } catch (err) {
    console.error("Exec error", err);
    return new NextResponse(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}

