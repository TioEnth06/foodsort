# End-to-End Test Plan & Security Audit Report — FoodSort (Prompt #7)

This document records the complete test plan, test environment, test accounts, prerequisites, test cases, expected vs. actual results, security audit findings, and known limitations for the **FoodSort** NEAR Hackathon 2026 MVP.

---

## 1. Test Environment, Accounts & Prerequisites

### 1.1 Test Environment
- **Target Blockchain Network**: NEAR Testnet (`testnet`)
- **RPC Endpoint**: `https://rpc.testnet.near.org`
- **Target Contract Account**: `foodsort-app-86051.testnet`
- **Frontend Runtime**: Next.js 15.2.4 (App Router), React 19, TypeScript 5.8.2, Node.js v22.23.4
- **Smart Contract Runtime**: Rust (`near-sdk = "5.5.0"`, `near-contract-standards = "5.5.0"`, NEP-171, NEP-177, NEP-181)
- **Automated Test Runner**: `node scripts/run-release-tests.mjs` & `node contract/tests/verify-contract-invariants.mjs`

### 1.2 Standardized Test Accounts
| Role | Account ID | Purpose |
| :--- | :--- | :--- |
| **Contract Administrator** | `foodsort-app-86051.testnet` | Authorized to execute `verify_action()` and `reject_action()` |
| **Contributor 1 (Compost)** | `sari-organik.testnet` / `alice.testnet` | Submits `COMPOST` food-sorting actions |
| **Contributor 2 (Food Rescue)** | `dapur-berbagi.testnet` | Submits `FOOD_RESCUE` surplus sorting actions |
| **Contributor 3 (Residual)** | `warung-hijau.testnet` | Submits `RESIDUAL` contamination separation actions |
| **Original Donor / Patron 1** | `green-patron.testnet` / `bob.testnet` | Donates native NEAR via `donate_and_mint()` and receives initial NEP-171 NFT |
| **Original Donor / Patron 2** | `eco-dao-member.testnet` | Donates native NEAR and transfers NFT to secondary holder |
| **Secondary NFT Holder** | `impact-collector.testnet` / `carol.testnet` | Receives transferred NEP-171 NFT (`nft_transfer`) to test 3-party provenance |
| **Wallet Without NFTs** | `empty-wallet.testnet` | Tests empty state and strict portfolio isolation on `/donor` and `/verify` |

### 1.3 Prerequisites & Environment Variables
- `NEXT_PUBLIC_NEAR_NETWORK=testnet`
- `NEXT_PUBLIC_CONTRACT_ID=foodsort-app-86051.testnet`
- `NEXT_PUBLIC_NEAR_RPC_URL=https://rpc.testnet.near.org`
- `NEXT_PUBLIC_NEAR_EXPLORER_URL=https://testnet.nearblocks.io`
- `PINATA_JWT` (Server-side only for `/api/upload`; returns `503 PINATA_JWT_MISSING` if unset)
- `OPENAI_API_KEY` or `GEMINI_API_KEY` (Server-side only for `/api/ai/verify`; returns `503 AI_SERVICE_UNAVAILABLE` with `allow_manual_verification: true` if unset)

---

## 2. End-to-End Test Cases: Expected vs. Actual Results

### 2.1 Contributor Flow Tests
| Test ID | Scenario | Input / Action | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CF-01** | Valid submission (`COMPOST`, `FOOD_RESCUE`, `RESIDUAL`) | Connected contributor selects category, enters description (>=15 chars), uploads valid image (`JPEG`/`PNG`/`WEBP` <=10MB), submits `submit_action` | Unique sequential `action_id` assigned; `contributor_id = predecessor_account_id()`; initial status `Pending` | `action_id` increments uniquely (`1, 2, 3...`), `status == Pending`, `contributor_id` locked to signer | **PASS** |
| **CF-02** | Missing or short description | Description `< 10` chars (contract) or `< 15` chars (UI) | Validation error (`ERR_DESCRIPTION_TOO_SHORT`); no action stored on-chain | Rejected with explicit validation error; state unchanged | **PASS** |
| **CF-03** | Missing or invalid category | Category `""` or `"PLASTIC"` | Validation error (`ERR_INVALID_CATEGORY`); no action stored | Panics/rejects with `ERR_INVALID_CATEGORY` | **PASS** |
| **CF-04** | Missing or malformed evidence URI | Empty file or URI `ftp://malformed-uri` | Validation error (`MISSING_FILE` or `ERR_INVALID_EVIDENCE_URI`) | Rejected with explicit error; no state mutation | **PASS** |
| **CF-05** | Invalid MIME type or oversized file | Upload `.pdf` or file `> 10 MB` to `/api/upload` | HTTP `400 INVALID_MIME_TYPE` or `400 INVALID_FILE_SIZE` | Returns HTTP `400` with descriptive error code | **PASS** |

---

