# Live Demo Runbook & 3-Minute Judge Walkthrough — FoodSort

This runbook guides presenters and NEAR Hackathon 2026 judges through a complete **3-minute live walkthrough** of **FoodSort**.

---

## Pre-Demo Checklist (30 Seconds Before Presenting)

1. **Start Frontend Server (or open Deployed Vercel URL)**:
   ```bash
   cd frontend
   npm run dev
   ```
   Open `http://localhost:3000` (or your live Vercel URL).
2. **Verify Environment Keys (Optional for Live Pinata + Live AI)**:
   - In `frontend/.env.local` (or Vercel Project Settings -> Environment Variables):
     - `PINATA_JWT` (for live IPFS pinning on `/contribute`)
     - `OPENAI_API_KEY` or `GEMINI_API_KEY` (for live AI evidence analysis on `/admin`)
   - *Fallback Guarantee*: Even if AI or Testnet RPC is offline during judging, FoodSort never fakes transactions or fabricates AI outputs—it clearly labels `DEMO DATA PREVIEW` and enables manual admin review.

---

## 3-Minute Judge Pitch & Live Demo Script

### Minute 0:00 – 0:35 | Problem, Truthful Treasury & Architecture (`/`)
1. **Show Homepage (`/`)**:
   - Point to the **Transparent Treasury State** card on the right:
     - Highlight `8.4796 NEAR` net held in treasury + `0.0204 NEAR` NEP-171 storage reserved.
     - Emphasize the core Hackathon rule: **`HELD_IN_TREASURY`** — FoodSort separates storage byte costs from net donations and **never falsely claims funds have been distributed** while held in contract state.
2. **Scroll to "Three Verifiable Food-Sorting Categories"**:
   - Point out the standardized sorting streams: `COMPOST`, `FOOD_RESCUE`, and `RESIDUAL`.

---

### Minute 0:35 – 1:15 | Contributor Journey (`/contribute`)
1. **Navigate to `Contribute` (`/contribute`)**:
   - Click **Connect NEAR Testnet Wallet** in the top-right navbar and select the preset `Contributor: sari-organik.testnet` (or connect via MyNearWallet Testnet redirect).
2. **Fill the Contribution Form**:
   - Select category: **`COMPOST`**.
   - Select action type: **`Community Market Green Waste Sorting`**.
   - Enter description: `"Sorted 18.5 kg of vegetable trimmings and coffee grounds into aerated compost bins."`
   - Select an evidence photo (`JPEG`/`PNG`/`WEBP`).
3. **Explain the 2-Step On-Chain Submission**:
   - Step 1 pins the raw image off-chain to **Pinata IPFS** (`POST /api/upload`) and returns `ipfs://<CID>`.
   - Step 2 invokes `submit_action(food_category, action_type, description, evidence_uri)` on NEAR Testnet (`foodsort.testnet`), recording `env::predecessor_account_id()` as the immutable `contributor_id` with initial status `Pending`.

---

### Minute 1:15 – 2:00 | Admin Dashboard & Isolated AI Verification Assistant (`/admin`)
1. **Navigate to `Admin Review` (`/admin`)**:
   - Point out the **Contract-Level Admin Guard Banner**: when connected as `sari-organik.testnet`, admin action buttons are locked (`Non-Admin Wallet`), backed by `require!(env::predecessor_account_id() == self.admin_id)` in Rust.
   - Click **`Switch to admin.foodsort.testnet`** in the top-right status card to connect as the authorized contract administrator.
2. **Run AI Verification Assistant (Prompt #6.5)**:
   - On pending Action `#103` (`COMPOST` by `budi-kompos.testnet`) or `#104` (`RESIDUAL` by `warung-hijau.testnet`), click **"Run AI Evidence Analysis"**.
   - Point out the structured analysis returned by `/api/ai/verify`:
     - **Recommendation**: `APPROVE` / `REJECT` / `NEEDS_REVIEW`
     - **Confidence Score**, **Category Assessment** (`COMPOST` / `FOOD_RESCUE` / `RESIDUAL`), **Evidence Relevance**, **Description Consistency**, **Risk Flags**, and **AI Reasoning**.
     - Point out the mandatory disclaimer: *AI has zero wallet access, cannot execute transactions, and never claims to certify food safety.*
3. **Human-in-the-Loop Confirmation & Separate Audit Log**:
   - Click **Approve (`verify_action`)** (or **Request Additional Evidence** / **Reject**).
   - Show the **Confirm On-Chain Human Admin Decision** modal comparing the prior AI recommendation with the human admin's decision.
   - Scroll down to the **Separate AI Recommendations & Human Admin Audit Log** card showing that `AI_RECOMMENDATION` and `HUMAN_ADMIN_DECISION` are logged as separate entries.

---

### Minute 2:00 – 2:35 | Donor Patronage & NEP-171 NFT Mint (`/actions` -> `/actions/101` -> `/donor`)
1. **Navigate to `Explore Actions` (`/actions`)**:
   - Filter by `Verified` vs `Pending`: show that only `Verified` actions enable patronage, while `Pending` and `Rejected` actions are blocked by the smart contract (`ERR_ACTION_NOT_VERIFIED`).
2. **Open Verified Action `#101` (`/actions/101`)**:
   - Point out the **Original Action Contributor** card (`sari-organik.testnet`).
   - In the **Support Verified Action & Mint NFT** panel on the right, select `2.5 NEAR`.
   - Highlight the transparent breakdown:
     - Action Performed By: `sari-organik.testnet` (read from contract storage, never from frontend args).
     - Estimated NEP-171 Storage Cost (`~0.0068 NEAR`) deducted via checked arithmetic from the attached deposit.
     - Treasury Status: `HELD_IN_TREASURY`.
3. **Open `Donor Hub` (`/donor`)**:
   - Show the connected donor's **Owned NEP-171 Patronage Certificates** and **On-Chain Donation Ledger** table.

---

### Minute 2:35 – 3:00 | Walletless Public Verification & 3-Party Provenance (`/verify`)
1. **Navigate to `NFT Gallery & Verify` (`/verify`)**:
   - Disconnect the wallet in the navbar to prove the verification page works **100% walletless** via direct public NEAR Testnet RPC queries.
2. **Click Token `foodsort-donation-2` in the Quick Inspect bar**:
   - Point to the **Three-Party Cryptographic Provenance** card:
     1. **1. Original Contributor (`sari-organik.testnet`)**: Performed the physical food-sorting work.
     2. **2. Original Donor (`eco-dao-member.testnet`)**: Funded the contract treasury and minted the NFT.
     3. **3. Current NFT Owner (`impact-collector.testnet`)**: Current NEP-171 token holder after secondary transfer.
   - Conclude: *"Even when a Donation NFT is transferred to a new collector, FoodSort never conflates the current owner or financial donor with the grassroots contributor who performed the environmental action, and every yoctoNEAR in the contract treasury is accounted for transparently."*
