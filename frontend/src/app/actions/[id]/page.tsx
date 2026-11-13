"use client";

import React, { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useNearWallet } from "@/lib/near/wallet-provider";
import {
  getExplorerAccountUrl,
  getExplorerTxUrl,
  NEAR_CONFIG,
} from "@/lib/near/config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  formatTimestamp,
  formatYoctoToNear,
  parseNearToYocto,
  resolveIpfsUrl,
} from "@/lib/utils";
import {
  AlertCircle,
  ArrowLeft,
  Award,
  CheckCircle2,
  Clock,
  ExternalLink,
  HeartHandshake,
  Loader2,
  ShieldCheck,
  UserCheck,
  Wallet,
  XCircle,
} from "lucide-react";

const PRESET_AMOUNTS = ["0.5", "1", "2.5", "5"];

export default function ActionDetailPage() {
  const params = useParams<{ id: string }>();
  const actionId = Number(params?.id);

  const {
    accountId,
    openWalletModal,
    callContractMethod,
    actions,
    donations,
  } = useNearWallet();

  const [donationNear, setDonationNear] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);
  const [mintResult, setMintResult] = useState<{
    txHash: string;
    explorerUrl: string;
    tokenId?: string;
  } | null>(null);

  const action = useMemo(
    () => actions.find((a) => a.action_id === actionId) || null,
    [actions, actionId]
  );

  const actionDonations = useMemo(
    () => donations.filter((d) => d.action_id === actionId),
    [donations, actionId]
  );

  if (!action) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-[#1B4332]">
          Action #{String(params?.id)} Not Found
        </h1>
        <p className="text-sm text-[#525B56]">
          The requested food-sorting action could not be found in current contract
          records.
        </p>
        <Link href="/actions">
          <Button variant="primary">
            <ArrowLeft className="h-4 w-4" />
            Back to Actions Directory
          </Button>
        </Link>
      </div>
    );
  }

  const handleDonateAndMint = async (e: React.FormEvent) => {
    e.preventDefault();
    setTxError(null);
    setMintResult(null);

    if (action.status !== "Verified") {
      setTxError("Only Verified actions are eligible to receive donations.");
      return;
    }

    let depositYocto: string;
    try {
      depositYocto = parseNearToYocto(donationNear);
      const minGross = BigInt("115000000000000000000000");
      if (BigInt(depositYocto) < minGross) {
        setTxError(
          "Minimum attached amount is 0.12 NEAR (covers 0.1 NEAR minimum net treasury donation plus NEP-171 on-chain storage bytes)."
        );
        return;
      }
    } catch {
      setTxError("Please enter a valid positive NEAR amount.");
      return;
    }

    setIsSubmitting(true);
    try {
      const outcome = await callContractMethod({
        methodName: "donate_and_mint",
        args: { action_id: action.action_id },
        depositYocto,
        gas: "150000000000000",
      });

      const returnedRecord = outcome.returnValue as {
        token_id?: string;
      } | null;

      setMintResult({
        txHash: outcome.txHash,
        explorerUrl: outcome.explorerUrl,
        tokenId: returnedRecord?.token_id,
      });
    } catch (err) {
      setTxError(
        err instanceof Error
          ? err.message
          : "Donation transaction failed or was cancelled."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 space-y-8">
      <div>
        <Link
          href="/actions"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1B4332] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Actions Directory
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-6">
          <Card className="overflow-hidden">
            <div className="relative h-80 sm:h-96 w-full bg-[#F3EFE6]">
              <img
                src={resolveIpfsUrl(action.evidence_uri)}
                alt={action.action_type}
                className="h-full w-full object-cover"
              />
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <Badge variant="category">{action.food_category}</Badge>
                {action.is_demo_data && (
                  <Badge variant="demo">DEMO DATA RECORD</Badge>
                )}
              </div>
            </div>

            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs text-[#525B56]">
                  Action ID #{action.action_id} • Submitted{" "}
                  {formatTimestamp(action.submitted_at_ms)}
                </span>
                {action.status === "Verified" && (
                  <Badge variant="verified">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verified On-Chain
                  </Badge>
                )}
                {action.status === "Pending" && (
                  <Badge variant="pending">
                    <Clock className="h-3.5 w-3.5" />
                    Pending Admin Verification
                  </Badge>
                )}
                {action.status === "Rejected" && (
                  <Badge variant="rejected">
                    <XCircle className="h-3.5 w-3.5" />
                    Rejected by Admin
                  </Badge>
                )}
              </div>
              <CardTitle className="text-2xl mt-2">
                {action.action_type}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <p className="text-sm sm:text-base text-[#1C1F1E]/90 leading-relaxed">
                {action.description}
              </p>

              <div className="rounded-xl border border-[#40916C]/40 bg-[#D8F3DC]/35 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1B4332] flex items-center gap-1.5">
                    <UserCheck className="h-4 w-4 text-[#40916C]" />
                    Original Action Contributor (Action Performer)
                  </span>
                  <a
                    href={getExplorerAccountUrl(action.contributor_id)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#1B4332] hover:underline"
                  >
                    NEAR Explorer
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="font-mono text-base font-bold text-[#1B4332]">
                  {action.contributor_id}
                </div>
                <p className="text-xs text-[#525B56]">
                  When a donor supports this action via{" "}
                  <code className="font-mono">donate_and_mint()</code>, the smart
                  contract reads{" "}
                  <code className="font-mono">{action.contributor_id}</code>{" "}
                  directly from verified contract storage and embeds it inside the
                  minted NEP-171 NFT metadata.
                </p>
              </div>

              <div className="rounded-xl border border-[#1B4332]/15 bg-[#FAF8F5] p-4 text-xs space-y-2">
                <div className="font-semibold text-[#1C1F1E]">
                  On-Chain Evidence & Verification Metadata
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono">
                  <div>
                    <span className="text-[#525B56]">Category:</span>{" "}
                    <strong>{action.food_category}</strong>
                  </div>
                  <div>
                    <span className="text-[#525B56]">Verified By:</span>{" "}
                    <strong>{action.verified_by || "—"}</strong>
                  </div>
                  <div className="sm:col-span-2 truncate">
                    <span className="text-[#525B56]">Evidence URI:</span>{" "}
                    <a
                      href={resolveIpfsUrl(action.evidence_uri)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#40916C] hover:underline"
                    >
                      {action.evidence_uri}
                    </a>
                  </div>
                </div>
                {action.rejection_reason && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-2.5 text-red-900">
                    <strong>Rejection Reason:</strong> {action.rejection_reason}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Patronage History for Action #{action.action_id} (
                {actionDonations.length})
              </CardTitle>
              <CardDescription>
                Every donation mints a verifiable 1-of-1 NEP-171 certificate while
                holding net NEAR in the contract treasury.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {actionDonations.length === 0 ? (
                <p className="text-sm text-[#525B56]">
                  No patronage donations recorded for this action yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {actionDonations.map((don) => (
                    <div
                      key={don.donation_id}
                      className="rounded-xl border border-[#1B4332]/15 bg-[#FAF8F5] p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#1B4332]">
                            {don.token_id}
                          </span>
                          <Badge variant="verified">{don.treasury_status}</Badge>
                        </div>
                        <div className="text-[#525B56]">
                          Original Donor:{" "}
                          <strong className="font-mono text-[#1C1F1E]">
                            {don.donor_id}
                          </strong>{" "}
                          • Action Performed By:{" "}
                          <strong className="font-mono text-[#1B4332]">
                            {don.contributor_id}
                          </strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right font-mono">
                          <div className="font-bold text-[#1B4332]">
                            {formatYoctoToNear(don.net_treasury_amount_yocto, 4)}{" "}
                            NEAR Net
                          </div>
                          <div className="text-[11px] text-[#525B56]">
                            (+{formatYoctoToNear(don.storage_cost_yocto, 4)}{" "}
                            storage)
                          </div>
                        </div>
                        <Link href={`/verify?token=${don.token_id}`}>
                          <Button size="sm" variant="outline">
                            Verify NFT
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <Card className="border-[#1B4332]/25 shadow-md">
            <CardHeader className="bg-[#1B4332] text-[#FAF8F5] rounded-t-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#D8F3DC]">
                  Native NEAR Patronage
                </span>
                <Badge variant="verified">NEP-171 Mint</Badge>
              </div>
              <CardTitle className="text-white text-xl mt-1">
                Support Verified Action & Mint NFT
              </CardTitle>
              <CardDescription className="text-[#D8F3DC]/85">
                Calls <code className="font-mono">donate_and_mint()</code> on{" "}
                <code className="font-mono">{NEAR_CONFIG.contractId}</code>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 pt-5">
              {action.status !== "Verified" ? (
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <AlertCircle className="h-4 w-4 text-amber-700 shrink-0" />
                    Action Not Eligible for Donations ({action.status})
                  </div>
                  <p>
                    The FoodSort smart contract strictly rejects donations for{" "}
                    <strong>{action.status}</strong> actions (
                    <code className="font-mono">ERR_ACTION_NOT_VERIFIED</code>).
                    An authorized administrator must verify this action on-chain
                    before patronage is enabled.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleDonateAndMint} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1B4332]">
                      Select or Enter Attached NEAR Amount
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {PRESET_AMOUNTS.map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setDonationNear(amt)}
                          className={`rounded-xl border py-2 text-xs font-mono font-bold transition-colors cursor-pointer ${
                            donationNear === amt
                              ? "border-[#1B4332] bg-[#1B4332] text-[#FAF8F5]"
                              : "border-[#1B4332]/20 bg-[#FAF8F5] text-[#1C1F1E] hover:bg-[#D8F3DC]/50"
                          }`}
                        >
                          {amt} NEAR
                        </button>
                      ))}
                    </div>
                    <Input
                      type="number"
                      step="0.05"
                      min="0.12"
                      value={donationNear}
                      onChange={(e) => setDonationNear(e.target.value)}
                      placeholder="Custom amount in NEAR (min 0.12)"
                      className="font-mono"
                    />
                  </div>

                  <div className="rounded-xl border border-[#1B4332]/15 bg-[#FAF8F5] p-3.5 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#525B56]">
                        Action Performed By (Contributor):
                      </span>
                      <span className="font-mono font-bold text-[#1B4332]">
                        {action.contributor_id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#525B56]">
                        Patron / NFT Recipient (Donor):
                      </span>
                      <span className="font-mono font-semibold text-[#1C1F1E]">
                        {accountId || "Connect wallet"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#525B56]">
                        Minimum Net Treasury Donation:
                      </span>
                      <span className="font-mono">0.1000 NEAR</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#525B56]">
                        Estimated NEP-171 Storage Cost:
                      </span>
                      <span className="font-mono">~0.0068 NEAR</span>
                    </div>
                    <div className="border-t border-[#1B4332]/10 pt-2 flex justify-between font-semibold text-[#1B4332]">
                      <span>Treasury Holding Status:</span>
                      <span className="font-mono">HELD_IN_TREASURY</span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-[#F3EFE6] p-3 text-xs text-[#525B56] space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-[#1B4332]">
                      <ShieldCheck className="h-4 w-4 text-[#40916C]" />
                      Attribution & Treasury Guarantee
                    </div>
                    <p>
                      Your minted NFT proves your financial patronage while
                      permanently attributing the physical sorting action to{" "}
                      <strong className="font-mono text-[#1C1F1E]">
                        {action.contributor_id}
                      </strong>
                      . Net donated NEAR remains held transparently in the
                      contract treasury and is never falsely claimed as
                      distributed.
                    </p>
                  </div>

                  {txError && (
                    <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-red-900">
                      <strong>Transaction Notice:</strong> {txError}
                    </div>
                  )}

                  {mintResult && (
                    <div className="rounded-xl border border-[#40916C] bg-[#D8F3DC]/60 p-4 text-xs text-[#1B4332] space-y-2">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <Award className="h-4 w-4 text-[#1B4332]" />
                        Patronage Transaction Confirmed On-Chain!
                      </div>
                      <p className="font-mono break-all">
                        Tx Hash: {mintResult.txHash}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <a
                          href={getExplorerTxUrl(mintResult.txHash)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-semibold underline"
                        >
                          View on NEAR Testnet Explorer
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        {mintResult.tokenId && (
                          <Link
                            href={`/verify?token=${mintResult.tokenId}`}
                            className="inline-flex items-center gap-1 font-semibold underline ml-2"
                          >
                            View Minted NFT ({mintResult.tokenId})
                          </Link>
                        )}
                      </div>
                    </div>
                  )}

                  {accountId ? (
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Awaiting NEAR Wallet Signature...
                        </>
                      ) : (
                        <>
                          <HeartHandshake className="h-4 w-4" />
                          Donate {donationNear || "0"} NEAR & Mint Patronage NFT
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="secondary"
                      size="lg"
                      className="w-full"
                      onClick={openWalletModal}
                    >
                      <Wallet className="h-4 w-4" />
                      Connect NEAR Testnet Wallet to Donate
                    </Button>
                  )}
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
