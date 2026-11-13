export const NEAR_CONFIG = {
  networkId: process.env.NEXT_PUBLIC_NEAR_NETWORK || "testnet",
  contractId: process.env.NEXT_PUBLIC_CONTRACT_ID || "foodsort.testnet",
  nodeUrl:
    process.env.NEXT_PUBLIC_NEAR_RPC_URL || "https://rpc.testnet.near.org",
  walletUrl:
    process.env.NEXT_PUBLIC_NEAR_WALLET_URL ||
    "https://testnet.mynearwallet.com",
  explorerUrl:
    process.env.NEXT_PUBLIC_NEAR_EXPLORER_URL ||
    "https://testnet.nearblocks.io",
};

export function getExplorerTxUrl(txHash: string): string {
  return `${NEAR_CONFIG.explorerUrl.replace(/\/$/, "")}/txns/${txHash}`;
}

export function getExplorerAccountUrl(accountId: string): string {
  return `${NEAR_CONFIG.explorerUrl.replace(/\/$/, "")}/address/${accountId}`;
}
