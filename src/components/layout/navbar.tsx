"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNearWallet } from "@/lib/near/wallet-provider";
import { NEAR_CONFIG } from "@/lib/near/config";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatYoctoToNear } from "@/lib/utils";
import {
  AlertCircle,
  Database,
  Leaf,
  LogOut,
  Menu,
  RefreshCw,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Overview" },
  { href: "/actions", label: "Explore Actions" },
  { href: "/contribute", label: "Contribute" },
  { href: "/donor", label: "Donor Hub" },
  { href: "/admin", label: "Admin Review" },
  { href: "/verify", label: "NFT Gallery & Verify" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    accountId,
    openWalletModal,
    disconnectWallet,
    treasury,
    isUsingDemoData,
    isLoadingChain,
    refreshChainData,
    toggleDemoPreviewMode,
  } = useNearWallet();

  return (
    <header className="sticky top-0 z-40 border-b border-[#1B4332]/15 bg-[#FAF8F5]/95 backdrop-blur-md">
      <div
        className={cn(
          "border-b px-4 py-1.5 text-xs transition-colors",
          isUsingDemoData
            ? "border-amber-300 bg-amber-50 text-amber-950"
            : "border-[#40916C]/30 bg-[#D8F3DC]/60 text-[#1B4332]"
        )}
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {isUsingDemoData ? (
              <>
                <Badge variant="demo">DEMO DATA PREVIEW</Badge>
                <span>
                  Viewing clearly labeled demo records (`{NEAR_CONFIG.contractId}` on
                  NEAR Testnet). No fake transactions are ever simulated.
                </span>
              </>
            ) : (
              <>
                <Badge variant="verified">LIVE ON-CHAIN STATE</Badge>
                <span>
                  Connected to NEAR Testnet contract{" "}
                  <code className="font-mono font-semibold">
                    {NEAR_CONFIG.contractId}
                  </code>
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1 font-medium text-[#1B4332]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#40916C]" />
              Treasury:{" "}
              <strong className="font-mono">
                {formatYoctoToNear(treasury.treasury_balance_yocto, 4)} NEAR
              </strong>{" "}
              (HELD_IN_TREASURY)
            </span>

            <button
              type="button"
              onClick={() => toggleDemoPreviewMode(!isUsingDemoData)}
              className="inline-flex items-center gap-1 rounded-md border border-[#1B4332]/20 bg-white/80 px-2 py-0.5 text-[11px] font-medium text-[#1C1F1E] hover:bg-white cursor-pointer"
            >
              <Database className="h-3 w-3 text-[#40916C]" />
              {isUsingDemoData ? "Try Live RPC" : "Switch to Demo Preview"}
            </button>

            <button
              type="button"
              onClick={() => void refreshChainData()}
              className="inline-flex items-center gap-1 rounded-md p-1 text-[#1B4332] hover:bg-[#1B4332]/10 cursor-pointer"
              title="Refresh NEAR Testnet RPC data"
            >
              <RefreshCw
                className={cn("h-3.5 w-3.5", isLoadingChain && "animate-spin")}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B4332] text-[#FAF8F5] shadow-xs group-hover:bg-[#40916C] transition-colors">
            <Leaf className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-[#1B4332]">
                FoodSort
              </span>
              <span className="rounded-md bg-[#D8F3DC] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#1B4332]">
                NEAR Testnet
              </span>
            </div>
            <p className="text-[11px] text-[#525B56] hidden sm:block">
              Verifiable Food-Sorting & NEP-171 Patronage
            </p>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#1B4332] text-[#FAF8F5]"
                    : "text-[#1C1F1E]/80 hover:bg-[#D8F3DC]/60 hover:text-[#1B4332]"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {accountId ? (
            <div className="flex items-center gap-1.5 rounded-xl border border-[#1B4332]/20 bg-white px-3 py-1.5 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-[#40916C]" />
              <span className="font-mono text-xs font-semibold text-[#1B4332] max-w-[150px] truncate">
                {accountId}
              </span>
              <button
                type="button"
                onClick={disconnectWallet}
                className="ml-1 rounded-md p-1 text-[#525B56] hover:bg-red-50 hover:text-[#B91C1C] cursor-pointer"
                title="Disconnect wallet"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="primary"
              onClick={openWalletModal}
            >
              <Wallet className="h-4 w-4" />
              Connect NEAR Testnet
            </Button>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="lg:hidden rounded-xl border border-[#1B4332]/20 p-2 text-[#1B4332]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#1B4332]/15 bg-[#FAF8F5] px-4 py-3 space-y-1">
          {NAV_LINKS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block rounded-xl px-3.5 py-2.5 text-sm font-medium",
                  isActive
                    ? "bg-[#1B4332] text-[#FAF8F5]"
                    : "text-[#1C1F1E] hover:bg-[#D8F3DC]/60"
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-[#1B4332]/10 text-[11px] text-[#525B56] flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 text-[#1B4332]" />
            <span>
              All donated NEAR is held in the contract treasury (HELD_IN_TREASURY).
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
