"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { FoodAction } from "@/lib/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatTimestamp,
  formatYoctoToNear,
  resolveIpfsUrl,
} from "@/lib/utils";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  HeartHandshake,
  UserCheck,
  XCircle,
} from "lucide-react";

export function ActionCard({ action }: { action: FoodAction }) {
  const statusBadge = () => {
    switch (action.status) {
      case "Verified":
        return (
          <Badge variant="verified">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Verified Action
          </Badge>
        );
      case "Pending":
        return (
          <Badge variant="pending">
            <Clock className="h-3.5 w-3.5" />
            Pending Verification
          </Badge>
        );
      case "Rejected":
        return (
          <Badge variant="rejected">
            <XCircle className="h-3.5 w-3.5" />
            Rejected
          </Badge>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden flex flex-col h-full hover:border-[#40916C] transition-colors">
        <div className="relative h-48 w-full bg-[#F3EFE6] overflow-hidden">
          <img
            src={resolveIpfsUrl(action.evidence_uri)}
            alt={action.action_type}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <Badge variant="category">{action.food_category}</Badge>
            {action.is_demo_data && <Badge variant="demo">DEMO DATA</Badge>}
          </div>
          <div className="absolute top-3 right-3">{statusBadge()}</div>
        </div>

        <CardHeader className="pb-2">
          <div className="flex items-center justify-between text-xs text-[#525B56] font-mono">
            <span>Action #{action.action_id}</span>
            <span>{formatTimestamp(action.submitted_at_ms)}</span>
          </div>
          <CardTitle className="mt-1 line-clamp-1">
            {action.action_type}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 space-y-3">
          <p className="text-sm text-[#525B56] line-clamp-3 leading-relaxed">
            {action.description}
          </p>

          <div className="rounded-xl bg-[#FAF8F5] border border-[#1B4332]/10 p-2.5 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[#525B56] flex items-center gap-1">
                <UserCheck className="h-3.5 w-3.5 text-[#40916C]" />
                Original Contributor:
              </span>
              <span className="font-mono font-semibold text-[#1B4332]">
                {action.contributor_id}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#525B56] flex items-center gap-1">
                <HeartHandshake className="h-3.5 w-3.5 text-[#1B4332]" />
                Held in Treasury:
              </span>
              <span className="font-mono font-semibold text-[#1C1F1E]">
                {formatYoctoToNear(action.total_donated_yocto, 4)} NEAR (
                {action.donation_count} patron
                {action.donation_count === 1 ? "" : "s"})
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Link href={`/actions/${action.action_id}`} className="w-full">
            <Button
              variant={action.status === "Verified" ? "primary" : "outline"}
              className="w-full justify-between"
            >
              <span>
                {action.status === "Verified"
                  ? "Support Verified Action & Mint NFT"
                  : "Inspect Action & Evidence"}
              </span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
