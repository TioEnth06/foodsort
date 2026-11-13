import {
  DonationNftExtraMetadata,
  DonationRecord,
  FoodAction,
  Nep171Token,
  NftVerificationProof,
  TreasurySummary,
} from "./types";

/** Offline fallback only — never presented as live chain state. */
export const DEMO_ADMIN_ID = "foodsort-app-86051.testnet";
export const DEMO_CONTRIBUTOR_ID = "foodsort-contrib-6146.testnet";

export const DEMO_ACTIONS: FoodAction[] = [
  {
    action_id: 1,
    contributor_id: DEMO_CONTRIBUTOR_ID,
    food_category: "COMPOST",
    action_type: "Community Market Green Waste Sorting",
    description:
      "Sorted 18.5 kg of leafy vegetable trimmings, fruit peels, and coffee grounds from morning market stalls into aerated compost bins.",
    evidence_uri:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80",
    status: "Verified",
    submitted_at_ms: 1762910000000,
    verified_at_ms: 1762917200000,
    verified_by: DEMO_ADMIN_ID,
    rejection_reason: null,
    total_donated_yocto: "977370000000000000000000",
    donation_count: 1,
    is_demo_data: true,
  },
  {
    action_id: 2,
    contributor_id: DEMO_CONTRIBUTOR_ID,
    food_category: "FOOD_RESCUE",
    action_type: "Bakery Surplus Recovery",
    description:
      "Sorted and portioned 24 unspoiled sourdough loaves and surplus produce for same-evening neighborhood kitchen distribution.",
    evidence_uri:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80",
    status: "Verified",
    submitted_at_ms: 1762930000000,
    verified_at_ms: 1762935400000,
    verified_by: DEMO_ADMIN_ID,
    rejection_reason: null,
    total_donated_yocto: "0",
    donation_count: 0,
    is_demo_data: true,
  },
  {
    action_id: 3,
    contributor_id: DEMO_CONTRIBUTOR_ID,
    food_category: "RESIDUAL",
    action_type: "Contaminated liner separation",
    description:
      "Separated oil-soaked food packaging and multilayer sachets from organic compost stream at community kitchen.",
    evidence_uri:
      "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1000&q=80",
    status: "Verified",
    submitted_at_ms: 1762980000000,
    verified_at_ms: 1762985000000,
    verified_by: DEMO_ADMIN_ID,
    rejection_reason: null,
    total_donated_yocto: "478930000000000000000000",
    donation_count: 1,
    is_demo_data: true,
  },
  {
    action_id: 4,
    contributor_id: DEMO_CONTRIBUTOR_ID,
    food_category: "RESIDUAL",
    action_type: "Mixed Bin Audit",
    description:
      "Sorted residual waste bin behind food stall; evidence did not show separated containers.",
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
    action_id: 1,
    token_id: "foodsort-donation-1",
    donor_id: DEMO_CONTRIBUTOR_ID,
    contributor_id: DEMO_CONTRIBUTOR_ID,
    gross_attached_yocto: "1000000000000000000000000",
    storage_cost_yocto: "22630000000000000000000",
    net_treasury_amount_yocto: "977370000000000000000000",
    donated_at_ms: 1762921000000,
    treasury_status: "HELD_IN_TREASURY",
    is_demo_data: true,
  },
  {
    donation_id: 2,
    action_id: 3,
    token_id: "foodsort-donation-2",
    donor_id: DEMO_CONTRIBUTOR_ID,
    contributor_id: DEMO_CONTRIBUTOR_ID,
    gross_attached_yocto: "500000000000000000000000",
    storage_cost_yocto: "21070000000000000000000",
    net_treasury_amount_yocto: "478930000000000000000000",
    donated_at_ms: 1762942000000,
    treasury_status: "HELD_IN_TREASURY",
    is_demo_data: true,
  },
];

function buildDemoNftToken(donation: DonationRecord): Nep171Token {
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
    owner_id: donation.donor_id,
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

export const DEMO_NFT_TOKENS: Nep171Token[] = DEMO_DONATIONS.map(buildDemoNftToken);

export const DEMO_TREASURY_SUMMARY: TreasurySummary = {
  admin_id: DEMO_ADMIN_ID,
  min_donation_yocto: "100000000000000000000000",
  treasury_balance_yocto: "1456300000000000000000000",
  funds_distributed_yocto: "0",
  total_storage_reserved_yocto: "43700000000000000000000",
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
