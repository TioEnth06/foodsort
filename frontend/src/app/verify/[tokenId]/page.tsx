"use client";

import React, { Suspense } from "react";
import { useParams } from "next/navigation";
import { VerifyContent } from "@/components/verify/verify-content";

function VerifyTokenIdRouteInner() {
  const params = useParams<{ tokenId: string }>();
  const rawTokenId = params?.tokenId
    ? decodeURIComponent(String(params.tokenId))
    : "foodsort-donation-1";

  return <VerifyContent initialTokenOverride={rawTokenId} />;
}

export default function VerifyTokenIdPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-12 text-center text-sm text-[#525B56]">
          Loading Public NFT Verification Proof...
        </div>
      }
    >
      <VerifyTokenIdRouteInner />
    </Suspense>
  );
}
