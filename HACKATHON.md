# NEAR Hackathon 2026 — FoodSort Official Specification

## Track & Theme
**Sustainability, On-Chain Provenance & Verifiable Patronage on NEAR Protocol**

FoodSort is an environmental action verification and patronage platform built on **NEAR Protocol (Testnet)** for the NEAR Hackathon 2026. It connects grassroots food-sorting contributors, human verifiers (assisted by an advisory-only off-chain AI verification assistant), and environmental patrons/donors using native NEAR and **NEP-171 / NEP-177 Non-Fungible Tokens**.

---

## Core Hackathon Rules & Non-Negotiable Guardrails

1. **Contributor Attribution Integrity**
   - Contributors submit real-world food-sorting actions (`COMPOST`, `FOOD_RESCUE`, `RESIDUAL`) with off-chain IPFS evidence (`ipfs://...` via Pinata).
   - When a donor supports a verified action via `donate_and_mint`, the minted Donation NFT **must** permanently record the original `contributor_id` read directly from the verified action in contract storage.
   - The contract must **never** accept contributor attribution from frontend parameters during donation.
   - The donor must **never** be presented as the person who performed the physical food-sorting contribution.

2. **Transparent Contract Treasury Accounting**
   - Donors attach native NEAR to support verified actions.
   - The smart contract strictly separates NEP-171 / state storage byte costs (`storage_cost_yocto`) from the net environmental patronage amount (`net_treasury_amount_yocto`) using checked arithmetic.
   - All net donation funds remain transparently held in the contract treasury (`treasury_status: "HELD_IN_TREASURY"`).
   - **Truthfulness Rule**: Neither the smart contract nor the frontend may ever claim or mark that donation funds have been distributed when they remain held in the contract treasury.

3. **Distinguishing Roles in NFT Provenance**
   - Every Donation NFT verification view must clearly distinguish three distinct on-chain accounts:
     1. **Original Contributor (`contributor_id`)**: Performed and documented the food-sorting action.
     2. **Original Patron / Donor (`donor_id`)**: Contributed native NEAR to the treasury and received the initial Donation NFT.
     3. **Current NFT Owner (`owner_id`)**: Current NEP-171 holder of the NFT (which may change if transferred via `nft_transfer`).

4. **Advisory-Only AI Verification Assistant (Human-in-the-Loop)**
   - The Admin Dashboard includes an isolated AI Verification Assistant that evaluates submitted evidence images, food categories (`COMPOST`, `FOOD_RESCUE`, `RESIDUAL`), and descriptions.
   - AI has **zero access** to admin wallets, private keys, or contract signing capabilities.
   - AI never claims to certify food safety or independently prove physical activity occurred solely from an image.
   - Human admin retains 100% final authority and must explicitly confirm before signing `verify_action` or `reject_action` on-chain.

5. **Strict MVP Boundaries (Anti-Bloat Policy)**
   - Do **not** build:
     - Secondary NFT marketplace or bidding engine
     - DAO voting or governance token
     - Autonomous AI on-chain auto-execution
     - NEP-141 fungible reward token
     - Physical fleet/logistics routing system
