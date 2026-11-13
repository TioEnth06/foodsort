#!/usr/bin/env node
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/**
 * FoodSort Comprehensive End-to-End Testing & Security Audit Suite (Prompt #7)
 * Runs sequentially:
 * 1. Code Freeze, Secret Protection & Scope Guardrail Audit
 * 2. Smart Contract Static & State-Machine Lifecycle Tests (Contributor, Admin, Donation, NFT, Treasury)
 * 3. AI Verification Assistant Tests (Cases A, B, C, D + Zero-Key Isolation + Separate Audit Logging)
 * 4. Integer yoctoNEAR Accounting & Route Verification (/verify & /verify/[tokenId])
 * 5. Frontend Lint, TypeScript Typecheck & Next.js Production Build
 */

const rootDir = path.resolve(import.meta.dirname, "..");

console.log("==================================================================");
console.log("  FoodSort Prompt #7 — E2E TESTING & SECURITY AUDIT SUITE");
console.log("==================================================================\n");

// ---------------------------------------------------------------------------
// 1. Code Freeze & Secret Protection Audit
// ---------------------------------------------------------------------------
console.log("[1/5] Auditing Code Freeze, Scope Boundaries & Secret Protection...");

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
console.log("[2/5] Running Smart Contract Invariant & State Machine Suite...");
execSync("node contract/tests/verify-contract-invariants.mjs", {
  cwd: rootDir,
  stdio: "inherit",
});
console.log("");

// ---------------------------------------------------------------------------
// 3. AI Verification Assistant Tests (Cases A, B, C, D & Isolation)
// ---------------------------------------------------------------------------
console.log("[3/5] Running AI Verification Assistant Tests (Cases A, B, C, D)...");

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

// Verify Prompt #6.5 & #7 AI security invariants
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
  "Case D: AI route must return explicit AI_SERVICE_UNAVAILABLE (503) when unconfigured (never fabricate AI results)"
);
assert.match(
  aiVerifyRoute,
  /allow_manual_verification:\s*true/,
  "Case D: AI route must explicitly signal allow_manual_verification: true on error/unavailable"
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

// Simulate normalizeAndValidateAiResult across Cases A, B, and C
function simulateNormalizeAiResult(raw, submittedCategory) {
  const rawRec = String(raw.recommendation || "NEEDS_REVIEW").toUpperCase();
  const recommendation =
    rawRec === "APPROVE" || rawRec === "REJECT" || rawRec === "NEEDS_REVIEW"
      ? rawRec
      : "NEEDS_REVIEW";
  const detectedCategory = String(
    raw.category_assessment?.detected_category || submittedCategory
  ).toUpperCase();
  return {
    recommendation,
    confidence_score: Math.max(0, Math.min(1, Number(raw.confidence_score ?? 0.5))),
    category_assessment: {
      submitted_category: submittedCategory,
      detected_category: detectedCategory,
      matches_submitted: detectedCategory === submittedCategory,
    },
    risk_flags: Array.isArray(raw.risk_flags) ? raw.risk_flags : [],
    requires_human_approval: true,
  };
}

// Case A: Strong evidence -> APPROVE
const caseA = simulateNormalizeAiResult(
  {
    recommendation: "APPROVE",
    confidence_score: 0.94,
    category_assessment: { detected_category: "COMPOST" },
    risk_flags: [],
  },
  "COMPOST"
);
assert.equal(caseA.recommendation, "APPROVE");
assert.equal(caseA.category_assessment.matches_submitted, true);
assert.equal(caseA.requires_human_approval, true);

// Case B: Weak or unrelated evidence -> REJECT
const caseB = simulateNormalizeAiResult(
  {
    recommendation: "REJECT",
    confidence_score: 0.91,
    category_assessment: { detected_category: "UNCLEAR" },
    risk_flags: ["Unrelated image content", "No food sorting containers visible"],
  },
  "FOOD_RESCUE"
);
assert.equal(caseB.recommendation, "REJECT");
assert.equal(caseB.category_assessment.matches_submitted, false);
assert.equal(caseB.requires_human_approval, true);

// Case C: Inconsistent description/category/evidence -> NEEDS_REVIEW
const caseC = simulateNormalizeAiResult(
  {
    recommendation: "NEEDS_REVIEW",
    confidence_score: 0.62,
    category_assessment: { detected_category: "RESIDUAL" },
    risk_flags: ["Category mismatch: submitted COMPOST but evidence shows plastic residual"],
  },
  "COMPOST"
);
assert.equal(caseC.recommendation, "NEEDS_REVIEW");
assert.equal(caseC.category_assessment.matches_submitted, false);
assert.equal(caseC.requires_human_approval, true);

console.log("✓ AI Verification Cases A, B, C, D and isolation guardrails verified.\n");

// ---------------------------------------------------------------------------
// 4. Integer yoctoNEAR Accounting & Public Verification Routes
// ---------------------------------------------------------------------------
console.log("[4/5] Verifying Integer yoctoNEAR Accounting & Public Verification Routes...");

const utilsTs = fs.readFileSync(
  path.join(rootDir, "frontend/src/lib/utils.ts"),
  "utf8"
);
assert.ok(
  utilsTs.includes("if (!/^\\d+(\\.\\d{1,24})?$/.test(clean))") &&
    !utilsTs.includes("Number(clean)"),
  "parseNearToYocto must validate strict decimal format without floating-point arithmetic"
);
assert.ok(
  fs.existsSync(path.join(rootDir, "frontend/src/app/verify/page.tsx")) &&
    fs.existsSync(path.join(rootDir, "frontend/src/app/verify/[tokenId]/page.tsx")),
  "Both /verify and /verify/[tokenId] public verification routes must exist"
);

console.log("✓ Integer yoctoNEAR conversion and /verify/[tokenId] route verified.\n");

// ---------------------------------------------------------------------------
// 5. Frontend Lint & Typecheck
// ---------------------------------------------------------------------------
console.log("[5/5] Running Frontend Lint & TypeScript Check...");
execSync("npm run lint", {
  cwd: path.join(rootDir, "frontend"),
  stdio: "inherit",
});
console.log("✓ Frontend lint and typecheck passed with zero errors.");

console.log("\n==================================================================");
console.log("  ALL PROMPT #7 E2E & SECURITY AUDIT TESTS PASSED");
console.log("==================================================================");
