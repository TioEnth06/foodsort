# Live Demo Runbook — FoodSort (NEAR Testnet)

> **Site**: https://foodsort.vercel.app  
> **Contract**: `foodsort-app-86051.testnet`  
> **Admin**: `foodsort-app-86051.testnet`  
> **Explorer**: https://testnet.nearblocks.io/address/foodsort-app-86051.testnet  
> **Flow**: Contributor → Evidence → AI assist → Human admin → Donate → NFT → Public verify

---

## Pre-demo checklist (1 minute)

1. Open https://foodsort.vercel.app
2. Navbar badge must say **NEAR testnet** (not Example data)
3. MyNearWallet set to **Testnet**
4. Vercel env live: `PINATA_JWT`, `GEMINI_API_KEY`, `AI_PROVIDER=gemini`
5. Optional soft-connect presets (portfolio preview only):
   - Contributor/donor sample: `foodsort-contrib-6146.testnet`
   - Admin: `foodsort-app-86051.testnet`
6. **Signing real txs** still needs MyNearWallet (or CLI). Soft-connect alone cannot sign.

### Current seeded state (approx.)

- Verified actions: `#1` COMPOST, `#2` FOOD_RESCUE, `#3` RESIDUAL
- Rejected: `#4` (shows reject path)
- NFTs: `foodsort-donation-1`, `foodsort-donation-2`
- Best donate target for live mint: **`/actions/2`** (verified, open for support)

---

## 3-minute judge walkthrough

### 0:00–0:30 — Home (`/`)

- Pitch: *Sort food. Support change. Keep the credit honest.*
- Point to **Live treasury**: funds **held**, distributed **0 NEAR**
- Emphasize: never claim funds are distributed in this MVP

### 0:30–1:10 — Contribute (`/contribute`)

1. Connect MyNearWallet (Testnet) as your contributor account
2. Category: `COMPOST` / `FOOD_RESCUE` / `RESIDUAL`
3. Upload evidence photo → IPFS via Pinata
4. Submit → on-chain `submit_action` → status **Pending**

### 1:10–1:55 — Admin + AI (`/admin`)

1. Show non-admin cannot approve (contract `assert_admin`)
2. Connect/sign as **`foodsort-app-86051.testnet`**
3. Click **Run AI Evidence Analysis** on a pending action
   - AI returns recommendation + `requires_human_approval: true`
   - AI has **no wallet / no keys**
4. Human clicks Approve → `verify_action` (or Reject → `reject_action`)

### 1:55–2:30 — Donate + mint (`/actions/2`)

1. Open a **Verified** action (prefer `#2`)
2. Connect donor wallet (can be same or different testnet account)
3. Donate ≥ ~0.12 NEAR → `donate_and_mint`
4. Show minted certificate id `foodsort-donation-N`
5. Optional: open `/donor` with that wallet to see owned certificates

### 2:30–3:00 — Public verify (`/verify/foodsort-donation-1`)

1. Disconnect wallet — verification stays public
2. Show three roles stay distinct:
   - Original contributor
   - Original donor
   - Current owner
3. Close: *AI assists, humans decide, NEAR records attribution forever.*

---

## If something breaks mid-demo

| Issue | Fallback |
| --- | --- |
| AI API error | Continue with manual admin review (allowed) |
| Upload fails | Use an existing `https://...` image URL if form allows, or show prior action |
| Wallet reject | Soft-connect + show existing verified action `#1`/`#2` and `/verify` |
| Need fresh pending action | Submit one quickly on `/contribute`, or use CLI seed |

---

## Useful links

- App: https://foodsort.vercel.app
- Verify example: https://foodsort.vercel.app/verify/foodsort-donation-1
- Action to donate: https://foodsort.vercel.app/actions/2
- Testnet notes: [TESTNET.md](./TESTNET.md)
- Docs index: [README.md](./README.md)
