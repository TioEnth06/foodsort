# Smart contract & NFT metadata — FoodSort

Deployed testnet account: `foodsort-app-86051.testnet` ([TESTNET.md](./TESTNET.md)).

## 1. Standards & crates

- **Language**: Rust (`edition = "2021"`)
- **SDK**: `near-sdk = "5.5.0"`, `near-contract-standards = "5.5.0"`
- **Standards**: NEP-171 (core), NEP-177 (metadata), NEP-181 (enumeration)

---

## 2. Contract State Schema

### 2.1 `FoodSortContract` Root Struct
| Field | Type | Description |
| :--- | :--- | :--- |
| `admin_id` | `AccountId` | Authorized administrator account allowed to verify or reject actions |
| `min_donation_yocto` | `u128` | Minimum net donation required (after deducting NEP-171 storage cost); default `0.1 NEAR` (`100_000_000_000_000_000_000_000` yoctoNEAR) |
| `treasury_balance_yocto` | `u128` | Cumulative net donation funds transparently held in the contract treasury |
| `total_storage_reserved_yocto` | `u128` | Cumulative yoctoNEAR locked to cover on-chain NFT & donation record storage bytes |
| `next_action_id` | `u64` | Auto-incrementing counter starting at `1` |
| `next_donation_id` | `u64` | Auto-incrementing counter starting at `1` |
| `actions` | `IterableMap<u64, FoodAction>` | Canonical map of all submitted food-sorting actions |
| `donations` | `IterableMap<u64, DonationRecord>` | Canonical map of all donation records |
| `token_to_donation_id` | `LookupMap<TokenId, u64>` | Maps NEP-171 `token_id` (`foodsort-donation-{id}`) to `donation_id` |
| `tokens` | `NonFungibleToken` | Standard NEP-171/177/181 token implementation from `near-contract-standards` |
| `metadata` | `LazyOption<NFTContractMetadata>` | NEP-177 contract-level metadata |

### 2.2 `ActionStatus` Enum
- `Pending`: Submitted by contributor, awaiting human admin verification. Not eligible for donations.
- `Verified`: Approved on-chain by `admin_id`. Eligible for `donate_and_mint`.
- `Rejected`: Rejected on-chain by `admin_id` with a recorded `rejection_reason`. Not eligible for donations.

### 2.3 `FoodAction` Struct
| Field | Type | Description |
| :--- | :--- | :--- |
| `action_id` | `u64` | Unique sequential action ID |
| `contributor_id` | `AccountId` | NEAR account that submitted the action (`env::predecessor_account_id()`) |
| `food_category` | `String` | Standardized category: `"COMPOST"`, `"FOOD_RESCUE"`, or `"RESIDUAL"` |
| `action_type` | `String` | Specific sorting activity type (e.g., `"Household Organic Separation"`) |
| `description` | `String` | Detailed activity description |
| `evidence_uri` | `String` | Off-chain IPFS URI (`ipfs://...` or `https://...`) |
| `status` | `ActionStatus` | `Pending`, `Verified`, or `Rejected` |
| `submitted_at_ms` | `u64` | Block timestamp in milliseconds (`env::block_timestamp_ms()`) |
| `verified_at_ms` | `Option<u64>` | Timestamp when verified or rejected |
| `verified_by` | `Option<AccountId>` | Admin account that verified or rejected the action |
| `rejection_reason` | `Option<String>` | Reason provided by admin if rejected |
| `total_donated_yocto` | `U128` | Sum of net treasury donations supporting this action |
| `donation_count` | `u64` | Number of verified donations supporting this action |

### 2.4 `DonationRecord` Struct
| Field | Type | Description |
| :--- | :--- | :--- |
| `donation_id` | `u64` | Unique sequential donation ID |
| `action_id` | `u64` | ID of the verified `FoodAction` supported |
| `token_id` | `String` | Deterministic NEP-171 token ID (`foodsort-donation-{donation_id}`) |
| `donor_id` | `AccountId` | Account that called `donate_and_mint` and initially received the NFT |
| `contributor_id` | `AccountId` | Copied directly from `action.contributor_id` in contract state |
| `gross_attached_yocto` | `U128` | Total yoctoNEAR attached to the `donate_and_mint` call |
| `storage_cost_yocto` | `U128` | Exact storage byte cost reserved for the NFT & donation state |
| `net_treasury_amount_yocto` | `U128` | Net donation credited to the contract treasury (`gross - storage`) |
| `donated_at_ms` | `u64` | Block timestamp in milliseconds |
| `treasury_status` | `String` | Always `"HELD_IN_TREASURY"` (never marked distributed) |

---

## 3. Complete NFT Metadata Specification (NEP-177 + `extra` Provenance JSON)

