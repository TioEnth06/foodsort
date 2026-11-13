use foodsort_contract::models::{ActionStatus, DonationNftExtraMetadata};
use foodsort_contract::FoodSortContract;
use near_contract_standards::non_fungible_token::core::NonFungibleTokenCore;
use near_contract_standards::non_fungible_token::enumeration::NonFungibleTokenEnumeration;
use near_sdk::test_utils::VMContextBuilder;
use near_sdk::{testing_env, AccountId, NearToken};

fn setup_context(predecessor: &str, deposit_yocto: u128) {
    let pred: AccountId = predecessor.parse().unwrap();
    let contract_id: AccountId = "foodsort.testnet".parse().unwrap();
    let mut builder = VMContextBuilder::new();
    builder
        .current_account_id(contract_id)
        .signer_account_id(pred.clone())
        .predecessor_account_id(pred)
        .attached_deposit(NearToken::from_yoctonear(deposit_yocto))
        .block_timestamp(1_763_050_000_000_000_000);
    testing_env!(builder.build());
}

#[test]
fn integration_full_lifecycle_across_all_categories() {
    setup_context("admin.testnet", 0);
    let mut contract = FoodSortContract::new("admin.testnet".parse().unwrap(), None);

    setup_context("contributor1.testnet", 0);
    let id_compost = contract.submit_action(
        "COMPOST".to_string(),
        "Community Kitchen Composting".to_string(),
        "Diverted 12kg of fruit and vegetable prep scraps into aerobic compost bins.".to_string(),
        "ipfs://bafybeic7compost111111111111111111111111111111111111111111".to_string(),
    );

    setup_context("contributor2.testnet", 0);
    let id_rescue = contract.submit_action(
        "FOOD_RESCUE".to_string(),
        "Night Market Surplus Redistribution".to_string(),
        "Sorted and packed 25 unspoiled meal portions for neighborhood shelter.".to_string(),
        "ipfs://bafybeic7rescue2222222222222222222222222222222222222222222".to_string(),
    );

    setup_context("contributor3.testnet", 0);
    let id_residual = contract.submit_action(
        "RESIDUAL".to_string(),
        "Contaminated Packaging Separation".to_string(),
        "Removed oil-soaked plastic liners and spoiled meat from organic bins.".to_string(),
        "ipfs://bafybeic7residual33333333333333333333333333333333333333333".to_string(),
    );

    assert_eq!(id_compost, 1);
    assert_eq!(id_rescue, 2);
    assert_eq!(id_residual, 3);

    setup_context("admin.testnet", 0);
    let verified_1 = contract.verify_action(id_compost);
    let verified_2 = contract.verify_action(id_rescue);
    let rejected_3 = contract.reject_action(
        id_residual,
        "Evidence image is blurry and container weight label is not visible.".to_string(),
    );

    assert_eq!(verified_1.status, ActionStatus::Verified);
    assert_eq!(verified_2.status, ActionStatus::Verified);
    assert_eq!(rejected_3.status, ActionStatus::Rejected);

    let one_near = NearToken::from_near(1).as_yoctonear();
    let three_near = NearToken::from_near(3).as_yoctonear();

    setup_context("donor_alpha.testnet", one_near);
    let donation_1 = contract.donate_and_mint(id_compost);

    setup_context("donor_beta.testnet", three_near);
    let donation_2 = contract.donate_and_mint(id_rescue);

    assert_eq!(donation_1.token_id, "foodsort-donation-1");
    assert_eq!(donation_2.token_id, "foodsort-donation-2");

    let token_1 = contract
        .nft_token("foodsort-donation-1".to_string())
        .expect("Token 1 must exist");
    let metadata_1 = token_1.metadata.expect("Metadata must exist");
    let extra_1: DonationNftExtraMetadata =
        serde_json::from_str(&metadata_1.extra.expect("Extra JSON must exist")).unwrap();

    assert_eq!(
        extra_1.original_contributor_id,
        "contributor1.testnet".parse::<AccountId>().unwrap()
    );
    assert_eq!(
        extra_1.original_donor_id,
        "donor_alpha.testnet".parse::<AccountId>().unwrap()
    );
    assert_eq!(extra_1.treasury_status, "HELD_IN_TREASURY");
    assert_eq!(
        extra_1.net_treasury_donation_yocto.0 + extra_1.storage_deposit_yocto.0,
        one_near
    );

    let summary = contract.get_treasury_summary();
    assert_eq!(summary.total_actions_count, 3);
    assert_eq!(summary.verified_actions_count, 2);
    assert_eq!(summary.rejected_actions_count, 1);
    assert_eq!(summary.total_donations_count, 2);
    assert_eq!(
        summary.treasury_balance_yocto.0,
        donation_1.net_treasury_amount_yocto.0 + donation_2.net_treasury_amount_yocto.0
    );
    assert_eq!(contract.nft_total_supply().0, 2);
}
