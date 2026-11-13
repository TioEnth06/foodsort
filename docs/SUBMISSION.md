# NEAR Hackathon 2026 — Official Submission Package (FoodSort)

## 1. Basic Project Information

- **Project Name**: FoodSort
- **Tagline**: Verifiable Food-Sorting Action Registry & Attribution-Preserving NEP-171 Patronage Protocol on NEAR
- **Hackathon Track**: Sustainability, On-Chain Provenance & Verifiable Impact Patronage (NEAR Hackathon 2026)
- **GitHub Repository**: [https://github.com/TioEnth06/foodsort.git](https://github.com/TioEnth06/foodsort.git)
- **Target NEAR Network**: NEAR Testnet (`testnet`)
- **Smart Contract Account ID**: `foodsort.testnet`
- **Implemented NEP Standards**: NEP-171 (NFT Core), NEP-177 (NFT Metadata), NEP-181 (NFT Enumeration)

---

## 2. Problem & Solution Summary

### The Problem
1. **Unverified Environmental Claims**: Community food waste diversion (`COMPOST`), surplus recovery (`FOOD_RESCUE`), and contamination separation (`RESIDUAL`) lack tamper-resistant proof of execution.
2. **Broken Attribution in Web3 Patronage**: Existing impact NFT platforms routinely conflate the financial donor or secondary NFT buyer with the person who performed the physical environmental labor.
3. **Untruthful Payout Claims**: Applications often claim or imply that donated funds have been disbursed when they are actually still held in a treasury contract.
4. **Manual Verification Bottlenecks**: Human administrators reviewing evidence photos and descriptions need structured triage assistance without surrendering on-chain signing authority or private keys to automated AI bots.

### The FoodSort Solution
- **Contributors** upload food-sorting evidence images to IPFS via Pinata (`/api/upload`) and submit on-chain actions (`submit_action`) across three standardized categories: `COMPOST`, `FOOD_RESCUE`, and `RESIDUAL`.
- **Human Admins (Assisted by an Isolated AI Verification Assistant)** inspect pending actions on `/admin`. The server-side AI service (`/api/ai/verify`) analyzes untrusted descriptions and images to return a structured recommendation (`APPROVE`, `REJECT`, `NEEDS_REVIEW`), confidence score, category match, evidence relevance, description consistency, and risk flags. The AI has **zero wallet access** and never claims to certify food safety. The human admin explicitly confirms before signing `verify_action` or `reject_action` on NEAR Testnet, and AI recommendations vs. human decisions are logged separately (`/api/ai/audit-log`).
- **Donors** support verified actions with native NEAR via `donate_and_mint(action_id)`. The Rust contract measures exact storage byte usage, deducts `storage_cost_yocto` using checked arithmetic, holds `net_treasury_amount_yocto` transparently in the contract treasury (`HELD_IN_TREASURY`), and mints a 1-of-1 NEP-171 Patronage NFT to the donor.
- **Public Verifiers** can inspect any minted NFT on `/verify` without connecting a wallet. The contract's `get_nft_verification_proof` view explicitly distinguishes three separate accounts:
  1. **Original Contributor (`contributor_id`)** — Performed the food-sorting action.
  2. **Original Donor (`donor_id`)** — Contributed native NEAR and minted the NFT.
  3. **Current NFT Owner (`owner_id`)** — Current NEP-171 holder.

---

## 3. Technical Architecture & Smart Contract Security Highlights

| Requirement | Implementation in FoodSort |
| :--- | :--- |
| **Smart Contract Stack** | Rust (`near-sdk = "5.5.0"`, `near-contract-standards = "5.5.0"`, NEP-171, NEP-177, NEP-181) in `contract/src/lib.rs` |
| **Frontend Stack** | Next.js 15 App Router, TypeScript, Tailwind CSS v4, `shadcn/ui`, `motion` animations in `frontend/` |
| **Off-Chain Storage** | Strict Pinata IPFS pinning (`POST /api/upload`) validating MIME types (`JPEG`, `PNG`, `WEBP`) and 10 MB limit |
| **Admin Access Control** | Contract-enforced `require!(env::predecessor_account_id() == self.admin_id, "ERR_NOT_ADMIN")` |
| **Unverified Donation Guard** | Contract-enforced `require!(action.status == ActionStatus::Verified, "ERR_ACTION_NOT_VERIFIED")` |
| **Immutable Attribution** | `donate_and_mint` reads `contributor_id` exclusively from `self.actions.get(&action_id)` in contract storage |
| **Storage vs. Treasury Isolation** | Checked arithmetic (`checked_sub`, `checked_add`) separates `storage_cost_yocto` from `net_treasury_amount_yocto` |
| **Honest Treasury Status** | All donation records and NFT metadata explicitly record `treasury_status: "HELD_IN_TREASURY"` |
| **AI Assistant Isolation** | Server-side `/api/ai/verify` treats inputs as untrusted, enforces `requires_human_approval: true`, and logs separately in `/api/ai/audit-log` |

---

## 4. Final Pre-Submission Verification Checklist

- [x] `HACKATHON.md`, `README.md`, `AGENTS.md`, and all `docs/*.md` files present and up to date
- [x] All 7 pages implemented and navigable (`/`, `/actions`, `/actions/[id]`, `/contribute`, `/donor`, `/admin`, `/verify`)
- [x] Isolated AI Verification Assistant (`Prompt #6.5`) integrated into `/admin` with human confirmation modal and manual fallback
- [x] Automated release test suite (`node scripts/run-release-tests.mjs`) passes 100%
- [x] Next.js production build (`npm run build`) and TypeScript check (`npm run typecheck`) pass with zero errors
- [x] No `.env` or secret keys committed to Git history
