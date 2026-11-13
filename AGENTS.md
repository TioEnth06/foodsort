# AGENTS.md — FoodSort contributor guardrails

Rules for humans and coding agents working in this repo.

## Product invariants

- **Actors**: Contributor (`submit_action`) · Admin (`verify_action` / `reject_action`) · Donor (`donate_and_mint`).
- **No fake txs**: Never invent transaction hashes. Example-data reads must stay clearly badged.
- **Attribution**: `donate_and_mint` reads `contributor_id` only from stored `FoodAction`.
- **Treasury**: Net donations stay `HELD_IN_TREASURY`; never claim distribution in MVP.
- **NFT roles**: Always show contributor ≠ original donor ≠ current owner.

## AI verification assistant

- Advisory only (`requires_human_approval: true`).
- No NEAR keys or wallet access; AI API keys stay server-side.
- Missing / failed AI → honest `503` + manual admin path.
- Log AI recommendations separately from human decisions (`/api/ai/audit-log`).

## Repo layout & performance

- App source of truth: root `src/`. Vercel Root Directory is `frontend/` — run `node scripts/sync-frontend-src.mjs` after edits (release tests require `src/` ≡ `frontend/src`).
- Ignore heavy dirs: `node_modules/`, `.next/`, `contract/target/`, `*.wasm`.
- Respect `contract/.cargo/config.toml` job limits; run heavy builds sequentially.
- Prefer in-memory near-sdk tests over local validator Docker.

Live contract & demo IDs: [docs/TESTNET.md](docs/TESTNET.md).
