"use client";
import { useState } from "react";

const SAMPLE = `2026-10-22 02:14:01 sshd Failed password for admin from 203.0.113.45
2026-10-22 02:14:03 sshd Failed password for admin from 203.0.113.45
2026-10-22 02:14:04 sshd Failed password for root from 203.0.113.45
2026-10-22 02:14:06 sshd Failed password for admin from 203.0.113.45
2026-10-22 02:14:09 sshd Failed password for admin from 203.0.113.45
2026-10-22 02:15:30 sshd Accepted password for aadhi from 198.51.100.7
2026-10-22 02:16:11 sshd Failed password for aadhi from 198.51.100.7`;

const THRESHOLD = 3;

function analyze(text) {
  const byIp = {};
  text.split("\n").forEach((line) => {
    if (/failed (password|login)/i.test(line)) {
      const ip = (line.match(/\b(\d{1,3}(?:\.\d{1,3}){3})\b(?!.*\b\d{1,3}(?:\.\d{1,3}){3}\b)/) || [])[1] || "unknown";
      byIp[ip] = (byIp[ip] || 0) + 1;
    }
  });
  const total = Object.values(byIp).reduce((a, b) => a + b, 0);
  const offenders = Object.entries(byIp)
    .filter(([, n]) => n > THRESHOLD)
    .sort((a, b) => b[1] - a[1]);
  return { total, byIp, offenders };
}

export default function Home() {
  const [logs, setLogs] = useState(SAMPLE);
  const [result, setResult] = useState(null);
  const [heard, setHeard] = useState("");

  function speak(msg) {
    setHeard(msg);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(msg));
    }
  }

  function run() {
    const r = analyze(logs);
    setResult(r);
    if (r.offenders.length) {
      const [ip, n] = r.offenders[0];
      speak(
        `Security alert. ${n} failed logins from ${ip}. This looks like a brute force attempt. Do you want me to block it?`
      );
    } else {
      speak(`All clear. I found ${r.total} failed logins, none above the limit.`);
    }
  }

  const alert = result && result.offenders.length > 0;

  return (
    <main>
      <style>{css}</style>
      <header>
        <h1>Login Watch</h1>
        <p>Paste auth logs. Ask Alexa if anyone is guessing passwords.</p>
      </header>

      <section>
        <label htmlFor="logs">Auth logs</label>
        <textarea id="logs" value={logs} onChange={(e) => setLogs(e.target.value)} spellCheck={false} rows={9} />
        <div className="row">
          <button onClick={run}>“Alexa, check my logs”</button>
          <button className="ghost" onClick={() => { setLogs(SAMPLE); setResult(null); setHeard(""); }}>
            Reset sample
          </button>
        </div>
      </section>

      {result && (
        <section>
          {alert ? (
            <div className="banner danger" role="alert">
              Possible brute force: {result.offenders.length} source{result.offenders.length > 1 ? "s" : ""} over {THRESHOLD} failed logins
            </div>
          ) : (
            <div className="banner ok" role="status">No suspicious activity found</div>
          )}
          <table>
            <thead><tr><th>Source IP</th><th>Failed logins</th><th>Status</th></tr></thead>
            <tbody>
              {Object.entries(result.byIp).map(([ip, n]) => (
                <tr key={ip} className={n > THRESHOLD ? "bad" : ""}>
                  <td>{ip}</td><td>{n}</td><td>{n > THRESHOLD ? "Suspicious" : "Normal"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {heard && (
        <section className="alexa">
          <span className="ring" aria-hidden="true" />
          <p><strong>Alexa:</strong> {heard}</p>
        </section>
      )}
    </main>
  );
}

const css = `
:root{--bg:#0e1a24;--panel:#142533;--ink:#e8f1f7;--mute:#8ba3b5;--line:#25405a;--cyan:#00caff;--red:#ff4d5e;--green:#3ddc97}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:720px;margin:0 auto;padding:32px 16px 64px}
h1{margin:0 0 4px;font-size:2rem}
header p{margin:0 0 24px;color:var(--mute)}
section{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:16px;margin-bottom:16px}
label{display:block;margin-bottom:8px;color:var(--mute)}
textarea{width:100%;background:#0a131b;color:var(--ink);border:1px solid var(--line);border-radius:8px;padding:12px;font:13px/1.5 ui-monospace,Consolas,monospace;resize:vertical}
.row{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
button{background:var(--cyan);color:#04202c;border:0;border-radius:999px;padding:10px 20px;font-weight:600;cursor:pointer}
button.ghost{background:transparent;color:var(--ink);border:1px solid var(--line)}
button:focus-visible,textarea:focus-visible{outline:2px solid var(--cyan);outline-offset:2px}
.banner{padding:14px 16px;border-radius:8px;font-weight:600;margin-bottom:12px}
.danger{background:var(--red);color:#fff}
.ok{background:var(--green);color:#03281a}
table{width:100%;border-collapse:collapse}
th,td{text-align:left;padding:8px;border-bottom:1px solid var(--line)}
th{color:var(--mute);font-weight:500}
tr.bad td{color:var(--red);font-weight:600}
.alexa{display:flex;align-items:center;gap:14px}
.alexa p{margin:0}
.ring{flex:none;width:36px;height:36px;border-radius:50%;border:4px solid var(--cyan);box-shadow:0 0 12px var(--cyan)}
@media (prefers-reduced-motion:no-preference){.ring{animation:pulse 1.6s ease-in-out 3}}
@keyframes pulse{50%{box-shadow:0 0 24px var(--cyan);transform:scale(1.08)}}
`;