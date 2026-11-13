# AGENTS.md — Engineering & AI Agent Guardrails for FoodSort

This document defines mandatory architectural, security, and performance rules for any AI coding assistant or developer contributing to the **FoodSort** repository (`https://github.com/TioEnth06/foodsort.git`).

---

## 1. Product & Domain Invariants

- **Three Actors**:
  1. **Contributor**: Submits food-sorting evidence (`COMPOST`, `FOOD_RESCUE`, `RESIDUAL`) to the NEAR contract (`submit_action`).
  2. **Admin**: Reviews pending actions (with optional advisory AI analysis) and executes `verify_action` or `reject_action` on-chain.
  3. **Donor / Patron**: Supports verified actions with native NEAR (`donate_and_mint`) and receives a NEP-171 Donation NFT.
- **No Fake Transactions**: Never simulate blockchain transaction hashes or fake on-chain success when interacting with NEAR Testnet. Demo/fallback read data must always be explicitly badged as `DEMO DATA`.
- **Immutable Attribution**: In the Rust contract (`contract/src/lib.rs`), `donate_and_mint` must read `contributor_id` exclusively from the stored `FoodAction` record—never from function arguments.
- **Honest Treasury Status**: Funds donated via `donate_and_mint` are held in the contract treasury (`HELD_IN_TREASURY`). Never display UI copy or contract state claiming funds have been disbursed or distributed.
- **Role Separation on NFTs**: Always display `contributor_id` (Action Performer), `donor_id` (Original Patron), and `owner_id` (Current NFT Holder) distinctly.

---

## 2. Isolated AI Verification Assistant Rules (Prompt #6.5)

- **Advisory Only**: The AI service (`/api/ai/verify`) analyzes untrusted descriptions, categories (`COMPOST`, `FOOD_RESCUE`, `RESIDUAL`), and evidence images and returns a structured JSON assessment with `requires_human_approval: true`.
- **No Key Exposure**: AI endpoints must never access NEAR private keys or wallet sessions, and AI API keys (`OPENAI_API_KEY` / `GEMINI_API_KEY`) must remain strictly server-side.
- **Graceful Manual Fallback**: If AI credentials are not configured or the upstream service is unavailable, return an explicit unavailable status (`503`)—never fabricate AI analysis—and allow the human admin to verify or reject manually.
- **Separate Audit Trail**: Log AI recommendations and human admin final decisions separately via `/api/ai/audit-log`.

---

## 3. MacBook Performance & Resource Safeguards

To ensure development in Cursor never slows down or overheats the host MacBook:
1. Keep `contract/target/`, `frontend/node_modules/`, `frontend/.next/`, and `*.wasm` excluded in `.gitignore` and `.vscode/settings.json`.
2. Respect `contract/.cargo/config.toml` (`jobs = 2`, `debug = 0` for dev/test profiles).
3. Run heavy commands (`cargo test`, `next build`) sequentially, never in parallel.
4. Prefer in-memory `near-sdk::testing_env!` unit and integration tests over heavy local validator Docker containers.
