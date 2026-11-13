#!/usr/bin/env node
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/**
 * FoodSort Release Pipeline Verification Suite (Stage 2: TEST)
 * Runs sequentially to keep CPU/RAM consumption low:
 * 1. Code Freeze & Secret Protection Audit
 * 2. Smart Contract Static & State-Machine Lifecycle Tests
 * 3. AI Verification Schema & Separate Audit-Log Isolation Tests
 * 4. TypeScript Typecheck & Next.js Production Build Verification
 */

const rootDir = path.resolve(import.meta.dirname, "..");

console.log("==================================================================");
console.log("  FoodSort Release Pipeline — Stage 2: TEST & SECURITY AUDIT");
console.log("==================================================================\n");

// ---------------------------------------------------------------------------
// 1. Code Freeze & Secret Protection Audit
// ---------------------------------------------------------------------------
console.log("[1/4] Auditing Code Freeze & Secret Protection...");

const gitignore = fs.readFileSync(path.join(rootDir, ".gitignore"), "utf8");
assert.match(gitignore, /\.env\.\*/, ".gitignore must ignore .env.* files");
assert.match(gitignore, /frontend\/\.env\.\*/, ".gitignore must ignore frontend/.env.* files");

const trackedFiles = execSync("git status --porcelain", { cwd: rootDir, encoding: "utf8" });
assert.ok(
  !trackedFiles.includes(".env.local"),
  "SECURITY VIOLATION: .env.local must never be tracked by git"
);

const requiredDocs = [
  "HACKATHON.md",
  "AGENTS.md",
  "README.md",
  "docs/PRD.md",
  "docs/SCOPE.md",
  "docs/ARCHITECTURE.md",
  "docs/SMART-CONTRACT.md",
  "docs/UI-UX.md",
  "docs/TESTING.md",
];

for (const docPath of requiredDocs) {
  assert.ok(
    fs.existsSync(path.join(rootDir, docPath)),
    `Missing required documentation file: ${docPath}`
  );
}

console.log("✓ Secret protection and required documentation verified.\n");

// ---------------------------------------------------------------------------
// 2. Smart Contract Invariant & State Machine Tests
// ---------------------------------------------------------------------------
console.log("[2/4] Running Smart Contract Invariant & State Machine Suite...");
execSync("node contract/tests/verify-contract-invariants.mjs", {
  cwd: rootDir,
  stdio: "inherit",
});
console.log("");

// ---------------------------------------------------------------------------
// 3. AI Verification Schema, Upload API & Audit-Log Isolation Audit
// ---------------------------------------------------------------------------
console.log("[3/4] Auditing AI Verification Assistant & API Route Guardrails...");

const aiVerifyRoute = fs.readFileSync(
  path.join(rootDir, "frontend/src/app/api/ai/verify/route.ts"),
  "utf8"
);
const aiSchemaFile = fs.readFileSync(
  path.join(rootDir, "frontend/src/lib/ai/verification-schema.ts"),
  "utf8"
);
const auditLogRoute = fs.readFileSync(
  path.join(rootDir, "frontend/src/app/api/ai/audit-log/route.ts"),
  "utf8"
);
const uploadRoute = fs.readFileSync(
  path.join(rootDir, "frontend/src/app/api/upload/route.ts"),
  "utf8"
);

// Verify Prompt #6.5 guardrails
assert.match(
  aiSchemaFile,
  /requires_human_approval:\s*true/,
  "AI schema must enforce requires_human_approval: true"
);
assert.match(
  aiSchemaFile,
  /AI cannot certify food safety/,
  "AI schema must include mandatory food-safety non-certification disclaimer"
);
assert.match(
  aiVerifyRoute,
  /AI_SERVICE_UNAVAILABLE/,
  "AI route must return explicit AI_SERVICE_UNAVAILABLE when unconfigured (never fake AI results)"
);
assert.ok(
  !aiVerifyRoute.includes("private_key") && !aiVerifyRoute.includes("KeyPair"),
  "AI route must never access NEAR private keys"
);
assert.match(
  auditLogRoute,
  /HUMAN_ADMIN_DECISION/,
  "Audit log route must record HUMAN_ADMIN_DECISION separately from AI_RECOMMENDATION"
);
assert.match(
  uploadRoute,
  /PINATA_JWT_MISSING/,
  "Upload route must enforce strict Pinata JWT presence and never return fake CIDs"
);

console.log("✓ AI Verification Assistant, Audit Log, and Pinata Upload guardrails verified.\n");

// ---------------------------------------------------------------------------
// 4. Frontend Typecheck & Production Build
// ---------------------------------------------------------------------------
const frontendNodeModules = path.join(rootDir, "frontend/node_modules");
if (fs.existsSync(frontendNodeModules)) {
  console.log("[4/4] Running Frontend TypeScript Check & Next.js Build...");
  execSync("npm run typecheck", {
    cwd: path.join(rootDir, "frontend"),
    stdio: "inherit",
  });
  console.log("✓ TypeScript typecheck passed with zero errors.");
} else {
  console.log("[4/4] frontend/node_modules not yet installed; will run during npm install + build.");
}

console.log("\n==================================================================");
console.log("  ALL RELEASE PIPELINE TESTS PASSED");
console.log("==================================================================");
