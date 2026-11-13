# Product requirements — FoodSort

Live deployment notes: [TESTNET.md](./TESTNET.md) · Judge script: [DEMO-RUNBOOK.md](./DEMO-RUNBOOK.md).

## 1. Summary

**FoodSort** verifies real-world food-sorting actions (`COMPOST`, `FOOD_RESCUE`, `RESIDUAL`) on **NEAR**, with advisory AI triage, human admin approval, transparent native-NEAR patronage, and **NEP-171 Donation NFTs** that keep contributor attribution honest.

---

## 2. Problem Statement

1. **Unverified Sustainability Claims**: Grassroots food waste sorting and surplus rescue efforts lack verifiable, tamper-resistant proof of execution.
2. **Broken Attribution in Impact Patronage**: In many Web3 impact platforms, when a donor mints an impact NFT, metadata conflates the financial patron with the person who performed the physical environmental labor.
3. **Opaque Fund Claims**: Platforms frequently imply that donated funds have already been distributed to field workers when funds are actually still sitting in a treasury or escrow contract.
4. **Slow Manual Review Bottlenecks**: Human verifiers reviewing evidence photos and descriptions need structured triage assistance without surrendering on-chain authority or private keys to automated bots.

---

## 3. Core Product Rules

1. **Contributors** submit food-sorting actions with off-chain IPFS evidence URIs.
2. **Admins** verify or reject pending actions on-chain.
3. **AI Verification Assistant** provides structured, advisory-only evidence triage (`APPROVE`, `REJECT`, `NEEDS_REVIEW`) without wallet access or food-safety certification claims.
4. **Donors** support only `Verified` actions using native NEAR (`donate_and_mint`).
5. **Donors receive NEP-171 Donation NFTs** whose NEP-177 metadata permanently preserves the original `contributor_id` read from on-chain verified action state.
6. **Donation funds are held transparently in the contract treasury** (`HELD_IN_TREASURY`), separated from NEP-171 storage costs.
7. **Strict Honesty**: The application never claims that funds have been distributed while they remain held in the contract treasury.

---

## 4. User Journeys

### 4.1 Contributor Journey
1. Contributor navigates to `/contribute` and connects their NEAR Testnet wallet.
2. Contributor selects a standardized **Food Category**:
   - `COMPOST` (Compostable organic food scraps diverted from landfill)
   - `FOOD_RESCUE` (Edible surplus food sorted and recovered for community consumption)
   - `RESIDUAL` (Contaminated/spoiled residual waste separated to prevent batch contamination)
3. Contributor selects an **Action Type** (e.g., `"Household Organic Separation"`, `"Market Surplus Sorting"`, `"Commercial Kitchen Batch Audit"`), writes a concrete description, and selects an evidence photo.
4. The frontend uploads the evidence image via `/api/upload` to Pinata IPFS and receives an immutable `ipfs://<CID>` URI.
5. Contributor signs the `submit_action` transaction on NEAR Testnet.
6. The smart contract stores the `FoodAction` with `status: Pending`, sets `contributor_id = env::predecessor_account_id()`, and returns the new `action_id`.
7. The UI displays the confirmed `action_id`, pending verification status, and NEAR Testnet Explorer transaction link.

### 4.2 Admin Journey (With AI Verification Assistant)
1. Authorized admin navigates to `/admin` and connects the admin NEAR Testnet wallet matching the contract's `admin_id`.
2. Admin inspects the queue of `Pending` actions loaded directly from the contract (`get_actions`), viewing contributor account ID, category, action type, description, and IPFS evidence image.
3. Admin optionally clicks **"Run AI Evidence Analysis"** on an action card:
   - The server-side endpoint (`POST /api/ai/verify`) analyzes the untrusted description, submitted category (`COMPOST`, `FOOD_RESCUE`, `RESIDUAL`), and evidence image.
   - The AI Analysis Panel displays the structured result: `recommendation` (`APPROVE`, `REJECT`, `NEEDS_REVIEW`), `confidence_score`, `category_assessment`, `evidence_relevance`, `description_consistency`, `risk_flags`, and `reasoning`, along with a mandatory disclaimer that AI does not certify food safety or replace human verification.
   - The AI recommendation is recorded in the server audit log (`POST /api/ai/audit-log`).
4. Admin chooses a human action:
   - **Approve** (`verify_action`)
   - **Reject** (`reject_action` with reason)
   - **Request Additional Evidence** (rejects or logs structured evidence request so contributor can submit clearer proof)
5. Before any blockchain call is made, an **Explicit Human Confirmation Modal** shows the AI recommendation alongside the admin's decision (highlighting if the admin is overriding the AI).
6. Upon confirmation, the admin wallet signs `verify_action` or `reject_action` on NEAR Testnet. The contract verifies `predecessor_account_id() == admin_id` as the single source of truth, updates the action state, and the UI logs the final human decision separately.

### 4.3 Donor Journey
1. Donor browses `/actions` or `/actions/[id]`. Only actions with `status == Verified` are eligible for patronage.
2. Donor inspects the verified evidence image, verifier timestamp, and the original contributor account (`contributor_id`).
3. Donor selects or enters a native NEAR donation amount (must cover minimum net donation + NFT storage bytes), connects their NEAR Testnet wallet, and clicks **"Donate & Mint Patronage NFT"**.
4. Wallet signs `donate_and_mint({ action_id })` with the attached NEAR deposit.
5. The contract:
   - Verifies the action is `Verified`.
   - Reads `contributor_id` from the stored `FoodAction`.
   - Measures exact storage byte delta and deducts `storage_cost_yocto` from the attached deposit using checked arithmetic.
   - Credits `net_treasury_amount_yocto` to `treasury_balance_yocto` with status `"HELD_IN_TREASURY"`.
   - Mints NEP-171 token `foodsort-donation-{donation_id}` to `donor_id` with full NEP-177 metadata and structured `extra` JSON.
6. Donor views the transaction outcome, NEAR Explorer link, and newly minted NFT in `/donor` and `/verify?token=foodsort-donation-{donation_id}`.

### 4.4 Public Verifier / Auditor Journey
1. Any visitor (with or without a NEAR wallet) visits `/verify`.
2. Visitor browses all minted Donation NFTs or looks up a specific `token_id`.
3. Visitor inspects on-chain proof directly from NEAR Testnet RPC:
   - **Original Contributor (`contributor_id`)**: Performed the food-sorting work.
   - **Original Donor (`donor_id`)**: Funded the donation and minted the NFT.
   - **Current NFT Owner (`owner_id`)**: Current holder of the NEP-171 token.
   - **Financial Breakdown**: Gross attached NEAR, storage deposit reserved, net donation held in contract treasury (`HELD_IN_TREASURY`).
