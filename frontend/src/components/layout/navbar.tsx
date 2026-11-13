"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNearWallet } from "@/lib/near/wallet-provider";
import { cn } from "@/lib/utils";
import { ArrowUpRight, LogOut, Menu, X } from "lucide-react";

const PRIMARY_NAV = [
  { href: "/actions", label: "Explore" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#impact", label: "Impact" },
  { href: "/verify", label: "Verify" },
  { href: "/contribute", label: "Contribute" },
  { href: "/donor", label: "Donor Hub" },
  { href: "/admin", label: "Admin" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { accountId, openWalletModal, disconnectWallet } = useNearWallet();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
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
          ? "border-b border-[#102A1F]/10 bg-[#F5F2E9]/95 backdrop-blur-md"
          : "bg-[#F5F2E9]"
      )}
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 sm:px-10 lg:px-16">
        <Link
          href="/"
          className="text-xl font-bold tracking-[-0.04em] text-[#102A1F]"
        >
          FoodSort
        </Link>

        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center gap-8"
        >
          {PRIMARY_NAV.map((item) => {
            const isActive =
              item.href === "/actions"
                ? pathname.startsWith("/actions") ||
                  pathname.startsWith("/explore")
                : !item.href.startsWith("/#") && pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "editorial-link text-sm transition-colors py-1",
                  isActive
                    ? "text-[#102A1F] font-semibold"
                    : "text-[#18211C]/70 hover:text-[#102A1F]"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {accountId ? (
            <div className="flex items-center gap-2 rounded-full border border-[#102A1F]/20 bg-white px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#6F8F45]" />
              <span className="text-xs font-medium text-[#102A1F] max-w-[140px] truncate">
                {accountId}
              </span>
              <button
                type="button"
                onClick={disconnectWallet}
                className="p-1 text-[#18211C]/50 hover:text-red-800 transition-colors cursor-pointer"
                title="Disconnect wallet"
                aria-label="Disconnect wallet"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={openWalletModal}
              className="group inline-flex items-center gap-2 rounded-full bg-[#102A1F] px-5 py-2.5 text-xs font-medium text-[#F5F2E9] hover:bg-[#0C1712] transition-all cursor-pointer"
            >
              <span>Connect NEAR</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-[#C7F36B] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="lg:hidden inline-flex items-center justify-center rounded-full border border-[#102A1F]/15 p-2 text-[#102A1F]"
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

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#102A1F]/10 bg-[#F5F2E9] px-5 py-6 space-y-2">
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 text-lg font-medium text-[#102A1F] border-b border-[#102A1F]/8 last:border-0"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
