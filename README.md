# FoodSort

> **Sort food. Support change. Collect impact.**

**One-line description:** FoodSort is a community-powered food impact platform that connects verified real-world food actions with transparent on-chain donations and Donation NFTs.

Repository: [https://github.com/TioEnth06/foodsort.git](https://github.com/TioEnth06/foodsort.git)  
Live Demo URL: `[INSERT LIVE DEMO URL]`  
Demo Video URL: `[INSERT DEMO VIDEO URL]`  
Deployed NEAR Testnet Contract: `[INSERT ACTUAL CONTRACT ADDRESS]` (default configured target: `foodsort.testnet`)

---

## Core Flow

```text
Contributor
  → Food Action + Evidence (COMPOST | FOOD_RESCUE | RESIDUAL + Pinata IPFS URI)
  → AI-Assisted Verification (Advisory only • requires_human_approval: true)
  → Human Admin Approval (Explicit human confirmation & wallet signature)
  → NEAR On-Chain Verification (verify_action / reject_action on NEAR Testnet)
  → Donor Contribution (donate_and_mint with native NEAR)
  → Donation NFT (NEP-171 / NEP-177 minted to donor, preserving original contributor attribution)
  → Public Verification (Walletless verification on /verify & /verify/[tokenId])
```

### Critical Architectural Distinctions
1. **AI Assists; Human Admin Decides; Smart Contract Enforces**:
   - The AI Verification Assistant (`POST /api/ai/verify`) is strictly an advisory triage tool for the human administrator. It has **zero access** to admin private keys or wallets and never executes blockchain transactions.
   - The human administrator makes the final verification decision after an explicit confirmation step.
   - The Rust smart contract (`contract/src/lib.rs`) enforces `assert_admin()` (`env::predecessor_account_id() == self.admin_id`) as the single source of truth and records the verified state on-chain.
2. **Three-Party NFT Provenance (`Contributor ≠ Original Donor ≠ Current NFT Owner`)**:
   - When a donor calls `donate_and_mint(action_id)`, the contract reads `contributor_id` directly from the verified `FoodAction` in contract storage—never from frontend arguments.
   - Public verification (`/verify` and `/verify/[tokenId]`) clearly distinguishes:
     - **Original Contributor (`contributor_id`)**: Performed the real-world food-sorting action.
     - **Original Donor (`donor_id`)**: Funded the donation and minted the Donation NFT.
     - **Current NFT Owner (`owner_id`)**: Current NEP-171 holder (even after secondary `nft_transfer`).
3. **Truthful Treasury Accounting (`Funds Held` vs. `Funds Distributed`)**:
   - The smart contract separates NEP-171 state storage byte costs (`storage_cost_yocto`) from the net donation (`net_treasury_amount_yocto`) using checked integer arithmetic (`u128`).
   - All net donations remain transparently held in the contract treasury (`treasury_status: "HELD_IN_TREASURY"`, `funds_distributed_yocto: "0"`). FoodSort never claims that funds have been distributed when no on-chain disbursement has occurred.

---

## Project Structure

```text
foodsort/
├── README.md                   # Project overview, setup, and reproduction guide
├── HACKATHON.md                # Official NEAR Hackathon 2026 track & submission overview
├── AGENTS.md                   # Engineering, security, and scope guardrails
├── vercel.json                 # Vercel deployment configuration
├── scripts/
│   ├── run-release-tests.mjs   # End-to-end invariant, AI schema, lint & typecheck runner
│   └── deploy-near-testnet.sh  # NEAR Testnet WASM build, deploy & init script
├── docs/
│   ├── PRD.md                  # Product requirements & user journeys
│   ├── SCOPE.md                # Frozen MVP boundaries & release checklist
│   ├── ARCHITECTURE.md         # System architecture & trust boundaries
│   ├── SMART-CONTRACT.md       # NEAR Rust contract & NEP-171/177 metadata spec
│   ├── UI-UX.md                # Sustainability design system & 7-page layout spec
│   ├── TESTING.md              # End-to-end test plan, test matrix & security audit
│   ├── DEMO-RUNBOOK.md         # 3-minute judge live walkthrough script
│   └── SUBMISSION.md           # Complete copy-paste Hackathon submission package
├── frontend/                   # Next.js 15 + React 19 + TypeScript + Tailwind v4 + Motion
└── contract/                   # NEAR Rust Smart Contract (near-sdk 5.5.0 + NEP-171/177/181)
```

---

## Application Pages & Routes

| Route | Actor / Access | Purpose |
| :--- | :--- | :--- |
| `/` | Public | Homepage with live treasury summary (`Funds Held` vs `Funds Distributed: 0 NEAR`), 3-actor provenance loop, and featured verified actions |
| `/actions` | Public | Filterable directory of `Verified`, `Pending`, and `Rejected` food-sorting actions across `COMPOST`, `FOOD_RESCUE`, and `RESIDUAL` |
| `/actions/[id]` | Public / Donor | Full action evidence, contributor attribution, verification metadata, and native NEAR `donate_and_mint()` patronage panel |
| `/contribute` | Contributor (Wallet) | 2-step Pinata IPFS evidence upload (`POST /api/upload`) + on-chain `submit_action()` submission |
| `/admin` | Admin (Wallet) | Pending review queue, isolated AI Verification Assistant panel (`POST /api/ai/verify`), explicit human confirmation modal, on-chain `verify_action()` / `reject_action()`, and separate AI vs. Human audit log (`POST /api/ai/audit-log`) |
| `/donor` | Donor (Wallet) | Connected wallet's personal NEP-171 Donation NFT gallery (`nft_tokens_for_owner`) and on-chain donation ledger |
| `/verify` & `/verify/[tokenId]` | Public (Walletless) | Direct NEAR Testnet RPC verification of any Donation NFT (`get_nft_verification_proof`) and full on-chain NFT gallery |

---

## Environment Variables (`frontend/.env.local`)

Copy `frontend/.env.example` to `frontend/.env.local`:

```bash
# NEAR Testnet Configuration
NEXT_PUBLIC_NEAR_NETWORK=testnet
NEXT_PUBLIC_CONTRACT_ID=foodsort.testnet
NEXT_PUBLIC_NEAR_RPC_URL=https://rpc.testnet.near.org
NEXT_PUBLIC_NEAR_EXPLORER_URL=https://testnet.nearblocks.io
NEXT_PUBLIC_NEAR_WALLET_URL=https://testnet.mynearwallet.com

# Pinata IPFS Configuration (Required server-side for POST /api/upload)
PINATA_JWT=[INSERT PINATA JWT]
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs

# Isolated AI Verification Assistant (Server-side only for POST /api/ai/verify)
# Supported providers: "openai" or "gemini"
AI_PROVIDER=openai
OPENAI_API_KEY=[INSERT OPENAI API KEY]
AI_MODEL=gpt-4o-mini
GEMINI_API_KEY=[INSERT GEMINI API KEY IF USING GEMINI]
```

> **Honest Fallback Behavior**:
> - If the NEAR Testnet contract is not yet deployed at `NEXT_PUBLIC_CONTRACT_ID` or RPC is unreachable, read views fall back to clearly badged `DEMO DATA PREVIEW` records (`is_demo_data: true`), while write transactions are never faked.
> - If `OPENAI_API_KEY` / `GEMINI_API_KEY` is not configured, `/api/ai/verify` returns HTTP `503 AI_SERVICE_UNAVAILABLE` (`allow_manual_verification: true`) without fabricating AI output, and the human admin can still verify or reject actions manually.

---

## Reproducible Local Setup, Testing & Deployment

### 1. Install Frontend Dependencies & Run Local Dev Server

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

### 2. Run End-to-End Tests, Lint, Typecheck & Production Build

```bash
# From repository root: runs static security audit, contract state-machine tests, AI schema tests, lint & typecheck
node scripts/run-release-tests.mjs

# From frontend/: run lint, typecheck, and production build
cd frontend
npm run lint
npm run typecheck
npm run build
```

### 3. Build & Deploy NEAR Smart Contract to Testnet

```bash
# Compiles contract/ to wasm32-unknown-unknown and deploys/initializes via NEAR CLI
CONTRACT_ID="foodsort.testnet" ADMIN_ID="admin.foodsort.testnet" bash scripts/deploy-near-testnet.sh
```
