# NEAR Hackathon 2026 — Final Submission Package (FoodSort)

This document contains the complete, fact-checked submission materials for **FoodSort**, derived strictly from the repository implementation. Placeholders (`[INSERT ...]`) are provided wherever deployment-specific URLs or live transaction hashes must be filled in by the presenter.

---

## 1. Project Identity & Positioning

- **Product Name**: FoodSort
- **Tagline**: Sort food. Support change. Collect impact.
- **One-line Description**: FoodSort is a community-powered food impact platform that connects verified real-world food actions with transparent on-chain donations and Donation NFTs.
- **Hackathon Track**: Sustainability, On-Chain Provenance & AI-Assisted Impact Verification on NEAR Protocol
- **GitHub Repository URL**: `https://github.com/TioEnth06/foodsort.git`
- **Live Frontend Demo URL**: `[INSERT LIVE DEMO URL]`
- **Demo Walkthrough Video URL**: `[INSERT DEMO VIDEO URL]`
- **NEAR Network**: NEAR Testnet (`testnet`)
- **Deployed Smart Contract Address**: `[INSERT ACTUAL CONTRACT ADDRESS]` (default configured in `frontend/.env.example`: `foodsort.testnet`)
- **Sample Verified Action Transaction Hash**: `[INSERT ACTUAL SUBMIT/VERIFY TX HASH]`
- **Sample `donate_and_mint` Transaction Hash**: `[INSERT ACTUAL DONATE_AND_MINT TX HASH]`

---

## 2. Core End-to-End Flow

```text
Contributor
→ Food Action + Evidence
→ AI-Assisted Verification
→ Human Admin Approval
→ NEAR On-Chain Verification
→ Donor Contribution
→ Donation NFT
→ Public Verification
```

1. **Contributor Submits Food Action + Evidence (`/contribute`)**:
   - Connects a NEAR Testnet wallet.
   - Selects one of the three supported categories (`COMPOST`, `FOOD_RESCUE`, `RESIDUAL`), specifies an action type, writes an activity description, and uploads photographic evidence.
   - The evidence image is validated and pinned off-chain to IPFS via Pinata (`POST /api/upload`), returning `ipfs://<CID>`.
   - Calls `submit_action(food_category, action_type, description, evidence_uri)` on the NEAR smart contract, storing the action with `status: Pending` and `contributor_id = env::predecessor_account_id()`.
2. **AI-Assisted Verification (`/admin` -> `POST /api/ai/verify`)**:
   - The human admin opens `/admin` and clicks **"Run AI Evidence Analysis"** on a pending submission.
   - The server-side AI service analyzes the untrusted description, submitted category (`COMPOST`, `FOOD_RESCUE`, `RESIDUAL`), and evidence image, returning a structured JSON evaluation:
     - `recommendation`: `"APPROVE"` | `"REJECT"` | `"NEEDS_REVIEW"`
     - `confidence_score`: `0.0` to `1.0`
     - `category_assessment`, `evidence_relevance`, `description_consistency`, `risk_flags`, `reasoning`
     - `requires_human_approval`: `true` (hardcoded invariant)
   - **Important Distinction**: AI assists verification; it never certifies food safety, has zero access to admin wallets or private keys, and cannot execute blockchain transactions.
3. **Human Admin Approval & NEAR On-Chain Verification (`/admin`)**:
   - The human administrator reviews the evidence and AI assessment, then chooses **Approve**, **Reject**, or **Request Additional Evidence**.
   - An explicit confirmation modal displays the prior AI recommendation alongside the admin's decision before invoking the wallet.
   - The smart contract enforces `assert_admin()` (`env::predecessor_account_id() == self.admin_id`) and records `Verified` or `Rejected` on-chain (`verify_action` / `reject_action`).
   - AI recommendations and human admin decisions are logged separately via `POST /api/ai/audit-log`.
4. **Donor Contribution & Donation NFT Minting (`/actions/[id]`)**:
   - Donors browse `/actions` and select a `Verified` action (`Pending` and `Rejected` actions are rejected by the contract with `ERR_ACTION_NOT_VERIFIED`).
   - Donor attaches native NEAR and calls `donate_and_mint(action_id)`.
   - The contract measures exact storage byte usage (`env::storage_usage()`), deducts `storage_cost_yocto` from the attached deposit using checked `u128` arithmetic, records `net_treasury_amount_yocto` in the contract treasury (`treasury_status: "HELD_IN_TREASURY"`), and mints NEP-171 token `foodsort-donation-{donation_id}` to the donor.
   - The NFT metadata (`DonationNftExtraMetadata`) permanently locks `original_contributor_id` read directly from the verified action stored on-chain.
5. **NFT Gallery & Walletless Public Verification (`/donor`, `/verify`, `/verify/[tokenId]`)**:
   - Donors inspect their owned certificates and donation ledger on `/donor`.
   - Any member of the public—without connecting a wallet—can open `/verify` or `/verify/[tokenId]` to query `get_nft_verification_proof(token_id)` on NEAR Testnet RPC and verify:
     - `original_contributor_id` (Action Performer)
     - `original_donor_id` (Original Patron)
     - `current_owner_id` (Current NEP-171 Holder)
     - `gross_attached_yocto`, `storage_cost_yocto`, `net_treasury_amount_yocto`, and `treasury_status: "HELD_IN_TREASURY"` (`Funds Distributed: 0 NEAR`).

