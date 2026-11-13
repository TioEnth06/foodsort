"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useNearWallet } from "@/lib/near/wallet-provider";
import { ActionCard } from "@/components/actions/action-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatYoctoToNear } from "@/lib/utils";
import {
  ArrowRight,
  Award,
  Bot,
  Database,
  Leaf,
  Recycle,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react";

export default function HomePage() {
  const { actions, treasury, isUsingDemoData } = useNearWallet();

  const verifiedActions = actions
    .filter((a) => a.status === "Verified")
    .slice(0, 3);

  return (
    <div className="space-y-16 pb-8">
      <section className="relative overflow-hidden border-b border-[#1B4332]/15 bg-gradient-to-b from-[#1B4332] to-[#122E22] text-[#FAF8F5] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="verified" className="bg-[#D8F3DC] text-[#1B4332]">
                  NEAR Hackathon 2026 MVP
                </Badge>
                <Badge
                  variant="neutral"
                  className="bg-[#40916C]/30 text-[#D8F3DC] border-[#40916C]"
                >
                  NEP-171 + NEP-177 Provenance NFTs
                </Badge>
                {isUsingDemoData && (
                  <Badge variant="demo">DEMO DATA PREVIEW ACTIVE</Badge>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                Verifiable Food-Sorting Actions &{" "}
                <span className="text-[#D8F3DC]">
                  Attribution-Preserving Patronage
                </span>{" "}
                on NEAR.
              </h1>

              <p className="text-base sm:text-lg text-[#D8F3DC]/90 max-w-2xl leading-relaxed">
                Contributors document real-world food-sorting actions (
                <code className="font-mono text-white">COMPOST</code>,{" "}
                <code className="font-mono text-white">FOOD_RESCUE</code>,{" "}
                <code className="font-mono text-white">RESIDUAL</code>) pinned to
                IPFS. Human admins—assisted by an isolated AI triage
                assistant—verify actions on-chain. Donors support verified
                actions with native NEAR and mint NEP-171 Patronage NFTs that
                permanently preserve the original contributor&apos;s attribution.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href="/actions">
                  <Button variant="secondary" size="lg">
                    Explore Verified Actions
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contribute">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-[#D8F3DC]/40 text-[#FAF8F5] hover:bg-[#D8F3DC]/15"
                  >
                    <UploadCloud className="h-4 w-4" />
                    Submit Sorting Action
                  </Button>
                </Link>
                <Link href="/verify">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="text-[#D8F3DC] hover:bg-white/10"
                  >
                    Public NFT Verifier
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="lg:col-span-5"
            >
              <div className="rounded-2xl border border-[#40916C]/40 bg-[#FAF8F5] text-[#1C1F1E] p-6 shadow-xl space-y-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#40916C]">
                      Contract Treasury Accounting
                    </span>
                    <h2 className="text-xl font-bold text-[#1B4332] mt-0.5">
                      Transparent Treasury State
                    </h2>
                  </div>
                  <Badge variant="verified">{treasury.treasury_status}</Badge>
                </div>

                <div className="rounded-xl bg-[#1B4332] text-[#FAF8F5] p-4">
                  <div className="text-xs text-[#D8F3DC]/80">
                    Net Donations Held in Contract Treasury
                  </div>
                  <div className="mt-1 text-3xl font-extrabold font-mono">
                    {formatYoctoToNear(treasury.treasury_balance_yocto, 4)} NEAR
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-[#D8F3DC]/90 border-t border-white/15 pt-2 font-mono">
                    <span>NEP-171 Storage Reserved:</span>
                    <span>
                      {formatYoctoToNear(
                        treasury.total_storage_reserved_yocto,
                        4
                      )}{" "}
                      NEAR
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="rounded-xl border border-[#1B4332]/15 bg-white p-3">
                    <div className="text-xl font-extrabold text-[#1B4332]">
                      {treasury.verified_actions_count}
                    </div>
                    <div className="text-[11px] text-[#525B56] font-medium">
                      Verified Actions
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#1B4332]/15 bg-white p-3">
                    <div className="text-xl font-extrabold text-amber-700">
                      {treasury.pending_actions_count}
                    </div>
                    <div className="text-[11px] text-[#525B56] font-medium">
                      Pending Review
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#1B4332]/15 bg-white p-3">
                    <div className="text-xl font-extrabold text-[#40916C]">
                      {treasury.total_donations_count}
                    </div>
                    <div className="text-[11px] text-[#525B56] font-medium">
                      Patronage NFTs
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-[#F3EFE6] p-3 text-xs text-[#525B56] flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#1B4332] shrink-0 mt-0.5" />
                  <span>
                    <strong>Non-Distribution Truthfulness:</strong> All net
                    donations are held transparently in the smart contract
                    treasury (<code className="font-mono">HELD_IN_TREASURY</code>
                    ) and are never falsely marked as distributed.
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#40916C]">
              End-to-End Provenance Loop
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1B4332] mt-1">
              How FoodSort Preserves Truthful Attribution
            </h2>
          </div>
          <Link href="/verify">
            <Button variant="outline" size="sm">
              Inspect On-Chain NFT Proofs
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D8F3DC] text-[#1B4332] mb-2">
                <Recycle className="h-5 w-5" />
              </div>
              <CardTitle>1. Contributor Submits Evidence</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[#525B56] space-y-2">
              <p>
                Contributors sort food waste into standardized streams (
                <code className="font-mono text-[#1B4332]">COMPOST</code>,{" "}
                <code className="font-mono text-[#1B4332]">FOOD_RESCUE</code>,{" "}
                <code className="font-mono text-[#1B4332]">RESIDUAL</code>),
                upload photographic evidence to Pinata IPFS, and call{" "}
                <code className="font-mono text-[#1B4332]">submit_action()</code>
                .
              </p>
              <p className="text-xs font-mono text-[#1B4332]">
                Recorded as: action.contributor_id = predecessor_account_id()
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D8F3DC] text-[#1B4332] mb-2">
                <Bot className="h-5 w-5" />
              </div>
              <CardTitle>2. AI-Assisted Human Admin Review</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[#525B56] space-y-2">
              <p>
                The isolated AI Verification Assistant evaluates untrusted
                descriptions and images for category consistency and risk flags.
                AI has zero wallet access; the human admin explicitly confirms
                and signs{" "}
                <code className="font-mono text-[#1B4332]">verify_action()</code>
                .
              </p>
              <p className="text-xs font-mono text-[#1B4332]">
                Guardrail: requires_human_approval = true
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D8F3DC] text-[#1B4332] mb-2">
                <Award className="h-5 w-5" />
              </div>
              <CardTitle>3. Donor Patronage & NEP-171 NFT</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[#525B56] space-y-2">
              <p>
                Donors attach native NEAR to{" "}
                <code className="font-mono text-[#1B4332]">
                  donate_and_mint()
                </code>
                . The contract deducts exact storage byte cost, holds net funds
                in treasury, and mints an NFT whose metadata permanently locks
                the original contributor&apos;s account ID.
              </p>
              <p className="text-xs font-mono text-[#1B4332]">
                Distinguishes: Contributor vs. Donor vs. Current Owner
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#40916C]">
            Standardized Sorting Streams
          </span>
          <h2 className="text-2xl font-bold text-[#1B4332] mt-1">
            Three Verifiable Food-Sorting Categories
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              code: "COMPOST",
              title: "Organic Composting Diversion",
              desc: "Vegetable trimmings, fruit peels, coffee grounds, and uncontaminated organic matter diverted into aerobic compost or bokashi.",
              icon: Leaf,
            },
            {
              code: "FOOD_RESCUE",
              title: "Edible Surplus Food Recovery",
              desc: "Unspoiled bakery, produce, or prepared surplus sorted and portioned before market closing for immediate community recovery.",
              icon: Sparkles,
            },
            {
              code: "RESIDUAL",
              title: "Contaminated & Residual Separation",
              desc: "Oil-soaked liners, multilayer sachets, and spoiled items isolated so clean organic composting batches remain uncontaminated.",
              icon: Database,
            },
          ].map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.code}
                className="rounded-2xl border border-[#1B4332]/15 bg-white p-5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="category">{cat.code}</Badge>
                  <Icon className="h-4 w-4 text-[#40916C]" />
                </div>
                <h3 className="font-bold text-[#1C1F1E] pt-1">{cat.title}</h3>
                <p className="text-xs text-[#525B56] leading-relaxed">
                  {cat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#40916C]">
              Ready for Patronage
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1B4332] mt-1">
              Verified Food-Sorting Actions
            </h2>
          </div>
          <Link href="/actions">
            <Button variant="primary" size="sm">
              View All Actions ({actions.length})
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {verifiedActions.map((action) => (
            <ActionCard key={action.action_id} action={action} />
          ))}
        </div>
      </section>
    </div>
  );
}
