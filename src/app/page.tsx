"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useNearWallet } from "@/lib/near/wallet-provider";
import {
  formatTimestamp,
  formatYoctoToNear,
  resolveIpfsUrl,
} from "@/lib/utils";
import { ArrowRight, ArrowUpRight } from "lucide-react";

const STEPS = [
  {
    word: "Sort",
    caption:
      "Communities divert compost, rescue surplus food, or separate contaminated waste at kitchens and markets",
  },
  {
    word: "Document",
    caption:
      "A photo and short description become lasting evidence of the work that was done",
  },
  {
    word: "Verify",
    caption:
      "An assistant flags inconsistencies for review — a person makes the final call",
  },
  {
    word: "Support",
    caption:
      "Anyone can back a verified action with NEAR while funds stay visible in the treasury",
  },
  {
    word: "Remember",
    caption:
      "Each donation leaves a certificate that permanently credits the person who did the sorting",
  },
];

const SUPPORT_STORY = [
  {
    title: "Someone sorts food",
    detail:
      "A contributor documents real sorting work — compost, rescue, or residual — with photo evidence",
  },
  {
    title: "It gets verified",
    detail:
      "A human reviewer confirms the action on-chain before anyone can support it",
  },
  {
    title: "You back the work",
    detail:
      "Your donation stays held in the contract treasury, with a clear record of what you supported",
  },
  {
    title: "Credit stays with the sorter",
    detail:
      "The certificate always names the original contributor, even if the NFT changes hands later",
  },
];

