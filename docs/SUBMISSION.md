# NEAR Hackathon 2026 — FoodSort submission

Copy-paste package aligned with the live deployment. Fill remaining `[INSERT …]` fields before portal submit.

---

## 1. Identity

| Field | Value |
| --- | --- |
| Product | FoodSort |
| Tagline | Sort food. Support change. Collect impact. |
| One-liner | Community food-impact platform that connects verified real-world food actions with transparent on-chain donations and Donation NFTs |
| Track | Sustainability, on-chain provenance & AI-assisted impact verification on NEAR |
| Repo | https://github.com/TioEnth06/foodsort.git |
| Live app | https://foodsort.vercel.app |
| Demo video | `[INSERT DEMO VIDEO URL]` |
| Network | NEAR Testnet |
| Contract | `foodsort-app-86051.testnet` |
| Deploy tx | https://testnet.nearblocks.io/txns/Ggp3QYyBLZadbKsBpa1LrwyF8oeYyPLjbHyRMYPKKpQP |
| Sample verify page | https://foodsort.vercel.app/verify/foodsort-donation-1 |
| Sample donate target | https://foodsort.vercel.app/actions/2 |
| Sample submit/verify tx | `[INSERT SUBMIT OR VERIFY TX]` |
| Sample donate_and_mint tx | `[INSERT DONATE_AND_MINT TX]` |

Details: [TESTNET.md](./TESTNET.md) · Judge script: [DEMO-RUNBOOK.md](./DEMO-RUNBOOK.md)

---

## 2. Flow (short)

```text
Contributor → Evidence → AI assist → Human admin → On-chain verify
  → donate_and_mint → Donation NFT → Public /verify
```

1. **Contribute** (`/contribute`) — category + photo → Pinata → `submit_action` → `Pending`
2. **AI assist** (`/admin`) — `POST /api/ai/verify` returns recommendation + `requires_human_approval: true` (no keys)
3. **Human + chain** — Approve/Reject with confirmation modal → `verify_action` / `reject_action` (`assert_admin`)
4. **Donate** (`/actions/[id]`) — verified only → storage vs net split → mint `foodsort-donation-{id}` with locked contributor
5. **Verify** (`/verify/[tokenId]`) — walletless proof of contributor / donor / current owner + `HELD_IN_TREASURY`

---

## 3. Portal description (copy-paste)

### Problem
Grassroots food sorting (compost diversion, surplus rescue, residual separation) rarely gets honest patronage: evidence is hard to verify, impact NFTs often credit the payer instead of the sorter, platforms imply payouts that never happened, and giving AI signing keys is unsafe.

### Solution
**FoodSort** on NEAR: contributors pin evidence to IPFS and register actions on testnet; an advisory AI helps admins triage (`requires_human_approval: true`) while humans keep signing authority; `donate_and_mint` embeds `original_contributor_id` from contract state into NEP-171/177 certificates; treasury UI and contract both show funds **held**, not distributed; anyone can open `/verify/[tokenId]` without a wallet.

---

## 4. Stack map

| Layer | Tech | Paths |
| --- | --- | --- |
| Contract | Rust near-sdk 5.5 + NEP-171/177/181 | `contract/src/` |
| App | Next.js 15.5 App Router, React 19, Tailwind v4, Motion | `src/` (synced to `frontend/` for Vercel) |
| NEAR client | JSON-RPC views + MyNearWallet | `src/lib/near/` |
| IPFS | Pinata via `/api/upload` | `src/app/api/upload/` |
| AI | Gemini (default) / OpenAI vision + audit log | `src/app/api/ai/` |
| Release | Invariant suite + deploy script | `scripts/`, `contract/tests/` |

---

## 5. Live vs example data

- **Production default**: live contract `foodsort-app-86051.testnet` (3 verified, 1 rejected, 2 NFTs, treasury held, distributed 0).
- **Example-data fallback**: only when RPC fails or preview is forced — clearly badged; never fakes write txs or AI output.
- **AI missing keys**: `503` + manual review remains available.
