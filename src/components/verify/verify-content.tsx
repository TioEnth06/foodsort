"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useNearWallet } from "@/lib/near/wallet-provider";
import {
  getExplorerAccountUrl,
  getExplorerTxUrl,
  NEAR_CONFIG,
} from "@/lib/near/config";
import { getOnChainNftVerificationProof } from "@/lib/near/rpc";
import { getDemoVerificationProof } from "@/lib/mock-data";
import {
  DonationNftExtraMetadata,
  NftVerificationProof,
} from "@/lib/types";
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
  resolveIpfsUrl,
} from "@/lib/utils";
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  ExternalLink,
  Globe,
  HeartHandshake,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";

export function VerifyContent({
  initialTokenOverride,
}: {
  initialTokenOverride?: string;
}) {
  const searchParams = useSearchParams();
  const initialTokenParam =
    initialTokenOverride ||
    searchParams.get("token") ||
    "foodsort-donation-1";

  const {
    accountId,
    nftTokens,
    donations,
    actions,
    isUsingDemoData,
    isLoadingChain,
    chainConnectionError,
    refreshChainData,
  } = useNearWallet();

  const [lookupInput, setLookupInput] = useState(initialTokenParam);
  const [selectedTokenId, setSelectedTokenId] = useState(initialTokenParam);
  const [proof, setProof] = useState<NftVerificationProof | null>(null);
  const [isLoadingProof, setIsLoadingProof] = useState(false);
  const [proofError, setProofError] = useState<string | null>(null);
  const [galleryTab, setGalleryTab] = useState<"all" | "owned">("all");

  useEffect(() => {
    const tokenFromUrl = initialTokenOverride || searchParams.get("token");
    if (tokenFromUrl) {
      setLookupInput(tokenFromUrl);
      setSelectedTokenId(tokenFromUrl);
    }
  }, [initialTokenOverride, searchParams]);

  const loadProof = useCallback(
    async (tokenIdToLoad: string) => {
      setIsLoadingProof(true);
      setProofError(null);

      try {
        if (!isUsingDemoData) {
          const liveProof =
            await getOnChainNftVerificationProof(tokenIdToLoad);
          if (liveProof) {
            setProof({
              ...liveProof,
              network: liveProof.network || NEAR_CONFIG.networkId,
              is_demo_data: false,
            });
            setIsLoadingProof(false);
            return;
          }
        }

        const demoProof = getDemoVerificationProof(tokenIdToLoad);
        if (demoProof) {
          setProof(demoProof);
        } else {
          setProof(null);
          setProofError(
            `No NEP-171 Patronage NFT found with token_id '${tokenIdToLoad}'.`
          );
        }
      } catch (err) {
        const demoProof = getDemoVerificationProof(tokenIdToLoad);
        if (demoProof) {
          setProof(demoProof);
        } else {
          setProof(null);
          setProofError(
            err instanceof Error
              ? err.message
              : `Unable to verify token '${tokenIdToLoad}'.`
          );
        }
      } finally {
        setIsLoadingProof(false);
      }
    },
    [isUsingDemoData]
  );

  useEffect(() => {
    if (selectedTokenId) {
      void loadProof(selectedTokenId);
    }
  }, [selectedTokenId, loadProof]);

  const displayedGalleryTokens = useMemo(() => {
    if (galleryTab === "owned") {
      if (!accountId) return [];
      return nftTokens.filter((t) => t.owner_id === accountId);
    }
    return nftTokens;
  }, [nftTokens, galleryTab, accountId]);

  const parsedExtra = useMemo<DonationNftExtraMetadata | null>(() => {
    if (!proof?.token_metadata?.extra) return null;
    try {
      return JSON.parse(
        proof.token_metadata.extra
      ) as DonationNftExtraMetadata;
    } catch {
      return null;
    }
  }, [proof]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#1B4332]/15 pb-6">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="verified">
              <ShieldCheck className="h-3.5 w-3.5" />
              Public Walletless Verification
            </Badge>
            <Badge variant="neutral">
              <Globe className="h-3 w-3" />
              Network: {NEAR_CONFIG.networkId}
            </Badge>
            {isUsingDemoData && <Badge variant="demo">DEMO DATA</Badge>}
          </div>
          <h1 className="text-3xl font-extrabold text-[#1B4332]">
            FoodSort NFT Gallery & Public Verification
          </h1>
          <p className="text-sm text-[#525B56] max-w-3xl">
            Accessible without connecting a wallet via{" "}
            <code className="font-mono">/verify</code> or{" "}
            <code className="font-mono">/verify/[tokenId]</code>. Queries NEAR
            Testnet RPC (<code className="font-mono">{NEAR_CONFIG.contractId}</code>
            ) to verify NEP-171 ownership, NEP-177 metadata, treasury holding
            status, and 3-party provenance distinguishing the{" "}
            <strong>Current NFT Owner</strong>,{" "}
            <strong>Original Donor</strong>, and{" "}
            <strong>Original Action Contributor</strong>.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            void refreshChainData();
            void loadProof(selectedTokenId);
          }}
          disabled={isLoadingProof || isLoadingChain}
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${
              isLoadingProof || isLoadingChain ? "animate-spin" : ""
            }`}
          />
          Retry / Refresh RPC
        </Button>
      </div>

      <Card className="bg-[#1B4332] text-[#FAF8F5] border-[#1B4332]">
        <CardContent className="pt-6 space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (lookupInput.trim()) {
                setSelectedTokenId(lookupInput.trim());
              }
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="h-4 w-4 text-[#525B56] absolute left-3.5 top-3.5" />
              <Input
                value={lookupInput}
                onChange={(e) => setLookupInput(e.target.value)}
                placeholder="Enter NEP-171 token_id (e.g. foodsort-donation-1, foodsort-donation-2)..."
                className="pl-10 font-mono bg-white text-[#1C1F1E]"
              />
            </div>
            <Button type="submit" variant="secondary">
              Verify NEP-171 Token On-Chain
            </Button>
          </form>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#D8F3DC]/80">Quick inspect tokens:</span>
            {nftTokens.map((t) => (
              <button
                key={t.token_id}
                type="button"
                onClick={() => {
                  setLookupInput(t.token_id);
                  setSelectedTokenId(t.token_id);
                }}
                className={`rounded-lg px-2.5 py-1 font-mono transition-colors cursor-pointer ${
                  selectedTokenId === t.token_id
                    ? "bg-[#D8F3DC] text-[#1B4332] font-bold"
                    : "bg-[#122E22] text-[#D8F3DC] hover:bg-[#40916C]"
                }`}
              >
                {t.token_id}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {isLoadingProof ? (
        <Card className="p-12 text-center text-sm text-[#525B56] flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-[#40916C]" />
          Querying NEAR Testnet RPC for <code>{selectedTokenId}</code>...
        </Card>
      ) : proofError || !proof ? (
        <Card className="p-8 border-red-300 bg-red-50 text-red-900 text-sm space-y-3">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="h-4 w-4 text-red-700" />
            Verification Lookup Error
          </div>
          <p>{proofError || "Token verification proof not found."}</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => void loadProof(selectedTokenId)}
            >
              Retry Lookup
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                setLookupInput("foodsort-donation-1");
                setSelectedTokenId("foodsort-donation-1");
              }}
            >
              Load foodsort-donation-1
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5 space-y-6">
            <Card className="overflow-hidden">
              <div className="relative h-72 w-full bg-[#F3EFE6]">
                <img
                  src={resolveIpfsUrl(
                    proof.token_metadata?.media || proof.action.evidence_uri
                  )}
                  alt={proof.token_metadata?.title || proof.token_id}
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <Badge variant="category">{proof.action.food_category}</Badge>
                  {proof.is_demo_data && (
                    <Badge variant="demo">DEMO DATA</Badge>
                  )}
                </div>
                <div className="absolute top-3 right-3">
                  <Badge variant="verified">NEP-171 + NEP-177</Badge>
                </div>
              </div>

              <CardHeader>
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="font-bold text-[#40916C]">
                    Token ID: {proof.token_id}
                  </span>
                  <span className="text-[#525B56]">
                    Network: {proof.network || NEAR_CONFIG.networkId}
                  </span>
                </div>
                <CardTitle className="text-lg mt-1">
                  {proof.token_metadata?.title}
                </CardTitle>
                <CardDescription>
                  {proof.token_metadata?.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 text-xs">
                <div className="rounded-xl bg-[#FAF8F5] border border-[#1B4332]/15 p-3 font-mono space-y-1">
                  <div className="font-sans font-semibold text-[#1B4332] pb-1">
                    Raw NEP-177 TokenMetadata.extra JSON
                  </div>
                  <pre className="overflow-x-auto text-[11px] text-[#1C1F1E] leading-relaxed">
                    {JSON.stringify(parsedExtra, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <Card className="border-[#1B4332]/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#40916C] flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    Three-Party Cryptographic Provenance
                  </span>
                  <Badge
                    variant={
                      proof.is_held_by_original_donor ? "verified" : "pending"
                    }
                  >
                    {proof.is_held_by_original_donor
                      ? "Held by Original Donor"
                      : "Transferred After Mint (Secondary Holder)"}
                  </Badge>
                </div>
                <CardTitle className="text-xl mt-1">
                  Role Separation & Attribution Proof
                </CardTitle>
                <CardDescription>
                  FoodSort strictly separates the person who performed the
                  food-sorting action from the financial patron and the current
                  NFT holder.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border-2 border-[#40916C] bg-[#D8F3DC]/35 p-3.5 space-y-1.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#1B4332] flex items-center gap-1">
                      <UserCheck className="h-3.5 w-3.5 text-[#1B4332]" />
                      1. Original Contributor
                    </div>
                    <div className="font-mono text-sm font-bold text-[#1B4332] break-all">
                      {proof.original_contributor_id}
                    </div>
                    <p className="text-[11px] text-[#525B56]">
                      Performed and documented the physical food-sorting action
                      (#{proof.action.action_id}).
                    </p>
                    <a
                      href={getExplorerAccountUrl(proof.original_contributor_id)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1B4332] underline"
                    >
                      Explorer <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  <div className="rounded-xl border border-[#1B4332]/20 bg-[#FAF8F5] p-3.5 space-y-1.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#40916C] flex items-center gap-1">
                      <HeartHandshake className="h-3.5 w-3.5" />
                      2. Original Donor
                    </div>
                    <div className="font-mono text-sm font-bold text-[#1C1F1E] break-all">
                      {proof.original_donor_id}
                    </div>
                    <p className="text-[11px] text-[#525B56]">
                      Contributed native NEAR to the contract treasury and
                      minted this NFT.
                    </p>
                    <a
                      href={getExplorerAccountUrl(proof.original_donor_id)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1B4332] underline"
                    >
                      Explorer <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  <div className="rounded-xl border border-[#1B4332]/20 bg-[#FAF8F5] p-3.5 space-y-1.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#1B4332] flex items-center gap-1">
                      <Award className="h-3.5 w-3.5" />
                      3. Current NFT Owner
                    </div>
                    <div className="font-mono text-sm font-bold text-[#1C1F1E] break-all">
                      {proof.current_owner_id}
                    </div>
                    <p className="text-[11px] text-[#525B56]">
                      Current NEP-171 holder of <code>{proof.token_id}</code>.
                    </p>
                    <a
                      href={getExplorerAccountUrl(proof.current_owner_id)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1B4332] underline"
                    >
                      Explorer <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                <div className="rounded-xl border border-[#1B4332]/20 bg-white p-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1B4332]">
                      On-Chain Donation & Treasury Accounting (Donation #
                      {proof.donation.donation_id})
                    </span>
                    <Badge variant="verified">
                      {proof.donation.treasury_status} (Distributed: 0 NEAR)
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono pt-1">
                    <div className="rounded-lg bg-[#FAF8F5] p-2.5">
                      <div className="text-[11px] font-sans text-[#525B56]">
                        Gross Attached Deposit
                      </div>
                      <div className="text-sm font-bold text-[#1C1F1E]">
                        {formatYoctoToNear(
                          proof.donation.gross_attached_yocto,
                          4
                        )}{" "}
                        NEAR
                      </div>
                    </div>

                    <div className="rounded-lg bg-[#FAF8F5] p-2.5">
                      <div className="text-[11px] font-sans text-[#525B56]">
                        NEP-171 Storage Reserved
                      </div>
                      <div className="text-sm font-bold text-[#525B56]">
                        {formatYoctoToNear(
                          proof.donation.storage_cost_yocto,
                          4
                        )}{" "}
                        NEAR
                      </div>
                    </div>

                    <div className="rounded-lg bg-[#D8F3DC]/50 p-2.5">
                      <div className="text-[11px] font-sans text-[#1B4332]">
                        Funds Held in Treasury
                      </div>
                      <div className="text-sm font-bold text-[#1B4332]">
                        {formatYoctoToNear(
                          proof.donation.net_treasury_amount_yocto,
                          4
                        )}{" "}
                        NEAR
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1B4332]/10">
                    <span className="text-[#525B56]">
                      Minted At: {formatTimestamp(proof.donation.donated_at_ms)}
                    </span>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/verify/${encodeURIComponent(proof.token_id)}`}
                        className="font-mono font-semibold text-[#1B4332] underline"
                      >
                        Direct Permalink (/verify/{proof.token_id})
                      </Link>
                      {proof.donation.tx_hash && (
                        <a
                          href={getExplorerTxUrl(proof.donation.tx_hash)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-mono font-semibold text-[#40916C] underline"
                        >
                          Mint Tx: {proof.donation.tx_hash}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-[#1B4332]/15 bg-[#FAF8F5] p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1C1F1E] flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-[#40916C]" />
                      Linked Verified Action #{proof.action.action_id}:{" "}
                      {proof.action.action_type} ({proof.action.status})
                    </span>
                    <Link
                      href={`/actions/${proof.action.action_id}`}
                      className="font-semibold text-[#1B4332] underline"
                    >
                      Open Action Page →
                    </Link>
                  </div>
                  <p className="text-[#525B56]">{proof.action.description}</p>
                  <div className="font-mono text-[11px] text-[#525B56]">
                    Verified By: <strong>{proof.action.verified_by}</strong> on{" "}
                    {formatTimestamp(proof.action.verified_at_ms)} • Evidence:{" "}
                    {proof.action.evidence_uri}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {chainConnectionError && !isUsingDemoData && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950 flex items-center justify-between">
          <span>RPC Connection Warning: {chainConnectionError}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => void refreshChainData()}
          >
            Retry RPC
          </Button>
        </div>
      )}

      <div className="space-y-4 pt-4 border-t border-[#1B4332]/15">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-[#1B4332]">
              On-Chain NEP-171 Patronage NFT Gallery
            </h2>
            <p className="text-xs text-[#525B56]">
              Click any NFT card to load its complete 3-party cryptographic
              verification proof above.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={galleryTab === "all" ? "primary" : "outline"}
              onClick={() => setGalleryTab("all")}
            >
              All Minted NFTs ({nftTokens.length})
            </Button>
            <Button
              size="sm"
              variant={galleryTab === "owned" ? "primary" : "outline"}
              onClick={() => setGalleryTab("owned")}
            >
              Owned by Connected Wallet (
              {accountId
                ? nftTokens.filter((t) => t.owner_id === accountId).length
                : 0}
              )
            </Button>
          </div>
        </div>

        {displayedGalleryTokens.length === 0 ? (
          <Card className="p-8 text-center text-sm text-[#525B56]">
            {galleryTab === "owned" && !accountId
              ? "Connect your NEAR Testnet wallet to filter NFTs owned by your account, or view All Minted NFTs."
              : `No NEP-171 NFTs are currently owned by ${accountId}.`}
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {displayedGalleryTokens.map((token) => {
              const linkedDonation = donations.find(
                (d) => d.token_id === token.token_id
              );
              const linkedAction = actions.find(
                (a) => a.action_id === linkedDonation?.action_id
              );
              const isTransferred =
                linkedDonation && token.owner_id !== linkedDonation.donor_id;

              return (
                <Card
                  key={token.token_id}
                  className={`overflow-hidden cursor-pointer transition-all ${
                    selectedTokenId === token.token_id
                      ? "ring-2 ring-[#1B4332] border-[#1B4332]"
                      : "hover:border-[#40916C]"
                  }`}
                  onClick={() => {
                    setLookupInput(token.token_id);
                    setSelectedTokenId(token.token_id);
                  }}
                >
                  <div className="relative h-44 w-full bg-[#F3EFE6]">
                    <img
                      src={resolveIpfsUrl(token.metadata?.media || "")}
                      alt={token.token_id}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <Badge variant="category">
                        {linkedAction?.food_category || "NFT"}
                      </Badge>
                      {isTransferred && (
                        <Badge variant="pending">Transferred Holder</Badge>
                      )}
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <div className="font-mono text-xs font-bold text-[#40916C]">
                      {token.token_id}
                    </div>
                    <CardTitle className="text-sm mt-0.5 line-clamp-1">
                      {token.metadata?.title || token.token_id}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-1 font-mono">
                    <div className="flex justify-between">
                      <span className="font-sans text-[#525B56]">
                        Contributor:
                      </span>
                      <span className="font-bold text-[#1B4332]">
                        {linkedDonation?.contributor_id || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans text-[#525B56]">
                        Original Donor:
                      </span>
                      <span>{linkedDonation?.donor_id || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans text-[#525B56]">
                        Current Owner:
                      </span>
                      <span className="font-semibold text-[#1C1F1E]">
                        {token.owner_id}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
