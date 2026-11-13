"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useNearWallet } from "@/lib/near/wallet-provider";
import { NEAR_CONFIG } from "@/lib/near/config";
import {
  formatTimestamp,
  formatYoctoToNear,
  resolveIpfsUrl,
} from "@/lib/utils";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

const TIMELINE_STAGES = [
  {
    step: "01",
    word: "SORT",
    caption:
      "Divert organic compost, recover edible surplus, or isolate contaminated residuals at community kitchens and markets",
  },
  {
    step: "02",
    word: "DOCUMENT",
    caption:
      "Capture photographic evidence and pin immutable metadata to IPFS before registering the action on NEAR",
  },
  {
    step: "03",
    word: "VERIFY",
    caption:
      "An isolated AI assistant triages consistency and risk flags; a human administrator makes the final on-chain approval",
  },
  {
    step: "04",
    word: "SUPPORT",
    caption:
      "Patrons back verified actions with native NEAR while net funds are held transparently in the smart contract treasury",
  },
  {
    step: "05",
    word: "PROVE",
    caption:
      "Every donation mints a NEP-171 provenance certificate that permanently credits the original contributor",
  },
];

const PROVENANCE_STAGES = [
  {
    id: "VERIFIED ACTION",
    label: "Stage 01 // Field Execution",
    detail:
      "Contributor sari-organik.testnet sorts 18.5 kg of market green waste — verified on-chain by admin.foodsort.testnet",
  },
  {
    id: "DONATION",
    label: "Stage 02 // Treasury Support",
    detail:
      "Patron attaches native NEAR via donate_and_mint() — storage bytes are separated and net funds stay HELD_IN_TREASURY",
  },
  {
    id: "NFT",
    label: "Stage 03 // Archival Certificate",
    detail:
      "A 1-of-1 NEP-171 / NEP-177 certificate is minted to the patron while locking original_contributor_id in contract state",
  },
  {
    id: "PUBLIC PROOF",
    label: "Stage 04 // Open Verification",
    detail:
      "Anyone can inspect the certificate without a wallet, distinguishing Contributor ≠ Original Donor ≠ Current Owner",
  },
];

