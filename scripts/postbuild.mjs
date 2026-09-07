/**
 * Reconciles the two halves of a based build for GitHub Pages.
 *
 * Vite's `base` puts hashed assets at build/client/assets, but React Router's
 * `basename` prerenders HTML into build/client/<basename>/. Pages already serves the
 * repo under /<repo>/, so publishing either directory alone gives 404s: the root is
 * missing the prerendered routes, the nested one is missing the assets.
 *
 * This flattens the nested HTML up into build/client so the whole directory can be
 * published as the Pages artifact, and keeps the SPA fallback as 404.html so unknown
 * deep links still boot the app instead of showing the GitHub 404 page.
 */
import { existsSync } from "node:fs";
import { cp, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const CLIENT_DIR = "build/client";

const config = await readFile("react-router.config.ts", "utf8");
const basename = config.match(/basename:\s*["'](.+?)["']/)?.[1];

if (!basename || basename === "/") {
  console.log("postbuild: no basename to flatten, nothing to do");
  process.exit(0);
}

const segment = basename.replace(/^\/|\/$/g, "");
const nested = join(CLIENT_DIR, segment);

if (!existsSync(nested)) {
  throw new Error(`postbuild: expected ${nested} to exist — did the prerender run?`);
}

// Preserve the SPA fallback (rendered at build/client/index.html) as 404.html first.
const fallback = join(CLIENT_DIR, "index.html");
if (existsSync(fallback)) {
  await rename(fallback, join(CLIENT_DIR, "404.html"));
}

for (const entry of await readdir(nested)) {
  await cp(join(nested, entry), join(CLIENT_DIR, entry), { recursive: true });
}
await rm(nested, { recursive: true, force: true });

// Jekyll would otherwise strip files and directories beginning with an underscore.
await writeFile(join(CLIENT_DIR, ".nojekyll"), "");

console.log(`postbuild: flattened ${segment}/ into ${CLIENT_DIR} and wrote 404.html`);
