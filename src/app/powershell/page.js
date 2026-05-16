"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PowerShellPage() {
  const [command, setCommand] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await fetch("/api/auth/me");
      if (!r.ok) { router.push("/login"); return; }
      const d = await r.json();
      if (!d.authenticated && !cancelled) router.push("/login");
    })();
    return () => { cancelled = true; };
  }, [router]);

  async function run() {
    if (!command.trim()) return;
    setLoading(true);
    setOutput((o) => o + `\nPS> ${command}\n`);
    try {
      const res = await fetch("/api/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command }),
      });
      const d = await res.json();
      if (!res.ok) {
        setOutput((o) => o + `ERROR: ${d.error || "Unknown error"}\n`);
      } else {
        setOutput((o) => o + (d.output || "") + "\n");
      }
    } catch (err) {
      setOutput((o) => o + `Network error: ${String(err)}\n`);
    } finally {
      setLoading(false);
      setCommand("");
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>PowerShell-like Shell</h1>
      <div>
        <textarea value={output} rows={12} readOnly style={{ width: "100%", fontFamily: "monospace" }} />
      </div>
      <div style={{ marginTop: 8 }}>
        <input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          style={{ width: "80%" }}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); run(); } }}
        />
        <button onClick={run} disabled={loading} style={{ marginLeft: 8 }}>{loading ? "Running..." : "Run"}</button>
      </div>
    </div>
  );
}

