import React from "react";
import Link from "next/link";
import { NEAR_CONFIG } from "@/lib/near/config";
import { ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#102A1F]/15 bg-[#0C1712] text-[#F5F2E9]">
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 pb-12 border-b border-white/10">
          {/* Brand & Tagline */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-extrabold tracking-[-0.04em] text-[#F5F2E9]">
                FoodSort
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#C7F36B]">
                Verified Food Impact on NEAR
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-semibold tracking-[-0.02em] text-[#F5F2E9]/90 max-w-md">
              Sort food — Support change — Collect impact
            </p>
            <p className="text-xs font-mono text-[#F5F2E9]/60 max-w-lg leading-relaxed">
              Verified food impact, made visible — Original contributor
              attribution is permanently preserved on-chain, and 100% of net
              donations remain transparently held in the contract treasury (
              <span className="text-[#C7F36B]">HELD_IN_TREASURY</span>)
            </p>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-3 space-y-3">
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#F5F2E9]/45">
              Navigation
            </div>
            <ul className="space-y-2.5 text-sm font-medium text-[#F5F2E9]/85">
              <li>
                <Link
                  href="/actions"
                  className="editorial-link hover:text-[#C7F36B] transition-colors"
                >
                  Explore
                </Link>
              </li>
              <li>
                <Link
                  href="/contribute"
                  className="editorial-link hover:text-[#C7F36B] transition-colors"
                >
                  Contribute
                </Link>
              </li>
              <li>
                <Link
                  href="/donor"
                  className="editorial-link hover:text-[#C7F36B] transition-colors"
                >
                  Donor Hub
                </Link>
              </li>
              <li>
                <Link
                  href="/verify"
                  className="editorial-link hover:text-[#C7F36B] transition-colors"
                >
                  Verify
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="editorial-link hover:text-[#C7F36B] transition-colors"
                >
                  Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Technical & Standards */}
          <div className="lg:col-span-3 space-y-3">
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#F5F2E9]/45">
              Protocol & Standards
            </div>
            <div className="flex flex-wrap gap-2 font-mono text-xs">
              {["NEAR Testnet", "NEP-171", "NEP-177", "NEP-181"].map((spec) => (
                <span
                  key={spec}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[#F5F2E9]/85"
                >
                  {spec}
                </span>
              ))}
            </div>
            <div className="pt-2 space-y-1.5 font-mono text-xs text-[#F5F2E9]/65">
              <div>Contract: {NEAR_CONFIG.contractId}</div>
              <div className="flex flex-wrap gap-4 pt-1">
                <a
                  href={`${NEAR_CONFIG.explorerUrl}/address/${NEAR_CONFIG.contractId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[#C7F36B] hover:underline"
                >
                  NEAR Explorer
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
                <a
                  href="https://github.com/TioEnth06/foodsort"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[#F5F2E9]/85 hover:text-[#C7F36B] hover:underline"
                >
                  GitHub Repository
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-[11px] text-[#F5F2E9]/50">
          <div>FoodSort • NEAR Hackathon 2026</div>
          <div>
            Contributor → Verification → Support → Donation NFT → Public
            Provenance
          </div>
        </div>
      </div>
    </footer>
  );
}
