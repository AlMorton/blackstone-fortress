/** Mimics a GitHub Pages project site: serves build/client under /<repo>/, 404.html otherwise. */
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const ROOT = "build/client";
const PREFIX = "/blackstone-fortress";
const PORT = Number(process.argv[2] ?? 4173);
const TYPES = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".png": "image/png", ".json": "application/json", ".svg": "image/svg+xml",
};

createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (!url.pathname.startsWith(PREFIX)) return send(res, 404, join(ROOT, "404.html"));

  let rel = normalize(url.pathname.slice(PREFIX.length)).replace(/^(\.\.[/\\])+/, "");
  let file = join(ROOT, rel);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!existsSync(file)) return send(res, 404, join(ROOT, "404.html"));
  send(res, 200, file);
}).listen(PORT, () => console.log(`serving ${ROOT} at http://localhost:${PORT}${PREFIX}/`));

function send(res, status, file) {
  res.writeHead(status, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
  createReadStream(file).pipe(res);
}
