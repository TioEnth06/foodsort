import {
  DonationNftExtraMetadata,
  DonationRecord,
  FoodAction,
  Nep171Token,
  NftVerificationProof,
  TreasurySummary,
} from "./types";

export const DEMO_ADMIN_ID = "admin.foodsort.testnet";

export const DEMO_ACTIONS: FoodAction[] = [
  {
    action_id: 101,
    contributor_id: "sari-organik.testnet",
    food_category: "COMPOST",
    action_type: "Community Market Green Waste Sorting",
    description:
      "Sorted 18.5 kg of leafy vegetable trimmings, fruit peels, and coffee grounds from 6 morning market stalls into aerated compost bins. Removed all plastic ties and stickers prior to weighing.",
    evidence_uri:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80",
    status: "Verified",
    submitted_at_ms: 1762910000000,
    verified_at_ms: 1762917200000,
    verified_by: DEMO_ADMIN_ID,
    rejection_reason: null,
    total_donated_yocto: "3486400000000000000000000",
    donation_count: 2,
    is_demo_data: true,
  },
  {
    action_id: 102,
    contributor_id: "dapur-berbagi.testnet",
    food_category: "FOOD_RESCUE",
    action_type: "Bakery & Produce Surplus Recovery",
    description:
      "Sorted and portioned 24 unspoiled sourdough loaves and 11 kg of surplus grade-A tomatoes before closing hour for same-evening neighborhood kitchen distribution.",
    evidence_uri:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80",
    status: "Verified",
    submitted_at_ms: 1762930000000,
    verified_at_ms: 1762935400000,
    verified_by: DEMO_ADMIN_ID,
    rejection_reason: null,
    total_donated_yocto: "4993200000000000000000000",
    donation_count: 1,
    is_demo_data: true,
  },
  {
    action_id: 103,
    contributor_id: "budi-kompos.testnet",
    food_category: "COMPOST",
    action_type: "Household Organic Separation",
    description:
      "Separated 6.2 kg of household kitchen scraps (banana peels, eggshells, wilted greens) into bokashi fermentation buckets to prevent methane release in municipal landfill.",
    evidence_uri:
      "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1000&q=80",
    status: "Pending",
    submitted_at_ms: 1762980000000,
    verified_at_ms: null,
    verified_by: null,
    rejection_reason: null,
    total_donated_yocto: "0",
    donation_count: 0,
    is_demo_data: true,
  },
  {
    action_id: 104,
    contributor_id: "warung-hijau.testnet",
    food_category: "RESIDUAL",
    action_type: "Contaminated Batch & Spoilage Separation",
    description:
      "Isolated 9.0 kg of oil-contaminated paper wrappers and spoiled dairy products from clean organic bins at culinary court so the 40 kg compost batch remained uncontaminated.",
    evidence_uri:
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1000&q=80",
    status: "Pending",
    submitted_at_ms: 1762992000000,
    verified_at_ms: null,
    verified_by: null,
    rejection_reason: null,
    total_donated_yocto: "0",
    donation_count: 0,
    is_demo_data: true,
  },
  {
    action_id: 105,
    contributor_id: "anon-sorter.testnet",
    food_category: "RESIDUAL",
    action_type: "Mixed Bin Audit",
    description:
      "Sorted residual waste bin behind food stall, separated non-compostable multilayer sachets.",
    evidence_uri:
      "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&w=1000&q=80",
    status: "Rejected",
    submitted_at_ms: 1762850000000,
    verified_at_ms: 1762860000000,
    verified_by: DEMO_ADMIN_ID,
    rejection_reason:
      "Evidence photo does not show separated sorting containers or verifiable batch context.",
    total_donated_yocto: "0",
    donation_count: 0,
    is_demo_data: true,
  },
];

export const DEMO_DONATIONS: DonationRecord[] = [
  {
    donation_id: 1,
    action_id: 101,
    token_id: "foodsort-donation-1",
    donor_id: "green-patron.testnet",
    contributor_id: "sari-organik.testnet",
    gross_attached_yocto: "2000000000000000000000000",
    storage_cost_yocto: "6800000000000000000000",
    net_treasury_amount_yocto: "1993200000000000000000000",
    donated_at_ms: 1762921000000,
    treasury_status: "HELD_IN_TREASURY",
    tx_hash: "DemoTx9xK7vP2mQ4nL8rT1wY5zB3cF6hJ0kM",
    is_demo_data: true,
  },
  {
    donation_id: 2,
    action_id: 101,
    token_id: "foodsort-donation-2",
    donor_id: "eco-dao-member.testnet",
    contributor_id: "sari-organik.testnet",
    gross_attached_yocto: "1500000000000000000000000",
    storage_cost_yocto: "6800000000000000000000",
    net_treasury_amount_yocto: "1493200000000000000000000",
    donated_at_ms: 1762928000000,
    treasury_status: "HELD_IN_TREASURY",
    tx_hash: "DemoTx4bN8mP1qR7sV2wX9yZ3cD5fG6hJ8kL",
    is_demo_data: true,
  },
  {
    donation_id: 3,
    action_id: 102,
    token_id: "foodsort-donation-3",
    donor_id: "green-patron.testnet",
    contributor_id: "dapur-berbagi.testnet",
    gross_attached_yocto: "5000000000000000000000000",
    storage_cost_yocto: "6800000000000000000000",
    net_treasury_amount_yocto: "4993200000000000000000000",
    donated_at_ms: 1762942000000,
    treasury_status: "HELD_IN_TREASURY",
    tx_hash: "DemoTx7pQ2rS5tU8vW1xY4zA6bC9dE3fG0hJ",
    is_demo_data: true,
  },
];

