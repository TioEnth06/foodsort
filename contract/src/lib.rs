pub mod models;
pub mod views;

use models::{
    ActionStatus, DonationNftExtraMetadata, DonationRecord, FoodAction, StorageKey,
    DEFAULT_MIN_DONATION_YOCTO, NFT_METADATA_SCHEMA_VERSION, TREASURY_STATUS_HELD,
};
use near_contract_standards::non_fungible_token::core::{
    NonFungibleTokenCore, NonFungibleTokenResolver,
};
use near_contract_standards::non_fungible_token::enumeration::NonFungibleTokenEnumeration;
use near_contract_standards::non_fungible_token::metadata::{
    NFTContractMetadata, NonFungibleTokenMetadataProvider, TokenMetadata, NFT_METADATA_SPEC,
};
use near_contract_standards::non_fungible_token::{NonFungibleToken, Token, TokenId};
use near_sdk::collections::LazyOption;
use near_sdk::json_types::U128;
use near_sdk::store::{IterableMap, LookupMap};
use near_sdk::{env, near, require, AccountId, PanicOnDefault, PromiseOrValue};

const SUPPORTED_CATEGORIES: [&str; 3] = ["COMPOST", "FOOD_RESCUE", "RESIDUAL"];

#[near(contract_state)]
#[derive(PanicOnDefault)]
pub struct FoodSortContract {
    pub admin_id: AccountId,
    pub min_donation_yocto: u128,
    pub treasury_balance_yocto: u128,
    pub total_storage_reserved_yocto: u128,
    pub next_action_id: u64,
    pub next_donation_id: u64,
    pub actions: IterableMap<u64, FoodAction>,
    pub donations: IterableMap<u64, DonationRecord>,
    pub token_to_donation_id: LookupMap<TokenId, u64>,
    pub tokens: NonFungibleToken,
    pub metadata: LazyOption<NFTContractMetadata>,
}

#[near]
impl FoodSortContract {
    #[init]
    pub fn new(admin_id: AccountId, min_donation_yocto: Option<U128>) -> Self {
        require!(!env::state_exists(), "ERR_ALREADY_INITIALIZED");

        let contract_metadata = NFTContractMetadata {
            spec: NFT_METADATA_SPEC.to_string(),
            name: "FoodSort Verified Patronage Certificates".to_string(),
            symbol: "FSORT".to_string(),
            icon: None,
            base_uri: None,
            reference: None,
            reference_hash: None,
        };

        Self {
            admin_id: admin_id.clone(),
            min_donation_yocto: min_donation_yocto
                .map(|v| v.0)
                .unwrap_or(DEFAULT_MIN_DONATION_YOCTO),
            treasury_balance_yocto: 0,
            total_storage_reserved_yocto: 0,
            next_action_id: 1,
            next_donation_id: 1,
            actions: IterableMap::new(StorageKey::Actions),
            donations: IterableMap::new(StorageKey::Donations),
            token_to_donation_id: LookupMap::new(StorageKey::TokenToDonationId),
            tokens: NonFungibleToken::new(
                StorageKey::NonFungibleToken,
                admin_id,
                Some(StorageKey::TokenMetadata),
                Some(StorageKey::Enumeration),
                Some(StorageKey::Approval),
            ),
            metadata: LazyOption::new(StorageKey::ContractMetadata, Some(&contract_metadata)),
        }
    }

    pub fn submit_action(
        &mut self,
        food_category: String,
        action_type: String,
        description: String,
        evidence_uri: String,
    ) -> u64 {
        let normalized_category = food_category.trim().to_uppercase();
        require!(
            SUPPORTED_CATEGORIES.contains(&normalized_category.as_str()),
            "ERR_INVALID_CATEGORY: Category must be COMPOST, FOOD_RESCUE, or RESIDUAL"
        );

        let clean_type = action_type.trim().to_string();
        require!(!clean_type.is_empty(), "ERR_EMPTY_ACTION_TYPE");
        require!(clean_type.len() <= 120, "ERR_ACTION_TYPE_TOO_LONG");

        let clean_desc = description.trim().to_string();
        require!(clean_desc.len() >= 10, "ERR_DESCRIPTION_TOO_SHORT");
        require!(clean_desc.len() <= 2000, "ERR_DESCRIPTION_TOO_LONG");

        let clean_uri = evidence_uri.trim().to_string();
        require!(
            clean_uri.starts_with("ipfs://") || clean_uri.starts_with("https://"),
            "ERR_INVALID_EVIDENCE_URI: Must start with ipfs:// or https://"
        );

        let action_id = self.next_action_id;
        self.next_action_id = self
            .next_action_id
            .checked_add(1)
            .expect("ERR_ACTION_ID_OVERFLOW");

        let contributor_id = env::predecessor_account_id();
        let submitted_at_ms = env::block_timestamp_ms();

        let action = FoodAction {
            action_id,
            contributor_id,
            food_category: normalized_category,
            action_type: clean_type,
            description: clean_desc,
            evidence_uri: clean_uri,
            status: ActionStatus::Pending,
            submitted_at_ms,
            verified_at_ms: None,
            verified_by: None,
            rejection_reason: None,
            total_donated_yocto: U128(0),
            donation_count: 0,
        };

        self.actions.insert(action_id, action);
        action_id
    }

