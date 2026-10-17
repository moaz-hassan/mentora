#!/usr/bin/env node
/**
 * MIG-09 smoke test: imports every module under `src/` to catch import-time
 * crashes (e.g. missing exports, broken imports, syntax errors).
 *
 * `src/app.js` is intentionally excluded: importing it starts Redis connection
 * side effects and creates the HTTP server. `server.js` lives outside `src/`.
 *
 * Notes:
 * - Loads `.env` (like the real server does) so config modules see their vars.
 * - Requires no database: Mongoose buffering/Redis retries are non-fatal here.
 * - Forces process exit at the end (queue clients/intervals keep Node alive).
 *
 * Run: npm run smoke:imports
 */
import "dotenv/config";
import { readdir } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const srcDir = fileURLToPath(new URL("../src", import.meta.url));

const EXCLUDED_MODULES = new Set(["app.js"]);

const collectJsFiles = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectJsFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      files.push(fullPath);
    }
  }

  return files;
};

const backgroundWarnings = [];

process.on("unhandledRejection", (reason) => {
  backgroundWarnings.push(`unhandledRejection: ${reason?.message || reason}`);
});

const hardStop = setTimeout(() => {
  console.error("✗ Import smoke timed out after 30s (a module import is hanging).");
  process.exit(1);
}, 30000);

const main = async () => {
  const files = (await collectJsFiles(srcDir)).sort();
  const failures = [];
  let importedCount = 0;

  for (const file of files) {
    const relPath = relative(srcDir, file).split(sep).join("/");

    if (EXCLUDED_MODULES.has(relPath)) {
      console.log(`↷ ${relPath} (skipped: entry module with side effects)`);
      continue;
    }

    try {
      await import(pathToFileURL(file).href);
      importedCount++;
      console.log(`✓ ${relPath}`);
    } catch (error) {
      failures.push(relPath);
      console.error(`✗ ${relPath}\n    ${error?.stack || error}`);
    }
  }

  clearTimeout(hardStop);

  if (backgroundWarnings.length > 0) {
    console.warn(`\n⚠️  ${backgroundWarnings.length} background warning(s) while importing:`);
    backgroundWarnings.forEach((warning) => console.warn(`  - ${warning}`));
  }

  if (failures.length > 0) {
    console.error(`\n✗ Import smoke FAILED: ${failures.length} module(s) failed to import.`);
    process.exit(1);
  }

  console.log(`\n✅ Import smoke passed: ${importedCount} modules imported without errors.`);
  process.exit(0);
};

main().catch((error) => {
  clearTimeout(hardStop);
  console.error("✗ Import smoke crashed:", error);
  process.exit(1);
});
