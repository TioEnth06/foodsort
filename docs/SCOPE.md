# MVP Scope & Implementation Checklist — FoodSort (FROZEN FOR RELEASE)

> **CODE FREEZE STATUS: ACTIVE**  
> All MVP deliverables and the isolated Prompt #6.5 AI Verification Assistant extension are locked for release verification, deployment, live demo, and hackathon submission.

## 1. In-Scope MVP Deliverables

### 1.1 Documentation (`docs/`, root `.md` files)
- Official `HACKATHON.md`, `README.md`, `AGENTS.md`
- `docs/PRD.md`, `docs/SCOPE.md`, `docs/ARCHITECTURE.md`, `docs/SMART-CONTRACT.md`, `docs/UI-UX.md`, `docs/TESTING.md`
- Release & Submission docs: `docs/DEMO-RUNBOOK.md`, `docs/SUBMISSION.md`

### 1.2 NEAR Smart Contract (`contract/`)
- Rust smart contract using `near-sdk` and `near-contract-standards`
- NEP-171 Core Non-Fungible Token + NEP-177 Metadata + NEP-181 Enumeration
- Action submission (`submit_action`) supporting `COMPOST`, `FOOD_RESCUE`, `RESIDUAL`
- Admin-restricted verification (`verify_action`) and rejection (`reject_action`)
- Native NEAR donation and atomic NFT minting (`donate_and_mint`)
- Checked arithmetic separating NFT/state storage costs from net treasury balance
- On-chain view methods for actions, donations, treasury summary, and 3-party NFT verification proofs
- Comprehensive in-memory unit and integration tests

### 1.3 Frontend Application & Off-Chain Services (`frontend/`)
- Next.js App Router + TypeScript + Tailwind CSS + `shadcn/ui` components + `motion` animations
- Sustainability palette: Forest Green (`#1B4332`), Leaf Green (`#40916C`), Warm Cream (`#FAF8F5`), Charcoal (`#1C1F1E`)
- 7 Complete Pages:
  1. Homepage (`/`)
  2. Actions Listing (`/actions`)
  3. Action Detail & Donation Flow (`/actions/[id]`)
  4. Contribution Form (`/contribute`)
  5. Donor Dashboard (`/donor`)
  6. Admin Dashboard with AI Verification Assistant (`/admin`)
  7. NFT Gallery & Public Verification Page (`/verify`)
- Strict Pinata IPFS upload API route (`/api/upload`)
- Isolated Server-Side AI Verification Assistant (`/api/ai/verify`) and separate AI vs. Human Audit Log (`/api/ai/audit-log`)
- Real NEAR Testnet Wallet Selector integration and direct JSON-RPC view queries
- Clearly labeled `DEMO DATA` fallback mode when viewing before contract deployment or without Testnet data

---

## 2. Explicit Out-of-Scope Exclusions

In accordance with the NEAR Hackathon 2026 rules, the following are **strictly excluded**:
- **No NFT Marketplace**: No buying, selling, bidding, or royalty trading UI/contract logic.
- **No DAO or Governance System**: Single authorized `admin_id` stored in contract state is the verifier authority for the MVP.
- **No Autonomous On-Chain AI Execution**: AI is strictly an off-chain, human-in-the-loop advisory assistant for the admin and cannot sign or trigger blockchain transactions.
- **No Fungible Token (NEP-141)**: All donations use native NEAR.
- **No Logistics or Delivery System**: FoodSort tracks and verifies sorting actions and patronage, not fleet dispatch or physical pickup routing.
- **No Fake Payout Claims**: Donation funds remain transparently held in the contract treasury (`HELD_IN_TREASURY`).

---

## 3. Master Release Checklist (Freeze -> Test -> Deploy -> Demo -> Submit)

- [x] **Stage 1: FREEZE (Scope & Security Lock)**
  - [x] Enforce contributor attribution from contract state (`action.contributor_id`)
  - [x] Enforce `"HELD_IN_TREASURY"` status across contract and UI
  - [x] Enforce 3-party NFT provenance (`contributor_id`, `donor_id`, `owner_id`)
  - [x] Enforce isolated AI Verification Assistant (`requires_human_approval: true`)
  - [x] Block `.env` and `.env.local` in `.gitignore`
- [x] **Stage 2: TEST (Contract + API + Build Verification)**
  - [x] Rust contract static and state-machine lifecycle tests (`contract/tests/verify-contract-invariants.mjs` & `cargo test`)
  - [x] AI verification schema normalization & separate audit-log tests (`scripts/run-release-tests.mjs`)
  - [x] `npm run typecheck` and `npm run build` succeed cleanly
- [x] **Stage 3: DEPLOY (Scripts, GitHub & Vercel Config)**
  - [x] `scripts/deploy-near-testnet.sh` ready for NEAR Testnet deployment
  - [x] `vercel.json` and `frontend/.env.example` / `frontend/.env.local` configured
- [x] **Stage 4: DEMO (`docs/DEMO-RUNBOOK.md`)**
  - [x] 3-minute structured judge walkthrough covering all 7 pages and 4 user journeys
- [x] **Stage 5: SUBMIT (`docs/SUBMISSION.md`)**
  - [x] Complete NEAR Hackathon 2026 submission copy and verification checklist