    pub fn verify_action(&mut self, action_id: u64) -> FoodAction {
        self.assert_admin();

        let mut action = self
            .actions
            .get(&action_id)
            .cloned()
            .expect("ERR_ACTION_NOT_FOUND");

        require!(
            action.status == ActionStatus::Pending,
            "ERR_ACTION_NOT_PENDING"
        );

        action.status = ActionStatus::Verified;
        action.verified_at_ms = Some(env::block_timestamp_ms());
        action.verified_by = Some(env::predecessor_account_id());
        action.rejection_reason = None;

        self.actions.insert(action_id, action.clone());
        action
    }

    pub fn reject_action(&mut self, action_id: u64, reason: String) -> FoodAction {
        self.assert_admin();

        let clean_reason = reason.trim().to_string();
        require!(!clean_reason.is_empty(), "ERR_EMPTY_REJECTION_REASON");

        let mut action = self
            .actions
            .get(&action_id)
            .cloned()
            .expect("ERR_ACTION_NOT_FOUND");

        require!(
            action.status == ActionStatus::Pending,
            "ERR_ACTION_NOT_PENDING"
        );

        action.status = ActionStatus::Rejected;
        action.verified_at_ms = Some(env::block_timestamp_ms());
        action.verified_by = Some(env::predecessor_account_id());
        action.rejection_reason = Some(clean_reason);

        self.actions.insert(action_id, action.clone());
        action
    }

