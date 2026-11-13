"use client";

import React, { Suspense } from "react";
import { VerifyContent } from "@/components/verify/verify-content";

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-12 text-center text-sm text-[#525B56]">
          Loading Public NFT Verification Page...
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