Each minted Donation NFT (`token_id = "foodsort-donation-{donation_id}"`) includes standard NEP-177 `TokenMetadata` fields plus a strictly structured JSON object in `metadata.extra`:

### 3.1 NEP-177 `TokenMetadata` Fields
| Field | Type | Value Format |
| :--- | :--- | :--- |
| `title` | `Option<String>` | `"FoodSort Patronage NFT #{donation_id} — Action #{action_id} ({food_category})"` |
| `description` | `Option<String>` | `"Verified food-sorting patronage certificate. Action performed by {contributor_id}; supported by patron {donor_id}. Funds are transparently held in the FoodSort contract treasury (HELD_IN_TREASURY)."` |
| `media` | `Option<String>` | `action.evidence_uri` (IPFS URI of the verified sorting evidence) |
| `media_hash` | `Option<Base64VecU8>` | `None` (CID is self-authenticating in `ipfs://` URI) |
| `copies` | `Option<u64>` | `Some(1)` (Unique 1-of-1 certificate per donation) |
| `issued_at` | `Option<String>` | Millisecond timestamp string (`donated_at_ms.to_string()`) |
| `expires_at` | `Option<String>` | `None` |
| `starts_at` | `Option<String>` | `Some(donated_at_ms.to_string())` |
| `updated_at` | `Option<String>` | `Some(donated_at_ms.to_string())` |
| `extra` | `Option<String>` | Serialized JSON of `DonationNftExtraMetadata` (see table below) |
| `reference` | `Option<String>` | Often set to the evidence URI (same as `media`) |
| `reference_hash` | `Option<Base64VecU8>` | `None` |

### 3.2 `DonationNftExtraMetadata` JSON Fields (Stored in `TokenMetadata.extra`)
| JSON Field | Type | Description |
| :--- | :--- | :--- |
| `schema_version` | `String` | `"foodsort-nft-v1"` |
| `token_id` | `String` | NEP-171 token ID (`"foodsort-donation-{donation_id}"`) |
| `network` | `String` | NEAR network identifier (`"testnet"` or `"mainnet"`) |
| `action_id` | `u64` | Linked verified `FoodAction` ID |
| `donation_id` | `u64` | Linked `DonationRecord` ID |
| `original_contributor_id` | `AccountId` | Account that performed the physical food-sorting action (immutable) |
| `original_donor_id` | `AccountId` | Account that made the donation and minted the NFT (immutable) |
| `food_category` | `String` | `"COMPOST"`, `"FOOD_RESCUE"`, or `"RESIDUAL"` |
| `action_type` | `String` | Specific food-sorting activity type |
| `evidence_uri` | `String` | IPFS URI of the verified action evidence |
| `verified_by` | `AccountId` | Admin account that verified the action |
| `verified_at_ms` | `u64` | Timestamp when action was verified |
| `donated_at_ms` | `u64` | Timestamp when donation occurred and NFT was minted |
| `gross_donation_yocto` | `U128` | Total attached yoctoNEAR |
| `storage_deposit_yocto` | `U128` | Storage cost deducted for on-chain state |
| `net_treasury_donation_yocto` | `U128` | Net donation held in contract treasury |
| `treasury_status` | `String` | `"HELD_IN_TREASURY"` |

---

## 4. Contract Methods Reference

### 4.1 Change Methods
1. `#[init] pub fn new(admin_id: AccountId, min_donation_yocto: Option<U128>) -> Self`
2. `pub fn submit_action(&mut self, food_category: String, action_type: String, description: String, evidence_uri: String) -> u64`
3. `pub fn verify_action(&mut self, action_id: u64) -> FoodAction`
4. `pub fn reject_action(&mut self, action_id: u64, reason: String) -> FoodAction`
5. `#[payable] pub fn donate_and_mint(&mut self, action_id: u64) -> DonationRecord`

### 4.2 View Methods
- `get_action(action_id: u64) -> Option<FoodAction>`
- `get_actions(from_index: Option<u64>, limit: Option<u64>, status_filter: Option<ActionStatus>) -> Vec<FoodAction>`
- `get_actions_by_contributor(contributor_id: AccountId) -> Vec<FoodAction>`
- `get_donation(donation_id: u64) -> Option<DonationRecord>`
- `get_donations_by_donor(donor_id: AccountId) -> Vec<DonationRecord>`
- `get_donations_by_action(action_id: u64) -> Vec<DonationRecord>`
- `get_donation_by_token_id(token_id: String) -> Option<DonationRecord>`
- `get_treasury_summary() -> TreasurySummary`
- `get_nft_verification_proof(token_id: String) -> Option<NftVerificationProof>`
- Standard NEP-171 / NEP-177 / NEP-181 views (`nft_token`, `nft_metadata`, `nft_tokens`, `nft_tokens_for_owner`, `nft_total_supply`, `nft_supply_for_owner`)
