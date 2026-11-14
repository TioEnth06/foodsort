# FoodSort hackathon screenshot report

Captured for NEAR Hackathon submission + X announcement.  
Viewport: **1440 × 900** PNG. Live contract: `foodsort-app-86051.testnet`.

## Capture method

- UI: FoodSort Next.js app (same codebase as production).
- Data: **live NEAR Testnet** via `https://rpc.testnet.fastnear.com`.
- Note: `https://foodsort.vercel.app` was CORS-blocked against the legacy `rpc.testnet.near.org` endpoint at capture time (UI fell back to Example data). Default RPC in `src/lib/near/config.ts` was updated to FastNear so production can load live chain after deploy.
- Soft-connect used for contributor/admin/donor portfolio views; **no fabricated transaction hashes**.
- Seeded real pending action `#5` via CLI (`submit_action` tx `GDd3NewNV8cfZDZ31CdC92BLuwi6yR5YPoYbLgW8w8Hh`) so AI analysis could run on a real Pending item.

## Screenshots

| File | Route | Demonstrates | Data | Limitations |
| --- | --- | --- | --- | --- |
| `01-landing-hero.png` | `/` | Brand hero, CTAs, NEAR testnet badge | Live testnet | Hero composition (not full page) |
| `02-contributor-submission.png` | `/contribute` | Category, action type, description form | Live testnet + soft-connect contributor | Evidence upload control below fold (not in frame); no signed submit in shot |
| `03-ai-verification.png` | `/admin` | Pending `#5`, real Gemini AI REJECT + confidence/risk flags, Approve/Reject human controls | Live testnet + soft-connect admin; AI from `/api/ai/verify` | Soft-connect cannot sign `verify_action`; AI advisory only |
| `04-verified-action-donation.png` | `/actions/2` | Verified FOOD_RESCUE action, contributor attribution, donate panel | Live testnet | No donation success toast (honest — no fake mint) |
| `05-donation-nft.png` | `/donor` | Owned certificates `foodsort-donation-1/2`, contributor ≠ donor ≠ owner fields, treasury held | Live testnet + soft-connect donor | Soft-connect portfolio preview |
| `06-public-verification.png` | `/verify/foodsort-donation-1` | Walletless public provenance, 3 roles, held treasury breakdown | Live testnet | Captured with Connect NEAR visible (wallet disconnected) |

## X carousel

Framed 1080×1350 cards in `docs/submission/x-carousel/` using the same six captures + FoodSort palette captions. Not product mockups — embeds real UI screenshots.

## Related paths

```text
docs/submission/screenshots/01-landing-hero.png
docs/submission/screenshots/02-contributor-submission.png
docs/submission/screenshots/03-ai-verification.png
docs/submission/screenshots/04-verified-action-donation.png
docs/submission/screenshots/05-donation-nft.png
docs/submission/screenshots/06-public-verification.png
docs/submission/screenshots/SCREENSHOT-REPORT.md
docs/submission/x-carousel/01-landing-hero.png
docs/submission/x-carousel/02-contributor-submission.png
docs/submission/x-carousel/03-ai-verification.png
docs/submission/x-carousel/04-verified-action-donation.png
docs/submission/x-carousel/05-donation-nft.png
docs/submission/x-carousel/06-public-verification.png
```

Helper scripts (optional re-run): `scripts/capture-hackathon-screenshots.mjs`, `scripts/make-x-carousel.mjs`.