    #[payable]
    pub fn donate_and_mint(&mut self, action_id: u64) -> DonationRecord {
        let storage_before = env::storage_usage();
        let attached_deposit = env::attached_deposit().as_yoctonear();
        require!(
            attached_deposit > 0,
            "ERR_ZERO_DEPOSIT: Attached NEAR deposit must be greater than zero"
        );
        let donor_id = env::predecessor_account_id();
        let donated_at_ms = env::block_timestamp_ms();

        let mut action = self
            .actions
            .get(&action_id)
            .cloned()
            .expect("ERR_ACTION_NOT_FOUND");

        require!(
            action.status == ActionStatus::Verified,
            "ERR_ACTION_NOT_VERIFIED: Only verified actions can receive donations"
        );

        // Read original contributor strictly from contract state, never from caller input
        let contributor_id = action.contributor_id.clone();
        let verified_by = action
            .verified_by
            .clone()
            .unwrap_or_else(|| self.admin_id.clone());
        let verified_at_ms = action.verified_at_ms.unwrap_or(action.submitted_at_ms);

        let donation_id = self.next_donation_id;
        self.next_donation_id = self
            .next_donation_id
            .checked_add(1)
            .expect("ERR_DONATION_ID_OVERFLOW");

        let token_id = format!("foodsort-donation-{}", donation_id);
        require!(!token_id.trim().is_empty(), "ERR_INVALID_TOKEN_ID");
        require!(
            !self.tokens.owner_by_id.contains_key(&token_id),
            "ERR_DUPLICATE_TOKEN_ID"
        );

        let contract_account = env::current_account_id().to_string();
        let network = if contract_account.ends_with(".near") {
            "mainnet".to_string()
        } else {
            "testnet".to_string()
        };

        let provisional_extra = DonationNftExtraMetadata {
            schema_version: NFT_METADATA_SCHEMA_VERSION.to_string(),
            token_id: token_id.clone(),
            network: network.clone(),
            action_id,
            donation_id,
            original_contributor_id: contributor_id.clone(),
            original_donor_id: donor_id.clone(),
            food_category: action.food_category.clone(),
            action_type: action.action_type.clone(),
            evidence_uri: action.evidence_uri.clone(),
            verified_by: verified_by.clone(),
            verified_at_ms,
            donated_at_ms,
            gross_donation_yocto: U128(attached_deposit),
            storage_deposit_yocto: U128(0),
            net_treasury_donation_yocto: U128(attached_deposit),
            treasury_status: TREASURY_STATUS_HELD.to_string(),
        };

        let extra_json = serde_json::to_string(&provisional_extra)
            .expect("ERR_SERIALIZE_NFT_EXTRA_METADATA");

        let token_metadata = TokenMetadata {
            title: Some(format!(
                "FoodSort Patronage NFT #{} — Action #{} ({})",
                donation_id, action_id, action.food_category
            )),
            description: Some(format!(
                "Verified food-sorting patronage certificate. Action performed by {}; supported by patron {}. Funds are transparently held in the FoodSort contract treasury ({}).",
                contributor_id, donor_id, TREASURY_STATUS_HELD
            )),
            media: Some(action.evidence_uri.clone()),
            media_hash: None,
            copies: Some(1),
            issued_at: Some(donated_at_ms.to_string()),
            expires_at: None,
            starts_at: Some(donated_at_ms.to_string()),
            updated_at: Some(donated_at_ms.to_string()),
            extra: Some(extra_json),
            reference: Some(action.evidence_uri.clone()),
            reference_hash: None,
        };

        self.tokens.internal_mint_with_refund(
            token_id.clone(),
            donor_id.clone(),
            Some(token_metadata),
            None,
        );

        let provisional_record = DonationRecord {
            donation_id,
            action_id,
            token_id: token_id.clone(),
            donor_id: donor_id.clone(),
            contributor_id: contributor_id.clone(),
            gross_attached_yocto: U128(attached_deposit),
            storage_cost_yocto: U128(0),
            net_treasury_amount_yocto: U128(attached_deposit),
            donated_at_ms,
            treasury_status: TREASURY_STATUS_HELD.to_string(),
        };

        self.donations.insert(donation_id, provisional_record);
        self.token_to_donation_id.insert(token_id.clone(), donation_id);
        self.actions.flush();
        self.donations.flush();
        self.token_to_donation_id.flush();

        let storage_after = env::storage_usage();
        let storage_bytes_added = storage_after.saturating_sub(storage_before) as u128;
        let storage_cost_yocto = storage_bytes_added
            .checked_mul(env::storage_byte_cost().as_yoctonear())
            .expect("ERR_STORAGE_COST_OVERFLOW");

        let net_treasury_amount_yocto = attached_deposit
            .checked_sub(storage_cost_yocto)
            .expect("ERR_DEPOSIT_INSUFFICIENT_FOR_STORAGE");

        require!(
            net_treasury_amount_yocto >= self.min_donation_yocto,
            "ERR_BELOW_MIN_DONATION: Net donation after storage cost is below minimum threshold"
        );

        let final_extra = DonationNftExtraMetadata {
            schema_version: NFT_METADATA_SCHEMA_VERSION.to_string(),
            token_id: token_id.clone(),
            network,
            action_id,
            donation_id,
            original_contributor_id: contributor_id.clone(),
            original_donor_id: donor_id.clone(),
            food_category: action.food_category.clone(),
            action_type: action.action_type.clone(),
            evidence_uri: action.evidence_uri.clone(),
            verified_by,
            verified_at_ms,
            donated_at_ms,
            gross_donation_yocto: U128(attached_deposit),
            storage_deposit_yocto: U128(storage_cost_yocto),
            net_treasury_donation_yocto: U128(net_treasury_amount_yocto),
            treasury_status: TREASURY_STATUS_HELD.to_string(),
        };

        if let Some(token_metadata_by_id) = &mut self.tokens.token_metadata_by_id {
            if let Some(mut existing_meta) = token_metadata_by_id.get(&token_id) {
                existing_meta.extra = Some(
                    serde_json::to_string(&final_extra)
                        .expect("ERR_SERIALIZE_FINAL_NFT_EXTRA_METADATA"),
                );
                token_metadata_by_id.insert(&token_id, &existing_meta);
            }
        }

        let final_record = DonationRecord {
            donation_id,
            action_id,
            token_id,
            donor_id,
            contributor_id,
            gross_attached_yocto: U128(attached_deposit),
            storage_cost_yocto: U128(storage_cost_yocto),
            net_treasury_amount_yocto: U128(net_treasury_amount_yocto),
            donated_at_ms,
            treasury_status: TREASURY_STATUS_HELD.to_string(),
        };

        self.donations.insert(donation_id, final_record.clone());

        action.total_donated_yocto = U128(
            action
                .total_donated_yocto
                .0
                .checked_add(net_treasury_amount_yocto)
                .expect("ERR_ACTION_TOTAL_DONATED_OVERFLOW"),
        );
        action.donation_count = action
            .donation_count
            .checked_add(1)
            .expect("ERR_ACTION_DONATION_COUNT_OVERFLOW");
        self.actions.insert(action_id, action);

        self.treasury_balance_yocto = self
            .treasury_balance_yocto
            .checked_add(net_treasury_amount_yocto)
            .expect("ERR_TREASURY_BALANCE_OVERFLOW");
        self.total_storage_reserved_yocto = self
            .total_storage_reserved_yocto
            .checked_add(storage_cost_yocto)
            .expect("ERR_STORAGE_RESERVED_OVERFLOW");

        final_record
    }