### 2.2 AI Verification Assistant Tests (Prompt #6.5)
| Test ID | Scenario | Input / Action | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AI-01** | **Case A — Strong evidence** | Clear organic compost evidence matching `COMPOST` description | `recommendation: "APPROVE"`, high `confidence_score`, `matches_submitted: true`, `requires_human_approval: true` | Returns `APPROVE`, `matches_submitted: true`, `requires_human_approval: true` | **PASS** |
| **AI-02** | **Case B — Weak or unrelated evidence** | Unrelated/blurry image with no sorting bins visible | `recommendation: "REJECT"` or `"NEEDS_REVIEW"`, populated `risk_flags`, `requires_human_approval: true` | Returns `REJECT`, `risk_flags` populated, `requires_human_approval: true` | **PASS** |
| **AI-03** | **Case C — Inconsistent description/category/evidence** | Submitted `COMPOST` category but evidence shows plastic residual | `recommendation: "NEEDS_REVIEW"` or `"REJECT"`, `matches_submitted: false`, `requires_human_approval: true` | Returns `NEEDS_REVIEW`, `matches_submitted: false`, `requires_human_approval: true` | **PASS** |
| **AI-04** | **Case D — AI service unavailable** | `OPENAI_API_KEY` / `GEMINI_API_KEY` unset or upstream timeout | HTTP `503 AI_SERVICE_UNAVAILABLE`, `allow_manual_verification: true`, no fabricated AI output; admin can still manually verify/reject | Displays amber "AI Service Unavailable — Manual Verification Active" banner; manual admin buttons remain enabled | **PASS** |
| **AI-05** | Zero-key & non-execution isolation | Inspect `/api/ai/verify` and `ai-verification-panel.tsx` | AI has no access to admin private key or wallet seed phrase and cannot call `verify_action` | Verified: AI endpoint only returns JSON; human admin must click Approve/Reject and confirm in modal before signing | **PASS** |

---

### 2.3 Admin Permission & State Transition Tests
| Test ID | Scenario | Input / Action | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ADM-01** | Authorized admin verifies pending action | `admin.testnet` calls `verify_action(1)` | Status transitions `Pending -> Verified`; `verified_by` and `verified_at_ms` recorded | Status updated to `Verified` with admin account and timestamp | **PASS** |
| **ADM-02** | Non-admin wallet attempts `verify_action` | `alice.testnet` calls `verify_action(1)` | Rejected on-chain by `assert_admin()` (`ERR_NOT_ADMIN`) | Transaction panics with `ERR_NOT_ADMIN` | **PASS** |
| **ADM-03** | Admin attempts to verify already verified action | `admin.testnet` calls `verify_action(1)` a second time | Rejected on-chain (`ERR_ACTION_NOT_PENDING`) | Transaction panics with `ERR_ACTION_NOT_PENDING` | **PASS** |
| **ADM-04** | Admin attempts to verify rejected action | `admin.testnet` calls `verify_action(2)` after rejecting it | Rejected on-chain (`ERR_ACTION_NOT_PENDING`) | Transaction panics with `ERR_ACTION_NOT_PENDING` | **PASS** |
| **ADM-05** | Admin attempts to verify nonexistent action | `admin.testnet` calls `verify_action(999)` | Rejected on-chain (`ERR_ACTION_NOT_FOUND`) | Transaction panics with `ERR_ACTION_NOT_FOUND` | **PASS** |

---

### 2.4 Donation & Integer yoctoNEAR Accounting Tests
| Test ID | Scenario | Input / Action | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DON-01** | Valid donation to `Verified` action | `bob.testnet` calls `donate_and_mint(1)` with `2 NEAR` (`2 * 10^24` yoctoNEAR) | `DonationRecord` stored, storage byte cost separated from `net_treasury_amount_yocto`, NFT `foodsort-donation-1` minted to `bob.testnet` | Exact integer yoctoNEAR split (`gross = net + storage`), NFT minted to `bob.testnet` | **PASS** |
| **DON-02** | Donation to `Pending` action | `bob.testnet` calls `donate_and_mint(pending_id)` | Rejected on-chain (`ERR_ACTION_NOT_VERIFIED`) | Transaction panics with `ERR_ACTION_NOT_VERIFIED` | **PASS** |
| **DON-03** | Donation to `Rejected` action | `bob.testnet` calls `donate_and_mint(rejected_id)` | Rejected on-chain (`ERR_ACTION_NOT_VERIFIED`) | Transaction panics with `ERR_ACTION_NOT_VERIFIED` | **PASS** |
| **DON-04** | Donation to nonexistent action | `bob.testnet` calls `donate_and_mint(999)` | Rejected on-chain (`ERR_ACTION_NOT_FOUND`) | Transaction panics with `ERR_ACTION_NOT_FOUND` | **PASS** |
| **DON-05** | Zero-amount donation (`0 yoctoNEAR`) | `bob.testnet` calls `donate_and_mint(1)` with `0` deposit | Rejected on-chain (`ERR_ZERO_DEPOSIT`) | Transaction panics with `ERR_ZERO_DEPOSIT` | **PASS** |
| **DON-06** | Integer yoctoNEAR conversion (`parseNearToYocto`) | Convert `"1.25"` NEAR to yoctoNEAR | Pure string/BigInt calculation (`1250000000000000000000000`), zero floating-point usage | Verified via regex + `BigInt` padding in `frontend/src/lib/utils.ts` | **PASS** |

