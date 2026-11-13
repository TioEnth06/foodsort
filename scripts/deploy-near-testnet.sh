#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# FoodSort NEAR Testnet Smart Contract Build, Deploy & Initialization Script
# ==============================================================================
# Usage:
#   CONTRACT_ID="foodsort-app-86051.testnet" ADMIN_ID="foodsort-app-86051.testnet" \
#     bash scripts/deploy-near-testnet.sh
#
# Prerequisites:
#   - Rust toolchain with wasm32-unknown-unknown target
#   - near-cli-rs (`npx near-cli-rs` works) + credentials in ~/.near-credentials/testnet/
# ==============================================================================

CONTRACT_ID="${CONTRACT_ID:-${NEXT_PUBLIC_CONTRACT_ID:-foodsort-app-86051.testnet}}"
ADMIN_ID="${ADMIN_ID:-$CONTRACT_ID}"
MIN_DONATION_YOCTO="${MIN_DONATION_YOCTO:-100000000000000000000000}" # 0.1 NEAR
NEAR_BIN="${NEAR_BIN:-npx --yes near-cli-rs}"

echo "=================================================================="
echo "  FoodSort NEAR Testnet Deployment Pipeline"
echo "  Target Contract : $CONTRACT_ID"
echo "  Admin Account   : $ADMIN_ID"
echo "  Min Net Donation: $MIN_DONATION_YOCTO yoctoNEAR (0.1 NEAR)"
echo "=================================================================="

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/contract"

echo "[1/3] Building WASM binary..."
rustup target add wasm32-unknown-unknown >/dev/null 2>&1 || true
cargo build --target wasm32-unknown-unknown --release -j 2

WASM_PATH="target/wasm32-unknown-unknown/release/foodsort_contract.wasm"
if [ ! -f "$WASM_PATH" ]; then
  echo "ERROR: Compiled WASM file not found at $WASM_PATH"
  exit 1
fi

echo "✓ Built WASM artifact: $WASM_PATH ($(wc -c < "$WASM_PATH") bytes)"

echo "[2/3] Deploying + initializing on NEAR Testnet ($CONTRACT_ID)..."
$NEAR_BIN contract deploy "$CONTRACT_ID" \
  use-file "$ROOT/contract/$WASM_PATH" \
  with-init-call new \
  json-args "{\"admin_id\":\"$ADMIN_ID\",\"min_donation_yocto\":\"$MIN_DONATION_YOCTO\"}" \
  prepaid-gas '100.0 Tgas' \
  attached-deposit '0 NEAR' \
  network-config testnet \
  sign-with-legacy-keychain \
  send

echo "[3/3] Reading treasury summary..."
$NEAR_BIN contract call-function as-read-only "$CONTRACT_ID" get_treasury_summary \
  json-args '{}' \
  network-config testnet \
  now

echo ""
echo "=================================================================="
echo "  DEPLOYMENT COMPLETE"
echo "  Explorer: https://testnet.nearblocks.io/address/$CONTRACT_ID"
echo "=================================================================="
