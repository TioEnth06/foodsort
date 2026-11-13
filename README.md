# FoodSort

> **Sort food. Support change. Collect impact.**

Community food-impact platform: verified real-world sorting actions, transparent NEAR donations, and attribution-preserving Donation NFTs.

| | |
| --- | --- |
| Repo | https://github.com/TioEnth06/foodsort.git |
| Live app | https://foodsort.vercel.app |
| Demo video | `[INSERT DEMO VIDEO URL]` |
| Contract | `foodsort-app-86051.testnet` — [docs/TESTNET.md](docs/TESTNET.md) |

---

## Core flow

```text
Contributor → Evidence (IPFS) → AI assist → Human admin → On-chain verify
  → Donor donate_and_mint → Donation NFT → Public /verify
```

**Rules that never bend**

1. **AI assists; human decides; contract enforces** — `/api/ai/verify` has no keys/wallet; `assert_admin()` is the source of truth.
2. **Contributor ≠ original donor ≠ current owner** — `donate_and_mint` reads `contributor_id` from stored action state, never from frontend args.
3. **Held ≠ distributed** — net donations stay `HELD_IN_TREASURY`; MVP never claims payouts.

---

## Layout

```text
foodsort/
├── README.md / HACKATHON.md / AGENTS.md
├── src/                        # Next.js app (Vercel / local root)
├── frontend/                   # Mirror package (same app sources)
├── contract/                   # Rust NEAR contract (NEP-171/177/181)
├── scripts/                    # release tests + testnet deploy
└── docs/                       # product, architecture, demo, submission
```

Doc index: [docs/README.md](docs/README.md).

### Routes

| Route | Who | Purpose |
| --- | --- | --- |
| `/` | Public | Live treasury (held vs distributed 0) + featured actions |
| `/actions` | Public | Verified / Pending / Rejected directory |
| `/actions/[id]` | Public / donor | Evidence + `donate_and_mint` |
| `/contribute` | Contributor | Pinata upload + `submit_action` |
| `/admin` | Admin | AI assist + human approve/reject |
| `/donor` | Donor | Owned NFTs + donation ledger |
| `/verify`, `/verify/[tokenId]` | Public | Walletless NFT provenance |

---

## Environment

Copy `.env.example` → `.env.local` (repo root):

```bash
NEXT_PUBLIC_NEAR_NETWORK=testnet
NEXT_PUBLIC_CONTRACT_ID=foodsort-app-86051.testnet
NEXT_PUBLIC_NEAR_RPC_URL=https://rpc.testnet.near.org
NEXT_PUBLIC_NEAR_EXPLORER_URL=https://testnet.nearblocks.io
NEXT_PUBLIC_NEAR_WALLET_URL=https://testnet.mynearwallet.com

PINATA_JWT=
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs

AI_PROVIDER=gemini
AI_MODEL=gemini-3.6-flash
GEMINI_API_KEY=
# Optional: AI_PROVIDER=openai + OPENAI_API_KEY=
```

- Missing Pinata / AI keys → honest `503`; manual admin review still works.
- RPC failure → Example-data preview only for reads; writes are never faked.

---

## Setup, test, deploy

```bash
npm install
npm run dev          # http://localhost:3000

node scripts/run-release-tests.mjs
npm run lint
npm run typecheck
npm run build

CONTRACT_ID=foodsort-app-86051.testnet \
ADMIN_ID=foodsort-app-86051.testnet \
bash scripts/deploy-near-testnet.sh
```

Judge script: [docs/DEMO-RUNBOOK.md](docs/DEMO-RUNBOOK.md) · Submission: [docs/SUBMISSION.md](docs/SUBMISSION.md)
