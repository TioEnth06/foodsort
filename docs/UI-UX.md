# UI/UX Design Specification — FoodSort

## 1. Brand Identity & Sustainability Palette

FoodSort uses a refined, organic sustainability aesthetic designed for high legibility, mobile-first responsiveness, and transparent cryptographic provenance.

### Color Palette
| Token | Hex | Usage |
| :--- | :--- | :--- |
| **Forest Green (Primary)** | `#1B4332` | Primary CTAs, main navigation badges, verified status headers, treasury cards |
| **Leaf Green (Accent)** | `#40916C` | Interactive states, secondary badges, progress bars, category pills |
| **Sage Mist (Surface Accent)** | `#D8F3DC` | Subtle badge fills, verified highlight borders, hover states |
| **Warm Cream (Background)** | `#FAF8F5` | Primary page canvas and warm elevated card surfaces |
| **Charcoal (Foreground)** | `#1C1F1E` | High-contrast body copy, headings, and tabular numbers |
| **Amber Ochre (Pending/Review)** | `#D97706` | `Pending` verification status, `NEEDS_REVIEW` AI badges, Demo Mode banner |
| **Crimson Earth (Rejected/Risk)** | `#B91C1C` | `Rejected` status, AI risk flags, transaction error alerts |

---

## 2. Global Navigation & Transparency Banners

1. **Top Navigation Bar**:
   - Brand emblem (`FoodSort` + `NEAR Testnet` badge)
   - Links to all 7 core routes:
     1. `Overview` (`/`)
     2. `Explore Actions` (`/actions`)
     3. `Contribute` (`/contribute`)
     4. `Donor Hub` (`/donor`)
     5. `Admin Review` (`/admin`)
     6. `NFT Gallery & Verify` (`/verify`)
   - Wallet connection status button (`Connect NEAR Testnet` / connected `accountId` + disconnect action).
2. **Data Source / Demo Banner**:
   - Whenever the user views sample/demo actions (before contract deployment or when switching to Demo Preview mode), a persistent top banner clearly states:
     `DEMO DATA PREVIEW — Viewing clearly labeled demo records. No fake transactions are ever simulated.`
3. **Treasury Honesty Notice**:
   - Every treasury widget and donation receipt explicitly displays:
     `Treasury Status: HELD_IN_TREASURY — Net donations are held transparently inside the FoodSort smart contract treasury and have not been distributed.`

---

## 3. Page-by-Page Specifications

1. **Homepage (`/`)**: Hero section, Live Treasury State card, 3-Actor Architecture explanation, 3 standardized sorting streams (`COMPOST`, `FOOD_RESCUE`, `RESIDUAL`), and Featured Verified Actions.
2. **Actions Listing (`/actions`)**: Status tabs (`All`, `Verified`, `Pending`, `Rejected`), category pills (`COMPOST`, `FOOD_RESCUE`, `RESIDUAL`), and search bar.
3. **Action Detail & Donation (`/actions/[id]`)**: Full IPFS evidence image, immutable contributor attribution block, verification audit block, and `donate_and_mint()` panel with storage vs. net treasury fee breakdown.
4. **Contribution Form (`/contribute`)**: 2-step Pinata IPFS upload (`/api/upload`) + NEAR Testnet `submit_action()` call.
5. **Donor Dashboard (`/donor`)**: Connected donor stats, Owned NEP-171 Patronage Certificates grid, and On-Chain Donation Ledger table.
6. **Admin Dashboard with AI Verification Assistant (`/admin`)**: Contract access control banner, Pending Actions Queue, isolated AI Verification Panel (`APPROVE` / `REJECT` / `NEEDS_REVIEW`, confidence score, category assessment, evidence relevance, description consistency, risk flags, reasoning), explicit human confirmation modal, and separate AI vs. Human Audit Log.
7. **NFT Gallery & Public Verification Page (`/verify`)**: Walletless public RPC access, Token ID search bar, 3-Party Cryptographic Provenance card (Original Contributor vs. Original Donor vs. Current NFT Owner), and full On-Chain NFT Gallery.
