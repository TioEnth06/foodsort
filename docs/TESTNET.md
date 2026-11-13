# FoodSort on NEAR Testnet

## Live deployment

| Item | Value |
| --- | --- |
| Network | `testnet` |
| Contract | `foodsort-app-86051.testnet` |
| Admin | `foodsort-app-86051.testnet` |
| Seeded contributor | `foodsort-contrib-6146.testnet` |
| Explorer | https://testnet.nearblocks.io/address/foodsort-app-86051.testnet |
| Deploy tx | https://explorer.testnet.near.org/transactions/Ggp3QYyBLZadbKsBpa1LrwyF8oeYyPLjbHyRMYPKKpQP |

Frontend default (`NEXT_PUBLIC_CONTRACT_ID`) points at this contract. When RPC succeeds, the UI uses live on-chain data (not example/demo records).

## Seeded / live demo state

- Verified: `#1` COMPOST, `#2` FOOD_RESCUE, `#3` RESIDUAL
- Rejected: `#4` (reject-path demo)
- NFTs: `foodsort-donation-1`, `foodsort-donation-2`
- Treasury holds net donations; funds distributed = 0
- Prefer `/actions/2` for a live donate+mint during demos

## How to use as a tester

1. Open https://foodsort.vercel.app (or local `npm run dev`)
2. Confirm navbar badge says **NEAR testnet** (not Example data)
3. Connect with **MyNearWallet (Testnet)** for real signed transactions
4. Soft-connect presets only preview portfolio views; signing still needs MyNearWallet
5. Admin actions (`verify_action` / `reject_action`) must be signed by `foodsort-app-86051.testnet`

## Redeploy

```bash
CONTRACT_ID=foodsort-app-86051.testnet \
ADMIN_ID=foodsort-app-86051.testnet \
bash scripts/deploy-near-testnet.sh
```

Requires Rust (`wasm32-unknown-unknown`) and `near-cli-rs`, plus credentials for the contract account in `~/.near-credentials/testnet/`.

## Vercel env

Set at least:

- `NEXT_PUBLIC_CONTRACT_ID=foodsort-app-86051.testnet`
- `NEXT_PUBLIC_NEAR_NETWORK=testnet`
- `PINATA_JWT` (upload)
- `GEMINI_API_KEY` (AI advisory)
