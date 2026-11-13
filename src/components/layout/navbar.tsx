"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNearWallet } from "@/lib/near/wallet-provider";
import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  Database,
  LogOut,
  Menu,
  RefreshCw,
  X,
} from "lucide-react";

const PRIMARY_NAV = [
  { href: "/actions", label: "Explore" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#impact", label: "Impact" },
  { href: "/verify", label: "Verify" },
];

const APP_ROUTES = [
  { href: "/contribute", label: "Contribute" },
  { href: "/donor", label: "Donor Hub" },
  { href: "/admin", label: "Admin" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const {
    accountId,
    openWalletModal,
    disconnectWallet,
    isUsingDemoData,
    isLoadingChain,
    refreshChainData,
    toggleDemoPreviewMode,
  } = useNearWallet();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-300",
        scrolled
          ? "border-b border-[#102A1F]/12 bg-[#F5F2E9]/95 backdrop-blur-md shadow-[0_1px_0_rgba(16,42,31,0.05)]"
          : "border-b border-[#102A1F]/8 bg-[#F5F2E9]/70 backdrop-blur-sm"
      )}
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3.5 sm:px-8 lg:px-12">
        {/* Left: Wordmark */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="group flex items-baseline gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6F8F45] rounded-sm"
          >
            <span className="text-xl font-extrabold tracking-[-0.04em] text-[#102A1F]">
              FoodSort
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#18211C]/65">
              <span className="h-1.5 w-1.5 rounded-full bg-[#6F8F45]" />
              NEAR
            </span>
          </Link>

          {/* Subtle Truthfulness Data-Source Pill */}
          <button
            type="button"
            onClick={() => toggleDemoPreviewMode(!isUsingDemoData)}
            title="Switch between Demo Preview and Live NEAR Testnet RPC"
            className="hidden xl:inline-flex items-center gap-1.5 rounded-full border border-[#102A1F]/15 bg-white/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#18211C]/80 hover:border-[#102A1F]/40 hover:bg-white transition-colors cursor-pointer"
          >
            <Database className="h-3 w-3 text-[#6F8F45]" />
            <span>{isUsingDemoData ? "Demo Data Mode" : "Live RPC State"}</span>
          </button>
        </div>

        {/* Center/Right: Minimal Editorial Navigation */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center gap-7"
        >
          {PRIMARY_NAV.map((item) => {
            const isActive =
              item.href === "/actions"
                ? pathname.startsWith("/actions") ||
                  pathname.startsWith("/explore")
                : item.href === "/verify"
                  ? pathname.startsWith("/verify")
                  : false;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "editorial-link text-sm font-medium tracking-[-0.01em] transition-colors py-1",
                  isActive
                    ? "text-[#102A1F] font-semibold"
                    : "text-[#18211C]/75 hover:text-[#102A1F]"
                )}
              >
                {item.label}
              </Link>
            );
          })}

          <span
            className="h-3.5 w-[1px] bg-[#102A1F]/15"
            aria-hidden="true"
          />

          <div className="flex items-center gap-4">
            {APP_ROUTES.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "font-mono text-xs uppercase tracking-[0.1em] transition-colors py-1",
                    isActive
                      ? "text-[#102A1F] font-bold underline underline-offset-4"
                      : "text-[#18211C]/65 hover:text-[#102A1F]"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Right: Connect NEAR CTA */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => void refreshChainData()}
            className="hidden sm:inline-flex items-center justify-center rounded-full border border-[#102A1F]/15 p-2 text-[#102A1F] hover:bg-[#102A1F]/5 transition-colors cursor-pointer"
            title="Refresh NEAR Testnet RPC state"
            aria-label="Refresh NEAR Testnet RPC state"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", isLoadingChain && "animate-spin")}
            />
          </button>

          {accountId ? (
            <div className="flex items-center gap-2 rounded-full border border-[#102A1F]/20 bg-white px-3.5 py-1.5">
              <span className="h-2 w-2 rounded-full bg-[#6F8F45]" />
              <span className="font-mono text-xs font-semibold text-[#102A1F] max-w-[140px] truncate">
                {accountId}
              </span>
              <button
                type="button"
                onClick={disconnectWallet}
                className="rounded-full p-1 text-[#18211C]/60 hover:bg-red-50 hover:text-red-800 transition-colors cursor-pointer"
                title="Disconnect NEAR wallet"
                aria-label="Disconnect NEAR wallet"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={openWalletModal}
              className="group inline-flex items-center gap-2 rounded-full bg-[#102A1F] px-4 py-2 text-xs font-semibold tracking-wide text-[#F5F2E9] hover:bg-[#0C1712] transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Connect NEAR</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-[#C7F36B] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="lg:hidden inline-flex items-center justify-center rounded-full border border-[#102A1F]/20 p-2 text-[#102A1F]"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Deliberate Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#102A1F]/15 bg-[#F5F2E9] px-5 py-6 space-y-5">
          <div className="space-y-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#18211C]/50">
              Experience
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PRIMARY_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl border border-[#102A1F]/12 bg-white/70 px-3.5 py-2.5 text-sm font-semibold text-[#102A1F]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#18211C]/50">
              Application Portals
            </div>
            <div className="grid grid-cols-3 gap-2">
              {APP_ROUTES.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl border border-[#102A1F]/15 bg-[#102A1F]/5 px-3 py-2 text-center font-mono text-xs font-semibold text-[#102A1F]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[#102A1F]/10 pt-4 font-mono text-[11px] text-[#18211C]/70">
            <span>
              State: {isUsingDemoData ? "DEMO DATA PREVIEW" : "LIVE ON-CHAIN"}
            </span>
            <button
              type="button"
              onClick={() => toggleDemoPreviewMode(!isUsingDemoData)}
              className="underline font-semibold text-[#102A1F]"
            >
              {isUsingDemoData ? "Try Live RPC" : "Use Demo Preview"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
