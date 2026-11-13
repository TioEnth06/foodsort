#!/usr/bin/env node
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
execSync("rm -rf frontend/src && cp -a src frontend/src", { cwd: root, stdio: "inherit" });
console.log("✓ Synced src/ → frontend/src (Vercel Root Directory)");
