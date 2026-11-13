export type FoodCategory = "COMPOST" | "FOOD_RESCUE" | "RESIDUAL";

export type ActionStatus = "Pending" | "Verified" | "Rejected";

export interface FoodAction {
  action_id: number;
  contributor_id: string;
  food_category: FoodCategory;
  action_type: string;
  description: string;
  evidence_uri: string;
  status: ActionStatus;
  submitted_at_ms: number;
  verified_at_ms: number | null;
  verified_by: string | null;
  rejection_reason: string | null;
  total_donated_yocto: string;
  donation_count: number;
  is_demo_data?: boolean;
}

export interface DonationRecord {
  donation_id: number;
  action_id: number;
  token_id: string;
  donor_id: string;
  contributor_id: string;
  gross_attached_yocto: string;
  storage_cost_yocto: string;
  net_treasury_amount_yocto: string;
  donated_at_ms: number;
  treasury_status: "HELD_IN_TREASURY";
  tx_hash?: string;
  is_demo_data?: boolean;
}

export interface DonationNftExtraMetadata {
  schema_version: string;
  action_id: number;
  donation_id: number;
  original_contributor_id: string;
  original_donor_id: string;
  food_category: FoodCategory;
  action_type: string;
  evidence_uri: string;
  verified_by: string;
  verified_at_ms: number;
  donated_at_ms: number;
  gross_donation_yocto: string;
  storage_deposit_yocto: string;
  net_treasury_donation_yocto: string;
  treasury_status: "HELD_IN_TREASURY";
}

export interface Nep177TokenMetadata {
  title?: string | null;
  description?: string | null;
  media?: string | null;
  copies?: number | null;
  issued_at?: string | null;
  starts_at?: string | null;
  updated_at?: string | null;
  extra?: string | null;
}

export interface Nep171Token {
  token_id: string;
  owner_id: string;
  metadata?: Nep177TokenMetadata | null;
  is_demo_data?: boolean;
}

export interface TreasurySummary {
  admin_id: string;
  min_donation_yocto: string;
  treasury_balance_yocto: string;
  total_storage_reserved_yocto: string;
  treasury_status: "HELD_IN_TREASURY";
  total_actions_count: number;
  verified_actions_count: number;
  pending_actions_count: number;
  rejected_actions_count: number;
  total_donations_count: number;
  is_demo_data?: boolean;
}

export interface NftVerificationProof {
  token_id: string;
  current_owner_id: string;
  original_donor_id: string;
  original_contributor_id: string;
  is_held_by_original_donor: boolean;
  donation: DonationRecord;
  action: FoodAction;
  token_metadata?: Nep177TokenMetadata | null;
  is_demo_data?: boolean;
}
