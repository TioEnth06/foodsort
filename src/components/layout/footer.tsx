import React from "react";
import Link from "next/link";
import { NEAR_CONFIG } from "@/lib/near/config";
import { ExternalLink, Leaf, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#1B4332]/15 bg-[#1B4332] text-[#FAF8F5] mt-16">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#40916C] text-white">
                <Leaf className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                FoodSort Protocol • NEAR Hackathon 2026
              </span>
            </div>
            <p className="text-sm text-[#D8F3DC]/85 max-w-xl leading-relaxed">
              Verifiable food-sorting action registry and NEP-171 patronage NFT
              protocol on NEAR Testnet. Original contributor attribution is
              permanently preserved on-chain, and all net donations remain
              transparently held in the contract treasury (
              <code className="font-mono text-white">HELD_IN_TREASURY</code>).
            </p>
            <div className="inline-flex items-center gap-2 rounded-xl bg-[#122E22] px-3 py-2 text-xs text-[#D8F3DC]">
              <ShieldCheck className="h-4 w-4 text-[#40916C] shrink-0" />
              <span>
                Truthfulness Guardrail: FoodSort never claims that treasury
                funds have been distributed while held in contract state.
              </span>
            </div>
          </div>

          <div className="space-y-2.5 text-sm">
            <h4 className="font-semibold text-[#D8F3DC] uppercase tracking-wider text-xs">
              Platform Navigation
            </h4>
            <ul className="space-y-2 text-[#FAF8F5]/85">
              <li>
                <Link href="/actions" className="hover:text-white">
                  Explore Verified Actions
                </Link>
              </li>
              <li>
                <Link href="/contribute" className="hover:text-white">
                  Submit Sorting Action
                </Link>
              </li>
              <li>
                <Link href="/donor" className="hover:text-white">
                  Donor Dashboard
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white">
                  Admin Review & AI Assistant
                </Link>
              </li>
              <li>
                <Link href="/verify" className="hover:text-white">
                  Public NFT Verification
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5 text-sm">
            <h4 className="font-semibold text-[#D8F3DC] uppercase tracking-wider text-xs">
              On-Chain Specifications
            </h4>
            <ul className="space-y-2 text-xs text-[#FAF8F5]/85 font-mono">
              <li>Network: {NEAR_CONFIG.networkId}</li>
              <li>Contract: {NEAR_CONFIG.contractId}</li>
              <li>Standards: NEP-171, NEP-177, NEP-181</li>
              <li>Categories: COMPOST, FOOD_RESCUE, RESIDUAL</li>
              <li className="pt-1 font-sans">
                <a
                  href={`${NEAR_CONFIG.explorerUrl}/address/${NEAR_CONFIG.contractId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[#D8F3DC] hover:underline"
                >
                  View Contract on NEAR Explorer
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
