import type { Metadata } from "next";
import "./globals.css";
import { NearWalletProvider } from "@/lib/near/wallet-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "FoodSort — Verifiable Food-Sorting & NEP-171 Patronage on NEAR",
  description:
    "NEAR Hackathon 2026 MVP: Submit food-sorting actions (COMPOST, FOOD_RESCUE, RESIDUAL), verify with human-in-the-loop AI triage, and support verified actions with native NEAR and attribution-preserving NEP-171 Donation NFTs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1F1E]">
        <NearWalletProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </NearWalletProvider>
      </body>
    </html>
  );
}
