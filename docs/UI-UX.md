# UI / UX — FoodSort

## Palette

| Token | Hex | Use |
| --- | --- | --- |
| Forest Green | `#1B4332` | Primary CTAs, nav, verified headers |
| Leaf Green | `#40916C` | Accents, secondary badges |
| Sage Mist | `#D8F3DC` | Soft fills / borders |
| Warm Cream | `#FAF8F5` | Page canvas |
| Charcoal | `#1C1F1E` | Body / headings |
| Amber | `#D97706` | Pending / needs review |
| Crimson | `#B91C1C` | Rejected / errors |

## Global chrome

1. **Nav** — FoodSort + **NEAR testnet** badge; links to Overview, Explore, Contribute, Donor, Admin, Verify; wallet connect/disconnect.
2. **Data source** — Live chain is default. If RPC fails or example preview is forced, show a clear **Example data** badge. Never fake write txs.
3. **Treasury** — Every treasury surface states funds are **held** (`HELD_IN_TREASURY`), not distributed.

## Pages

| Route | Content |
| --- | --- |
| `/` | Brand hero, live treasury, provenance loop, featured verified actions |
| `/actions` | Status + category filters |
| `/actions/[id]` | Evidence, attribution, donate panel (storage vs net) |
| `/contribute` | Upload → `submit_action` |
| `/donor` | Owned certificates + ledger for connected wallet |
| `/admin` | Pending queue, AI panel, confirmation modal, audit log |
| `/verify` | Walletless lookup + 3-party provenance gallery |

Copy tone: human, specific, no metadata-slop labels in the UI. Technical field names stay in docs / explorer links.
