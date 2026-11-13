# MVP scope — FoodSort (frozen for release)

## 1. In scope

### Docs
- Root: `README.md`, `HACKATHON.md`, `AGENTS.md`
- `docs/`: PRD, SCOPE, ARCHITECTURE, SMART-CONTRACT, UI-UX, TESTING, TESTNET, DEMO-RUNBOOK, SUBMISSION (+ [README index](./README.md))

### Contract (`contract/`)
- Rust near-sdk + NEP-171 / 177 / 181
- `submit_action` (`COMPOST` | `FOOD_RESCUE` | `RESIDUAL`)
- Admin `verify_action` / `reject_action`
- `donate_and_mint` with storage vs treasury split
- Views for actions, donations, treasury, NFT verification proof
- Unit / integration / invariant tests

### App (`src/`)
- Next.js App Router + TypeScript + Tailwind + Motion
- Seven pages: `/`, `/actions`, `/actions/[id]`, `/contribute`, `/donor`, `/admin`, `/verify`
- `/api/upload` (Pinata), `/api/ai/verify`, `/api/ai/audit-log`
- MyNearWallet + JSON-RPC views
- Example-data fallback only when live RPC is unavailable (badged)

## 2. Out of scope

- NFT marketplace / bidding
- DAO / governance token
- AI that signs or auto-executes on-chain
- NEP-141 reward token
- Logistics / fleet routing
- Claiming funds distributed while still held

## 3. Release checklist

- [x] Freeze — attribution, treasury honesty, 3-party provenance, AI advisory-only, secrets gitignored
- [x] Test — contract invariants, AI schema, lint / typecheck / build
- [x] Deploy — `scripts/deploy-near-testnet.sh`, Vercel + `.env.example`
- [x] Demo — [DEMO-RUNBOOK.md](./DEMO-RUNBOOK.md) against live contract
- [x] Submit — [SUBMISSION.md](./SUBMISSION.md) + [TESTNET.md](./TESTNET.md)
