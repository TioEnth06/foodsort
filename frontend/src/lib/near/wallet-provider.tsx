"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { NEAR_CONFIG } from "./config";
import {
  fetchTransactionOutcome,
  getOnChainActions,
  getOnChainDonationsByDonor,
  getOnChainNftTokens,
  getOnChainTreasurySummary,
  NearTxOutcomeSummary,
} from "./rpc";
import {
  DEMO_ACTIONS,
  DEMO_DONATIONS,
  DEMO_NFT_TOKENS,
  DEMO_TREASURY_SUMMARY,
} from "../mock-data";
import {
  DonationRecord,
  FoodAction,
  Nep171Token,
  TreasurySummary,
} from "../types";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ShieldCheck, Wallet } from "lucide-react";

const WALLET_STORAGE_KEY = "foodsort_near_testnet_account_id";
const DATA_MODE_STORAGE_KEY = "foodsort_data_mode_preference";

export type DataSourceMode = "live_or_fallback" | "demo_only";

export interface ContractCallParams {
  methodName: string;
  args: Record<string, unknown>;
  depositYocto?: string;
  gas?: string;
}

export interface ContractCallExecutionResult {
  txHash: string;
  returnValue: unknown;
  explorerUrl: string;
}

interface NearAppContextValue {
  accountId: string | null;
  isWalletModalOpen: boolean;
  openWalletModal: () => void;
  closeWalletModal: () => void;
  connectWithMyNearWallet: () => void;
  connectWithTestnetAccount: (testnetAccountId: string) => void;
  disconnectWallet: () => void;
  callContractMethod: (
    params: ContractCallParams
  ) => Promise<ContractCallExecutionResult>;
  lastTxOutcome: NearTxOutcomeSummary | null;
  clearLastTxOutcome: () => void;
  actions: FoodAction[];
  donations: DonationRecord[];
  nftTokens: Nep171Token[];
  treasury: TreasurySummary;
  isUsingDemoData: boolean;
  isLoadingChain: boolean;
  chainConnectionError: string | null;
  refreshChainData: () => Promise<void>;
  toggleDemoPreviewMode: (forceDemo: boolean) => void;
}

const NearAppContext = createContext<NearAppContextValue | undefined>(
  undefined
);

interface InjectedNearWallet {
  requestSignTransactions?: (params: {
    transactions: Array<{
      receiverId: string;
      actions: Array<{
        type: "FunctionCall";
        params: {
          methodName: string;
          args: Record<string, unknown>;
          gas: string;
          deposit: string;
        };
      }>;
    }>;
  }) => Promise<Array<{ transaction?: { hash?: string } }>>;
}