export default function HomePage() {
  const { actions, donations, nftTokens, treasury } = useNearWallet();

  const [activeStory, setActiveStory] = useState(2);

  const verifiedActions = actions.filter((a) => a.status === "Verified");
  const primaryAction = verifiedActions[0] || actions[0];
  const primaryDonation = donations[0];
  const primaryToken = nftTokens[0];

  const heroImage = resolveIpfsUrl(
    primaryAction?.evidence_uri ||
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80"
  );

  return (
    <div className="bg-[#F5F2E9] text-[#18211C] selection:bg-[#C7F36B] selection:text-[#102A1F]">
      {/* Hero — one composition, brand-led, full-bleed image */}
      <section className="relative min-h-[92vh] overflow-hidden flex flex-col justify-end">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Community food sorting"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C1712] via-[#0C1712]/55 to-[#0C1712]/25" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0C1712]/70 via-[#0C1712]/35 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 pb-16 pt-28 sm:px-10 lg:px-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="max-w-4xl font-extrabold tracking-[-0.04em] text-[#F5F2E9] leading-[0.95]"
            style={{ fontSize: "clamp(2.8rem, 7.5vw, 6.5rem)" }}
          >
            <span className="block text-[#C7F36B]">FoodSort</span>
            Sort food.
            <br />
            Support change.
            <br />
            Keep the credit honest.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="mt-6 max-w-xl text-lg sm:text-xl text-[#F5F2E9]/85 leading-relaxed"
          >
            Real sorting work becomes visible, verifiable, and supportable —
            with the original contributor always named
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link
              href="/actions"
              className="group inline-flex items-center gap-3 rounded-full bg-[#C7F36B] px-7 py-4 text-sm font-semibold text-[#102A1F] transition-all duration-300 hover:bg-white hover:-translate-y-0.5"
            >
              <span>Explore verified actions</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/contribute"
              className="group inline-flex items-center gap-2 rounded-full border border-white/35 px-7 py-4 text-sm font-semibold text-[#F5F2E9] transition-all duration-300 hover:border-[#C7F36B] hover:text-[#C7F36B] hover:-translate-y-0.5"
            >
              <span>Submit an action</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Why it matters */}
      <section className="mx-auto max-w-[1440px] px-5 py-24 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6 space-y-5">
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-[-0.035em] text-[#102A1F] leading-[1.05]">
              Good work happens every day — most of it stays invisible
            </h2>
            <p className="text-base sm:text-lg text-[#18211C]/80 leading-relaxed max-w-xl">
              Markets, kitchens, and households already sort organic waste and
              recover surplus food. That effort rarely gets a clear record, and
              when support arrives, credit often goes to the funder instead of
              the person who did the sorting
            </p>
            <p className="text-base sm:text-lg text-[#18211C]/80 leading-relaxed max-w-xl">
              FoodSort makes each verified batch visible, supportable, and
              permanently attributed to the original contributor
            </p>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
            <div className="sm:col-span-7 overflow-hidden rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80"
                alt="Fresh produce sorted at a market"
                className="h-80 w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="sm:col-span-5 overflow-hidden rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80"
                alt="Surplus bread ready for recovery"
                className="h-56 w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="border-y border-[#102A1F]/10 bg-[#ECE8DC]/50"
      >
        <div className="mx-auto max-w-[1440px] px-5 py-24 sm:px-10 lg:px-16">
          <div className="max-w-2xl pb-12">
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-[-0.035em] text-[#102A1F]">
              From sorting to proof
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#18211C]/75 leading-relaxed">
              Five simple steps — no jargon required
            </p>
          </div>

          <div className="divide-y divide-[#102A1F]/12">
            {STEPS.map((item, idx) => (
              <motion.div
                key={item.word}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: idx * 0.04 }}
                className="grid grid-cols-1 md:grid-cols-12 items-baseline gap-3 py-8"
              >
                <div className="md:col-span-1 text-sm text-[#6F8F45] font-semibold">
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <div className="md:col-span-4 text-3xl sm:text-4xl font-extrabold tracking-[-0.03em] text-[#102A1F]">
                  {item.word}
                </div>
                <div className="md:col-span-7 text-base text-[#18211C]/80 leading-relaxed">
                  {item.caption}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI assists / humans decide — plain language */}
      <section className="mx-auto max-w-[1440px] px-5 py-24 sm:px-10 lg:px-16">
        <div className="max-w-3xl space-y-4 pb-12">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-[-0.035em] text-[#102A1F]">
            An assistant helps. A person decides.
          </h2>
          <p className="text-base sm:text-lg text-[#18211C]/80 leading-relaxed">
            FoodSort uses a review assistant to spot mismatches between a photo
            and a description. It cannot hold keys, sign transactions, or
            approve anything on its own — only a human reviewer can verify an
            action
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          <div className="relative min-h-[340px] overflow-hidden rounded-2xl">
            <img
              src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1000&q=80"
              alt="Submitted sorting evidence"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0C1712] via-[#0C1712]/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-[#F5F2E9]">
              <p className="text-sm text-[#C7F36B] font-medium mb-2">
                Example submission
              </p>
              <p className="text-base leading-relaxed">
                Separated 6.2 kg of kitchen scraps into bokashi buckets —
                banana peels, eggshells, and wilted greens
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-6 rounded-2xl bg-white p-6 sm:p-8 border border-[#102A1F]/10">
            <div className="space-y-5">
              <h3 className="text-xl font-bold text-[#102A1F]">
                What the assistant checks
              </h3>
              <ul className="space-y-4 text-[#18211C]/85">
                <li className="flex items-start justify-between gap-4 border-b border-[#102A1F]/10 pb-4">
                  <div>
                    <div className="font-semibold text-[#102A1F]">
                      Category match
                    </div>
                    <div className="text-sm mt-0.5 text-[#18211C]/70">
                      Does the photo fit the claimed sorting type?
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-[#6F8F45]">
                    Looks good
                  </span>
                </li>
                <li className="flex items-start justify-between gap-4 border-b border-[#102A1F]/10 pb-4">
                  <div>
                    <div className="font-semibold text-[#102A1F]">
                      Evidence clarity
                    </div>
                    <div className="text-sm mt-0.5 text-[#18211C]/70">
                      Is real sorting work visible in the image?
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-[#6F8F45]">
                    Clear
                  </span>
                </li>
                <li className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold text-[#102A1F]">
                      Risk notes
                    </div>
                    <div className="text-sm mt-0.5 text-[#18211C]/70">
                      Anything unusual for a human to double-check?
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-[#6F8F45]">
                    None
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl bg-[#102A1F] p-5 text-[#F5F2E9]">
              <p className="text-sm text-[#C7F36B] font-medium mb-1">
                Final say stays human
              </p>
              <p className="text-sm text-[#F5F2E9]/80 mb-4">
                Only a trusted reviewer can approve an action on NEAR
              </p>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 rounded-full bg-[#C7F36B] px-4 py-2 text-xs font-bold text-[#102A1F] hover:bg-white transition-colors"
              >
                <span>Open admin review</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Verified actions showcase */}
      <section className="border-t border-[#102A1F]/10 bg-[#ECE8DC]/40">
        <div className="mx-auto max-w-[1440px] px-5 py-24 sm:px-10 lg:px-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-14">
            <div>
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-[-0.035em] text-[#102A1F]">
                Verified actions
              </h2>
              <p className="mt-3 text-base text-[#18211C]/75 max-w-md">
                Work that has been reviewed and is ready for support
              </p>
            </div>
            <Link
              href="/actions"
              className="editorial-link inline-flex items-center gap-2 text-sm font-semibold text-[#102A1F]"
            >
              <span>See all ({actions.length})</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-16">
            {verifiedActions.slice(0, 2).map((act, index) => {
              const isReversed = index % 2 === 1;
              const categoryLabel = act.food_category
                .replace(/_/g, " ")
                .toLowerCase()
                .replace(/^\w/, (c) => c.toUpperCase());

              return (
                <div
                  key={act.action_id}
                  className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center"
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
                      className="group block relative overflow-hidden rounded-2xl"
                    >
                      <div
                        className={
                          index === 0
                            ? "h-[360px] sm:h-[460px] w-full overflow-hidden"
                            : "h-[320px] sm:h-[400px] w-full overflow-hidden"
                        }
                      >
                        <img
                          src={resolveIpfsUrl(act.evidence_uri)}
                          alt={act.action_type}
                          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                          loading="lazy"
                        />
                      </div>
                      <div className="absolute bottom-4 left-4 rounded-full bg-[#C7F36B] px-3.5 py-1.5 text-xs font-bold text-[#102A1F]">
                        Verified
                      </div>
                      {act.is_demo_data && (
                        <div className="absolute top-4 left-4 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-[#18211C]">
                          Sample
                        </div>
                      )}
                    </Link>
                  </div>

                  <div
                    className={
                      isReversed
                        ? "lg:col-span-5 lg:order-1 space-y-5"
                        : "lg:col-span-5 lg:order-2 space-y-5"
                    }
                  >
                    <p className="text-sm font-medium text-[#6F8F45]">
                      {categoryLabel}
                    </p>
                    <h3 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.03em] text-[#102A1F]">
                      {act.action_type}
                    </h3>
                    <p className="text-base text-[#18211C]/80 leading-relaxed">
                      {act.description.replace(/\.+$/, "")}
                    </p>

                    <div className="grid grid-cols-2 gap-4 border-y border-[#102A1F]/12 py-4 text-sm">
                      <div>
                        <div className="text-[#18211C]/55">Contributor</div>
                        <div className="mt-1 font-semibold text-[#102A1F] break-all">
                          {act.contributor_id}
                        </div>
                      </div>
                      <div>
                        <div className="text-[#18211C]/55">Support held</div>
                        <div className="mt-1 font-semibold text-[#102A1F]">
                          {formatYoctoToNear(act.total_donated_yocto, 4)} NEAR
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/actions/${act.action_id}`}
                      className="group inline-flex items-center gap-3 rounded-full bg-[#102A1F] px-6 py-3.5 text-sm font-semibold text-[#F5F2E9] hover:bg-[#0C1712] transition-all"
                    >
                      <span>Support this action</span>
                      <ArrowUpRight className="h-4 w-4 text-[#C7F36B] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Certificate story — clean, no NEP/JSON noise */}
      <section className="mx-auto max-w-[1440px] px-5 py-24 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-[-0.035em] text-[#102A1F] leading-[1.05]">
              Support an action — keep its story with you
            </h2>
            <p className="text-base text-[#18211C]/80 leading-relaxed">
              When you donate, you receive a certificate of support. It proves
              your contribution and permanently names the person who did the
              sorting — not as a speculative collectible, just a clear record
            </p>

            <div className="space-y-2">
              {SUPPORT_STORY.map((stage, idx) => {
                const isActive = activeStory === idx;
                return (
                  <button
                    key={stage.title}
                    type="button"
                    onClick={() => setActiveStory(idx)}
                    className={`w-full text-left rounded-xl p-4 transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#102A1F] text-[#F5F2E9]"
                        : "bg-white/80 text-[#18211C] hover:bg-white border border-[#102A1F]/10"
                    }`}
                  >
                    <div
                      className={`text-sm font-semibold ${
                        isActive ? "text-[#C7F36B]" : "text-[#6F8F45]"
                      }`}
                    >
                      {stage.title}
                    </div>
                    <p
                      className={`mt-1 text-sm leading-relaxed ${
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

          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-[#102A1F]/15 bg-[#ECE8DC] p-6 sm:p-10 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-[#6F8F45] font-medium">
                    Certificate of support
                  </p>
                  <p className="mt-1 text-lg font-bold text-[#102A1F]">
                    {primaryDonation?.token_id ?? primaryToken?.token_id ?? "—"}
                  </p>
                </div>
                {primaryDonation?.is_demo_data && (
                  <span className="text-xs text-[#18211C]/55">Example</span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                <div className="sm:col-span-5 overflow-hidden rounded-xl">
                  <img
                    src={heroImage}
                    alt="Certificate media"
                    className="h-48 w-full object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="sm:col-span-7 space-y-3 text-sm">
                  <div className="flex justify-between gap-4 border-b border-[#102A1F]/12 pb-2">
                    <span className="text-[#18211C]/55">Action</span>
                    <span className="font-semibold text-[#102A1F] text-right">
                      #{primaryDonation?.action_id ?? primaryAction?.action_id ?? "—"}{" "}
                      ·{" "}
                      {(primaryAction?.food_category ?? "COMPOST")
                        .replace(/_/g, " ")
                        .toLowerCase()}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-[#102A1F]/12 pb-2">
                    <span className="text-[#18211C]/55">Contributor</span>
                    <span className="font-semibold text-[#102A1F] text-right break-all">
                      {primaryDonation?.contributor_id ??
                        primaryAction?.contributor_id ??
                        "—"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-[#102A1F]/12 pb-2">
                    <span className="text-[#18211C]/55">Original donor</span>
                    <span className="font-semibold text-[#102A1F] text-right break-all">
                      {primaryDonation?.donor_id ?? "—"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-[#102A1F]/12 pb-2">
                    <span className="text-[#18211C]/55">Amount</span>
                    <span className="font-semibold text-[#102A1F]">
                      {formatYoctoToNear(
                        primaryDonation?.net_treasury_amount_yocto ?? "0",
                        4
                      )}{" "}
                      NEAR
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#18211C]/55">Verified</span>
                    <span className="font-semibold text-[#102A1F]">
                      {primaryAction?.verified_at_ms
                        ? formatTimestamp(primaryAction.verified_at_ms)
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#102A1F]/12 pt-4 text-sm">
                <p className="text-[#18211C]/70">
                  Contributor, donor, and current owner stay distinct roles
                </p>
                <Link
                  href={`/verify/${encodeURIComponent(
                    primaryDonation?.token_id ?? "foodsort-donation-1"
                  )}`}
                  className="font-semibold text-[#102A1F] underline inline-flex items-center gap-1"
                >
                  <span>View certificate</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Public verify + treasury — human labels */}
      <section className="bg-[#0C1712] text-[#F5F2E9]">
        <div className="mx-auto max-w-[1440px] px-5 py-24 sm:px-10 lg:px-16 space-y-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-6 space-y-5">
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-[-0.035em] leading-[1.05]">
                Anyone can check a record — no wallet needed
              </h2>
              <p className="text-base sm:text-lg text-[#F5F2E9]/75 leading-relaxed max-w-xl">
                Open a certificate and see who sorted, who donated, and who
                holds it now. Those three roles never get mixed up, even after a
                transfer
              </p>
              <Link
                href="/verify"
                className="group inline-flex items-center gap-3 rounded-full bg-[#C7F36B] px-7 py-4 text-sm font-bold text-[#102A1F] transition-all hover:bg-white"
              >
                <span>Open public verification</span>
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>

            <div className="lg:col-span-6 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl bg-[#102A1F]/80 p-4">
                  <div className="text-[#F5F2E9]/50 text-xs mb-1">Action</div>
                  <div className="font-semibold text-[#C7F36B]">
                    Verified · #{primaryAction?.action_id ?? "—"}
                  </div>
                </div>
                <div className="rounded-xl bg-[#102A1F]/80 p-4">
                  <div className="text-[#F5F2E9]/50 text-xs mb-1">
                    Contributor
                  </div>
                  <div className="font-semibold truncate">
                    {primaryAction?.contributor_id ?? "—"}
                  </div>
                </div>
                <div className="rounded-xl bg-[#102A1F]/80 p-4">
                  <div className="text-[#F5F2E9]/50 text-xs mb-1">
                    Original donor
                  </div>
                  <div className="font-semibold truncate">
                    {primaryDonation?.donor_id ?? "—"}
                  </div>
                </div>
                <div className="rounded-xl bg-[#102A1F]/80 p-4">
                  <div className="text-[#F5F2E9]/50 text-xs mb-1">
                    Certificate
                  </div>
                  <div className="font-semibold text-[#C7F36B] truncate">
                    {primaryDonation?.token_id ?? "—"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-14">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.03em] mb-10">
              Live treasury
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div>
                <div className="text-5xl font-extrabold tracking-tight">
                  {treasury.verified_actions_count}
                </div>
                <div className="mt-2 text-sm text-[#F5F2E9]/60">
                  Verified actions
                </div>
              </div>
              <div>
                <div className="text-5xl font-extrabold tracking-tight">
                  {treasury.total_donations_count}
                </div>
                <div className="mt-2 text-sm text-[#F5F2E9]/60">
                  Support certificates
                </div>
              </div>
              <div>
                <div className="text-5xl font-extrabold tracking-tight text-[#C7F36B]">
                  {formatYoctoToNear(treasury.treasury_balance_yocto, 4)}
                </div>
                <div className="mt-2 text-sm text-[#C7F36B]/90">
                  NEAR held in treasury
                </div>
              </div>
              <div>
                <div className="text-5xl font-extrabold tracking-tight text-[#F5F2E9]/45">
                  {formatYoctoToNear(
                    treasury.funds_distributed_yocto || "0",
                    4
                  )}
                </div>
                <div className="mt-2 text-sm text-[#F5F2E9]/50">
                  NEAR distributed (none in this version)
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three streams */}
      <section
        id="impact"
        className="mx-auto max-w-[1440px] px-5 py-24 sm:px-10 lg:px-16"
      >
        <div className="max-w-2xl pb-12">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-[-0.035em] text-[#102A1F]">
            Three kinds of sorting
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#18211C]/75 leading-relaxed">
            Every action falls into one clear stream
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
          {[
            {
              title: "Compost",
              desc: "Organic scraps diverted from landfill — peels, greens, coffee grounds, and other clean material headed for composting",
            },
            {
              title: "Food rescue",
              desc: "Safe surplus recovered before it spoils — bakery loaves, market produce, and portioned leftovers ready for sharing",
            },
            {
              title: "Residual",
              desc: "Contaminated material kept out of compost — oil-soaked liners and packaging that would spoil a clean batch",
            },
          ].map((stream) => (
            <div key={stream.title} className="space-y-3">
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.03em] text-[#102A1F]">
                {stream.title}
              </h3>
              <p className="text-base text-[#18211C]/80 leading-relaxed">
                {stream.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-20 rounded-2xl bg-white border border-[#102A1F]/10 p-8 sm:p-12">
          <h3 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.035em] text-[#102A1F] max-w-xl">
            Impact you can follow end to end
          </h3>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { label: "Contributor", sub: "Does the sorting" },
              { label: "Verified action", sub: "Human approval" },
              { label: "Supporter", sub: "Donates NEAR" },
              { label: "Certificate", sub: "Locks credit" },
              { label: "Public record", sub: "Open to anyone" },
            ].map((node) => (
              <div key={node.label} className="space-y-1">
                <div className="text-lg font-bold text-[#102A1F]">
                  {node.label}
                </div>
                <div className="text-sm text-[#18211C]/65">{node.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#102A1F] text-[#F5F2E9] py-28 sm:py-32">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-10 lg:px-16 text-center space-y-8">
          <p className="text-sm font-medium tracking-[0.08em] uppercase text-[#C7F36B]">
            FoodSort
          </p>
          <h2
            className="font-extrabold tracking-[-0.04em] leading-[0.96] max-w-3xl mx-auto"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5.5rem)" }}
          >
            Make the next action visible
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/actions"
              className="group inline-flex items-center gap-3 rounded-full bg-[#C7F36B] px-8 py-4 text-sm font-bold text-[#102A1F] transition-all hover:bg-white hover:-translate-y-0.5"
            >
              <span>Explore verified actions</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/contribute"
              className="group inline-flex items-center gap-2 rounded-full border border-[#F5F2E9]/30 px-8 py-4 text-sm font-semibold text-[#F5F2E9] transition-all hover:border-[#C7F36B] hover:text-[#C7F36B] hover:-translate-y-0.5"
            >
              <span>Submit your action</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
