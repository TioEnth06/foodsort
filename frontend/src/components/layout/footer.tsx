import React from "react";
import Link from "next/link";
import { NEAR_CONFIG } from "@/lib/near/config";
import { ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#102A1F]/15 bg-[#0C1712] text-[#F5F2E9]">
      <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 pb-12 border-b border-white/10">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-2xl font-extrabold tracking-[-0.04em] text-[#F5F2E9]">
              FoodSort
            </span>
            <p className="text-xl sm:text-2xl font-semibold tracking-[-0.02em] text-[#F5F2E9]/90 max-w-md">
              Sort food. Support change. Keep the credit honest.
            </p>
            <p className="text-sm text-[#F5F2E9]/65 max-w-lg leading-relaxed">
              Verified food impact on NEAR — original contributors stay named,
              and donations remain held in the contract treasury
            </p>
          </div>

          <div className="lg:col-span-3 space-y-3">
            <div className="text-xs uppercase tracking-[0.12em] text-[#F5F2E9]/45">
              Navigate
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

          <div className="lg:col-span-3 space-y-3">
            <div className="text-xs uppercase tracking-[0.12em] text-[#F5F2E9]/45">
              Built on NEAR
            </div>
            <p className="text-sm text-[#F5F2E9]/70 leading-relaxed">
              Testnet contract
              <br />
              <span className="text-[#F5F2E9]/90">{NEAR_CONFIG.contractId}</span>
            </p>
            <div className="flex flex-wrap gap-4 pt-1 text-sm">
              <a
                href={`${NEAR_CONFIG.explorerUrl}/address/${NEAR_CONFIG.contractId}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[#C7F36B] hover:underline"
              >
                Explorer
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://github.com/TioEnth06/foodsort"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[#F5F2E9]/85 hover:text-[#C7F36B] hover:underline"
              >
                GitHub
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#F5F2E9]/50">
          <div>FoodSort · NEAR Hackathon 2026</div>
          <div>Contributor → Verify → Support → Certificate → Public record</div>
        </div>
      </div>
    </footer>
  );
}
