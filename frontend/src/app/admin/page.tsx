"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useNearWallet } from "@/lib/near/wallet-provider";
import { getExplorerTxUrl, NEAR_CONFIG } from "@/lib/near/config";
import { FoodAction } from "@/lib/types";
import {
  AiVerificationResult,
  AuditLogEntry,
} from "@/lib/ai/verification-schema";
import { AiVerificationPanel } from "@/components/admin/ai-verification-panel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { formatTimestamp, resolveIpfsUrl } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FileQuestion,
  Loader2,
  Lock,
  ShieldCheck,
  UserCheck,
  Wallet,
  XCircle,
} from "lucide-react";

type AdminDecisionType =
  | "APPROVE"
  | "REJECT"
  | "REQUEST_ADDITIONAL_EVIDENCE";

export default function AdminDashboardPage() {
  const {
    accountId,
    openWalletModal,
    connectWithTestnetAccount,
    callContractMethod,
    actions,
    treasury,
    isUsingDemoData,
  } = useNearWallet();

  const [aiResultsByAction, setAiResultsByAction] = useState<
    Record<number, AiVerificationResult>
  >({});

  const [pendingConfirmation, setPendingConfirmation] = useState<{
    action: FoodAction;
    decision: AdminDecisionType;
  } | null>(null);
  const [decisionNote, setDecisionNote] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [txFeedback, setTxFeedback] = useState<{
    type: "success" | "error";
    message: string;
    txHash?: string;
  } | null>(null);

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  const isAuthorizedAdmin = Boolean(
    accountId &&
      accountId.toLowerCase() === treasury.admin_id.toLowerCase()
  );

  const pendingActions = useMemo(
    () => actions.filter((a) => a.status === "Pending"),
    [actions]
  );

  const reviewedActions = useMemo(
    () => actions.filter((a) => a.status !== "Pending"),
    [actions]
  );

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch("/api/ai/audit-log");
      if (res.ok) {
        const data = (await res.json()) as { entries?: AuditLogEntry[] };
        setAuditLogs(data.entries || []);
      }
    } catch {
      // Ignore audit log fetch errors
    }
  };

  useEffect(() => {
    void fetchAuditLogs();
  }, []);

  const openConfirmationModal = (
    action: FoodAction,
    decision: AdminDecisionType
  ) => {
    setTxFeedback(null);
    setDecisionNote(
      decision === "REQUEST_ADDITIONAL_EVIDENCE"
        ? "Additional evidence requested: Please provide a clearer photo showing the sorting bin and separated food batch."
        : ""
    );
    setPendingConfirmation({ action, decision });
  };

  const executeConfirmedHumanDecision = async () => {
    if (!pendingConfirmation) return;
    const { action, decision } = pendingConfirmation;
    const priorAi = aiResultsByAction[action.action_id]?.recommendation || null;

    if (
      (decision === "REJECT" || decision === "REQUEST_ADDITIONAL_EVIDENCE") &&
      !decisionNote.trim()
    ) {
      setTxFeedback({
        type: "error",
        message:
          "Please provide a clear reason/note before rejecting or requesting additional evidence.",
      });
      return;
    }

    setIsExecuting(true);
    setTxFeedback(null);

    try {
      const methodName =
        decision === "APPROVE" ? "verify_action" : "reject_action";
      const args =
        decision === "APPROVE"
          ? { action_id: action.action_id }
          : {
              action_id: action.action_id,
              reason: decisionNote.trim(),
            };

      const txOutcome = await callContractMethod({
        methodName,
        args,
        depositYocto: "0",
        gas: "100000000000000",
      });

      await fetch("/api/ai/audit-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action_id: action.action_id,
          contributor_id: action.contributor_id,
          admin_account_id: accountId || "unauthorized",
          human_decision: decision,
          prior_ai_recommendation: priorAi,
          reason_or_note: decisionNote.trim() || undefined,
          on_chain_tx_hash: txOutcome.txHash,
        }),
      });

      await fetchAuditLogs();
      setPendingConfirmation(null);
      setTxFeedback({
        type: "success",
        message: `Executed ${methodName}(#${action.action_id}) on NEAR Testnet.`,
        txHash: txOutcome.txHash,
      });
    } catch (err) {
      const errMsg =
        err instanceof Error ? err.message : "On-chain execution failed.";

      await fetch("/api/ai/audit-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action_id: action.action_id,
          contributor_id: action.contributor_id,
          admin_account_id: accountId || "unconnected",
          human_decision: decision,
          prior_ai_recommendation: priorAi,
          reason_or_note: `${decisionNote.trim()} [On-Chain Result: ${errMsg}]`,
          on_chain_tx_hash: null,
        }),
      }).catch(() => {});

      await fetchAuditLogs();
      setPendingConfirmation(null);
      setTxFeedback({
        type: "error",
        message: errMsg,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-[#1B4332]/15 pb-6">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#40916C]">
              On-Chain Verification & AI Triage Assistant
            </span>
            {isUsingDemoData && <Badge variant="demo">Example</Badge>}
          </div>
          <h1 className="text-3xl font-extrabold text-[#1B4332]">
            FoodSort Admin Verification Dashboard
          </h1>
          <p className="text-sm text-[#525B56] max-w-3xl">
            Inspect pending food-sorting submissions, run isolated advisory AI
            evidence analysis, and execute on-chain{" "}
            <code className="font-mono">verify_action()</code> or{" "}
            <code className="font-mono">reject_action()</code>. Smart contract
            access control (<code className="font-mono">assert_admin()</code>) is
            the single source of truth.
          </p>
        </div>

        <div className="rounded-2xl border border-[#1B4332]/20 bg-white p-4 text-xs space-y-1.5 min-w-[290px]">
          <div className="flex items-center justify-between">
            <span className="text-[#525B56]">On-Chain Authorized Admin:</span>
            <code className="font-mono font-bold text-[#1B4332]">
              {treasury.admin_id}
            </code>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#525B56]">Connected Wallet:</span>
            <code className="font-mono font-semibold text-[#1C1F1E]">
              {accountId || "Not connected"}
            </code>
          </div>
          <div className="pt-1 flex items-center justify-between border-t border-[#1B4332]/10">
            {isAuthorizedAdmin ? (
              <Badge variant="verified">
                <ShieldCheck className="h-3.5 w-3.5" />
                Authorized Admin Connected
              </Badge>
            ) : (
              <div className="flex items-center justify-between w-full gap-2">
                <Badge variant="rejected">
                  <Lock className="h-3.5 w-3.5" />
                  Non-Admin Wallet
                </Badge>
                <button
                  type="button"
                  onClick={() => connectWithTestnetAccount(treasury.admin_id)}
                  className="text-[11px] font-semibold text-[#40916C] underline cursor-pointer"
                >
                  Switch to {treasury.admin_id}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {!isAuthorizedAdmin && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-2.5 max-w-3xl">
            <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm">
                Contract-Level Admin Guard Active (`ERR_NOT_ADMIN`)
              </div>
              <p className="mt-0.5 text-amber-900">
                Only <code className="font-mono font-bold">{treasury.admin_id}</code>{" "}
                can execute <code className="font-mono">verify_action()</code> or{" "}
                <code className="font-mono">reject_action()</code> on{" "}
                <code className="font-mono">{NEAR_CONFIG.contractId}</code>.
                Non-admin accounts are blocked both in the UI and by the Rust
                smart contract&apos;s{" "}
                <code className="font-mono">
                  require!(env::predecessor_account_id() == self.admin_id)
                </code>{" "}
                check.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="primary"
              onClick={() => connectWithTestnetAccount(treasury.admin_id)}
            >
              <Wallet className="h-3.5 w-3.5" />
              Connect as {treasury.admin_id}
            </Button>
            <Button size="sm" variant="outline" onClick={openWalletModal}>
              Open Wallet Selector
            </Button>
          </div>
        </div>
      )}

      {txFeedback && (
        <div
          className={`rounded-2xl border p-4 text-xs flex items-start justify-between gap-3 ${
            txFeedback.type === "success"
              ? "border-[#40916C] bg-[#D8F3DC]/60 text-[#1B4332]"
              : "border-red-300 bg-red-50 text-red-900"
          }`}
        >
          <div className="space-y-1">
            <div className="font-bold text-sm">
              {txFeedback.type === "success"
                ? "On-Chain Admin Transaction Confirmed"
                : "On-Chain Transaction Notice"}
            </div>
            <p>{txFeedback.message}</p>
            {txFeedback.txHash && (
              <a
                href={getExplorerTxUrl(txFeedback.txHash)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-mono underline pt-1"
              >
                View Transaction {txFeedback.txHash} on NEAR Explorer
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          <button
            type="button"
            onClick={() => setTxFeedback(null)}
            className="text-xs underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="space-y-5">
        <h2 className="text-xl font-bold text-[#1B4332]">
          Pending Verification Queue ({pendingActions.length})
        </h2>

        {pendingActions.length === 0 ? (
          <Card className="p-8 text-center text-sm text-[#525B56]">
            All submitted food-sorting actions have been reviewed.
          </Card>
        ) : (
          <div className="space-y-6">
            {pendingActions.map((action) => {
              const aiResult = aiResultsByAction[action.action_id] || null;

              return (
                <Card key={action.action_id} className="overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-12">
                    <div className="lg:col-span-4 bg-[#F3EFE6] relative min-h-[240px]">
                      <img
                        src={resolveIpfsUrl(action.evidence_uri)}
                        alt={action.action_type}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <Badge variant="category">{action.food_category}</Badge>
                        {action.is_demo_data && (
                          <Badge variant="demo">Example</Badge>
                        )}
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge variant="pending">Pending Review</Badge>
                      </div>
                    </div>

                    <div className="lg:col-span-8 p-6 space-y-5">
                      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#1B4332]/10 pb-3">
                        <div>
                          <div className="text-xs font-mono text-[#525B56]">
                            Action #{action.action_id} • Submitted{" "}
                            {formatTimestamp(action.submitted_at_ms)}
                          </div>
                          <h3 className="text-xl font-bold text-[#1C1F1E] mt-0.5">
                            {action.action_type}
                          </h3>
                        </div>

                        <div className="rounded-xl bg-[#D8F3DC]/40 border border-[#40916C]/30 px-3 py-1.5 text-xs">
                          <span className="text-[#525B56] flex items-center gap-1">
                            <UserCheck className="h-3.5 w-3.5 text-[#1B4332]" />
                            Contributor Account:
                          </span>
                          <span className="font-mono font-bold text-[#1B4332]">
                            {action.contributor_id}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-[#1C1F1E]/90 leading-relaxed">
                        {action.description}
                      </p>

                      <div className="text-xs font-mono text-[#525B56] truncate">
                        Evidence URI:{" "}
                        <a
                          href={resolveIpfsUrl(action.evidence_uri)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#40916C] underline"
                        >
                          {action.evidence_uri}
                        </a>
                      </div>

                      <AiVerificationPanel
                        action={action}
                        analysis={aiResult}
                        onAnalysisComplete={(res) => {
                          setAiResultsByAction((prev) => ({
                            ...prev,
                            [action.action_id]: res,
                          }));
                          void fetchAuditLogs();
                        }}
                      />

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1B4332]/10">
                        <div className="text-xs text-[#525B56]">
                          <strong>Human Authority:</strong> You may follow or
                          override the AI recommendation. Clicking an action
                          opens an explicit confirmation step before signing on
                          NEAR Testnet.
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="primary"
                            disabled={!isAuthorizedAdmin}
                            onClick={() =>
                              openConfirmationModal(action, "APPROVE")
                            }
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Approve (verify_action)
                          </Button>

                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={!isAuthorizedAdmin}
                            onClick={() =>
                              openConfirmationModal(
                                action,
                                "REQUEST_ADDITIONAL_EVIDENCE"
                              )
                            }
                          >
                            <FileQuestion className="h-4 w-4" />
                            Request Additional Evidence
                          </Button>

                          <Button
                            type="button"
                            size="sm"
                            variant="danger"
                            disabled={!isAuthorizedAdmin}
                            onClick={() =>
                              openConfirmationModal(action, "REJECT")
                            }
                          >
                            <XCircle className="h-4 w-4" />
                            Reject (reject_action)
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-[#1B4332]" />
            <CardTitle>
              Separate AI Recommendations & Human Admin Audit Log
            </CardTitle>
          </div>
          <CardDescription>
            Prompt #6.5 Security Requirement: AI recommendations and final human
            admin decisions are logged as separate entries so human overrides are
            transparently auditable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {auditLogs.length === 0 ? (
            <p className="text-xs text-[#525B56]">
              No AI analyses or admin decisions logged in this session yet. Run
              AI Evidence Analysis or execute an admin action above to populate
              the audit trail.
            </p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {auditLogs.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-xl border border-[#1B4332]/15 bg-[#FAF8F5] p-3 text-xs flex flex-wrap items-center justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          entry.entry_type === "AI_RECOMMENDATION"
                            ? "neutral"
                            : "verified"
                        }
                      >
                        {entry.entry_type}
                      </Badge>
                      <span className="font-mono font-bold text-[#1B4332]">
                        Action #{entry.action_id}
                      </span>
                      <span className="text-[#525B56]">
                        Contributor: {entry.contributor_id}
                      </span>
                    </div>

                    {entry.entry_type === "AI_RECOMMENDATION" ? (
                      <div className="text-[#1C1F1E]">
                        AI Recommended:{" "}
                        <strong>{entry.ai_recommendation}</strong> (Confidence:{" "}
                        {Math.round((entry.ai_confidence_score || 0) * 100)}% •
                        Model: {entry.ai_model})
                      </div>
                    ) : (
                      <div className="text-[#1C1F1E]">
                        Human Admin (
                        <code className="font-mono">
                          {entry.admin_account_id}
                        </code>
                        ) Decision: <strong>{entry.human_decision}</strong>
                        {entry.overrode_ai && (
                          <Badge variant="pending" className="ml-2">
                            Overrode AI ({entry.prior_ai_recommendation})
                          </Badge>
                        )}
                        {entry.reason_or_note && (
                          <span className="block text-[#525B56] mt-0.5">
                            Note: {entry.reason_or_note}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] font-mono text-[#525B56]">
                    {entry.timestamp_iso}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Reviewed Actions History ({reviewedActions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2.5">
            {reviewedActions.map((act) => (
              <div
                key={act.action_id}
                className="rounded-xl border border-[#1B4332]/15 bg-[#FAF8F5] p-3 text-xs flex flex-wrap items-center justify-between gap-2"
              >
                <div>
                  <span className="font-mono font-bold text-[#1B4332]">
                    Action #{act.action_id}
                  </span>{" "}
                  — <strong>{act.action_type}</strong> ({act.food_category}) by{" "}
                  <code className="font-mono">{act.contributor_id}</code>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      act.status === "Verified" ? "verified" : "rejected"
                    }
                  >
                    {act.status}
                  </Badge>
                  <span className="text-[#525B56] font-mono">
                    by {act.verified_by || treasury.admin_id}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(pendingConfirmation)}
        onClose={() => !isExecuting && setPendingConfirmation(null)}
        title="Confirm On-Chain Human Admin Decision"
        description="Explicit human confirmation is required before invoking the NEAR smart contract."
      >
        {pendingConfirmation && (
          <div className="space-y-4 text-xs">
            <div className="rounded-xl border border-[#1B4332]/20 bg-white p-3.5 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#525B56]">Target Action:</span>
                <strong className="font-mono">
                  #{pendingConfirmation.action.action_id} (
                  {pendingConfirmation.action.food_category})
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#525B56]">Contributor:</span>
                <strong className="font-mono text-[#1B4332]">
                  {pendingConfirmation.action.contributor_id}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#525B56]">Prior AI Recommendation:</span>
                <strong className="font-mono">
                  {aiResultsByAction[pendingConfirmation.action.action_id]
                    ?.recommendation || "Not run (Manual review)"}
                </strong>
              </div>
              <div className="flex justify-between border-t border-[#1B4332]/10 pt-1.5">
                <span className="text-[#525B56]">Your Human Decision:</span>
                <Badge
                  variant={
                    pendingConfirmation.decision === "APPROVE"
                      ? "verified"
                      : pendingConfirmation.decision ===
                          "REQUEST_ADDITIONAL_EVIDENCE"
                        ? "pending"
                        : "rejected"
                  }
                >
                  {pendingConfirmation.decision}
                </Badge>
              </div>
            </div>

            {(pendingConfirmation.decision === "REJECT" ||
              pendingConfirmation.decision ===
                "REQUEST_ADDITIONAL_EVIDENCE") && (
              <div className="space-y-1.5">
                <label className="font-semibold text-[#1C1F1E]">
                  Reason / Evidence Request Note (Recorded On-Chain):
                </label>
                <Textarea
                  value={decisionNote}
                  onChange={(e) => setDecisionNote(e.target.value)}
                  placeholder="Provide reason for rejection or specify what additional evidence is required..."
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isExecuting}
                onClick={() => setPendingConfirmation(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant={
                  pendingConfirmation.decision === "APPROVE"
                    ? "primary"
                    : "danger"
                }
                size="sm"
                disabled={isExecuting}
                onClick={executeConfirmedHumanDecision}
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Signing On-Chain Transaction...
                  </>
                ) : (
                  <>
                    Confirm & Sign{" "}
                    {pendingConfirmation.decision === "APPROVE"
                      ? "verify_action()"
                      : "reject_action()"}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