    fn assert_admin(&self) {
        require!(
            env::predecessor_account_id() == self.admin_id,
            "ERR_NOT_ADMIN: Caller is not the authorized contract administrator"
        );
    }
}

#[near]
impl NonFungibleTokenCore for FoodSortContract {
    #[payable]
    fn nft_transfer(
        &mut self,
        receiver_id: AccountId,
        token_id: TokenId,
        approval_id: Option<u64>,
        memo: Option<String>,
    ) {
        self.tokens
            .nft_transfer(receiver_id, token_id, approval_id, memo)
    }

    #[payable]
    fn nft_transfer_call(
        &mut self,
        receiver_id: AccountId,
        token_id: TokenId,
        approval_id: Option<u64>,
        memo: Option<String>,
        msg: String,
    ) -> PromiseOrValue<bool> {
        self.tokens
            .nft_transfer_call(receiver_id, token_id, approval_id, memo, msg)
    }

    fn nft_token(&self, token_id: TokenId) -> Option<Token> {
        self.tokens.nft_token(token_id)
    }
}

#[near]
impl NonFungibleTokenResolver for FoodSortContract {
    #[private]
    fn nft_resolve_transfer(
        &mut self,
        previous_owner_id: AccountId,
        receiver_id: AccountId,
        token_id: TokenId,
        approved_account_ids: Option<std::collections::HashMap<AccountId, u64>>,
    ) -> bool {
        self.tokens.nft_resolve_transfer(
            previous_owner_id,
            receiver_id,
            token_id,
            approved_account_ids,
        )
    }
}

#[near]
impl NonFungibleTokenEnumeration for FoodSortContract {
    fn nft_total_supply(&self) -> U128 {
        self.tokens.nft_total_supply()
    }

    fn nft_tokens(&self, from_index: Option<U128>, limit: Option<u64>) -> Vec<Token> {
        self.tokens.nft_tokens(from_index, limit)
    }

    fn nft_supply_for_owner(&self, account_id: AccountId) -> U128 {
        self.tokens.nft_supply_for_owner(account_id)
    }

    fn nft_tokens_for_owner(
        &self,
        account_id: AccountId,
        from_index: Option<U128>,
        limit: Option<u64>,
    ) -> Vec<Token> {
        self.tokens
            .nft_tokens_for_owner(account_id, from_index, limit)
    }
}

