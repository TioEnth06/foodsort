# NEAR Hackathon 2026 — FoodSort

## Positioning

| | |
| --- | --- |
| Product | FoodSort |
| Tagline | *Sort food. Support change. Collect impact.* |
| One-liner | Community food-impact platform linking verified sorting actions to transparent NEAR donations and Donation NFTs |
| Repo | https://github.com/TioEnth06/foodsort.git |
| Live demo | https://foodsort.vercel.app |
| Demo video | `[INSERT DEMO VIDEO URL]` |
| Contract | `foodsort-app-86051.testnet` — [docs/TESTNET.md](docs/TESTNET.md) |

## End-to-end flow

```text
Contributor → Food action + evidence → AI-assisted review → Human admin
  → On-chain verify → Donor contribution → Donation NFT → Public verify
```

- **AI assists** via `POST /api/ai/verify` (`requires_human_approval: true`) — no keys, no txs.
- **Human admin decides** on `/admin` (can override AI); decisions logged separately from AI via `/api/ai/audit-log`.
- **Contract enforces** `verify_action` / `reject_action` with `assert_admin()`.

## Guardrails

1. **Attribution** — NFT `original_contributor_id` comes from on-chain `FoodAction`, never frontend args; donor is never shown as the sorter.
2. **Treasury honesty** — storage cost vs net donation split with checked `u128`; status stays `HELD_IN_TREASURY` / distributed `0`.
3. **Three roles** — original contributor ≠ original donor ≠ current NFT owner on `/verify`.
4. **Out of MVP** — no marketplace, DAO, AI auto-signing, NEP-141 rewards, or logistics routing.

## Judge links

- Walkthrough: [docs/DEMO-RUNBOOK.md](docs/DEMO-RUNBOOK.md)
- Submission package: [docs/SUBMISSION.md](docs/SUBMISSION.md)
- Docs index: [docs/README.md](docs/README.md)
