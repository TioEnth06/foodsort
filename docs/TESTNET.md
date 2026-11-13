# FoodSort on NEAR Testnet

## Live deployment

| Item | Value |
| --- | --- |
| Network | `testnet` |
| Contract / admin | `foodsort-app-86051.testnet` |
| Seeded contributor / donor | `foodsort-contrib-6146.testnet` |
| App | https://foodsort.vercel.app |
| Explorer | https://testnet.nearblocks.io/address/foodsort-app-86051.testnet |
| Deploy tx | https://testnet.nearblocks.io/txns/Ggp3QYyBLZadbKsBpa1LrwyF8oeYyPLjbHyRMYPKKpQP |

Frontend default (`NEXT_PUBLIC_CONTRACT_ID`) points at this contract. When RPC succeeds, the UI uses live on-chain data. Soft-connect presets only preview portfolio views — signing still needs MyNearWallet (Testnet).

## Seeded state

| Kind | IDs |
| --- | --- |
| Verified | `#1` COMPOST, `#2` FOOD_RESCUE, `#3` RESIDUAL |
| Rejected | `#4` |
| NFTs | `foodsort-donation-1`, `foodsort-donation-2` |
| Treasury | Net donations held; `funds_distributed_yocto = 0` |

Prefer **`/actions/2`** for a live donate + mint (verified, open for support).  
Public verify example: `/verify/foodsort-donation-1`.

## Tester checklist

1. Open https://foodsort.vercel.app (or `npm run dev` from repo root)
2. Navbar badge says **NEAR testnet** (not Example data)
3. Connect **MyNearWallet → Testnet** for real txs
4. Admin `verify_action` / `reject_action` must be signed by `foodsort-app-86051.testnet`

Full walkthrough: [DEMO-RUNBOOK.md](./DEMO-RUNBOOK.md).

## Redeploy

```bash
CONTRACT_ID=foodsort-app-86051.testnet \
ADMIN_ID=foodsort-app-86051.testnet \
bash scripts/deploy-near-testnet.sh
```

Needs Rust (`wasm32-unknown-unknown`), `near-cli-rs`, and credentials in `~/.near-credentials/testnet/`.

## Vercel / local env

```bash
NEXT_PUBLIC_CONTRACT_ID=foodsort-app-86051.testnet
NEXT_PUBLIC_NEAR_NETWORK=testnet
PINATA_JWT=…                 # upload
GEMINI_API_KEY=…             # AI advisory
AI_PROVIDER=gemini
AI_MODEL=gemini-3.6-flash    # optional override
```

Copy root `.env.example` → `.env.local` for local runs.
