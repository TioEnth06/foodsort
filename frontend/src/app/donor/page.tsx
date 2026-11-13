"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useNearWallet } from "@/lib/near/wallet-provider";
import { getExplorerAccountUrl, getExplorerTxUrl } from "@/lib/near/config";
import { DonationNftExtraMetadata } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatTimestamp,
  formatYoctoToNear,
  resolveIpfsUrl,
} from "@/lib/utils";
import {
  AlertTriangle,
  Award,
  ExternalLink,
  HeartHandshake,
  Loader2,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  Wallet,
} from "lucide-react";

export default function DonorDashboardPage() {
  const {
    accountId,
    openWalletModal,
    connectWithTestnetAccount,
    donations,
    nftTokens,
    treasury,
    isUsingDemoData,
    isLoadingChain,
    chainConnectionError,
    refreshChainData,
  } = useNearWallet();

  // Strictly isolate private donor portfolio to the connected wallet accountId
  const donorDonations = useMemo(
    () => (accountId ? donations.filter((d) => d.donor_id === accountId) : []),
    [donations, accountId]
  );

  const ownedNfts = useMemo(
    () => (accountId ? nftTokens.filter((t) => t.owner_id === accountId) : []),
    [nftTokens, accountId]
  );

  const totalNetDonatedYocto = useMemo(() => {
    return donorDonations.reduce(
      (acc, d) => acc + BigInt(d.net_treasury_amount_yocto || "0"),
      0n
    );
  }, [donorDonations]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#1B4332]/15 pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#40916C]">
              Your support
            </span>
            {isUsingDemoData && <Badge variant="demo">Example</Badge>}
          </div>
          <h1 className="text-3xl font-extrabold text-[#1B4332]">
            Donor hub
          </h1>
          <p className="text-sm text-[#525B56] max-w-2xl">
            See donations and certificates tied to your wallet. Every
            certificate keeps credit with the original contributor, and net
            funds stay held in the treasury.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refreshChainData()}
            disabled={isLoadingChain}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isLoadingChain ? "animate-spin" : ""}`}
            />
            Refresh Portfolio
          </Button>
          {!accountId ? (
            <Button variant="primary" onClick={openWalletModal}>
              <Wallet className="h-4 w-4" />
              Connect Donor Wallet
            </Button>
          ) : (
            <a
              href={getExplorerAccountUrl(accountId)}
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="outline" size="sm">
                Account: {accountId}
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </a>
          )}
        </div>
      </div>

      {chainConnectionError && !isUsingDemoData && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0" />
            <span>RPC Notice: {chainConnectionError}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => void refreshChainData()}
          >
            Retry RPC
          </Button>
        </div>
      )}

      {/* Donor Summary Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-1">
            <CardDescription>Connected Donor Wallet</CardDescription>
            <CardTitle className="font-mono text-base text-[#1B4332] truncate">
              {accountId || "Not Connected"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-[#525B56]">
            {accountId
              ? "Isolated to connected NEAR account"
              : "Connect wallet to view personal gallery"}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardDescription>Your net held in treasury</CardDescription>
            <CardTitle className="text-2xl text-[#1B4332]">
              {formatYoctoToNear(totalNetDonatedYocto, 4)} NEAR
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-[#40916C] font-semibold">
            Held in treasury · Distributed: 0 NEAR
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardDescription>Certificates you own</CardDescription>
            <CardTitle className="text-2xl text-[#1B4332]">
              {ownedNfts.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-[#525B56]">
            From your connected wallet
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardDescription>Verified Actions Supported</CardDescription>
            <CardTitle className="font-mono text-2xl text-[#1B4332]">
              {donorDonations.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-[#525B56]">
            100% contributor attribution preserved
          </CardContent>
        </Card>
      </div>

      {/* Owned certificates */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-[#1B4332]">
              Your certificates ({ownedNfts.length})
            </h2>
            <p className="text-xs text-[#525B56]">
              Only certificates owned by your connected wallet.
            </p>
          </div>
          <Link href="/verify">
            <Button variant="outline" size="sm">
              Open verification
            </Button>
          </Link>
        </div>

        {isLoadingChain ? (
          <Card className="p-12 text-center text-sm text-[#525B56] flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-[#40916C]" />
            Loading your certificates...
          </Card>
        ) : !accountId ? (
          <Card className="p-8 text-center space-y-4">
            <p className="text-sm text-[#525B56]">
              Connect a NEAR wallet to see your certificates and donation
              history.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button variant="primary" size="sm" onClick={openWalletModal}>
                <Wallet className="h-4 w-4" />
                Connect NEAR
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  connectWithTestnetAccount("foodsort-contrib-6146.testnet")
                }
              >
                Try live contributor wallet
              </Button>
            </div>
          </Card>
        ) : ownedNfts.length === 0 ? (
          <Card className="p-8 text-center space-y-3">
            <p className="text-sm text-[#525B56]">
              No certificates owned by{" "}
              <strong>{accountId}</strong> yet.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/actions">
                <Button variant="primary" size="sm">
                  Support a verified action
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  connectWithTestnetAccount("foodsort-contrib-6146.testnet")
                }
              >
                Try live contributor wallet
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ownedNfts.map((token) => {
              let extra: DonationNftExtraMetadata | null = null;
              if (token.metadata?.extra) {
                try {
                  extra = JSON.parse(
                    token.metadata.extra
                  ) as DonationNftExtraMetadata;
                } catch {
                  extra = null;
                }
              }

              return (
                <Card
                  key={token.token_id}
                  className="overflow-hidden flex flex-col"
                >
                  <div className="relative h-48 w-full bg-[#F3EFE6]">
                    <img
                      src={resolveIpfsUrl(token.metadata?.media || "")}
                      alt={token.metadata?.title || token.token_id}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <Badge variant="category">
                        {extra?.food_category || "VERIFIED"}
                      </Badge>
                      {token.is_demo_data && (
                        <Badge variant="demo">Example</Badge>
                      )}
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge variant="verified">Certificate</Badge>
                    </div>
                  </div>

                  <CardHeader className="pb-2">
                    <div className="text-xs text-[#40916C] font-bold">
                      {token.token_id}
                    </div>
                    <CardTitle className="text-base mt-0.5">
                      {token.metadata?.title || token.token_id}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-3 text-xs">
                    <div className="rounded-xl border border-[#40916C]/40 bg-[#D8F3DC]/35 p-3 space-y-1.5">
                      <div className="flex justify-between gap-2">
                        <span className="text-[#525B56] flex items-center gap-1">
                          <UserCheck className="h-3.5 w-3.5 text-[#1B4332]" />
                          Contributor
                        </span>
                        <span className="font-bold text-[#1B4332] text-right break-all">
                          {extra?.original_contributor_id || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-[#525B56] flex items-center gap-1">
                          <HeartHandshake className="h-3.5 w-3.5 text-[#40916C]" />
                          Original donor
                        </span>
                        <span className="font-semibold text-[#1C1F1E] text-right break-all">
                          {extra?.original_donor_id || token.owner_id}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-[#525B56] flex items-center gap-1">
                          <Award className="h-3.5 w-3.5 text-[#1B4332]" />
                          Current owner
                        </span>
                        <span className="font-semibold text-[#1C1F1E] text-right break-all">
                          {token.owner_id}
                        </span>
                      </div>
                    </div>

                    {extra && (
                      <div className="rounded-xl bg-[#FAF8F5] border border-[#1B4332]/10 p-2.5 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-[#525B56]">Amount held</span>
                          <strong className="text-[#1B4332]">
                            {formatYoctoToNear(
                              extra.net_treasury_donation_yocto,
                              4
                            )}{" "}
                            NEAR
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#525B56]">Status</span>
                          <span className="text-[#40916C] font-bold">
                            Held in treasury
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter>
                    <Link
                      href={`/verify/${encodeURIComponent(token.token_id)}`}
                      className="w-full"
                    >
                      <Button variant="primary" size="sm" className="w-full">
                        <ShieldCheck className="h-4 w-4" />
                        View public proof
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Donation History Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Donation history · {accountId || "connect a wallet"}
          </CardTitle>
          <CardDescription>
            Amount sent, storage fee, and net held in treasury. Distributed: 0
            NEAR.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!accountId ? (
            <p className="text-sm text-[#525B56]">
              Connect a NEAR Testnet wallet to view its donation ledger.
            </p>
          ) : donorDonations.length === 0 ? (
            <p className="text-sm text-[#525B56]">
              No donation records found for account{" "}
              <code className="font-mono">{accountId}</code>.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1B4332]/15 text-[#525B56]">
                    <th className="py-2.5 pr-4">Donation / Token ID</th>
                    <th className="py-2.5 pr-4">Action & Contributor</th>
                    <th className="py-2.5 pr-4">Gross Attached</th>
                    <th className="py-2.5 pr-4">Storage Cost</th>
                    <th className="py-2.5 pr-4">Net Held in Treasury</th>
                    <th className="py-2.5 pr-4">Date</th>
                    <th className="py-2.5 text-right">Proof</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1B4332]/10 font-mono">
                  {donorDonations.map((d) => (
                    <tr key={d.donation_id}>
                      <td className="py-3 pr-4 font-bold text-[#1B4332]">
                        {d.token_id}
                      </td>
                      <td className="py-3 pr-4">
                        <Link
                          href={`/actions/${d.action_id}`}
                          className="underline text-[#1C1F1E]"
                        >
                          Action #{d.action_id}
                        </Link>
                        <div className="text-[11px] text-[#40916C]">
                          By: {d.contributor_id}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        {formatYoctoToNear(d.gross_attached_yocto, 4)} NEAR
                      </td>
                      <td className="py-3 pr-4 text-[#525B56]">
                        {formatYoctoToNear(d.storage_cost_yocto, 4)} NEAR
                      </td>
                      <td className="py-3 pr-4 font-bold text-[#1B4332]">
                        {formatYoctoToNear(d.net_treasury_amount_yocto, 4)} NEAR{" "}
                        <Badge variant="verified" className="ml-1">
                          {d.treasury_status}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 font-sans text-[#525B56]">
                        {formatTimestamp(d.donated_at_ms)}
                      </td>
                      <td className="py-3 text-right font-sans">
                        <div className="inline-flex items-center gap-2">
                          {d.tx_hash && (
                            <a
                              href={getExplorerTxUrl(d.tx_hash)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#40916C] hover:underline inline-flex items-center gap-0.5"
                            >
                              Tx <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          <Link
                            href={`/verify/${encodeURIComponent(d.token_id)}`}
                            className="font-semibold text-[#1B4332] hover:underline"
                          >
                            Verify
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
