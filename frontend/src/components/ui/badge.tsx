import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "verified" | "pending" | "rejected" | "category" | "demo" | "neutral";
}

export function Badge({
  className,
  variant = "neutral",
  ...props
}: BadgeProps) {
  const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
    verified: "bg-[#D8F3DC] text-[#1B4332] border-[#40916C]/40",
    pending: "bg-amber-100 text-amber-900 border-amber-300",
    rejected: "bg-red-100 text-red-900 border-red-300",
    category: "bg-[#1B4332] text-[#FAF8F5] border-[#1B4332]",
    demo: "bg-amber-50 text-amber-900 border-amber-400/80",
    neutral: "bg-[#F3EFE6] text-[#1C1F1E] border-[#1B4332]/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
