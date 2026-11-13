# Testing Strategy & Verification Plan — FoodSort

## 1. Smart Contract Testing (`contract/`)

To keep CPU and RAM consumption low while maintaining full coverage of contract invariants, tests use `near-sdk::testing_env!` in-memory VM execution with `jobs = 2` and `debug = 0` in `contract/.cargo/config.toml`, complemented by `contract/tests/verify-contract-invariants.mjs`.

### 1.1 Unit Tests (`contract/src/lib.rs`)
1. `test_contract_initialization`: Verifies `admin_id`, `min_donation_yocto`, zeroed `treasury_balance_yocto`, and NEP-177 `nft_metadata()`.
2. `test_submit_action_success_and_validation`: Submits valid `COMPOST`, `FOOD_RESCUE`, and `RESIDUAL` actions; verifies `action_id` increments, `contributor_id` equals `predecessor_account_id()`, and initial status is `Pending`.
3. `test_submit_action_rejects_invalid_category`: Confirms invalid categories panic with `ERR_INVALID_CATEGORY`.
4. `test_non_admin_cannot_verify_action`: Confirms non-admin caller panics with `ERR_NOT_ADMIN`.
5. `test_donate_rejected_for_pending_action`: Confirms `donate_and_mint` on a `Pending` action panics with `ERR_ACTION_NOT_VERIFIED`.
6. `test_donate_and_mint_preserves_attribution_and_separates_storage`: Confirms exact separation of `storage_cost_yocto` and `net_treasury_amount_yocto`, `HELD_IN_TREASURY` status, and 3-party provenance after NEP-171 `nft_transfer`.

### 1.2 Multi-Actor Integration Flows (`contract/tests/integration.rs`)
- End-to-end multi-action, multi-donor lifecycle testing across `COMPOST`, `FOOD_RESCUE`, and `RESIDUAL` actions, verifying cumulative treasury accounting accuracy.

---

## 2. Automated Release Verification (`scripts/run-release-tests.mjs`)

Run the full release verification suite with a single command:

```bash
node scripts/run-release-tests.mjs
```

It sequentially executes:
1. **Static Guardrail & Security Audit**: Verifies no `.env.local` secrets are tracked by Git, verifies NEP-171/177/181 traits, verifies `HELD_IN_TREASURY` constants, and verifies `requires_human_approval: true`.
2. **Contract State Machine Suite**: Executes all 7 contract lifecycle assertions.
3. **AI Schema & Audit-Log Isolation Suite**: Verifies untrusted AI output normalization, category assessment, mandatory disclaimer enforcement, and separate `AI_RECOMMENDATION` vs. `HUMAN_ADMIN_DECISION` audit entries.
4. **TypeScript & Next.js Production Build**: Runs `tsc --noEmit` and `next build` to verify all 7 pages and 3 API routes compile cleanly.
