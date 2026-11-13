# Test plan & security notes — FoodSort

## 1. Environment

| Item | Value |
| --- | --- |
| Network | NEAR Testnet |
| RPC | `https://rpc.testnet.near.org` (or FastNear) |
| Contract / admin | `foodsort-app-86051.testnet` |
| Seeded contributor / donor | `foodsort-contrib-6146.testnet` |
| App | Next.js 15.5 (root `src/`), React 19, TypeScript 5.8 |
| Contract SDK | near-sdk / near-contract-standards `5.5.0` |
| Runner | `node scripts/run-release-tests.mjs` |

### Accounts used in live / demo

| Role | Account |
| --- | --- |
| Admin | `foodsort-app-86051.testnet` |
| Contributor / donor (seeded) | `foodsort-contrib-6146.testnet` |
| Extra donor (optional) | Any funded testnet wallet |

Example-data fixtures (`sari-organik.testnet`, `green-patron.testnet`, …) appear only in offline preview badges — not on the live contract.

### Env prerequisites

```bash
NEXT_PUBLIC_NEAR_NETWORK=testnet
NEXT_PUBLIC_CONTRACT_ID=foodsort-app-86051.testnet
NEXT_PUBLIC_NEAR_RPC_URL=https://rpc.testnet.near.org
NEXT_PUBLIC_NEAR_EXPLORER_URL=https://testnet.nearblocks.io
PINATA_JWT=
AI_PROVIDER=gemini
GEMINI_API_KEY=          # or OPENAI_API_KEY with AI_PROVIDER=openai
```

---

## 2. Test matrix (expected vs actual)

### Contributor

| ID | Scenario | Expected | Status |
| --- | --- | --- | --- |
| CF-01 | Valid submit (all categories) | `Pending`, sequential `action_id`, `contributor_id = predecessor` | PASS |
| CF-02 | Short description | Rejected (`ERR_DESCRIPTION_TOO_SHORT` / UI validation) | PASS |
| CF-03 | Invalid category | `ERR_INVALID_CATEGORY` | PASS |
| CF-04 | Bad evidence URI / empty file | Upload or contract validation error | PASS |
| CF-05 | Bad MIME / >10 MB | HTTP 400 from `/api/upload` | PASS |

### AI assist

| ID | Scenario | Expected | Status |
| --- | --- | --- | --- |
| AI-01 | Strong matching evidence | `APPROVE`, `requires_human_approval: true` | PASS |
| AI-02 | Weak / unrelated image | `REJECT` or `NEEDS_REVIEW` + risk flags | PASS |
| AI-03 | Category/evidence mismatch | `NEEDS_REVIEW` / `REJECT`, `matches_submitted: false` | PASS |
| AI-04 | Keys missing / upstream down | `503 AI_SERVICE_UNAVAILABLE`, manual review OK | PASS |
| AI-05 | Isolation | No wallet/keys; cannot call `verify_action` | PASS |

### Admin

| ID | Scenario | Expected | Status |
| --- | --- | --- | --- |
| ADM-01 | Admin verifies pending | `Pending → Verified` | PASS |
| ADM-02 | Non-admin verify | `ERR_NOT_ADMIN` | PASS |
| ADM-03 | Re-verify verified | `ERR_ACTION_NOT_PENDING` | PASS |
| ADM-04 | Verify rejected | `ERR_ACTION_NOT_PENDING` | PASS |
| ADM-05 | Missing action | `ERR_ACTION_NOT_FOUND` | PASS |

### Donation / accounting

| ID | Scenario | Expected | Status |
| --- | --- | --- | --- |
| DON-01 | Donate to verified | Record + storage/net split + NFT mint | PASS |
| DON-02/03 | Pending / rejected | `ERR_ACTION_NOT_VERIFIED` | PASS |
| DON-04 | Missing action | `ERR_ACTION_NOT_FOUND` | PASS |
| DON-05 | Zero deposit | `ERR_ZERO_DEPOSIT` | PASS |
| DON-06 | `parseNearToYocto` | BigInt string math, no float | PASS |

### NFT / public / treasury

| ID | Scenario | Expected | Status |
| --- | --- | --- | --- |
| NFT-01 | Metadata `extra` fields | Contributor, donor, net, evidence, treasury status | PASS |
| NFT-02 | After `nft_transfer` | Contributor ≠ donor ≠ current owner | PASS |
| PUB-01 | `/verify` walletless | Full proof without wallet | PASS |
| GAL-01 | `/donor` isolation | Only connected wallet’s NFTs | PASS |
| TRS-01 | Held vs distributed | Held shown; distributed `0` / `HELD_IN_TREASURY` | PASS |

---

## 3. Security summary

1. Secrets stay server-side (`PINATA_JWT`, AI keys); `.env*` gitignored.
2. `assert_admin` on `verify_action` / `reject_action`.
3. Checked `u128` in contract; BigInt parsing in UI.
4. Contributor attribution only from stored `FoodAction`.
5. No withdrawal / payout methods in MVP.

---

## 4. Known MVP limits

1. AI audit log is in-memory per serverless instance; on-chain `verified_by` / rejection reason remain permanent.
2. No disbursement path by design (`funds_distributed_yocto = 0`).
3. Prefer `scripts/run-release-tests.mjs` + contract unit tests when the local Rust toolchain lags crates.io edition requirements.
