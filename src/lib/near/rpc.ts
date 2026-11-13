import { NEAR_CONFIG } from "./config";
import {
  ActionStatus,
  DonationRecord,
  FoodAction,
  Nep171Token,
  NftVerificationProof,
  TreasurySummary,
} from "../types";

interface JsonRpcResponse<T> {
  jsonrpc: string;
  id: string;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

interface ViewFunctionQueryResult {
  result: number[];
  logs: string[];
  block_height: number;
  block_hash: string;
}

export async function callNearView<T>(
  methodName: string,
  args: Record<string, unknown> = {},
  contractId = NEAR_CONFIG.contractId
): Promise<T> {
  const argsBase64 =
    typeof window !== "undefined"
      ? window.btoa(unescape(encodeURIComponent(JSON.stringify(args))))
      : Buffer.from(JSON.stringify(args), "utf8").toString("base64");

  const response = await fetch(NEAR_CONFIG.nodeUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: `foodsort-view-${methodName}-${Date.now()}`,
      method: "query",
      params: {
        request_type: "call_function",
        finality: "optimistic",
        account_id: contractId,
        method_name: methodName,
        args_base64: argsBase64,
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`NEAR RPC HTTP ${response.status} when calling ${methodName}`);
  }

  const payload = (await response.json()) as JsonRpcResponse<ViewFunctionQueryResult>;

  if (payload.error) {
    throw new Error(
      `NEAR RPC error on ${methodName}: ${payload.error.message}`
    );
  }

  if (!payload.result || !Array.isArray(payload.result.result)) {
    throw new Error(`Empty result array returned by ${methodName}`);
  }

  const decodedText = new TextDecoder().decode(
    new Uint8Array(payload.result.result)
  );
  return JSON.parse(decodedText) as T;
}

export interface NearTxOutcomeSummary {
  txHash: string;
  signerId: string;
  receiverId: string;
  succeeded: boolean;
  returnValue: unknown;
  errorMessage?: string;
}

export async function fetchTransactionOutcome(
  txHash: string,
  senderAccountId: string
): Promise<NearTxOutcomeSummary> {
  const response = await fetch(NEAR_CONFIG.nodeUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: `foodsort-tx-${txHash}`,
      method: "tx",
      params: [txHash, senderAccountId],
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`NEAR RPC HTTP ${response.status} querying tx ${txHash}`);
  }

  const payload = (await response.json()) as JsonRpcResponse<{
    status?: {
      SuccessValue?: string;
      Failure?: unknown;
    };
    transaction?: {
      signer_id?: string;
      receiver_id?: string;
    };
  }>;

  if (payload.error || !payload.result) {
    throw new Error(
      payload.error?.message || `Transaction ${txHash} not found on NEAR Testnet`
    );
  }

  const status = payload.result.status || {};
  const signerId = payload.result.transaction?.signer_id || senderAccountId;
  const receiverId =
    payload.result.transaction?.receiver_id || NEAR_CONFIG.contractId;

  if (status.Failure) {
    return {
      txHash,
      signerId,
      receiverId,
      succeeded: false,
      returnValue: null,
      errorMessage: JSON.stringify(status.Failure),
    };
  }

  let decodedValue: unknown = null;
  if (typeof status.SuccessValue === "string" && status.SuccessValue.length > 0) {
    try {
      const rawText =
        typeof window !== "undefined"
          ? decodeURIComponent(escape(window.atob(status.SuccessValue)))
          : Buffer.from(status.SuccessValue, "base64").toString("utf8");
      decodedValue = rawText ? JSON.parse(rawText) : null;
    } catch {
      decodedValue = status.SuccessValue;
    }
  }

  return {
    txHash,
    signerId,
    receiverId,
    succeeded: true,
    returnValue: decodedValue,
  };
}

export async function getOnChainActions(
  statusFilter?: ActionStatus
): Promise<FoodAction[]> {
  return callNearView<FoodAction[]>("get_actions", {
    from_index: 0,
    limit: 100,
    ...(statusFilter ? { status_filter: statusFilter } : {}),
  });
}

export async function getOnChainActionById(
  actionId: number
): Promise<FoodAction | null> {
  return callNearView<FoodAction | null>("get_action", {
    action_id: actionId,
  });
}

export async function getOnChainTreasurySummary(): Promise<TreasurySummary> {
  return callNearView<TreasurySummary>("get_treasury_summary", {});
}

export async function getOnChainDonationsByDonor(
  donorId: string
): Promise<DonationRecord[]> {
  return callNearView<DonationRecord[]>("get_donations_by_donor", {
    donor_id: donorId,
  });
}

export async function getOnChainDonationsByAction(
  actionId: number
): Promise<DonationRecord[]> {
  return callNearView<DonationRecord[]>("get_donations_by_action", {
    action_id: actionId,
  });
}

export async function getOnChainNftTokens(
  limit = 50
): Promise<Nep171Token[]> {
  return callNearView<Nep171Token[]>("nft_tokens", {
    from_index: "0",
    limit,
  });
}

export async function getOnChainNftTokensForOwner(
  accountId: string
): Promise<Nep171Token[]> {
  return callNearView<Nep171Token[]>("nft_tokens_for_owner", {
    account_id: accountId,
    from_index: "0",
    limit: 50,
  });
}

export async function getOnChainNftVerificationProof(
  tokenId: string
): Promise<NftVerificationProof | null> {
  return callNearView<NftVerificationProof | null>(
    "get_nft_verification_proof",
    {
      token_id: tokenId,
    }
  );
}
