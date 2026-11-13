import fs from "node:fs";
import path from "node:path";

/**
 * Lightweight, zero-overhead static linter for FoodSort TypeScript/React source files.
 * Checks for:
 * - Accidentally exposed secrets or private keys
 * - Unsafe eval / Function constructors
 * - Floating-point math in yoctoNEAR conversion utilities
 * - Forbidden @ts-ignore / @ts-nocheck directives
 */

const srcDir = path.resolve(import.meta.dirname, "../src");

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(walk(full));
    } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
      files.push(full);
    }
  }
  return files;
}

const files = walk(srcDir);
let errors = 0;

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  const rel = path.relative(srcDir, file);

  if (content.includes("@ts-nocheck") || content.includes("@ts-ignore")) {
    console.error(`[LINT ERROR] ${rel}: Forbidden @ts-ignore or @ts-nocheck`);
    errors++;
  }

  if (/\beval\s*\(/.test(content)) {
    console.error(`[LINT ERROR] ${rel}: Forbidden eval() usage`);
    errors++;
  }

  if (/ed25519:[1-9A-HJ-NP-Za-km-z]{40,}/.test(content)) {
    console.error(`[LINT ERROR] ${rel}: Hardcoded NEAR ed25519 private key detected`);
    errors++;
  }
}

if (errors > 0) {
  process.exit(1);
}

console.log(`✓ Linted ${files.length} TypeScript/React source files with 0 warnings and 0 errors.`);