export default function HomePage() {
  const { actions, donations, nftTokens, treasury, isUsingDemoData } =
    useNearWallet();

  // Restrained desktop-only parallax state (max ±6px)
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [activeProvenanceStage, setActiveProvenanceStage] = useState(2);

  const verifiedActions = actions.filter((a) => a.status === "Verified");
  const primaryAction = verifiedActions[0] || actions[0];
  const primaryDonation = donations[0];
  const primaryToken = nftTokens[0];

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const normX = (e.clientX - rect.left) / rect.width - 0.5;
    const normY = (e.clientY - rect.top) / rect.height - 0.5;
    setParallax({
      x: Number((normX * 10).toFixed(2)),
      y: Number((normY * 10).toFixed(2)),
    });
  };

  const resetHeroMouse = () => setParallax({ x: 0, y: 0 });

  return (
    <div className="bg-[#F5F2E9] text-[#18211C] selection:bg-[#C7F36B] selection:text-[#102A1F]">
      {/* =====================================================================
          HERO SECTION — Editorial Typography + Scientific Archival Visual
      ====================================================================== */}
      <section
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={resetHeroMouse}
        className="relative min-h-[92vh] border-b border-[#102A1F]/12 bg-archival-grain overflow-hidden flex flex-col justify-between"
      >
        <div className="mx-auto w-full max-w-[1440px] px-4 pt-8 pb-16 sm:px-8 lg:px-12">
          {/* Top Archival Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#102A1F]/12 pb-5">
            <div className="inline-flex items-center gap-2.5 font-mono text-xs tracking-[0.16em] uppercase text-[#102A1F]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6F8F45] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6F8F45]" />
              </span>
              <span>LIVE ON NEAR TESTNET</span>
              {isUsingDemoData && (
                <span className="rounded-sm bg-[#102A1F]/10 px-2 py-0.5 text-[10px] font-semibold text-[#102A1F]">
                  DEMO DATA PREVIEW
                </span>
              )}
            </div>

            <div className="font-mono text-xs tracking-[0.14em] uppercase text-[#18211C]/65">
              Verified food impact, made visible
            </div>
          </div>

          {/* Main Editorial Display Headline */}
          <div className="mt-10 sm:mt-14">
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="font-extrabold uppercase tracking-[-0.045em] text-[#102A1F] leading-[0.92]"
              style={{ fontSize: "clamp(3.1rem, 8vw, 8.6rem)" }}
            >
              <span className="block">SORT FOOD</span>
              <span className="block text-[#6F8F45]">SUPPORT CHANGE</span>
              <span className="block">COLLECT IMPACT</span>
            </motion.h1>
          </div>

          {/* Hero Split: Copy + CTAs Left / Annotated Archival Specimen Right */}
          <div className="mt-10 sm:mt-14 grid grid-cols-1 gap-10 lg:grid-cols-12 items-end">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="lg:col-span-5 space-y-8"
            >
              <p className="text-lg sm:text-xl text-[#18211C]/85 leading-relaxed font-normal max-w-xl">
                Turn real-world food-sorting actions into verified, supportable
                impact — with transparent provenance on NEAR
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/actions"
                  className="group inline-flex items-center gap-3 rounded-full bg-[#102A1F] px-7 py-4 text-sm font-semibold tracking-wide text-[#F5F2E9] transition-all duration-300 hover:bg-[#0C1712] hover:-translate-y-0.5"
                >
                  <span>Explore Verified Actions</span>
                  <ArrowRight className="h-4 w-4 text-[#C7F36B] transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/contribute"
                  className="group inline-flex items-center gap-2.5 rounded-full border border-[#102A1F]/30 bg-transparent px-7 py-4 text-sm font-semibold text-[#102A1F] transition-all duration-300 hover:border-[#102A1F] hover:bg-[#102A1F]/5 hover:-translate-y-0.5"
                >
                  <span>Submit an Action</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-[#102A1F]/15 pt-6 font-mono text-xs">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.16em] text-[#18211C]/55">
                    Action Streams
                  </div>
                  <div className="mt-1 font-semibold text-[#102A1F]">
                    COMPOST / RESCUE / RESIDUAL
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.16em] text-[#18211C]/55">
                    Treasury Status
                  </div>
                  <div className="mt-1 font-semibold text-[#102A1F]">
                    {treasury.treasury_status}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.16em] text-[#18211C]/55">
                    Provenance Standard
                  </div>
                  <div className="mt-1 font-semibold text-[#102A1F]">
                    NEP-171 / NEP-177
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Hero Visual: Archival Specimen Frame with Restrained Parallax */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.65, delay: 0.15 }}
              className="lg:col-span-7"
            >
              <div className="relative overflow-hidden rounded-2xl border border-[#102A1F]/20 bg-[#0C1712] shadow-2xl">
                <div
                  style={{
                    transform: `translate3d(${parallax.x * -0.5}px, ${parallax.y * -0.5}px, 0) scale(1.03)`,
                  }}
                  className="relative h-[360px] sm:h-[460px] w-full transition-transform duration-300 ease-out"
                >
                  <img
                    src={resolveIpfsUrl(
                      primaryAction?.evidence_uri ||
                        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80"
                    )}
                    alt={
                      primaryAction?.action_type ||
                      "Community food waste sorting specimen"
                    }
                    className="h-full w-full object-cover opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0C1712] via-[#0C1712]/25 to-transparent" />
                </div>

                {/* Scientific / Archival Annotation Overlay */}
                <div
                  style={{
                    transform: `translate3d(${parallax.x * 0.6}px, ${parallax.y * 0.6}px, 0)`,
                  }}
                  className="pointer-events-none absolute inset-0 flex flex-col justify-between p-5 sm:p-7 font-mono text-xs text-[#F5F2E9] transition-transform duration-300 ease-out"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="rounded-md border border-white/20 bg-[#0C1712]/80 backdrop-blur-md px-3 py-1.5 space-y-0.5">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-[#C7F36B]">
                        SPECIMEN // ACTION #{primaryAction?.action_id ?? 101}
                      </div>
                      <div className="text-[11px] text-[#F5F2E9]/90">
                        STREAM: {primaryAction?.food_category ?? "COMPOST"}
                      </div>
                    </div>

                    <div className="rounded-md border border-[#C7F36B]/40 bg-[#102A1F]/90 backdrop-blur-md px-3 py-1.5 text-[11px] font-semibold text-[#C7F36B] flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>STATUS // {primaryAction?.status ?? "VERIFIED"}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-white/20 bg-[#0C1712]/85 backdrop-blur-md p-4 rounded-xl">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.16em] text-[#F5F2E9]/55">
                        CONTRIBUTOR (PERFORMER)
                      </div>
                      <div className="mt-0.5 font-semibold text-[#C7F36B] truncate">
                        {primaryAction?.contributor_id ??
                          "sari-organik.testnet"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.16em] text-[#F5F2E9]/55">
                        TREASURY PATRONAGE
                      </div>
                      <div className="mt-0.5 font-semibold text-[#F5F2E9]">
                        {formatYoctoToNear(
                          primaryAction?.total_donated_yocto ?? "0",
                          4
                        )}{" "}
                        NEAR HELD
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.16em] text-[#F5F2E9]/55">
                        PROVENANCE CERTIFICATE
                      </div>
                      <div className="mt-0.5 font-semibold text-[#F5F2E9] truncate">
                        {primaryToken?.token_id ?? "foodsort-donation-1"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 01 — Real actions deserve real visibility
      ====================================================================== */}
      <section className="mx-auto max-w-[1440px] px-4 py-24 sm:px-8 lg:px-12 border-b border-[#102A1F]/12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#6F8F45]">
              01 // THE VISIBILITY GAP
            </div>
            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-[-0.035em] text-[#102A1F] leading-[1.04]">
              Real actions deserve real visibility
            </h2>
            <p className="text-base sm:text-lg text-[#18211C]/80 leading-relaxed max-w-xl">
              Every day, community kitchens, local markets, and households sort
              organic waste, recover surplus food, and isolate contaminants
              before they reach landfills — yet this physical work goes unseen,
              unverified, and unsupported, or when patronage occurs, existing
              platforms credit the financial donor instead of the person who
              performed the sorting
            </p>
            <p className="text-sm font-mono text-[#102A1F] border-l-2 border-[#6F8F45] pl-4 py-1">
              FoodSort turns each verified sorting batch into an auditable
              on-chain record where original contributor attribution is never
              overwritten
            </p>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
            <div className="sm:col-span-7 overflow-hidden rounded-2xl border border-[#102A1F]/15 bg-[#102A1F]">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80"
                alt="Fresh produce sorting at community market"
                className="h-80 w-full object-cover transition-transform duration-500 hover:scale-103"
                loading="lazy"
              />
              <div className="p-4 font-mono text-[11px] text-[#F5F2E9]/85 flex justify-between">
                <span>ARCHIVE // MARKET DIVERSION</span>
                <span className="text-[#C7F36B]">COMPOST STREAM</span>
              </div>
            </div>

            <div className="sm:col-span-5 overflow-hidden rounded-2xl border border-[#102A1F]/15 bg-white">
              <img
                src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80"
                alt="Surplus bread sorted for community recovery"
                className="h-56 w-full object-cover transition-transform duration-500 hover:scale-103"
                loading="lazy"
              />
              <div className="p-4 font-mono text-[11px] text-[#18211C]/80 space-y-1">
                <div className="font-semibold text-[#102A1F]">
                  SURPLUS RECOVERY
                </div>
                <div>Unspoiled portions documented prior to redistribution</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 02 — From action to proof (Typographic Timeline)
      ====================================================================== */}
      <section
        id="how-it-works"
        className="mx-auto max-w-[1440px] px-4 py-24 sm:px-8 lg:px-12 border-b border-[#102A1F]/12"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-14">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#6F8F45]">
              02 // PROTOCOL SEQUENCE
            </div>
            <h2 className="mt-2 text-4xl sm:text-6xl font-extrabold tracking-[-0.035em] text-[#102A1F]">
              From action to proof
            </h2>
          </div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#18211C]/65 max-w-xs">
            Real-world action → Verification → Support → Ownership → Provenance
          </p>
        </div>

        <div className="divide-y divide-[#102A1F]/15 border-y border-[#102A1F]/15">
          {TIMELINE_STAGES.map((item, idx) => (
            <motion.div
              key={item.word}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="group grid grid-cols-1 md:grid-cols-12 items-baseline gap-4 py-7 sm:py-9 hover:bg-[#102A1F]/[0.02] px-2 transition-colors"
            >
              <div className="md:col-span-2 font-mono text-xs uppercase tracking-[0.2em] text-[#6F8F45]">
                STAGE {item.step} ↓
              </div>
              <div className="md:col-span-5 text-4xl sm:text-6xl font-extrabold tracking-[-0.04em] text-[#102A1F] group-hover:translate-x-2 transition-transform duration-300">
                {item.word}
              </div>
              <div className="md:col-span-5 text-sm sm:text-base text-[#18211C]/80 leading-relaxed">
                {item.caption}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* =====================================================================
          SECTION 03 — AI assists / Humans decide (Split-Screen Governance)
      ====================================================================== */}
      <section className="mx-auto max-w-[1440px] px-4 py-24 sm:px-8 lg:px-12 border-b border-[#102A1F]/12">
        <div className="max-w-3xl space-y-3 pb-14">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#6F8F45]">
            03 // HUMAN-IN-THE-LOOP VERIFICATION
          </div>
          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-[-0.035em] text-[#102A1F]">
            AI assists — Humans decide
          </h2>
          <p className="text-base sm:text-lg text-[#18211C]/80 leading-relaxed">
            Our isolated AI Verification Assistant evaluates untrusted
            descriptions and evidence photography for category consistency and
            risk flags — yet it has zero wallet access and never executes
            transactions while human administrators hold final authority
            on-chain
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-[#102A1F]/20 overflow-hidden bg-white shadow-lg">
          {/* LEFT: Submitted Evidence Specimen */}
          <div className="lg:col-span-6 relative bg-[#0C1712] min-h-[380px] flex flex-col justify-between p-6 sm:p-8 text-[#F5F2E9]">
            <img
              src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1000&q=80"
              alt="Submitted food-sorting evidence under review"
              className="absolute inset-0 h-full w-full object-cover opacity-65"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0C1712] via-[#0C1712]/40 to-transparent" />

            <div className="relative z-10 flex items-center justify-between font-mono text-xs">
              <span className="rounded-md bg-[#0C1712]/80 border border-white/20 px-3 py-1">
                EVIDENCE INPUT // ACTION #103
              </span>
              <span className="rounded-md bg-[#C7F36B] text-[#102A1F] font-bold px-2.5 py-1">
                COMPOST
              </span>
            </div>

            <div className="relative z-10 space-y-2 border-t border-white/20 pt-4 font-mono text-xs">
              <div className="text-[#C7F36B] uppercase tracking-[0.15em]">
                SUBMITTED BY: budi-kompos.testnet
              </div>
              <p className="font-sans text-sm text-[#F5F2E9]/90 leading-relaxed">
                &ldquo;Separated 6.2 kg of household kitchen scraps (banana
                peels, eggshells, wilted greens) into bokashi fermentation
                buckets&rdquo;
              </p>
            </div>
          </div>

          {/* RIGHT: Structured AI Verification Readout -> Human Approval Gate */}
          <div className="lg:col-span-6 p-6 sm:p-10 bg-[#F5F2E9] flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-[#102A1F]/15 pb-4">
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#6F8F45]">
                    ADVISORY MODULE // /api/ai/verify
                  </div>
                  <h3 className="text-xl font-bold text-[#102A1F] mt-0.5">
                    AI Verification Assistant
                  </h3>
                </div>
                <span className="rounded-full border border-[#102A1F]/20 bg-white px-3 py-1 font-mono text-xs font-semibold text-[#102A1F]">
                  Zero Wallet Access
                </span>
              </div>

              {/* 3 Required Readout Metrics */}
              <div className="space-y-3 font-mono text-xs">
                <div className="rounded-xl border border-[#102A1F]/15 bg-white p-4 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#102A1F]">
                      CATEGORY CONSISTENCY
                    </div>
                    <div className="text-[11px] text-[#18211C]/70 mt-0.5">
                      Submitted: COMPOST → Detected: COMPOST (Matches)
                    </div>
                  </div>
                  <span className="rounded-md bg-[#C7F36B] px-2.5 py-1 font-bold text-[#102A1F]">
                    CONSISTENT
                  </span>
                </div>

                <div className="rounded-xl border border-[#102A1F]/15 bg-white p-4 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#102A1F]">
                      EVIDENCE RELEVANCE
                    </div>
                    <div className="text-[11px] text-[#18211C]/70 mt-0.5">
                      Organic peelings and fermentation container visible
                    </div>
                  </div>
                  <span className="rounded-md bg-[#102A1F] px-2.5 py-1 font-bold text-[#C7F36B]">
                    RELEVANT
                  </span>
                </div>

                <div className="rounded-xl border border-[#102A1F]/15 bg-white p-4 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#102A1F]">RISK FLAGS</div>
                    <div className="text-[11px] text-[#18211C]/70 mt-0.5">
                      Prompt injection & stock-photo checks cleared
                    </div>
                  </div>
                  <span className="rounded-md border border-[#102A1F]/20 px-2.5 py-1 font-bold text-[#6F8F45]">
                    0 FLAGS
                  </span>
                </div>
              </div>
            </div>

            {/* Final Authority Gate: Human Approval */}
            <div className="rounded-2xl bg-[#102A1F] p-5 text-[#F5F2E9] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#C7F36B]">
                  FINAL AUTHORITY // ON-CHAIN GATE
                </span>
                <span className="font-mono text-xs text-[#F5F2E9]/80">
                  requires_human_approval: true
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                <div>
                  <div className="text-base font-bold">Human Approval</div>
                  <p className="text-xs text-[#F5F2E9]/75">
                    Only{" "}
                    <code className="font-mono text-[#C7F36B]">
                      {treasury.admin_id}
                    </code>{" "}
                    can sign <code className="font-mono">verify_action()</code>{" "}
                    on NEAR
                  </p>
                </div>
                <Link
                  href="/admin"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#C7F36B] px-4 py-2 text-xs font-bold text-[#102A1F] hover:bg-white transition-colors shrink-0"
                >
                  <span>Open Admin Review</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 04 — Verified Actions (Asymmetric Editorial Showcase)
      ====================================================================== */}
      <section className="mx-auto max-w-[1440px] px-4 py-24 sm:px-8 lg:px-12 border-b border-[#102A1F]/12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-16">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#6F8F45]">
              04 // VERIFIED FIELD ARCHIVE
            </div>
            <h2 className="mt-2 text-4xl sm:text-6xl font-extrabold tracking-[-0.035em] text-[#102A1F]">
              Verified Actions
            </h2>
          </div>
          <Link
            href="/actions"
            className="editorial-link inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] font-bold text-[#102A1F]"
          >
            <span>Explore Full Registry ({actions.length} Actions)</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Asymmetric Editorial Spread (No conventional 3-column SaaS grid) */}
        <div className="space-y-20">
          {verifiedActions.slice(0, 2).map((act, index) => {
            const isReversed = index % 2 === 1;
            return (
              <div
                key={act.action_id}
                className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-center"
              >
                <div
                  className={
                    isReversed
                      ? "lg:col-span-7 lg:order-2"
                      : "lg:col-span-7 lg:order-1"
                  }
                >
                  <Link
                    href={`/actions/${act.action_id}`}
                    className="group block relative overflow-hidden rounded-2xl border border-[#102A1F]/20 bg-[#0C1712]"
                  >
                    <div
                      className={
                        index === 0
                          ? "h-[380px] sm:h-[480px] w-full overflow-hidden"
                          : "h-[340px] sm:h-[420px] w-full overflow-hidden"
                      }
                    >
                      <img
                        src={resolveIpfsUrl(act.evidence_uri)}
                        alt={act.action_type}
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-103 opacity-90"
                        loading="lazy"
                      />
                    </div>
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="rounded-full bg-[#102A1F]/90 backdrop-blur-md px-3.5 py-1 font-mono text-xs font-bold text-[#C7F36B]">
                        ACTION #{act.action_id}
                      </span>
                      {act.is_demo_data && (
                        <span className="rounded-full bg-amber-100/95 px-3 py-1 font-mono text-[10px] font-bold text-amber-950">
                          DEMO DATA
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-4 right-4 rounded-full bg-[#C7F36B] px-3.5 py-1 font-mono text-xs font-bold text-[#102A1F] flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#102A1F]" />
                      <span>VERIFIED</span>
                    </div>
                  </Link>
                </div>

                <div
                  className={
                    isReversed
                      ? "lg:col-span-5 lg:order-1 space-y-5"
                      : "lg:col-span-5 lg:order-2 space-y-5"
                  }
                >
                  <div className="text-5xl sm:text-7xl font-extrabold tracking-[-0.04em] text-[#102A1F]/15 select-none leading-none">
                    {act.food_category}
                  </div>
                  <div className="space-y-2">
                    <div className="font-mono text-xs uppercase tracking-[0.16em] text-[#6F8F45]">
                      {act.food_category} // VERIFIED BY{" "}
                      {act.verified_by || treasury.admin_id}
                    </div>
                    <h3 className="text-2xl sm:text-4xl font-extrabold tracking-[-0.03em] text-[#102A1F]">
                      {act.action_type}
                    </h3>
                  </div>

                  <p className="text-sm sm:text-base text-[#18211C]/80 leading-relaxed">
                    {act.description.replace(/\.+$/, "")}
                  </p>

                  <div className="grid grid-cols-2 gap-4 border-y border-[#102A1F]/15 py-4 font-mono text-xs">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.15em] text-[#18211C]/55">
                        ORIGINAL CONTRIBUTOR
                      </div>
                      <div className="mt-1 font-bold text-[#102A1F]">
                        {act.contributor_id}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.15em] text-[#18211C]/55">
                        NET SUPPORT HELD
                      </div>
                      <div className="mt-1 font-bold text-[#102A1F]">
                        {formatYoctoToNear(act.total_donated_yocto, 4)} NEAR (
                        {act.donation_count} patron
                        {act.donation_count === 1 ? "" : "s"})
                      </div>
                    </div>
                  </div>

                  <div className="pt-1">
                    <Link
                      href={`/actions/${act.action_id}`}
                      className="group inline-flex items-center gap-3 rounded-full bg-[#102A1F] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#F5F2E9] hover:bg-[#0C1712] transition-all"
                    >
                      <span>Support Action & Mint Provenance NFT</span>
                      <ArrowUpRight className="h-4 w-4 text-[#C7F36B] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =====================================================================
          SECTION 05 & 06 — Donation → NFT Story & Archival Certificate Visual
      ====================================================================== */}
      <section className="mx-auto max-w-[1440px] px-4 py-24 sm:px-8 lg:px-12 border-b border-[#102A1F]/12">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 items-center">
          {/* Left: Story & Interactive Stage Progression */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-3">
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#6F8F45]">
                05 // PATRONAGE PROVENANCE
              </div>
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-[-0.035em] text-[#102A1F] leading-[1.06]">
                Support an action — Carry its provenance
              </h2>
              <p className="text-base text-[#18211C]/80 leading-relaxed">
                A FoodSort Donation NFT is not a speculative collectible — it is
                an archival certificate of support that proves your native NEAR
                patronage while permanently preserving the original
                contributor&apos;s identity on-chain
              </p>
            </div>

            <div className="space-y-2.5">
              {PROVENANCE_STAGES.map((stage, idx) => {
                const isActive = activeProvenanceStage === idx;
                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => setActiveProvenanceStage(idx)}
                    className={`w-full text-left rounded-2xl border p-4 transition-all cursor-pointer ${
                      isActive
                        ? "border-[#102A1F] bg-[#102A1F] text-[#F5F2E9]"
                        : "border-[#102A1F]/15 bg-white/70 text-[#18211C] hover:border-[#102A1F]/40"
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span
                        className={
                          isActive ? "text-[#C7F36B]" : "text-[#6F8F45]"
                        }
                      >
                        {stage.label}
                      </span>
                      <span className="font-bold">{stage.id}</span>
                    </div>
                    <p
                      className={`mt-1.5 text-xs leading-relaxed ${
                        isActive ? "text-[#F5F2E9]/85" : "text-[#18211C]/70"
                      }`}
                    >
                      {stage.detail}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Tactile Archival Certificate Artifact */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border-2 border-[#102A1F] bg-[#ECE8DC] p-6 sm:p-10 shadow-xl space-y-6 relative">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#102A1F]/20 pb-5">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#6F8F45]">
                    ARCHIVAL CERTIFICATE OF SUPPORT // NEP-171 + NEP-177
                  </div>
                  <div className="mt-1 font-mono text-lg sm:text-xl font-bold text-[#102A1F]">
                    {primaryDonation?.token_id ?? "foodsort-donation-1"}
                  </div>
                </div>
                <div className="text-right font-mono text-xs">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#102A1F] px-3 py-1 text-[#C7F36B] font-semibold">
                    <span>PROOF OF SUPPORT</span>
                  </div>
                  {primaryDonation?.is_demo_data && (
                    <div className="mt-1 text-[10px] text-[#18211C]/65">
                      DEMO SPECIMEN RECORD
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                <div className="sm:col-span-5 overflow-hidden rounded-xl border border-[#102A1F]/20 bg-[#0C1712]">
                  <img
                    src={resolveIpfsUrl(
                      primaryAction?.evidence_uri ||
                        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"
                    )}
                    alt="Archival NFT specimen media"
                    className="h-48 w-full object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="sm:col-span-7 space-y-3 font-mono text-xs">
                  <div className="border-b border-[#102A1F]/15 pb-2 flex justify-between">
                    <span className="text-[#18211C]/60">ACTION ID</span>
                    <strong className="text-[#102A1F]">
                      #{primaryDonation?.action_id ?? 101} (
                      {primaryAction?.food_category ?? "COMPOST"})
                    </strong>
                  </div>
                  <div className="border-b border-[#102A1F]/15 pb-2 flex justify-between">
                    <span className="text-[#18211C]/60">
                      ORIGINAL CONTRIBUTOR
                    </span>
                    <strong className="text-[#102A1F]">
                      {primaryDonation?.contributor_id ??
                        "sari-organik.testnet"}
                    </strong>
                  </div>
                  <div className="border-b border-[#102A1F]/15 pb-2 flex justify-between">
                    <span className="text-[#18211C]/60">ORIGINAL DONOR</span>
                    <strong className="text-[#18211C]">
                      {primaryDonation?.donor_id ?? "green-patron.testnet"}
                    </strong>
                  </div>
                  <div className="border-b border-[#102A1F]/15 pb-2 flex justify-between">
                    <span className="text-[#18211C]/60">
                      NET DONATION AMOUNT
                    </span>
                    <strong className="text-[#102A1F]">
                      {formatYoctoToNear(
                        primaryDonation?.net_treasury_amount_yocto ??
                          "1993200000000000000000000",
                        4
                      )}{" "}
                      NEAR
                    </strong>
                  </div>
                  <div className="border-b border-[#102A1F]/15 pb-2 flex justify-between">
                    <span className="text-[#18211C]/60">VERIFIED TIMESTAMP</span>
                    <strong className="text-[#18211C]">
                      {formatTimestamp(
                        primaryAction?.verified_at_ms ?? 1762917200000
                      )}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#18211C]/60">NETWORK / STATUS</span>
                    <strong className="text-[#6F8F45]">
                      NEAR TESTNET • HELD_IN_TREASURY
                    </strong>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#102A1F]/20 pt-4 font-mono text-[11px] text-[#18211C]/75">
                <span>
                  ROLE INVARIANT: CONTRIBUTOR ≠ ORIGINAL DONOR ≠ CURRENT OWNER
                </span>
                <Link
                  href={`/verify/${encodeURIComponent(
                    primaryDonation?.token_id ?? "foodsort-donation-1"
                  )}`}
                  className="font-bold text-[#102A1F] underline inline-flex items-center gap-1"
                >
                  <span>Inspect Certificate</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 07 & 08 — Dark Public Verification & Live Protocol State
      ====================================================================== */}
      <section className="bg-[#0C1712] text-[#F5F2E9] bg-dark-archival-grain border-b border-white/10">
        <div className="mx-auto max-w-[1440px] px-4 py-24 sm:px-8 lg:px-12 space-y-24">
          {/* Public Verification Showcase */}
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#C7F36B]">
                06 // WALTLESS PUBLIC PROVENANCE
              </div>
              <h2 className="text-4xl sm:text-6xl font-extrabold tracking-[-0.035em] text-[#F5F2E9] leading-[1.05]">
                Nothing important should be hidden behind a dashboard
              </h2>
              <p className="text-base sm:text-lg text-[#F5F2E9]/75 leading-relaxed max-w-xl">
                Every verified action and patronage record can be inspected
                through its public provenance without connecting a wallet — even
                if a Donation NFT is transferred to a secondary holder, the
                record never conflates the current owner with the original donor
                or contributor
              </p>
              <div className="pt-2">
                <Link
                  href="/verify"
                  className="group inline-flex items-center gap-3 rounded-full bg-[#C7F36B] px-7 py-4 text-sm font-bold text-[#102A1F] transition-all hover:bg-white"
                >
                  <span>Open Public Verification Terminal</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-white/15 bg-[#102A1F]/60 backdrop-blur-md p-6 sm:p-8 font-mono text-xs space-y-4">
                <div className="flex items-center justify-between border-b border-white/15 pb-3 text-[11px] text-[#C7F36B]">
                  <span>PUBLIC RPC QUERY // get_nft_verification_proof()</span>
                  <span>
                    {isUsingDemoData ? "DEMO RECORD" : "ON-CHAIN RECORD"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-white/10 bg-[#0C1712]/80 p-4">
                    <div className="text-[10px] uppercase tracking-[0.16em] text-[#F5F2E9]/50">
                      ACTION
                    </div>
                    <div className="mt-1 text-base font-bold text-[#C7F36B]">
                      VERIFIED (#{primaryAction?.action_id ?? 101})
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-[#0C1712]/80 p-4">
                    <div className="text-[10px] uppercase tracking-[0.16em] text-[#F5F2E9]/50">
                      CONTRIBUTOR
                    </div>
                    <div className="mt-1 text-base font-bold text-[#F5F2E9] truncate">
                      {primaryAction?.contributor_id ?? "sari-organik.testnet"}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-[#0C1712]/80 p-4">
                    <div className="text-[10px] uppercase tracking-[0.16em] text-[#F5F2E9]/50">
                      ORIGINAL DONOR
                    </div>
                    <div className="mt-1 text-base font-bold text-[#F5F2E9] truncate">
                      {primaryDonation?.donor_id ?? "green-patron.testnet"}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-[#0C1712]/80 p-4">
                    <div className="text-[10px] uppercase tracking-[0.16em] text-[#F5F2E9]/50">
                      NFT
                    </div>
                    <div className="mt-1 text-base font-bold text-[#C7F36B] truncate">
                      {primaryDonation?.token_id ?? "foodsort-donation-1"}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#0C1712]/80 p-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.16em] text-[#F5F2E9]/50 block">
                      NETWORK
                    </span>
                    <span className="font-bold text-[#F5F2E9]">
                      NEAR {NEAR_CONFIG.networkId.toUpperCase()} (
                      {NEAR_CONFIG.contractId})
                    </span>
                  </div>
                  <Link
                    href="/verify/foodsort-donation-2"
                    className="text-[#C7F36B] underline text-xs"
                  >
                    Inspect Secondary Holder Proof (#2) →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* LIVE PROTOCOL STATE — Monumental Typographic Readout */}
          <div className="border-t border-white/15 pt-16 space-y-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#C7F36B]">
                07 // LIVE PROTOCOL STATE ({treasury.treasury_status})
              </div>
              <div className="font-mono text-xs text-[#F5F2E9]/65 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#C7F36B]" />
                <span>
                  Truthfulness Invariant: Funds Held vs Funds Distributed are
                  explicitly separated
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 border-y border-white/15 py-10">
              <div className="space-y-2">
                <div className="text-5xl sm:text-6xl font-extrabold font-mono tracking-tight text-[#F5F2E9]">
                  {String(treasury.verified_actions_count).padStart(2, "0")}
                </div>
                <div className="font-mono text-xs uppercase tracking-[0.18em] text-[#F5F2E9]/60">
                  VERIFIED ACTIONS
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-5xl sm:text-6xl font-extrabold font-mono tracking-tight text-[#F5F2E9]">
                  {String(treasury.total_donations_count).padStart(2, "0")}
                </div>
                <div className="font-mono text-xs uppercase tracking-[0.18em] text-[#F5F2E9]/60">
                  PATRONAGE NFTs
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-5xl sm:text-6xl font-extrabold font-mono tracking-tight text-[#C7F36B]">
                  {formatYoctoToNear(treasury.treasury_balance_yocto, 4)}
                </div>
                <div className="font-mono text-xs uppercase tracking-[0.18em] text-[#C7F36B]">
                  NEAR HELD IN TREASURY (FUNDS HELD)
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-5xl sm:text-6xl font-extrabold font-mono tracking-tight text-[#F5F2E9]/50">
                  {formatYoctoToNear(
                    treasury.funds_distributed_yocto || "0",
                    4
                  )}
                </div>
                <div className="font-mono text-xs uppercase tracking-[0.18em] text-[#F5F2E9]/55">
                  NEAR DISTRIBUTED (NO DISBURSEMENT IN MVP)
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 09 — Three Streams & Traceable Impact Connection Line
      ====================================================================== */}
      <section
        id="impact"
        className="mx-auto max-w-[1440px] px-4 py-24 sm:px-8 lg:px-12 space-y-24"
      >
        {/* Three Sorting Streams */}
        <div className="space-y-12">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#6F8F45]">
              08 // STANDARDIZED TAXONOMY
            </div>
            <h2 className="mt-2 text-4xl sm:text-6xl font-extrabold tracking-[-0.035em] text-[#102A1F]">
              Three Sorting Streams
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-[#102A1F]/15 border-y border-[#102A1F]/15">
            {[
              {
                num: "01",
                code: "COMPOST",
                title: "COMPOST",
                desc: "Organic material diverted into composting — vegetable trimmings, fruit peels, coffee grounds, and clean green matter kept out of methane-producing landfills",
              },
              {
                num: "02",
                code: "FOOD_RESCUE",
                title: "FOOD RESCUE",
                desc: "Safe-to-handle surplus recovery activities — unspoiled bakery loaves, grade-A market produce, and portioned surplus documented prior to community redistribution",
              },
              {
                num: "03",
                code: "RESIDUAL",
                title: "RESIDUAL",
                desc: "Contaminated or residual material separated from recoverable streams — isolating oil-soaked liners and multilayer sachets so organic compost batches stay pure",
              },
            ].map((stream) => (
              <div
                key={stream.code}
                className="py-10 lg:px-8 first:lg:pl-0 last:lg:pr-0 space-y-4"
              >
                <div className="flex items-center justify-between font-mono text-xs text-[#6F8F45]">
                  <span>STREAM // {stream.num}</span>
                  <span>[{stream.code}]</span>
                </div>
                <h3 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.03em] text-[#102A1F]">
                  {stream.title}
                </h3>
                <p className="text-sm sm:text-base text-[#18211C]/80 leading-relaxed">
                  {stream.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Traceable Impact Chain */}
        <div className="rounded-3xl border border-[#102A1F]/20 bg-white p-8 sm:p-14 space-y-10">
          <div className="max-w-2xl space-y-3">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#6F8F45]">
              09 // END-TO-END TRACEABILITY
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.035em] text-[#102A1F]">
              Impact should be something you can trace
            </h2>
          </div>

          <div className="relative pt-4">
            <div
              className="hidden lg:block absolute top-1/2 left-0 right-0 h-[2px] bg-[#102A1F]/15 -translate-y-1/2"
              aria-hidden="true"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
              {[
                { label: "Contributor", sub: "Performs sorting action" },
                { label: "Verified Action", sub: "AI triage + Human approval" },
                { label: "Supporter", sub: "Donates native NEAR" },
                { label: "Donation NFT", sub: "Locks contributor attribution" },
                { label: "Public Provenance", sub: "Walletless RPC proof" },
              ].map((node, i) => (
                <div
                  key={node.label}
                  className="rounded-2xl border border-[#102A1F]/20 bg-[#F5F2E9] p-5 space-y-1.5"
                >
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#6F8F45]">
                    NODE 0{i + 1}
                  </div>
                  <div className="text-lg font-extrabold text-[#102A1F]">
                    {node.label}
                  </div>
                  <div className="text-xs text-[#18211C]/70">{node.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          FINAL CTA — Full-Screen Deep Forest (#102A1F) Statement
      ====================================================================== */}
      <section className="bg-[#102A1F] text-[#F5F2E9] py-28 sm:py-36 border-t border-white/10">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12 text-center space-y-10">
          <div className="font-mono text-xs uppercase tracking-[0.22em] text-[#C7F36B]">
            BUILT ON NEAR
          </div>

          <h2
            className="font-extrabold tracking-[-0.04em] text-[#F5F2E9] leading-[0.96] max-w-4xl mx-auto"
            style={{ fontSize: "clamp(2.75rem, 6.5vw, 6.5rem)" }}
          >
            Make the next action visible
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/actions"
              className="group inline-flex items-center gap-3 rounded-full bg-[#C7F36B] px-8 py-4 text-sm font-bold text-[#102A1F] transition-all hover:bg-white hover:-translate-y-0.5"
            >
              <span>Explore Verified Actions</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/contribute"
              className="group inline-flex items-center gap-2.5 rounded-full border border-[#F5F2E9]/30 bg-transparent px-8 py-4 text-sm font-semibold text-[#F5F2E9] transition-all hover:border-[#C7F36B] hover:text-[#C7F36B] hover:-translate-y-0.5"
            >
              <span>Submit Your Action</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