#[near]
impl NonFungibleTokenMetadataProvider for FoodSortContract {
    fn nft_metadata(&self) -> NFTContractMetadata {
        self.metadata.get().expect("ERR_CONTRACT_METADATA_NOT_FOUND")
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::test_utils::{accounts, VMContextBuilder};
    use near_sdk::{testing_env, NearToken};

    fn get_context(predecessor: AccountId, attached_yocto: u128) -> VMContextBuilder {
        let mut builder = VMContextBuilder::new();
        builder
            .current_account_id(accounts(0))
            .signer_account_id(predecessor.clone())
            .predecessor_account_id(predecessor)
            .attached_deposit(NearToken::from_yoctonear(attached_yocto))
            .block_timestamp(1_763_000_000_000_000_000);
        builder
    }

    fn admin_account() -> AccountId {
        "admin.testnet".parse().unwrap()
    }

    fn contributor_account() -> AccountId {
        "alice.testnet".parse().unwrap()
    }

    fn donor_account() -> AccountId {
        "bob.testnet".parse().unwrap()
    }

    fn collector_account() -> AccountId {
        "carol.testnet".parse().unwrap()
    }

    #[test]
    fn test_contract_initialization() {
        let ctx = get_context(admin_account(), 0);
        testing_env!(ctx.build());

        let contract = FoodSortContract::new(admin_account(), None);
        let summary = contract.get_treasury_summary();

        assert_eq!(summary.admin_id, admin_account());
        assert_eq!(summary.min_donation_yocto.0, DEFAULT_MIN_DONATION_YOCTO);
        assert_eq!(summary.treasury_balance_yocto.0, 0);
        assert_eq!(summary.funds_distributed_yocto.0, 0);
        assert_eq!(summary.treasury_status, "HELD_IN_TREASURY");
        assert_eq!(contract.nft_metadata().symbol, "FSORT");
    }

    #[test]
    fn test_submit_action_success_and_validation() {
        let ctx = get_context(contributor_account(), 0);
        testing_env!(ctx.build());

        let mut contract = FoodSortContract::new(admin_account(), None);
        let action_id = contract.submit_action(
            "compost".to_string(),
            "Household Organic Separation".to_string(),
            "Sorted 4.5kg of vegetable peels and coffee grounds for community compost bin."
                .to_string(),
            "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi".to_string(),
        );

        assert_eq!(action_id, 1);
        let stored = contract.get_action(1).expect("Action should exist");
        assert_eq!(stored.contributor_id, contributor_account());
        assert_eq!(stored.food_category, "COMPOST");
        assert_eq!(stored.status, ActionStatus::Pending);
    }

    #[test]
    #[should_panic(expected = "ERR_INVALID_CATEGORY")]
    fn test_submit_action_rejects_invalid_category() {
        let ctx = get_context(contributor_account(), 0);
        testing_env!(ctx.build());

        let mut contract = FoodSortContract::new(admin_account(), None);
        contract.submit_action(
            "PLASTIC_BOTTLES".to_string(),
            "Sorting".to_string(),
            "Invalid category submission test case.".to_string(),
            "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi".to_string(),
        );
    }

    #[test]
    #[should_panic(expected = "ERR_NOT_ADMIN")]
    fn test_non_admin_cannot_verify_action() {
        let ctx = get_context(contributor_account(), 0);
        testing_env!(ctx.build());

        let mut contract = FoodSortContract::new(admin_account(), None);
        let action_id = contract.submit_action(
            "FOOD_RESCUE".to_string(),
            "Bakery Surplus Recovery".to_string(),
            "Recovered 12 loaves of unspoiled artisan bread before market closing.".to_string(),
            "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi".to_string(),
        );

        contract.verify_action(action_id);
    }

    #[test]
    #[should_panic(expected = "ERR_ACTION_NOT_PENDING")]
    fn test_admin_cannot_verify_already_verified_action() {
        let ctx = get_context(contributor_account(), 0);
        testing_env!(ctx.build());

        let mut contract = FoodSortContract::new(admin_account(), None);
        let action_id = contract.submit_action(
            "COMPOST".to_string(),
            "Household Organic Separation".to_string(),
            "Sorted 5kg of vegetable scraps into compost bin.".to_string(),
            "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi".to_string(),
        );

        let admin_ctx = get_context(admin_account(), 0);
        testing_env!(admin_ctx.build());
        contract.verify_action(action_id);
        contract.verify_action(action_id);
    }

    #[test]
    #[should_panic(expected = "ERR_ACTION_NOT_PENDING")]
    fn test_admin_cannot_verify_rejected_action() {
        let ctx = get_context(contributor_account(), 0);
        testing_env!(ctx.build());

        let mut contract = FoodSortContract::new(admin_account(), None);
        let action_id = contract.submit_action(
            "RESIDUAL".to_string(),
            "Residual Separation".to_string(),
            "Separated contaminated packaging from clean compost batch.".to_string(),
            "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi".to_string(),
        );

        let admin_ctx = get_context(admin_account(), 0);
        testing_env!(admin_ctx.build());
        contract.reject_action(action_id, "Blurry image".to_string());
        contract.verify_action(action_id);
    }

    #[test]
    #[should_panic(expected = "ERR_ACTION_NOT_FOUND")]
    fn test_admin_cannot_verify_nonexistent_action() {
        let admin_ctx = get_context(admin_account(), 0);
        testing_env!(admin_ctx.build());

        let mut contract = FoodSortContract::new(admin_account(), None);
        contract.verify_action(999);
    }

    #[test]
    #[should_panic(expected = "ERR_ACTION_NOT_VERIFIED")]
    fn test_donate_rejected_for_pending_action() {
        let ctx = get_context(contributor_account(), 0);
        testing_env!(ctx.build());

        let mut contract = FoodSortContract::new(admin_account(), None);
        let action_id = contract.submit_action(
            "RESIDUAL".to_string(),
            "Spoiled Batch Separation".to_string(),
            "Separated contaminated dairy containers from organic compost stream.".to_string(),
            "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi".to_string(),
        );

        let donor_ctx = get_context(donor_account(), NearToken::from_near(1).as_yoctonear());
        testing_env!(donor_ctx.build());

        contract.donate_and_mint(action_id);
    }

    #[test]
    #[should_panic(expected = "ERR_ZERO_DEPOSIT")]
    fn test_donate_rejected_for_zero_amount() {
        let ctx = get_context(contributor_account(), 0);
        testing_env!(ctx.build());

        let mut contract = FoodSortContract::new(admin_account(), None);
        let action_id = contract.submit_action(
            "COMPOST".to_string(),
            "Organic Separation".to_string(),
            "Sorted 4kg of vegetable peels and coffee grounds.".to_string(),
            "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi".to_string(),
        );

        let admin_ctx = get_context(admin_account(), 0);
        testing_env!(admin_ctx.build());
        contract.verify_action(action_id);

        let donor_ctx = get_context(donor_account(), 0);
        testing_env!(donor_ctx.build());
        contract.donate_and_mint(action_id);
    }

    #[test]
    fn test_donate_and_mint_preserves_attribution_and_separates_storage() {
        let ctx = get_context(contributor_account(), 0);
        testing_env!(ctx.build());

        let mut contract = FoodSortContract::new(admin_account(), None);
        let action_id = contract.submit_action(
            "COMPOST".to_string(),
            "Market Green Waste Sorting".to_string(),
            "Sorted 18kg of leafy greens and fruit trimmings at Sunday farmers market."
                .to_string(),
            "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi".to_string(),
        );

        let admin_ctx = get_context(admin_account(), 0);
        testing_env!(admin_ctx.build());
        let verified = contract.verify_action(action_id);
        assert_eq!(verified.status, ActionStatus::Verified);

        let two_near = NearToken::from_near(2).as_yoctonear();
        let donor_ctx = get_context(donor_account(), two_near);
        testing_env!(donor_ctx.build());

        let record = contract.donate_and_mint(action_id);
        assert_eq!(record.donation_id, 1);
        assert_eq!(record.token_id, "foodsort-donation-1");
        assert_eq!(record.donor_id, donor_account());
        assert_eq!(record.contributor_id, contributor_account());
        assert_eq!(record.gross_attached_yocto.0, two_near);
        assert!(record.storage_cost_yocto.0 > 0);
        assert_eq!(
            record.net_treasury_amount_yocto.0 + record.storage_cost_yocto.0,
            two_near
        );
        assert_eq!(record.treasury_status, "HELD_IN_TREASURY");

        let summary = contract.get_treasury_summary();
        assert_eq!(
            summary.treasury_balance_yocto.0,
            record.net_treasury_amount_yocto.0
        );
        assert_eq!(summary.funds_distributed_yocto.0, 0);
        assert_eq!(
            summary.total_storage_reserved_yocto.0,
            record.storage_cost_yocto.0
        );

        let transfer_ctx = get_context(donor_account(), 1);
        testing_env!(transfer_ctx.build());
        contract.nft_transfer(
            collector_account(),
            "foodsort-donation-1".to_string(),
            None,
            Some("Secondary gift".to_string()),
        );

        let proof = contract
            .get_nft_verification_proof("foodsort-donation-1".to_string())
            .expect("Verification proof must exist");

        assert_eq!(proof.current_owner_id, collector_account());
        assert_eq!(proof.original_donor_id, donor_account());
        assert_eq!(proof.original_contributor_id, contributor_account());
        assert!(!proof.is_held_by_original_donor);
    }
}
