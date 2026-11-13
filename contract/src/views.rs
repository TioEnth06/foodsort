use crate::models::{
    ActionStatus, DonationRecord, FoodAction, NftVerificationProof, TreasurySummary,
    TREASURY_STATUS_HELD,
};
use crate::{FoodSortContract, FoodSortContractExt};
use near_contract_standards::non_fungible_token::core::NonFungibleTokenCore;
use near_sdk::json_types::U128;
use near_sdk::{near, AccountId};

#[near]
impl FoodSortContract {
    pub fn get_admin(&self) -> AccountId {
        self.admin_id.clone()
    }

    pub fn get_min_donation_yocto(&self) -> U128 {
        U128(self.min_donation_yocto)
    }

    pub fn get_action(&self, action_id: u64) -> Option<FoodAction> {
        self.actions.get(&action_id).cloned()
    }

    pub fn get_actions(
        &self,
        from_index: Option<u64>,
        limit: Option<u64>,
        status_filter: Option<ActionStatus>,
    ) -> Vec<FoodAction> {
        let start = from_index.unwrap_or(0) as usize;
        let max = limit.unwrap_or(50).min(100) as usize;

        self.actions
            .values()
            .filter(|action| match &status_filter {
                Some(expected) => &action.status == expected,
                None => true,
            })
            .skip(start)
            .take(max)
            .cloned()
            .collect()
    }

    pub fn get_actions_by_contributor(&self, contributor_id: AccountId) -> Vec<FoodAction> {
        self.actions
            .values()
            .filter(|action| action.contributor_id == contributor_id)
            .cloned()
            .collect()
    }

    pub fn get_donation(&self, donation_id: u64) -> Option<DonationRecord> {
        self.donations.get(&donation_id).cloned()
    }

    pub fn get_donations_by_donor(&self, donor_id: AccountId) -> Vec<DonationRecord> {
        self.donations
            .values()
            .filter(|donation| donation.donor_id == donor_id)
            .cloned()
            .collect()
    }

    pub fn get_donations_by_action(&self, action_id: u64) -> Vec<DonationRecord> {
        self.donations
            .values()
            .filter(|donation| donation.action_id == action_id)
            .cloned()
            .collect()
    }

    pub fn get_donation_by_token_id(&self, token_id: String) -> Option<DonationRecord> {
        let donation_id = self.token_to_donation_id.get(&token_id)?;
        self.donations.get(donation_id).cloned()
    }

    pub fn get_treasury_summary(&self) -> TreasurySummary {
        let mut verified_count = 0u64;
        let mut pending_count = 0u64;
        let mut rejected_count = 0u64;

        for action in self.actions.values() {
            match action.status {
                ActionStatus::Verified => verified_count += 1,
                ActionStatus::Pending => pending_count += 1,
                ActionStatus::Rejected => rejected_count += 1,
            }
        }

        TreasurySummary {
            admin_id: self.admin_id.clone(),
            min_donation_yocto: U128(self.min_donation_yocto),
            treasury_balance_yocto: U128(self.treasury_balance_yocto),
            total_storage_reserved_yocto: U128(self.total_storage_reserved_yocto),
            treasury_status: TREASURY_STATUS_HELD.to_string(),
            total_actions_count: self.actions.len() as u64,
            verified_actions_count: verified_count,
            pending_actions_count: pending_count,
            rejected_actions_count: rejected_count,
            total_donations_count: self.donations.len() as u64,
        }
    }

    pub fn get_nft_verification_proof(&self, token_id: String) -> Option<NftVerificationProof> {
        let nft = self.tokens.nft_token(token_id.clone())?;
        let donation_id = self.token_to_donation_id.get(&token_id)?;
        let donation = self.donations.get(donation_id)?.clone();
        let action = self.actions.get(&donation.action_id)?.clone();

        let is_held_by_original_donor = nft.owner_id == donation.donor_id;

        Some(NftVerificationProof {
            token_id,
            current_owner_id: nft.owner_id,
            original_donor_id: donation.donor_id.clone(),
            original_contributor_id: action.contributor_id.clone(),
            is_held_by_original_donor,
            donation,
            action,
            token_metadata: nft.metadata,
        })
    }
}