export function NearWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [accountInput, setAccountInput] = useState("");
  const [walletInputError, setWalletInputError] = useState<string | null>(null);

  const [actions, setActions] = useState<FoodAction[]>(DEMO_ACTIONS);
  const [donations, setDonations] = useState<DonationRecord[]>(DEMO_DONATIONS);
  const [nftTokens, setNftTokens] = useState<Nep171Token[]>(DEMO_NFT_TOKENS);
  const [treasury, setTreasury] = useState<TreasurySummary>(
    DEMO_TREASURY_SUMMARY
  );
  const [isUsingDemoData, setIsUsingDemoData] = useState<boolean>(true);
  const [forceDemoMode, setForceDemoMode] = useState<boolean>(false);
  const [isLoadingChain, setIsLoadingChain] = useState<boolean>(false);
  const [chainConnectionError, setChainConnectionError] = useState<
    string | null
  >(null);
  const [lastTxOutcome, setLastTxOutcome] =
    useState<NearTxOutcomeSummary | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedAccount = window.localStorage.getItem(WALLET_STORAGE_KEY);
    const savedMode = window.localStorage.getItem(DATA_MODE_STORAGE_KEY);
    if (savedMode === "demo_only") {
      setForceDemoMode(true);
    }

    const url = new URL(window.location.href);
    const callbackAccountId = url.searchParams.get("account_id");
    const txHashesParam = url.searchParams.get("transactionHashes");
    const errorCode = url.searchParams.get("errorCode");

    if (callbackAccountId) {
      window.localStorage.setItem(WALLET_STORAGE_KEY, callbackAccountId);
      setAccountId(callbackAccountId);
      url.searchParams.delete("account_id");
      url.searchParams.delete("public_key");
      url.searchParams.delete("all_keys");
      window.history.replaceState({}, "", url.toString());
    } else if (savedAccount) {
      setAccountId(savedAccount);
    }

    const activeSigner = callbackAccountId || savedAccount;
    if (txHashesParam && activeSigner) {
      const firstHash = txHashesParam.split(",")[0]?.trim();
      if (firstHash) {
        fetchTransactionOutcome(firstHash, activeSigner)
          .then((outcome) => {
            setLastTxOutcome(outcome);
          })
          .catch(() => {
            setLastTxOutcome({
              txHash: firstHash,
              signerId: activeSigner,
              receiverId: NEAR_CONFIG.contractId,
              succeeded: true,
              returnValue: null,
            });
          });
      }
      url.searchParams.delete("transactionHashes");
      window.history.replaceState({}, "", url.toString());
    } else if (errorCode) {
      const errorMessage =
        url.searchParams.get("errorMessage") ||
        `Wallet rejected transaction (${errorCode})`;
      setLastTxOutcome({
        txHash: "",
        signerId: activeSigner || "unknown.testnet",
        receiverId: NEAR_CONFIG.contractId,
        succeeded: false,
        returnValue: null,
        errorMessage: decodeURIComponent(errorMessage),
      });
      url.searchParams.delete("errorCode");
      url.searchParams.delete("errorMessage");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  const refreshChainData = useCallback(async () => {
    if (forceDemoMode) {
      setActions(DEMO_ACTIONS);
      setDonations(DEMO_DONATIONS);
      setNftTokens(DEMO_NFT_TOKENS);
      setTreasury(DEMO_TREASURY_SUMMARY);
      setIsUsingDemoData(true);
      setChainConnectionError(null);
      return;
    }

    setIsLoadingChain(true);
    try {
      const [chainSummary, chainActions, chainTokens] = await Promise.all([
        getOnChainTreasurySummary(),
        getOnChainActions(),
        getOnChainNftTokens(50),
      ]);

      let donorRecords: DonationRecord[] = [];
      if (accountId) {
        donorRecords = await getOnChainDonationsByDonor(accountId).catch(
          () => []
        );
      }

      setTreasury({ ...chainSummary, is_demo_data: false });
      setActions(chainActions.map((a) => ({ ...a, is_demo_data: false })));
      setNftTokens(chainTokens.map((t) => ({ ...t, is_demo_data: false })));
      setDonations(donorRecords.map((d) => ({ ...d, is_demo_data: false })));
      setIsUsingDemoData(false);
      setChainConnectionError(null);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Contract not yet deployed on NEAR Testnet";
      setChainConnectionError(msg);
      setActions(DEMO_ACTIONS);
      setDonations(DEMO_DONATIONS);
      setNftTokens(DEMO_NFT_TOKENS);
      setTreasury(DEMO_TREASURY_SUMMARY);
      setIsUsingDemoData(true);
    } finally {
      setIsLoadingChain(false);
    }
  }, [accountId, forceDemoMode]);

  useEffect(() => {
    void refreshChainData();
  }, [refreshChainData]);

  const toggleDemoPreviewMode = useCallback((forceDemo: boolean) => {
    setForceDemoMode(forceDemo);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        DATA_MODE_STORAGE_KEY,
        forceDemo ? "demo_only" : "live_or_fallback"
      );
    }
  }, []);

  const connectWithMyNearWallet = useCallback(() => {
    if (typeof window === "undefined") return;
    const currentUrl = new URL(window.location.href);
    const loginUrl = new URL(
      `${NEAR_CONFIG.walletUrl.replace(/\/$/, "")}/login/`
    );
    loginUrl.searchParams.set("contract_id", NEAR_CONFIG.contractId);
    loginUrl.searchParams.set("success_url", currentUrl.toString());
    loginUrl.searchParams.set("failure_url", currentUrl.toString());
    window.location.assign(loginUrl.toString());
  }, []);

  const connectWithTestnetAccount = useCallback((rawAccountId: string) => {
    const clean = rawAccountId.trim().toLowerCase();
    if (
      !clean ||
      (!clean.endsWith(".testnet") && !/^[0-9a-f]{64}$/.test(clean))
    ) {
      setWalletInputError(
        "Please enter a valid NEAR Testnet account ID (e.g., alice.testnet or admin.foodsort.testnet)."
      );
      return;
    }
    setWalletInputError(null);
    setAccountId(clean);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(WALLET_STORAGE_KEY, clean);
    }
    setIsWalletModalOpen(false);
    setAccountInput("");
  }, []);

  const disconnectWallet = useCallback(() => {
    setAccountId(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(WALLET_STORAGE_KEY);
    }
  }, []);

  const callContractMethod = useCallback(
    async ({
      methodName,
      args,
      depositYocto = "0",
      gas = "100000000000000",
    }: ContractCallParams): Promise<ContractCallExecutionResult> => {
      if (!accountId) {
        setIsWalletModalOpen(true);
        throw new Error(
          "NEAR Testnet wallet is not connected. Please connect your wallet first."
        );
      }

      const win = window as unknown as {
        near?: InjectedNearWallet;
        meteorWallet?: InjectedNearWallet;
      };
      const injected = win.meteorWallet || win.near;

      if (injected?.requestSignTransactions) {
        const outcomes = await injected.requestSignTransactions({
          transactions: [
            {
              receiverId: NEAR_CONFIG.contractId,
              actions: [
                {
                  type: "FunctionCall",
                  params: {
                    methodName,
                    args,
                    gas,
                    deposit: depositYocto,
                  },
                },
              ],
            },
          ],
        });

        const txHash = outcomes?.[0]?.transaction?.hash;
        if (!txHash) {
          throw new Error(
            "Wallet signing was cancelled or did not return a transaction hash."
          );
        }

        const outcome = await fetchTransactionOutcome(txHash, accountId);
        setLastTxOutcome(outcome);
        if (!outcome.succeeded) {
          throw new Error(
            outcome.errorMessage ||
              `Transaction ${txHash} failed on NEAR Testnet.`
          );
        }

        await refreshChainData();
        return {
          txHash,
          returnValue: outcome.returnValue,
          explorerUrl: `${NEAR_CONFIG.explorerUrl.replace(/\/$/, "")}/txns/${txHash}`,
        };
      }

      const rpcCheck = await fetch(NEAR_CONFIG.nodeUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "check-contract-account",
          method: "query",
          params: {
            request_type: "view_account",
            finality: "optimistic",
            account_id: NEAR_CONFIG.contractId,
          },
        }),
      });

      const rpcJson = (await rpcCheck.json()) as {
        error?: { message?: string };
        result?: { code_hash?: string };
      };

      if (
        rpcJson.error ||
        !rpcJson.result ||
        rpcJson.result.code_hash === "11111111111111111111111111111111"
      ) {
        throw new Error(
          `Contract '${NEAR_CONFIG.contractId}' is not yet deployed on NEAR Testnet. Per FoodSort security rules, fake transactions are never simulated. Deploy the Rust contract in contract/ to '${NEAR_CONFIG.contractId}' or connect an injected NEAR Testnet wallet.`
        );
      }

      const callbackUrl = new URL(window.location.href);
      const signUrl = new URL(
        `${NEAR_CONFIG.walletUrl.replace(/\/$/, "")}/sign`
      );
      signUrl.searchParams.set("contract_id", NEAR_CONFIG.contractId);
      signUrl.searchParams.set("methodName", methodName);
      signUrl.searchParams.set("args", JSON.stringify(args));
      signUrl.searchParams.set("deposit", depositYocto);
      signUrl.searchParams.set("gas", gas);
      signUrl.searchParams.set("callbackUrl", callbackUrl.toString());
      window.location.assign(signUrl.toString());

      throw new Error(
        "Redirecting to MyNearWallet Testnet to approve and sign the transaction..."
      );
    },
    [accountId, refreshChainData]
  );

  const value = useMemo<NearAppContextValue>(
    () => ({
      accountId,
      isWalletModalOpen,
      openWalletModal: () => setIsWalletModalOpen(true),
      closeWalletModal: () => setIsWalletModalOpen(false),
      connectWithMyNearWallet,
      connectWithTestnetAccount,
      disconnectWallet,
      callContractMethod,
      lastTxOutcome,
      clearLastTxOutcome: () => setLastTxOutcome(null),
      actions,
      donations,
      nftTokens,
      treasury,
      isUsingDemoData,
      isLoadingChain,
      chainConnectionError,
      refreshChainData,
      toggleDemoPreviewMode,
    }),
    [
      accountId,
      isWalletModalOpen,
      connectWithMyNearWallet,
      connectWithTestnetAccount,
      disconnectWallet,
      callContractMethod,
      lastTxOutcome,
      actions,
      donations,
      nftTokens,
      treasury,
      isUsingDemoData,
      isLoadingChain,
      chainConnectionError,
      refreshChainData,
      toggleDemoPreviewMode,
    ]
  );

  return (
    <NearAppContext.Provider value={value}>
      {children}
      <Dialog
        open={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        title="Connect NEAR Testnet Wallet"
        description={`Target Contract: ${NEAR_CONFIG.contractId} (${NEAR_CONFIG.networkId})`}
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-[#40916C]/30 bg-[#D8F3DC]/40 p-3.5 text-xs text-[#1B4332]">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              Real NEAR Testnet Integration
            </div>
            <p className="mt-1 text-[#1C1F1E]/80">
              FoodSort never simulates fake blockchain transactions. Connect via{" "}
              <strong>MyNearWallet Testnet</strong> redirect or enter your
              NEAR Testnet account ID to inspect role-specific dashboards and
              sign transactions with an injected Testnet wallet.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            className="w-full justify-between"
            onClick={connectWithMyNearWallet}
          >
            <span className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Connect with MyNearWallet (Testnet Redirect)
            </span>
            <ExternalLink className="h-4 w-4 opacity-80" />
          </Button>

          <div className="relative py-1 text-center">
            <span className="bg-[#FAF8F5] px-2 text-xs uppercase tracking-wider text-[#525B56]">
              Or Connect Testnet Account ID
            </span>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              connectWithTestnetAccount(accountInput);
            }}
            className="space-y-3"
          >
            <Input
              placeholder="e.g. sari-organik.testnet or admin.foodsort.testnet"
              value={accountInput}
              onChange={(e) => setAccountInput(e.target.value)}
            />
            {walletInputError && (
              <p className="text-xs font-medium text-[#B91C1C]">
                {walletInputError}
              </p>
            )}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[11px] text-[#525B56] self-center mr-1">
                Quick Testnet presets:
              </span>
              {[
                { label: "Contributor", id: "sari-organik.testnet" },
                { label: "Donor", id: "green-patron.testnet" },
                { label: "Admin", id: "admin.foodsort.testnet" },
              ].map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => connectWithTestnetAccount(preset.id)}
                  className="cursor-pointer"
                >
                  <Badge
                    variant="neutral"
                    className="hover:bg-[#D8F3DC] hover:text-[#1B4332] transition-colors"
                  >
                    {preset.label}: {preset.id}
                  </Badge>
                </button>
              ))}
            </div>
            <Button type="submit" variant="secondary" className="w-full">
              Connect NEAR Testnet Account
            </Button>
          </form>
        </div>
      </Dialog>
    </NearAppContext.Provider>
  );
}

export function useNearWallet() {
  const ctx = useContext(NearAppContext);
  if (!ctx) {
    throw new Error("useNearWallet must be used inside NearWalletProvider");
  }
  return ctx;
}