function buildDemoNftToken(
  donation: DonationRecord,
  currentOwnerId?: string
): Nep171Token {
  const action = DEMO_ACTIONS.find((a) => a.action_id === donation.action_id)!;
  const extra: DonationNftExtraMetadata = {
    schema_version: "foodsort-nft-v1",
    token_id: donation.token_id,
    network: "testnet",
    action_id: action.action_id,
    donation_id: donation.donation_id,
    original_contributor_id: action.contributor_id,
    original_donor_id: donation.donor_id,
    food_category: action.food_category,
    action_type: action.action_type,
    evidence_uri: action.evidence_uri,
    verified_by: action.verified_by || DEMO_ADMIN_ID,
    verified_at_ms: action.verified_at_ms || action.submitted_at_ms,
    donated_at_ms: donation.donated_at_ms,
    gross_donation_yocto: donation.gross_attached_yocto,
    storage_deposit_yocto: donation.storage_cost_yocto,
    net_treasury_donation_yocto: donation.net_treasury_amount_yocto,
    treasury_status: "HELD_IN_TREASURY",
  };

  return {
    token_id: donation.token_id,
    owner_id: currentOwnerId || donation.donor_id,
    metadata: {
      title: `FoodSort Patronage NFT #${donation.donation_id} — Action #${action.action_id} (${action.food_category})`,
      description: `Certificate of support for a verified sorting action by ${action.contributor_id}, backed by ${donation.donor_id}. Net funds remain held in the FoodSort treasury.`,
      media: action.evidence_uri,
      copies: 1,
      issued_at: String(donation.donated_at_ms),
      starts_at: String(donation.donated_at_ms),
      updated_at: String(donation.donated_at_ms),
      extra: JSON.stringify(extra),
      reference: action.evidence_uri,
    },
    is_demo_data: true,
  };
}

export const DEMO_NFT_TOKENS: Nep171Token[] = [
  buildDemoNftToken(DEMO_DONATIONS[0]),
  buildDemoNftToken(DEMO_DONATIONS[1], "impact-collector.testnet"),
  buildDemoNftToken(DEMO_DONATIONS[2]),
];

export const DEMO_TREASURY_SUMMARY: TreasurySummary = {
  admin_id: DEMO_ADMIN_ID,
  min_donation_yocto: "100000000000000000000000",
  treasury_balance_yocto: "8479600000000000000000000",
  funds_distributed_yocto: "0",
  total_storage_reserved_yocto: "20400000000000000000000",
  treasury_status: "HELD_IN_TREASURY",
  total_actions_count: DEMO_ACTIONS.length,
  verified_actions_count: DEMO_ACTIONS.filter((a) => a.status === "Verified")
    .length,
  pending_actions_count: DEMO_ACTIONS.filter((a) => a.status === "Pending")
    .length,
  rejected_actions_count: DEMO_ACTIONS.filter((a) => a.status === "Rejected")
    .length,
  total_donations_count: DEMO_DONATIONS.length,
  is_demo_data: true,
};

export function getDemoVerificationProof(
  tokenId: string
): NftVerificationProof | null {
  const nft = DEMO_NFT_TOKENS.find((t) => t.token_id === tokenId);
  const donation = DEMO_DONATIONS.find((d) => d.token_id === tokenId);
  if (!nft || !donation) return null;
  const action = DEMO_ACTIONS.find((a) => a.action_id === donation.action_id);
  if (!action) return null;

  return {
    token_id: nft.token_id,
    network: "testnet",
    current_owner_id: nft.owner_id,
    original_donor_id: donation.donor_id,
    original_contributor_id: action.contributor_id,
    is_held_by_original_donor: nft.owner_id === donation.donor_id,
    donation,
    action,
    token_metadata: nft.metadata,
    is_demo_data: true,
  };
}
