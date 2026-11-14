#!/usr/bin/env node
/**
 * Capture FoodSort hackathon submission screenshots from production.
 * Viewport: 1440x900. Writes to docs/submission/screenshots/
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const APP = process.env.FOODSORT_CAPTURE_BASE || "http://127.0.0.1:3000";
const OUT = path.resolve("docs/submission/screenshots");
const VIEWPORT = { width: 1440, height: 900 };

fs.mkdirSync(OUT, { recursive: true });

async function waitSettled(page) {
  await page.waitForLoadState("networkidle", { timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(800);
}

async function softConnect(page, accountId) {
  await ensureTestnetBadge(page).catch(() => {});

  const headerText = await page.locator("header").innerText();
  if (headerText.includes(accountId)) {
    return; // already soft-connected as target
  }

  const disconnect = page.getByLabel(/Disconnect wallet/i);
  if (await disconnect.isVisible().catch(() => false)) {
    await disconnect.click();
    await page.waitForTimeout(500);
  }

  const connectBtn = page.getByRole("button", { name: /Connect NEAR/i }).first();
  await connectBtn.waitFor({ state: "visible", timeout: 15000 });
  await connectBtn.click();
  await page.waitForTimeout(600);

  if (accountId.includes("foodsort-app")) {
    await page.getByRole("button", { name: /^Admin$/i }).click();
  } else if (accountId.includes("contrib")) {
    await page.getByRole("button", { name: /Contributor/i }).click();
  } else {
    const input = page.getByPlaceholder(/testnet|foodsort/i).first();
    await input.fill(accountId);
    await page.getByRole("button", { name: /Soft-connect account/i }).click();
  }

  await page
    .locator("header")
    .getByText(accountId)
    .first()
    .waitFor({ state: "visible", timeout: 20000 });
  await page.waitForTimeout(600);
}

async function ensureTestnetBadge(page) {
  // Wait until chain load finishes (Connecting → NEAR testnet or Example data)
  await page
    .locator("header")
    .getByText(/NEAR testnet|Example data/i)
    .first()
    .waitFor({ state: "visible", timeout: 90000 });
  const text = await page.locator("header").innerText();
  if (!/NEAR testnet/i.test(text)) {
    console.warn("⚠ Header still not on live testnet:", text.split("\n").slice(0, 4).join(" | "));
  }
}

async function shot(page, name) {
  const file = path.join(OUT, name);
  await page.screenshot({ path: file, type: "png" });
  console.log("✓", name);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  // --- 01 Landing hero ---
  await page.goto(APP + "/", { waitUntil: "domcontentloaded", timeout: 60000 });
  await waitSettled(page);
  await ensureTestnetBadge(page);
  // Scroll to top hero
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await shot(page, "01-landing-hero.png");

  // --- 02 Contributor submission ---
  await page.goto(APP + "/contribute", { waitUntil: "domcontentloaded", timeout: 60000 });
  await waitSettled(page);
  await ensureTestnetBadge(page);

  // Soft-connect contributor for nicer UI state
  await softConnect(page, "foodsort-contrib-6146.testnet");
  await page.goto(APP + "/contribute", { waitUntil: "domcontentloaded", timeout: 60000 });
  await waitSettled(page);

  // Select category COMPOST if buttons/selects exist
  const compost = page.getByRole("button", { name: /^COMPOST$/i }).first();
  if (await compost.isVisible().catch(() => false)) {
    await compost.click();
  } else {
    const select = page.locator("select").first();
    if (await select.isVisible().catch(() => false)) {
      await select.selectOption({ label: /COMPOST/i }).catch(async () => {
        await select.selectOption("COMPOST").catch(() => {});
      });
    }
  }

  // Action type presets or input
  const preset = page.getByRole("button", { name: /Organic|Market|Household|Compost/i }).first();
  if (await preset.isVisible().catch(() => false)) {
    await preset.click();
  }
  const actionType = page.locator('input[name="action_type"], input[placeholder*="action" i]').first();
  if (await actionType.isVisible().catch(() => false)) {
    const v = await actionType.inputValue().catch(() => "");
    if (!v) await actionType.fill("Market Scraps Sorting");
  }

  const desc = page.locator("textarea").first();
  if (await desc.isVisible().catch(() => false)) {
    await desc.fill(
      "Sorted 12.4 kg of leafy vegetable trimmings and fruit peels from three market stalls into labeled aerated compost bins."
    );
  }

  await page.waitForTimeout(500);
  await shot(page, "02-contributor-submission.png");

  // --- 03 AI verification (admin + pending + run AI) ---
  await page.goto(APP + "/admin", { waitUntil: "domcontentloaded", timeout: 60000 });
  await waitSettled(page);
  await softConnect(page, "foodsort-app-86051.testnet");
  await page.goto(APP + "/admin", { waitUntil: "domcontentloaded", timeout: 60000 });
  await waitSettled(page);
  await ensureTestnetBadge(page);

  // Expand / focus pending action if needed
  const pendingLabel = page.getByText(/Pending/i).first();
  await pendingLabel.waitFor({ state: "visible", timeout: 30000 }).catch(() => {});

  const runAi = page.getByRole("button", { name: /Run AI Evidence Analysis|Re-run AI Analysis/i }).first();
  await runAi.waitFor({ state: "visible", timeout: 30000 });
  await runAi.click();

  // Wait for AI result (confidence or recommendation)
  await page
    .getByText(/AI Recommendation|confidence|APPROVE|REJECT|NEEDS_REVIEW/i)
    .first()
    .waitFor({ state: "visible", timeout: 90000 })
    .catch(() => {});
  await page.waitForTimeout(1500);

  // Scroll AI panel into view
  await runAi.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(400);
  await shot(page, "03-ai-verification.png");

  // --- 04 Verified action + donation ---
  await page.goto(APP + "/actions/2", { waitUntil: "domcontentloaded", timeout: 60000 });
  await waitSettled(page);
  await ensureTestnetBadge(page);
  // Scroll donation panel into view if present
  const donate = page.getByText(/Donate|NEAR|Mint/i).first();
  await donate.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(500);
  // Prefer a composition showing both details and donate — scroll mid if needed
  await page.evaluate(() => window.scrollTo(0, 180));
  await page.waitForTimeout(300);
  await shot(page, "04-verified-action-donation.png");

  // --- 05 Donation NFT (donor hub) ---
  await softConnect(page, "foodsort-contrib-6146.testnet");
  await page.goto(APP + "/donor", { waitUntil: "domcontentloaded", timeout: 60000 });
  await waitSettled(page);
  await ensureTestnetBadge(page);
  await page.getByText(/foodsort-donation/i).first().waitFor({ state: "visible", timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(600);
  await shot(page, "05-donation-nft.png");

  // --- 06 Public verification ---
  await page.goto(APP + "/verify/foodsort-donation-1", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await waitSettled(page);
  await ensureTestnetBadge(page);
  await page
    .getByText(/contributor|donor|owner|HELD_IN_TREASURY|foodsort-donation-1/i)
    .first()
    .waitFor({ state: "visible", timeout: 30000 })
    .catch(() => {});
  await page.evaluate(() => window.scrollTo(0, 120));
  await page.waitForTimeout(500);
  await shot(page, "06-public-verification.png");

  await browser.close();
  console.log("\nAll screenshots written to", OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
