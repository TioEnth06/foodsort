#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# FoodSort NEAR Testnet Smart Contract Build, Deploy & Initialization Script
# ==============================================================================
# Usage:
#   CONTRACT_ID="foodsort.testnet" ADMIN_ID="admin.foodsort.testnet" bash scripts/deploy-near-testnet.sh
#
# Prerequisites:
#   - Rust toolchain with wasm32-unknown-unknown target:
#       rustup target add wasm32-unknown-unknown
#   - NEAR CLI (near-cli-rs or near-cli):
#       npm install -g near-cli
# ==============================================================================

CONTRACT_ID="${CONTRACT_ID:-${NEXT_PUBLIC_CONTRACT_ID:-foodsort.testnet}}"
ADMIN_ID="${ADMIN_ID:-admin.foodsort.testnet}"
MIN_DONATION_YOCTO="${MIN_DONATION_YOCTO:-100000000000000000000000}" # 0.1 NEAR default

echo "=================================================================="
echo "  FoodSort NEAR Testnet Deployment Pipeline"
echo "  Target Contract : $CONTRACT_ID"
echo "  Admin Account   : $ADMIN_ID"
echo "  Min Net Donation: $MIN_DONATION_YOCTO yoctoNEAR (0.1 NEAR)"
echo "=================================================================="

cd "$(dirname "$0")/../contract"

echo "[1/3] Building WASM binary (throttled to 2 parallel jobs for MacBook safety)..."
rustup target add wasm32-unknown-unknown >/dev/null 2>&1 || true
cargo build --target wasm32-unknown-unknown --release -j 2

WASM_PATH="target/wasm32-unknown-unknown/release/foodsort_contract.wasm"
if [ ! -f "$WASM_PATH" ]; then
  echo "ERROR: Compiled WASM file not found at $WASM_PATH"
  exit 1
fi

echo "✓ Built WASM artifact: $WASM_PATH ($(wc -c < "$WASM_PATH") bytes)"

if ! command -v near >/dev/null 2>&1; then
  echo ""
  echo "NOTE: 'near' CLI is not installed in PATH."
  echo "To deploy and initialize on NEAR Testnet, run:"
  echo "  near deploy $CONTRACT_ID $WASM_PATH --networkId testnet"
  echo "  near call $CONTRACT_ID new '{\"admin_id\": \"$ADMIN_ID\", \"min_donation_yocto\": \"$MIN_DONATION_YOCTO\"}' --accountId $CONTRACT_ID --networkId testnet"
  exit 0
fi

echo "[2/3] Deploying WASM to NEAR Testnet ($CONTRACT_ID)..."
near deploy "$CONTRACT_ID" "$WASM_PATH" --networkId testnet

echo "[3/3] Initializing FoodSortContract::new(admin_id, min_donation_yocto)..."
near call "$CONTRACT_ID" new "{\"admin_id\": \"$ADMIN_ID\", \"min_donation_yocto\": \"$MIN_DONATION_YOCTO\"}" \
  --accountId "$CONTRACT_ID" \
  --networkId testnet || echo "Contract already initialized."

echo ""
echo "=================================================================="
echo "  DEPLOYMENT COMPLETE!"
echo "  Explorer: https://testnet.nearblocks.io/address/$CONTRACT_ID"
echo "=================================================================="
