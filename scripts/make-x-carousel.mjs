#!/usr/bin/env node
/**
 * Frame hackathon screenshots into X carousel cards (1080x1350).
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const SRC = path.resolve("docs/submission/screenshots");
const OUT = path.resolve("docs/submission/x-carousel");
fs.mkdirSync(OUT, { recursive: true });

const SLIDES = [
  {
    file: "01-landing-hero.png",
    label: "FOODSort",
    caption: "Sort food. Support change. Collect impact.",
  },
  {
    file: "02-contributor-submission.png",
    label: "SUBMIT",
    caption: "Turn real-world food actions into verifiable records.",
  },
  {
    file: "03-ai-verification.png",
    label: "VERIFY",
    caption: "AI assists. Humans decide.",
  },
  {
    file: "04-verified-action-donation.png",
    label: "SUPPORT",
    caption: "Support verified actions with native NEAR.",
  },
  {
    file: "05-donation-nft.png",
    label: "COLLECT",
    caption: "Receive a Donation NFT carrying action provenance.",
  },
  {
    file: "06-public-verification.png",
    label: "VERIFY PUBLICLY",
    caption: "Transparent records. Verifiable impact.",
  },
];

const W = 1080;
const H = 1350;
const PAD = 48;
const HEADER = 160;
const FOOTER = 56;

for (const slide of SLIDES) {
  const input = path.join(SRC, slide.file);
  const output = path.join(OUT, slide.file);
  const tmpShot = path.join(OUT, `.tmp-${slide.file}`);
  const captionEsc = slide.caption.replace(/'/g, "'\\''");
  const labelEsc = slide.label.replace(/'/g, "'\\''");

  // Fit screenshot into content area
  const contentW = W - PAD * 2;
  const contentH = H - HEADER - FOOTER - PAD;
  execSync(
    `convert '${input}' -resize ${contentW}x${contentH} -background '#F5F2E9' -gravity center -extent ${contentW}x${contentH} '${tmpShot}'`,
    { stdio: "inherit" }
  );

  // Build canvas with header + caption + screenshot + footer brand
  execSync(
    [
      `convert -size ${W}x${H} xc:'#102A1F'`,
      `\\( -size ${W}x${HEADER} xc:'#102A1F' \\)`,
      `-geometry +0+0 -composite`,
      // lime accent bar
      `\\( -size ${W}x6 xc:'#C7F36B' \\) -geometry +0+${HEADER - 6} -composite`,
      // screenshot panel background
      `\\( -size ${contentW + 16}x${contentH + 16} xc:'#F5F2E9' -stroke '#1B4332' -strokewidth 1 -fill '#F5F2E9' -draw 'rectangle 0,0 ${contentW + 15},${contentH + 15}' \\)`,
      `-geometry +${PAD - 8}+${HEADER + 8} -composite`,
      `\\( '${tmpShot}' \\) -geometry +${PAD}+${HEADER + 16} -composite`,
      // label
      `-font DejaVu-Sans-Bold -pointsize 42 -fill '#C7F36B' -gravity NorthWest -annotate +${PAD}+36 '${labelEsc}'`,
      // caption
      `-font DejaVu-Sans -pointsize 26 -fill '#F5F2E9' -gravity NorthWest -annotate +${PAD}+92 '${captionEsc}'`,
      // footer
      `-font DejaVu-Sans -pointsize 18 -fill '#C7F36B' -gravity SouthWest -annotate +${PAD}+22 'foodsort.vercel.app  ·  NEAR Testnet'`,
      `'${output}'`,
    ].join(" "),
    { stdio: "inherit" }
  );

  fs.unlinkSync(tmpShot);
  console.log("✓", slide.file);
}

console.log("\nCarousel written to", OUT);
