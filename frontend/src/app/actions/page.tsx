"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useNearWallet } from "@/lib/near/wallet-provider";
import { ActionStatus, FoodCategory } from "@/lib/types";
import { ActionCard } from "@/components/actions/action-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Filter, Search, UploadCloud } from "lucide-react";

const STATUS_TABS: Array<{ label: string; value: "ALL" | ActionStatus }> = [
  { label: "All", value: "ALL" },
  { label: "Verified", value: "Verified" },
  { label: "Pending", value: "Pending" },
  { label: "Rejected", value: "Rejected" },
];

const CATEGORY_TABS: Array<{ label: string; value: "ALL" | FoodCategory }> = [
  { label: "All", value: "ALL" },
  { label: "Compost", value: "COMPOST" },
  { label: "Food rescue", value: "FOOD_RESCUE" },
  { label: "Residual", value: "RESIDUAL" },
];

export default function ActionsListingPage() {
  const { actions, isUsingDemoData } = useNearWallet();
  const [statusFilter, setStatusFilter] = useState<"ALL" | ActionStatus>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | FoodCategory>(
    "ALL"
  );
  const [searchQuery, setSearchQuery] = useState("");

  const filteredActions = useMemo(() => {
    return actions.filter((action) => {
      if (statusFilter !== "ALL" && action.status !== statusFilter) {
        return false;
      }
      if (categoryFilter !== "ALL" && action.food_category !== categoryFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = String(action.action_id).includes(q);
        const matchesContributor = action.contributor_id
          .toLowerCase()
          .includes(q);
        const matchesType = action.action_type.toLowerCase().includes(q);
        const matchesDesc = action.description.toLowerCase().includes(q);
        return matchesId || matchesContributor || matchesType || matchesDesc;
      }
      return true;
    });
  }, [actions, statusFilter, categoryFilter, searchQuery]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#1B4332]/15 pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#40916C]">
              Explore
            </span>
            {isUsingDemoData && <Badge variant="demo">Example</Badge>}
          </div>
          <h1 className="text-3xl font-extrabold text-[#1B4332]">
            Verified food-sorting actions
          </h1>
          <p className="text-sm text-[#525B56] max-w-2xl">
            Browse community sorting work. Only verified actions can receive
            support — and each donation keeps credit with the original
            contributor.
          </p>
        </div>

        <Link href="/contribute">
          <Button variant="primary">
            <UploadCloud className="h-4 w-4" />
            Submit an action
          </Button>
        </Link>
      </div>

      <div className="rounded-2xl border border-[#1B4332]/15 bg-white p-4 space-y-4 shadow-2xs">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-center">
          <div className="lg:col-span-5 relative">
            <Search className="h-4 w-4 text-[#525B56] absolute left-3.5 top-3.5" />
            <Input
              placeholder="Search by contributor, id, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="lg:col-span-7 flex flex-wrap gap-1.5">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                className={`rounded-xl px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === tab.value
                    ? "bg-[#1B4332] text-[#FAF8F5]"
                    : "bg-[#FAF8F5] text-[#1C1F1E] hover:bg-[#D8F3DC]/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-[#1B4332]/10 pt-3">
          <span className="text-xs font-semibold text-[#525B56] flex items-center gap-1 mr-1">
            <Filter className="h-3.5 w-3.5 text-[#40916C]" />
            Food Category:
          </span>
          {CATEGORY_TABS.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategoryFilter(cat.value)}
              className={`rounded-lg px-2.5 py-1 text-xs font-mono font-semibold transition-colors cursor-pointer ${
                categoryFilter === cat.value
                  ? "bg-[#40916C] text-white"
                  : "bg-[#F3EFE6] text-[#1C1F1E] hover:bg-[#D8F3DC]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {filteredActions.length === 0 ? (
        <div className="rounded-2xl border border-[#1B4332]/15 bg-white p-12 text-center space-y-3">
          <p className="text-base font-semibold text-[#1C1F1E]">
            No food-sorting actions match your current filters.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setStatusFilter("ALL");
              setCategoryFilter("ALL");
              setSearchQuery("");
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredActions.map((action) => (
            <ActionCard key={action.action_id} action={action} />
          ))}
        </div>
      )}
    </div>
  );
}
