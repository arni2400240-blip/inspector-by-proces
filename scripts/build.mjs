import { mkdir, readFile, writeFile, cp } from "node:fs/promises";
import { rmSync } from "node:fs";

rmSync("dist", { recursive: true, force: true });
await mkdir("dist/server", { recursive: true });
await mkdir("dist/.openai", { recursive: true });
const html = await readFile("site/index.html", "utf8");
const worker = `const HTML = ${JSON.stringify(html)};\nexport default { async fetch(request) { const url = new URL(request.url); if (url.pathname === '/health') return new Response('ok'); return new Response(HTML, { headers: { 'content-type': 'text/html; charset=UTF-8', 'cache-control': 'public, max-age=300', 'x-content-type-options': 'nosniff', 'referrer-policy': 'strict-origin-when-cross-origin' } }); } };\n`;
await writeFile("dist/server/index.js", worker);
await cp(".openai/hosting.json", "dist/.openai/hosting.json");
console.log("INSPECTOR site build complete");
