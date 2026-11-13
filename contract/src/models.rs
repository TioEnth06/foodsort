use near_sdk::json_types::U128;
use near_sdk::{near, AccountId, BorshStorageKey};

pub const TREASURY_STATUS_HELD: &str = "HELD_IN_TREASURY";
pub const NFT_METADATA_SCHEMA_VERSION: &str = "foodsort-nft-v1";
pub const DEFAULT_MIN_DONATION_YOCTO: u128 = 100_000_000_000_000_000_000_000; // 0.1 NEAR

#[near(serializers = [borsh])]
#[derive(BorshStorageKey)]
pub enum StorageKey {
    Actions,
    Donations,
    TokenToDonationId,
    NonFungibleToken,
    TokenMetadata,
    Enumeration,
    Approval,
    ContractMetadata,
}

#[near(serializers = [json, borsh])]
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum ActionStatus {
    Pending,
    Verified,
    Rejected,
}

#[near(serializers = [json, borsh])]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct FoodAction {
    pub action_id: u64,
    pub contributor_id: AccountId,
    pub food_category: String,
    pub action_type: String,
    pub description: String,
    pub evidence_uri: String,
    pub status: ActionStatus,
    pub submitted_at_ms: u64,
    pub verified_at_ms: Option<u64>,
    pub verified_by: Option<AccountId>,
    pub rejection_reason: Option<String>,
    pub total_donated_yocto: U128,
    pub donation_count: u64,
}

#[near(serializers = [json, borsh])]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct DonationRecord {
    pub donation_id: u64,
    pub action_id: u64,
    pub token_id: String,
    pub donor_id: AccountId,
    pub contributor_id: AccountId,
    pub gross_attached_yocto: U128,
    pub storage_cost_yocto: U128,
    pub net_treasury_amount_yocto: U128,
    pub donated_at_ms: u64,
    pub treasury_status: String,
}

#[near(serializers = [json])]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct DonationNftExtraMetadata {
    pub schema_version: String,
    pub action_id: u64,
    pub donation_id: u64,
    pub original_contributor_id: AccountId,
    pub original_donor_id: AccountId,
    pub food_category: String,
    pub action_type: String,
    pub evidence_uri: String,
    pub verified_by: AccountId,
    pub verified_at_ms: u64,
    pub donated_at_ms: u64,
    pub gross_donation_yocto: U128,
    pub storage_deposit_yocto: U128,
    pub net_treasury_donation_yocto: U128,
    pub treasury_status: String,
}

#[near(serializers = [json])]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct TreasurySummary {
    pub admin_id: AccountId,
    pub min_donation_yocto: U128,
    pub treasury_balance_yocto: U128,
    pub total_storage_reserved_yocto: U128,
    pub treasury_status: String,
    pub total_actions_count: u64,
    pub verified_actions_count: u64,
    pub pending_actions_count: u64,
    pub rejected_actions_count: u64,
    pub total_donations_count: u64,
}

#[near(serializers = [json])]
#[derive(Clone, Debug)]
pub struct NftVerificationProof {
    pub token_id: String,
    pub current_owner_id: AccountId,
    pub original_donor_id: AccountId,
    pub original_contributor_id: AccountId,
    pub is_held_by_original_donor: bool,
    pub donation: DonationRecord,
    pub action: FoodAction,
    pub token_metadata: Option<near_contract_standards::non_fungible_token::metadata::TokenMetadata>,
}
