import type { Metadata } from "next";
import "./globals.css";
import { NearWalletProvider } from "@/lib/near/wallet-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "FoodSort — Verified Food Impact on NEAR",
  description:
    "FoodSort connects verified real-world food-sorting actions with transparent on-chain support and Donation NFTs.",
  keywords: [
    "FoodSort",
    "NEAR Protocol",
    "Verified Food Impact",
    "NEP-171",
    "NEP-177",
    "Compost",
    "Food Rescue",
    "Sustainability Provenance",
  ],
  openGraph: {
    title: "FoodSort — Verified Food Impact on NEAR",
    description:
      "Sort food. Support change. Collect impact. FoodSort connects verified real-world food-sorting actions with transparent on-chain support and Donation NFTs.",
    url: "https://foodsort.vercel.app",
    siteName: "FoodSort",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FoodSort — Verified Food Impact on NEAR",
    description:
      "Sort food. Support change. Collect impact. Verified food impact, made visible on NEAR.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#F5F2E9] text-[#18211C] selection:bg-[#C7F36B] selection:text-[#102A1F]">
        <NearWalletProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </NearWalletProvider>
      </body>
    </html>
  );
}
