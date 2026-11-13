# NEAR Hackathon 2026 — FoodSort Official Specification & Positioning

## 1. Final Project Positioning

- **Product**: FoodSort
- **Tagline**: *Sort food. Support change. Collect impact.*
- **One-line Description**: FoodSort is a community-powered food impact platform that connects verified real-world food actions with transparent on-chain donations and Donation NFTs.
- **Repository**: [https://github.com/TioEnth06/foodsort.git](https://github.com/TioEnth06/foodsort.git)
- **Live Demo URL**: [https://foodsort.vercel.app](https://foodsort.vercel.app)
- **Demo Video URL**: `[INSERT DEMO VIDEO URL]`
- **NEAR Testnet Contract Address**: `[INSERT ACTUAL CONTRACT ADDRESS]` (configured default in code: `foodsort.testnet`)

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

### Important Distinction
- **AI assists verification** by analyzing untrusted activity descriptions, submitted categories (`COMPOST`, `FOOD_RESCUE`, `RESIDUAL`), and evidence images off-chain (`POST /api/ai/verify`) and returning a structured recommendation (`APPROVE`, `REJECT`, `NEEDS_REVIEW`) with `requires_human_approval: true`.
- **Human admin makes the final verification decision** via an explicit confirmation step on `/admin`, and can follow or override the AI recommendation. AI recommendations and human admin decisions are logged separately (`POST /api/ai/audit-log`).
- **The smart contract enforces authorization and records the verified state on-chain** via `verify_action(action_id)` and `reject_action(action_id, reason)` guarded by `assert_admin()`.

---

## 3. Non-Negotiable Product & Security Guardrails

1. **Contributor Attribution Integrity**
   - Contributors submit real-world food-sorting actions (`COMPOST`, `FOOD_RESCUE`, `RESIDUAL`) with off-chain IPFS evidence (`ipfs://...` via Pinata).
   - When a donor supports a verified action via `donate_and_mint(action_id)`, the minted Donation NFT permanently records the original `contributor_id` read directly from the verified action in contract storage (`self.actions.get(&action_id)`).
   - The contract never accepts contributor attribution from frontend parameters during donation.
   - The donor is never presented as the person who performed the physical food-sorting contribution.

2. **Transparent Contract Treasury Accounting (`Funds Held` vs. `Funds Distributed`)**
   - Donors attach native NEAR to support verified actions.
   - The smart contract strictly separates NEP-171 / state storage byte costs (`storage_cost_yocto`) from the net environmental patronage amount (`net_treasury_amount_yocto`) using checked `u128` arithmetic.
   - All net donation funds remain transparently held in the contract treasury (`treasury_status: "HELD_IN_TREASURY"`, `funds_distributed_yocto: "0"`).
   - **Truthfulness Rule**: Neither the smart contract nor the frontend ever claims or marks that donation funds have been distributed when no on-chain disbursement transaction exists.

3. **Distinguishing Roles in NFT Provenance (`Contributor ≠ Original Donor ≠ Current NFT Owner`)**
   - Every Donation NFT verification view (`/verify` and `/verify/[tokenId]`) clearly distinguishes three distinct on-chain accounts:
     1. **Original Contributor (`contributor_id`)**: Performed and documented the food-sorting action.
     2. **Original Patron / Donor (`donor_id`)**: Contributed native NEAR to the treasury and received the initial Donation NFT.
     3. **Current NFT Owner (`owner_id`)**: Current NEP-171 holder of the NFT (which updates if transferred via `nft_transfer` without altering `original_donor_id` or `original_contributor_id`).

4. **Strict MVP Boundaries (Anti-Bloat Policy)**
   - FoodSort intentionally does **not** include:
     - Secondary NFT marketplace or bidding engine
     - DAO voting or governance token
     - Autonomous AI on-chain auto-execution
     - NEP-141 fungible reward token
     - Physical fleet/logistics routing system
