import { NextRequest, NextResponse } from "next/server";
import { AiRecommendation, AuditLogEntry } from "@/lib/ai/verification-schema";
import { appendAuditLogEntry, getAuditLogEntries } from "./store";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const actionIdParam = searchParams.get("action_id");
  const actionId = actionIdParam ? Number(actionIdParam) : undefined;
  return NextResponse.json({
    entries: getAuditLogEntries(actionId),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      action_id?: number;
      contributor_id?: string;
      admin_account_id?: string;
      human_decision?: "APPROVE" | "REJECT" | "REQUEST_ADDITIONAL_EVIDENCE";
      prior_ai_recommendation?: AiRecommendation | null;
      reason_or_note?: string;
      on_chain_tx_hash?: string | null;
    };

    const actionId = Number(body.action_id);
    if (!Number.isFinite(actionId) || actionId <= 0) {
      return NextResponse.json(
        { error: "Valid action_id is required." },
        { status: 400 }
      );
    }

    const decision = body.human_decision;
    if (
      decision !== "APPROVE" &&
      decision !== "REJECT" &&
      decision !== "REQUEST_ADDITIONAL_EVIDENCE"
    ) {
      return NextResponse.json(
        {
          error:
            "human_decision must be APPROVE, REJECT, or REQUEST_ADDITIONAL_EVIDENCE.",
        },
        { status: 400 }
      );
    }

    const priorAi = body.prior_ai_recommendation || null;
    const overrodeAi = Boolean(
      priorAi &&
        ((decision === "APPROVE" && priorAi !== "APPROVE") ||
          (decision === "REJECT" && priorAi === "APPROVE"))
    );

    const entry: AuditLogEntry = appendAuditLogEntry({
      id: `human-${actionId}-${Date.now()}`,
      timestamp_iso: new Date().toISOString(),
      entry_type: "HUMAN_ADMIN_DECISION",
      action_id: actionId,
      contributor_id: String(body.contributor_id || "unknown.testnet"),
      admin_account_id: String(body.admin_account_id || "unknown-admin.testnet"),
      human_decision: decision,
      overrode_ai: overrodeAi,
      prior_ai_recommendation: priorAi,
      reason_or_note: body.reason_or_note
        ? String(body.reason_or_note).slice(0, 500)
        : undefined,
      on_chain_tx_hash: body.on_chain_tx_hash || null,
    });

    return NextResponse.json({ entry });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Audit log write error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
