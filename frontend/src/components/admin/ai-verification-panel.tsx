"use client";

import React, { useState } from "react";
import { FoodAction } from "@/lib/types";
import {
  AiVerificationResult,
  MANDATORY_AI_DISCLAIMER,
} from "@/lib/ai/verification-schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  FileWarning,
  Loader2,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

interface AiVerificationPanelProps {
  action: FoodAction;
  analysis: AiVerificationResult | null;
  onAnalysisComplete: (result: AiVerificationResult) => void;
}

export function AiVerificationPanel({
  action,
  analysis,
  onAnalysisComplete,
}: AiVerificationPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [serviceError, setServiceError] = useState<string | null>(null);

  const runAiAnalysis = async () => {
    setIsLoading(true);
    setServiceError(null);

    try {
      const response = await fetch("/api/ai/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action_id: action.action_id,
          contributor_id: action.contributor_id,
          food_category: action.food_category,
          action_type: action.action_type,
          description: action.description,
          evidence_uri: action.evidence_uri,
          submitted_at_ms: action.submitted_at_ms,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setServiceError(
          data.error ||
            "AI Verification service is currently unavailable. Manual admin verification is active."
        );
        return;
      }

      onAnalysisComplete(data as AiVerificationResult);
    } catch (err) {
      setServiceError(
        err instanceof Error
          ? `${err.message}. Manual human verification remains available.`
          : "Unable to reach AI verification endpoint. Manual verification remains available."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getRecommendationBadge = (rec: AiVerificationResult["recommendation"]) => {
    switch (rec) {
      case "APPROVE":
        return <Badge variant="verified">AI Recommendation: APPROVE</Badge>;
      case "REJECT":
        return <Badge variant="rejected">AI Recommendation: REJECT</Badge>;
      default:
        return <Badge variant="pending">AI Recommendation: NEEDS_REVIEW</Badge>;
    }
  };

  return (
    <div className="rounded-xl border border-[#1B4332]/20 bg-[#FAF8F5] p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B4332] text-[#FAF8F5]">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#1C1F1E] flex items-center gap-1.5">
              AI Verification Assistant
              <span className="text-[11px] font-normal text-[#525B56]">
                (Advisory Only • Human Authority Required)
              </span>
            </h4>
            <p className="text-[11px] text-[#525B56]">
              Analyzes untrusted description, category ({action.food_category}), and
              evidence image without wallet access.
            </p>
          </div>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={runAiAnalysis}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Analyzing Evidence...
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5 text-[#40916C]" />
              {analysis ? "Re-run AI Analysis" : "Run AI Evidence Analysis"}
            </>
          )}
        </Button>
      </div>

      {serviceError && (
        <div className="rounded-xl border border-amber-300 bg-amber-50/90 p-3 text-xs text-amber-950 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold">
            <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0" />
            AI Service Unavailable — Manual Verification Active
          </div>
          <p className="text-amber-900/90">{serviceError}</p>
        </div>
      )}

      {analysis && (
        <div className="space-y-3 pt-2 border-t border-[#1B4332]/10 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {getRecommendationBadge(analysis.recommendation)}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#1C1F1E]">
                Confidence Score:{" "}
                {Math.round(analysis.confidence_score * 100)}%
              </span>
              <span className="text-[11px] text-[#525B56] font-mono">
                ({analysis.model_used})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <div className="rounded-lg border border-[#1B4332]/15 bg-white p-2.5">
              <div className="font-semibold text-[#1B4332] flex items-center justify-between">
                <span>Category Assessment</span>
                <span>
                  {analysis.category_assessment.matches_submitted ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#40916C]" />
                  ) : (
                    <FileWarning className="h-3.5 w-3.5 text-amber-600" />
                  )}
                </span>
              </div>
              <p className="mt-1 font-mono text-[11px] text-[#1C1F1E]">
                Submitted: {analysis.category_assessment.submitted_category} →
                Detected: {analysis.category_assessment.detected_category}
              </p>
              <p className="mt-1 text-[#525B56]">
                {analysis.category_assessment.explanation}
              </p>
            </div>

            <div className="rounded-lg border border-[#1B4332]/15 bg-white p-2.5">
              <div className="font-semibold text-[#1B4332] flex items-center justify-between">
                <span>Evidence Relevance</span>
                <span className="font-mono">
                  {Math.round(analysis.evidence_relevance.score * 100)}%
                </span>
              </div>
              <p className="mt-1 text-[#525B56]">
                {analysis.evidence_relevance.observations}
              </p>
            </div>

            <div className="rounded-lg border border-[#1B4332]/15 bg-white p-2.5">
              <div className="font-semibold text-[#1B4332] flex items-center justify-between">
                <span>Description Consistency</span>
                <span className="font-mono">
                  {Math.round(analysis.description_consistency.score * 100)}%
                </span>
              </div>
              <p className="mt-1 text-[#525B56]">
                {analysis.description_consistency.notes}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-[#1B4332]/15 bg-white p-2.5 space-y-1.5">
            <div className="font-semibold text-[#1C1F1E]">AI Reasoning</div>
            <p className="text-[#525B56] leading-relaxed">
              {analysis.reasoning}
            </p>
            {analysis.risk_flags.length > 0 ? (
              <div className="pt-1 flex flex-wrap items-center gap-1.5">
                <span className="font-semibold text-[#B91C1C] flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Risk Flags:
                </span>
                {analysis.risk_flags.map((flag, idx) => (
                  <Badge key={idx} variant="rejected">
                    {flag}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="pt-1 text-[#40916C] font-medium">
                No automated risk flags detected.
              </div>
            )}
          </div>

          <div className="rounded-lg bg-[#F3EFE6] px-3 py-2 text-[11px] text-[#525B56] flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 text-[#1B4332] shrink-0 mt-0.5" />
            <span>
              {analysis.disclaimer || MANDATORY_AI_DISCLAIMER} Requires explicit
              human approval (<code>requires_human_approval: true</code>).
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
