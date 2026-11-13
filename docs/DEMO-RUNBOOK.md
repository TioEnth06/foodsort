# Live Demo Runbook & 3-Minute Judge Walkthrough — FoodSort

> **Product**: FoodSort  
> **Tagline**: *Sort food. Support change. Collect impact.*  
> **Core Flow**: `Contributor → Food Action + Evidence → AI-Assisted Verification → Human Admin Approval → NEAR On-Chain Verification → Donor Contribution → Donation NFT → Public Verification`

This runbook guides presenters and NEAR Hackathon 2026 judges through a reproducible **3-minute live walkthrough** of **FoodSort**.

---

## Pre-Demo Setup (30 Seconds Before Presenting)

1. **Start Frontend Server (or open `[INSERT LIVE DEMO URL]`)**:
   ```bash
   cd frontend
   npm run dev
   ```
   Open `http://localhost:3000`.
2. **Environment Keys Check (`frontend/.env.local`)**:
   - `NEXT_PUBLIC_CONTRACT_ID=foodsort.testnet` (or `[INSERT ACTUAL CONTRACT ADDRESS]`)
   - `PINATA_JWT=[INSERT PINATA JWT]` (for live IPFS pinning on `/contribute`)
   - `OPENAI_API_KEY=[INSERT OPENAI API KEY]` or `GEMINI_API_KEY=[INSERT GEMINI API KEY]` (for live AI evidence analysis on `/admin`)
   - *Graceful Demo Fallback*: If presenting without live external keys or before contract deployment, the top navbar clearly badges `DEMO DATA PREVIEW` for read views, and `/admin` demonstrates graceful manual fallback when AI is unavailable.

---

## 3-Minute Judge Pitch & Walkthrough Script

### 0:00 – 0:30 | Positioning & Truthful Treasury Accounting (`/`)
1. **Open Homepage (`/`)**:
   - Introduce **FoodSort**: *"Sort food. Support change. Collect impact. FoodSort is a community-powered food impact platform that connects verified real-world food actions with transparent on-chain donations and Donation NFTs on NEAR."*
2. **Highlight the Transparent Treasury State Card**:
   - Point out the explicit separation between:
     - **Funds Held in Contract Treasury** (`treasury_balance_yocto`, status `HELD_IN_TREASURY`)
     - **Funds Distributed: `0 NEAR (No Disbursement in MVP)`**
     - **NEP-171 Storage Reserved** (`total_storage_reserved_yocto`)
   - Emphasize: *"FoodSort never claims funds have been distributed unless an actual on-chain disbursement exists."*

---

### 0:30 – 1:10 | Step 1: Contributor Submits Food Action + Evidence (`/contribute`)
1. **Navigate to `Contribute` (`/contribute`)**:
   - Click **Connect NEAR Testnet** in the navbar and connect as a contributor (e.g., preset `sari-organik.testnet` or via MyNearWallet Testnet).
2. **Walk Through the Submission Form**:
   - Select category: **`COMPOST`** (alongside `FOOD_RESCUE` and `RESIDUAL`).
   - Select action type: **`Community Market Green Waste Sorting`**.
   - Enter description (minimum 15 characters in UI / 10 characters in contract).
   - Select a valid evidence image (`JPEG`, `PNG`, or `WEBP`, up to 10 MB).
3. **Explain the 2-Step Execution**:
   - Step 1 uploads the evidence image to **Pinata IPFS** (`POST /api/upload`) and returns `ipfs://<CID>`.
   - Step 2 calls `submit_action(food_category, action_type, description, evidence_uri)` on the NEAR contract, assigning a unique sequential `action_id` with `status: Pending` and recording `contributor_id = env::predecessor_account_id()`.

---

### 1:10 – 1:55 | Steps 2, 3 & 4: AI-Assisted Verification + Human Admin Approval (`/admin`)
1. **Navigate to `Admin Review` (`/admin`)**:
   - Show that while connected as a non-admin (`sari-organik.testnet`), the **Approve / Reject** buttons are locked and backed by `assert_admin()` (`ERR_NOT_ADMIN`) in the Rust contract.
   - Click **`Switch to admin.foodsort.testnet`** in the top-right status card.
