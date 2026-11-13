import { FoodCategory } from "../types";

export type AiRecommendation = "APPROVE" | "REJECT" | "NEEDS_REVIEW";

export const SUPPORTED_AI_CATEGORIES: readonly FoodCategory[] = [
  "COMPOST",
  "FOOD_RESCUE",
  "RESIDUAL",
] as const;

export const MANDATORY_AI_DISCLAIMER =
  "Advisory analysis only: AI cannot certify food safety or independently prove that a physical food-sorting activity occurred solely from an image. Human administrator retains final verification authority.";

export interface AiCategoryAssessment {
  submitted_category: FoodCategory;
  detected_category: FoodCategory | "UNCLEAR";
  matches_submitted: boolean;
  explanation: string;
}

export interface AiEvidenceRelevance {
  is_relevant: boolean;
  score: number;
  observations: string;
}

export interface AiDescriptionConsistency {
  is_consistent: boolean;
  score: number;
  notes: string;
}

export interface AiVerificationResult {
  recommendation: AiRecommendation;
  confidence_score: number;
  category_assessment: AiCategoryAssessment;
  evidence_relevance: AiEvidenceRelevance;
  description_consistency: AiDescriptionConsistency;
  risk_flags: string[];
  reasoning: string;
  requires_human_approval: true;
  disclaimer: string;
  analyzed_at_iso: string;
  model_used: string;
}

export interface AiVerificationRequestPayload {
  action_id: number;
  contributor_id: string;
  food_category: string;
  action_type: string;
  description: string;
  evidence_uri: string;
  submitted_at_ms?: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp_iso: string;
  entry_type: "AI_RECOMMENDATION" | "HUMAN_ADMIN_DECISION";
  action_id: number;
  contributor_id: string;
  ai_recommendation?: AiRecommendation;
  ai_confidence_score?: number;
  ai_risk_flags?: string[];
  ai_model?: string;
  admin_account_id?: string;
  human_decision?: "APPROVE" | "REJECT" | "REQUEST_ADDITIONAL_EVIDENCE";
  overrode_ai?: boolean;
  prior_ai_recommendation?: AiRecommendation | null;
  reason_or_note?: string;
  on_chain_tx_hash?: string | null;
}

export function normalizeAndValidateAiResult(
  raw: Record<string, unknown>,
  submittedCategory: FoodCategory,
  modelUsed: string
): AiVerificationResult {
  const rawRec = String(raw.recommendation || "NEEDS_REVIEW").toUpperCase();
  const recommendation: AiRecommendation =
    rawRec === "APPROVE" || rawRec === "REJECT" || rawRec === "NEEDS_REVIEW"
      ? rawRec
      : "NEEDS_REVIEW";

  const clampScore = (val: unknown, fallback = 0.5): number => {
    const num = Number(val);
    if (Number.isNaN(num)) return fallback;
    if (num > 1 && num <= 100) return Number((num / 100).toFixed(2));
    return Number(Math.max(0, Math.min(1, num)).toFixed(2));
  };

  const catObj =
    raw.category_assessment && typeof raw.category_assessment === "object"
      ? (raw.category_assessment as Record<string, unknown>)
      : {};

  const rawDetected = String(
    catObj.detected_category || submittedCategory
  ).toUpperCase();
  const detectedCategory: FoodCategory | "UNCLEAR" =
    rawDetected === "COMPOST" ||
    rawDetected === "FOOD_RESCUE" ||
    rawDetected === "RESIDUAL"
      ? rawDetected
      : "UNCLEAR";

  const evObj =
    raw.evidence_relevance && typeof raw.evidence_relevance === "object"
      ? (raw.evidence_relevance as Record<string, unknown>)
      : {};

  const descObj =
    raw.description_consistency &&
    typeof raw.description_consistency === "object"
      ? (raw.description_consistency as Record<string, unknown>)
      : {};

  const riskFlags = Array.isArray(raw.risk_flags)
    ? raw.risk_flags
        .map((item) => String(item).trim())
        .filter((item) => item.length > 0)
        .slice(0, 10)
    : [];

  const rawReasoning = String(
    raw.reasoning ||
      "Evidence and activity description reviewed against submitted food-sorting category."
  ).trim();

  return {
    recommendation,
    confidence_score: clampScore(raw.confidence_score, 0.7),
    category_assessment: {
      submitted_category: submittedCategory,
      detected_category: detectedCategory,
      matches_submitted:
        typeof catObj.matches_submitted === "boolean"
          ? catObj.matches_submitted
          : detectedCategory === submittedCategory,
      explanation: String(
        catObj.explanation ||
          `Compared visual and textual cues against ${submittedCategory} criteria.`
      ).trim(),
    },
    evidence_relevance: {
      is_relevant:
        typeof evObj.is_relevant === "boolean" ? evObj.is_relevant : true,
      score: clampScore(evObj.score, 0.75),
      observations: String(
        evObj.observations || "Inspected uploaded evidence image for sorting containers and material type."
      ).trim(),
    },
    description_consistency: {
      is_consistent:
        typeof descObj.is_consistent === "boolean" ? descObj.is_consistent : true,
      score: clampScore(descObj.score, 0.75),
      notes: String(
        descObj.notes || "Evaluated consistency between activity type, description, and category."
      ).trim(),
    },
    risk_flags: riskFlags,
    reasoning: rawReasoning,
    requires_human_approval: true,
    disclaimer: MANDATORY_AI_DISCLAIMER,
    analyzed_at_iso: new Date().toISOString(),
    model_used: modelUsed,
  };
}