---

## 3. Long-Form Hackathon Portal Description (Copy-Paste Ready)

### Problem
Community-level food sorting—diverting organic scraps to compost (`COMPOST`), recovering edible surplus before spoilage (`FOOD_RESCUE`), and isolating contaminated waste (`RESIDUAL`)—is one of the highest-leverage climate actions available. Yet grassroots contributors struggle to receive transparent patronage because:
1. **Unverified Impact Claims**: Photos and descriptions lack structured, tamper-resistant verification.
2. **Broken Attribution in Web3 Impact NFTs**: Many patronage platforms conflate the financial donor (or secondary NFT holder) with the person who performed the physical environmental labor.
3. **Misleading Payout Claims**: Platforms frequently imply donated funds have been distributed when they remain sitting in an escrow or treasury contract.
4. **Verification Bottlenecks vs. Blind Automation**: Human reviewers need fast triage assistance, but handing smart-contract signing keys to autonomous AI agents introduces severe security and prompt-injection risks.

### Solution: FoodSort on NEAR
**FoodSort** (*Sort food. Support change. Collect impact.*) solves these four problems on NEAR Protocol:
- **On-Chain Action Registry & Off-Chain IPFS Evidence**: Contributors pin evidence images to IPFS via Pinata and register actions on NEAR Testnet (`submit_action`).
- **Advisory AI Verification + Human Authority**: Our isolated AI Verification Assistant (`/api/ai/verify`) evaluates untrusted descriptions and images for category consistency and risk flags (`requires_human_approval: true`), while human administrators retain 100% signing authority and contract-enforced access control (`assert_admin()`).
- **Attribution-Preserving NEP-171 / NEP-177 Donation NFTs**: When a donor calls `donate_and_mint(action_id)`, the Rust smart contract reads `contributor_id` from verified on-chain state and embeds it into both the `DonationRecord` and NEP-177 `TokenMetadata.extra` JSON.
- **Transparent Treasury Accounting**: Checked `u128` arithmetic separates NEP-171 storage byte costs from net donations, and both the contract and UI clearly distinguish `Funds Held in Contract Treasury` (`HELD_IN_TREASURY`) from `Funds Distributed` (`0 NEAR` in the MVP).
- **Walletless Public Verification**: Anyone can visit `/verify/[tokenId]` without connecting a wallet to verify the three-party provenance (`Original Contributor ≠ Original Donor ≠ Current NFT Owner`).

---

## 4. Technical Stack & Actual Repository Map

| Layer | Technology Used in Repository | Key Files |
| :--- | :--- | :--- |
| **Smart Contract** | Rust (`near-sdk = "5.5.0"`, `near-contract-standards = "5.5.0"`, NEP-171, NEP-177, NEP-181) | `contract/Cargo.toml`, `contract/src/lib.rs`, `contract/src/models.rs`, `contract/src/views.rs` |
| **Frontend Framework** | Next.js 15.2.4 (App Router), React 19, TypeScript 5.8.2, Tailwind CSS v4, `motion`, `lucide-react` | `frontend/package.json`, `frontend/src/app/*`, `frontend/src/components/*` |
| **NEAR Integration** | Direct JSON-RPC view client (`callNearView`, `fetchTransactionOutcome`) + Testnet Wallet integration | `frontend/src/lib/near/config.ts`, `frontend/src/lib/near/rpc.ts`, `frontend/src/lib/near/wallet-provider.tsx` |
| **IPFS Storage** | Server-side Pinata `pinFileToIPFS` route with MIME & 10 MB validation | `frontend/src/app/api/upload/route.ts` |
| **AI Verification Assistant** | Server-side OpenAI / Gemini Vision route + schema normalizer + separate AI vs. Human audit log | `frontend/src/app/api/ai/verify/route.ts`, `frontend/src/lib/ai/verification-schema.ts`, `frontend/src/app/api/ai/audit-log/route.ts` |
| **Testing & Release** | Contract state-machine & static invariant suite + E2E QA runner + NEAR Testnet deploy script | `contract/tests/verify-contract-invariants.mjs`, `scripts/run-release-tests.mjs`, `scripts/deploy-near-testnet.sh` |

---

## 5. Honest Disclosure of Demo Data vs. Live On-Chain Mode

To ensure judges can evaluate FoodSort immediately even before connecting external API keys or a funded Testnet wallet:
- **Demo Preview Mode (`DEMO DATA PREVIEW`)**: When the target contract is not yet deployed or when Demo Preview is toggled in the top banner, the UI displays 5 sample actions (`#101`–`#105`), 3 sample donations (`#1`–`#3`), and 3 sample NEP-171 tokens (`foodsort-donation-1`–`3`, where `foodsort-donation-2` demonstrates a token transferred to `impact-collector.testnet`). Every sample record is explicitly badged with `DEMO DATA`.
- **Zero Fake Transactions**: Attempting to sign a write transaction (`submit_action`, `verify_action`, `reject_action`, `donate_and_mint`) never fabricates a transaction hash; it requires a real NEAR Testnet contract and wallet signature.
- **No Fabricated AI Output**: If `OPENAI_API_KEY` / `GEMINI_API_KEY` is not set on the server, clicking **"Run AI Evidence Analysis"** returns an honest `503 AI_SERVICE_UNAVAILABLE` notice and keeps manual human verification active.