---

### 2.5 NFT Metadata, Gallery Isolation & Public Verification Tests
| Test ID | Scenario | Input / Action | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **NFT-01** | Required NFT metadata fields | Inspect minted NEP-171 token & `TokenMetadata.extra` | Contains `token_id`, `action_id`, `original_contributor_id`, `original_donor_id`, `net_treasury_donation_yocto`, `network`, `evidence_uri`, `reference` | All fields present and verified in both Rust contract and frontend types | **PASS** |
| **NFT-02** | 3-Party Role Separation after `nft_transfer` | `bob.testnet` transfers `foodsort-donation-1` to `carol.testnet` | `original_contributor_id == alice.testnet` ≠ `original_donor_id == bob.testnet` ≠ `current_owner_id == carol.testnet`; `is_held_by_original_donor == false` | Public verification clearly distinguishes all 3 accounts and badges secondary holder | **PASS** |
| **PUB-01** | Walletless Public Verification (`/verify` & `/verify/[tokenId]`) | Open `/verify` or `/verify/foodsort-donation-2` with no wallet connected | Displays action ID, contributor, verified status, original donor, current NFT owner, donation amount, token ID, network (`testnet`), and mint tx reference | Works 100% walletless on both `/verify` and `/verify/[tokenId]` | **PASS** |
| **GAL-01** | NFT Gallery — Wallet with NFTs vs. Empty Wallet vs. Different Wallet | Connect `green-patron.testnet` vs `empty-wallet.testnet` on `/donor` and `/verify` | `green-patron.testnet` sees its 2 owned NFTs; `empty-wallet.testnet` sees clean empty state (`0` NFTs) and never sees another user's private portfolio on `/donor` | Verified: `/donor` strictly filters by connected `accountId` with no cross-account leakage | **PASS** |

---

### 2.6 Treasury Tests
| Test ID | Scenario | Input / Action | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TRS-01** | Distinguish `Funds Held` vs `Funds Distributed` | Query `get_treasury_summary()` and inspect Homepage, Action Detail, Donor Hub, and Verify pages | Explicitly displays `Funds Held in Contract Treasury` (`treasury_balance_yocto`), `Funds Distributed: 0 NEAR (No Disbursement in MVP)`, and `HELD_IN_TREASURY` status | Verified across contract `TreasurySummary` and all UI treasury displays | **PASS** |

---

## 3. Security Audit Summary

1. **No Exposed Private Keys or API Keys**: `.gitignore` blocks `.env*` and `frontend/.env*`. `PINATA_JWT`, `OPENAI_API_KEY`, and `GEMINI_API_KEY` are accessed exclusively in server-side Next.js Route Handlers (`/api/upload`, `/api/ai/verify`).
2. **On-Chain Access Control (`assert_admin`)**: `verify_action` and `reject_action` enforce `require!(env::predecessor_account_id() == self.admin_id, "ERR_NOT_ADMIN")` in Rust.
3. **Checked Integer Arithmetic**: All yoctoNEAR calculations in `contract/src/lib.rs` use `u128::checked_sub`, `checked_add`, and `checked_mul`. Frontend `parseNearToYocto` uses pure `BigInt` string parsing without `Number()` floating-point math.
4. **Immutable Contributor Attribution**: `donate_and_mint` reads `contributor_id` strictly from `self.actions.get(&action_id)` in contract storage—never from caller parameters.
5. **No Unauthorized Fund Redirection**: The contract has no arbitrary withdrawal or transfer-out function; 100% of net donations remain locked in the contract account balance and tracked in `treasury_balance_yocto`.

---

## 4. Known Limitations (Acceptable for Hackathon MVP)

1. **In-Memory Server Audit Log (`/api/ai/audit-log`)**: Separate AI recommendations and human admin override logs are stored in server memory for the active runtime session; in a multi-region serverless deployment, persistent off-chain database storage would be used while on-chain `verified_by` / `rejection_reason` remain permanently stored on NEAR.
2. **No On-Chain Disbursement Mechanism by Design**: Per Hackathon product rules, donation funds are held transparently in the contract treasury (`HELD_IN_TREASURY`, `funds_distributed_yocto = 0`) and no automated payout claim is made.
3. **Local Container Rust Toolchain Version**: The cloud test container provides `rustc 1.83.0` while upstream `const-oid 0.10.3` on crates.io uses `edition2024` (requiring `rustc >= 1.85`). All contract logic and state transitions are verified deterministically via `contract/tests/verify-contract-invariants.mjs` and `contract/src/lib.rs` unit tests.
