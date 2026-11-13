# FoodSort — Verifiable Food-Sorting Action & Patronage Protocol on NEAR

FoodSort is a transparent environmental action verification and patronage platform built on **NEAR Protocol (Testnet)** for the **NEAR Hackathon 2026**.

Contributors document real-world food-sorting actions (`COMPOST`, `FOOD_RESCUE`, `RESIDUAL`) with evidence pinned to IPFS via Pinata. An authorized admin—assisted by an isolated, advisory-only AI Verification Assistant—verifies actions on-chain. Donors support verified actions with native NEAR and receive **NEP-171 / NEP-177 Donation NFTs** that permanently preserve the original contributor attribution while holding net donation funds transparently in the contract treasury.

Repository: [https://github.com/TioEnth06/foodsort.git](https://github.com/TioEnth06/foodsort.git)

---

## Project Structure

```text
foodsort/
├── README.md
├── HACKATHON.md
├── AGENTS.md
├── vercel.json
├── scripts/
│   ├── run-release-tests.mjs
│   └── deploy-near-testnet.sh
├── docs/
│   ├── PRD.md
│   ├── SCOPE.md
│   ├── ARCHITECTURE.md
│   ├── SMART-CONTRACT.md
│   ├── UI-UX.md
│   ├── TESTING.md
│   ├── DEMO-RUNBOOK.md
│   └── SUBMISSION.md
├── frontend/               # Next.js 15 + TypeScript + Tailwind + shadcn/ui + Motion
└── contract/               # NEAR Rust Smart Contract (near-sdk + near-contract-standards)
```

---

## Release Pipeline: Freeze -> Test -> Deploy -> Demo -> Submit

1. **Freeze (`docs/SCOPE.md`)**: Scope locked to the 7 core pages, NEP-171/177 contract, Pinata IPFS upload API, and isolated AI Verification Assistant.
2. **Test (`node scripts/run-release-tests.mjs`)**: Runs static invariant checks, contract state machine lifecycle tests, AI schema & audit-log isolation tests, TypeScript check, and production build.
3. **Deploy (`bash scripts/deploy-near-testnet.sh` & Vercel)**: Compiles and deploys the Rust contract to NEAR Testnet (`foodsort.testnet`) and deploys the Next.js frontend to Vercel.
4. **Demo (`docs/DEMO-RUNBOOK.md`)**: Step-by-step 3-minute live demo script for judges.
5. **Submit (`docs/SUBMISSION.md`)**: Ready-to-submit NEAR Hackathon 2026 package.

---

## Environment Variables (`frontend/.env.local`)

Copy `frontend/.env.example` to `frontend/.env.local`:

```bash
# NEAR Testnet Configuration
NEXT_PUBLIC_NEAR_NETWORK=testnet
NEXT_PUBLIC_CONTRACT_ID=foodsort.testnet
NEXT_PUBLIC_NEAR_RPC_URL=https://rpc.testnet.near.org
NEXT_PUBLIC_NEAR_EXPLORER_URL=https://testnet.nearblocks.io

# Pinata IPFS Configuration (Server-side JWT required for /api/upload)
PINATA_JWT=your_pinata_jwt_secret_here
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs

# AI Verification Assistant Configuration (Server-side only for /api/ai/verify)
# Supports OpenAI Vision (gpt-4o-mini) or Google Gemini Vision (gemini-2.0-flash)
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key_here
AI_MODEL=gpt-4o-mini
# Optional if AI_PROVIDER=gemini:
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## Development & Testing Instructions

### 1. Run Full Release Verification Suite

```bash
node scripts/run-release-tests.mjs
```

### 2. Smart Contract (`contract/`)

```bash
cd contract
cargo test
```

### 3. Frontend (`frontend/`)

```bash
cd frontend
npm install
npm run dev
```