2. **Run AI Verification Assistant (`Prompt #6.5`)**:
   - On pending Action `#103` (`COMPOST` by `budi-kompos.testnet`) or `#104` (`RESIDUAL` by `warung-hijau.testnet`), click **"Run AI Evidence Analysis"**.
   - Explain the core governance distinction:
     - **AI assists verification**: `/api/ai/verify` evaluates the untrusted description, category, and image and returns `recommendation` (`APPROVE` / `REJECT` / `NEEDS_REVIEW`), `confidence_score`, `category_assessment`, `evidence_relevance`, `description_consistency`, `risk_flags`, and `reasoning` with `requires_human_approval: true`.
     - **AI has zero wallet or private-key access** and never certifies food safety.
3. **Explicit Human Admin Confirmation & Separate Audit Log**:
   - Click **Approve (`verify_action`)** (or **Reject** / **Request Additional Evidence**).
   - Show the **Confirm On-Chain Human Admin Decision** modal comparing the prior AI recommendation against the human admin's decision.
   - Point out the **Separate AI Recommendations & Human Admin Audit Log** section (`POST /api/ai/audit-log`), which logs `AI_RECOMMENDATION` and `HUMAN_ADMIN_DECISION` as distinct records.

---

### 1:55 – 2:30 | Steps 5 & 6: Donor Contribution & Donation NFT Minting (`/actions/101` & `/donor`)
1. **Navigate to `Explore Actions` (`/actions`) -> Action `#101` (`/actions/101`)**:
   - Note that only `Verified` actions can receive donations (`Pending` and `Rejected` actions are blocked by the contract with `ERR_ACTION_NOT_VERIFIED`).
   - Point out the **Original Action Contributor** card (`sari-organik.testnet`).
   - In the **Support Verified Action & Mint NFT** panel, select `1 NEAR` or `2.5 NEAR`.
   - Highlight how `donate_and_mint(action_id)` works on-chain:
     - Reads `contributor_id` strictly from the verified action in contract storage (never from frontend parameters).
     - Deducts exact NEP-171 storage byte cost (`storage_cost_yocto`) from the attached deposit using checked `u128` integer arithmetic.
     - Credits `net_treasury_amount_yocto` to `treasury_balance_yocto` (`HELD_IN_TREASURY`).
     - Mints NEP-171 certificate `foodsort-donation-{id}` to the donor.
2. **Navigate to `Donor Hub` (`/donor`)**:
   - Connect preset `green-patron.testnet` to show the donor's owned NEP-171 certificates (`nft_tokens_for_owner`) and donation ledger.
   - Switch to `empty-wallet.testnet` to demonstrate strict portfolio isolation (an unconnected or empty wallet never displays another user's private NFT gallery).

---

### 2:30 – 3:00 | Step 7: Walletless Public Verification & 3-Party Provenance (`/verify/foodsort-donation-2`)
1. **Navigate to `/verify/foodsort-donation-2` (or click `foodsort-donation-2` on `/verify`)**:
   - Click the **Disconnect Wallet** button in the navbar to show that public verification works **100% without a wallet**.
2. **Highlight the Three-Party Cryptographic Provenance Card**:
   - Point out the three distinct accounts returned by `get_nft_verification_proof("foodsort-donation-2")`:
     1. **1. Original Contributor (`sari-organik.testnet`)** — Performed the physical food-sorting action (`Action #101`).
     2. **2. Original Donor (`eco-dao-member.testnet`)** — Funded the donation and originally minted the NFT.
     3. **3. Current NFT Owner (`impact-collector.testnet`)** — Current NEP-171 holder after secondary transfer (`Transferred After Mint (Secondary Holder)`).
3. **Closing Statement**:
   - *"With FoodSort on NEAR, AI assists verification, human admins make the final verification decision, the smart contract enforces authorization and treasury accounting on-chain, and every Donation NFT permanently preserves original contributor attribution."*
