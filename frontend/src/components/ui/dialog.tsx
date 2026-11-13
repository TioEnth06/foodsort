"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4">
      <div
        className={cn(
          "relative w-full max-w-lg rounded-2xl border border-[#1B4332]/20 bg-[#FAF8F5] p-6 shadow-xl",
          className
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#1B4332]/10 pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#1C1F1E]">{title}</h3>
            {description && (
              <p className="mt-1 text-xs text-[#525B56]">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#525B56] hover:bg-[#1B4332]/10 hover:text-[#1C1F1E] cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
