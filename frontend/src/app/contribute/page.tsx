"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useNearWallet } from "@/lib/near/wallet-provider";
import { getExplorerTxUrl, NEAR_CONFIG } from "@/lib/near/config";
import { FoodCategory } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  FileImage,
  Loader2,
  UploadCloud,
  Wallet,
} from "lucide-react";

const CATEGORY_OPTIONS: Array<{
  value: FoodCategory;
  title: string;
  subtitle: string;
}> = [
  {
    value: "COMPOST",
    title: "COMPOST — Organic Waste Diversion",
    subtitle:
      "Fruit/vegetable peels, coffee grounds, and clean organic scraps sorted for composting.",
  },
  {
    value: "FOOD_RESCUE",
    title: "FOOD_RESCUE — Edible Surplus Recovery",
    subtitle:
      "Unspoiled surplus produce, bread, or meals sorted and portioned for redistribution.",
  },
  {
    value: "RESIDUAL",
    title: "RESIDUAL — Spoilage & Contaminant Separation",
    subtitle:
      "Contaminated liners, non-compostables, and spoiled items separated from organic streams.",
  },
];

const ACTION_TYPE_PRESETS: Record<FoodCategory, string[]> = {
  COMPOST: [
    "Household Organic Separation",
    "Community Market Green Waste Sorting",
    "Commercial Kitchen Compost Prep",
  ],
  FOOD_RESCUE: [
    "Bakery & Produce Surplus Recovery",
    "Night Market Surplus Redistribution",
    "Catering Unopened Batch Recovery",
  ],
  RESIDUAL: [
    "Contaminated Batch & Spoilage Separation",
    "Mixed Bin De-contamination Audit",
    "Non-Compostable Packaging Separation",
  ],
};

export default function ContributePage() {
  const { accountId, openWalletModal, callContractMethod } = useNearWallet();

  const [foodCategory, setFoodCategory] = useState<FoodCategory>("COMPOST");
  const [actionType, setActionType] = useState(
    "Household Organic Separation"
  );
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [uploadedIpfsUri, setUploadedIpfsUri] = useState<string | null>(null);
  const [uploadedGatewayUrl, setUploadedGatewayUrl] = useState<string | null>(
    null
  );

  const [stepStatus, setStepStatus] = useState<
    "idle" | "uploading_ipfs" | "signing_tx" | "submitted"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<{
    actionId: number | string;
    txHash: string;
    ipfsUri: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setUploadedIpfsUri(null);
    setUploadedGatewayUrl(null);
    setErrorMessage(null);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmissionResult(null);

    if (!accountId) {
      openWalletModal();
      return;
    }

    if (!actionType.trim()) {
      setErrorMessage("Please select or enter an action type.");
      return;
    }

    if (description.trim().length < 15) {
      setErrorMessage(
        "Please provide a clear description of at least 15 characters."
      );
      return;
    }

    if (!selectedFile && !uploadedIpfsUri) {
      setErrorMessage(
        "Please select an evidence photograph (JPEG, PNG, or WEBP) to upload to Pinata IPFS."
      );
      return;
    }

    try {
      let finalIpfsUri = uploadedIpfsUri;

      if (!finalIpfsUri && selectedFile) {
        setStepStatus("uploading_ipfs");
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const uploadJson = (await uploadRes.json()) as {
          ipfsUri?: string;
          gatewayUrl?: string;
          error?: string;
        };

        if (!uploadRes.ok || !uploadJson.ipfsUri) {
          throw new Error(
            uploadJson.error ||
              `IPFS upload failed with status ${uploadRes.status}`
          );
        }

        finalIpfsUri = uploadJson.ipfsUri;
        setUploadedIpfsUri(uploadJson.ipfsUri);
        setUploadedGatewayUrl(uploadJson.gatewayUrl || null);
      }

      if (!finalIpfsUri) {
        throw new Error("Evidence IPFS URI is missing.");
      }

      setStepStatus("signing_tx");
      const txOutcome = await callContractMethod({
        methodName: "submit_action",
        args: {
          food_category: foodCategory,
          action_type: actionType.trim(),
          description: description.trim(),
          evidence_uri: finalIpfsUri,
        },
        depositYocto: "0",
        gas: "100000000000000",
      });

      setStepStatus("submitted");
      setSubmissionResult({
        actionId:
          typeof txOutcome.returnValue === "number" ||
          typeof txOutcome.returnValue === "string"
            ? txOutcome.returnValue
            : "Pending Indexing",
        txHash: txOutcome.txHash,
        ipfsUri: finalIpfsUri,
      });
    } catch (err) {
      setStepStatus("idle");
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Submission failed due to an unexpected error."
      );
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 space-y-8">
      <div className="space-y-2 border-b border-[#1B4332]/15 pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-[#40916C]">
          Contributor Portal
        </span>
        <h1 className="text-3xl font-extrabold text-[#1B4332]">
          Submit a Food-Sorting Action
        </h1>
        <p className="text-sm text-[#525B56]">
          Upload photographic evidence to IPFS via Pinata and register your
          sorting activity on the NEAR Testnet smart contract (
          <code className="font-mono">{NEAR_CONFIG.contractId}</code>). Your
          NEAR account ID will be permanently recorded as the original
          contributor.
        </p>
      </div>

      {!accountId && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-sm font-bold text-amber-950 flex items-center gap-2">
              <Wallet className="h-4 w-4 text-amber-700" />
              NEAR Testnet Wallet Required
            </div>
            <p className="text-xs text-amber-900">
              Connect your NEAR Testnet wallet so the contract can record{" "}
              <code className="font-mono">env::predecessor_account_id()</code>{" "}
              as the action contributor.
            </p>
          </div>
          <Button type="button" variant="primary" onClick={openWalletModal}>
            <Wallet className="h-4 w-4" />
            Connect NEAR Testnet Wallet
          </Button>
        </div>
      )}

      {submissionResult ? (
        <Card className="border-[#40916C] bg-[#D8F3DC]/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-[#1B4332]" />
              <CardTitle className="text-xl text-[#1B4332]">
                Action Submitted to NEAR Testnet!
              </CardTitle>
            </div>
            <CardDescription>
              Your food-sorting action is now on-chain with{" "}
              <strong>Pending Verification</strong> status.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="rounded-xl bg-white p-4 border border-[#1B4332]/15 space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-[#525B56]">Assigned Action ID:</span>
                <strong className="text-[#1B4332]">
                  #{String(submissionResult.actionId)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#525B56]">Contributor Account:</span>
                <strong>{accountId}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#525B56]">Category:</span>
                <strong>{foodCategory}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#525B56]">Verification Status:</span>
                <Badge variant="pending">Pending Admin Verification</Badge>
              </div>
              <div className="pt-1 border-t border-[#1B4332]/10 break-all">
                <span className="text-[#525B56]">Evidence IPFS URI:</span>{" "}
                {submissionResult.ipfsUri}
              </div>
              <div className="break-all">
                <span className="text-[#525B56]">Transaction Hash:</span>{" "}
                <a
                  href={getExplorerTxUrl(submissionResult.txHash)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#40916C] underline inline-flex items-center gap-1"
                >
                  {submissionResult.txHash}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/actions">
                <Button variant="primary">View Actions Registry</Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  setSubmissionResult(null);
                  setDescription("");
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setUploadedIpfsUri(null);
                  setStepStatus("idle");
                }}
              >
                Submit Another Action
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Action Details & Off-Chain IPFS Evidence</CardTitle>
            <CardDescription>
              Evidence images are pinned off-chain via Pinata IPFS (`POST
              /api/upload`) before calling `submit_action` on NEAR Testnet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1B4332]">
                  1. Select Standardized Food Category
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {CATEGORY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setFoodCategory(opt.value);
                        setActionType(ACTION_TYPE_PRESETS[opt.value][0]);
                      }}
                      className={`rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                        foodCategory === opt.value
                          ? "border-[#1B4332] bg-[#D8F3DC]/50 ring-2 ring-[#40916C]/40"
                          : "border-[#1B4332]/15 bg-[#FAF8F5] hover:bg-white"
                      }`}
                    >
                      <Badge variant="category">{opt.value}</Badge>
                      <div className="mt-2 text-xs font-bold text-[#1C1F1E]">
                        {opt.title}
                      </div>
                      <p className="mt-1 text-[11px] text-[#525B56] leading-relaxed">
                        {opt.subtitle}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1B4332]">
                  2. Action Type
                </label>
                <div className="flex flex-wrap gap-1.5 pb-1">
                  {ACTION_TYPE_PRESETS[foodCategory].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setActionType(preset)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                        actionType === preset
                          ? "bg-[#1B4332] text-[#FAF8F5]"
                          : "bg-[#F3EFE6] text-[#1C1F1E] hover:bg-[#D8F3DC]"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <Input
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  placeholder="Specify sorting action type..."
                  maxLength={120}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1B4332]">
                  3. Detailed Activity Description
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what food materials were sorted, approximate weight/volume, how contaminants were separated, and where the sorted batch was placed..."
                  maxLength={2000}
                />
                <div className="flex justify-between text-[11px] text-[#525B56]">
                  <span>Minimum 15 characters required by smart contract</span>
                  <span>{description.length} / 2000</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1B4332]">
                  4. Photographic Evidence (Pinata IPFS Off-Chain Storage)
                </label>
                <div className="rounded-xl border-2 border-dashed border-[#1B4332]/25 bg-[#FAF8F5] p-6 text-center space-y-3">
                  <FileImage className="mx-auto h-8 w-8 text-[#40916C]" />
                  <div className="text-xs text-[#525B56]">
                    Select a clear photo showing the sorted food containers and
                    batch context (JPEG, PNG, or WEBP, max 10 MB).
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="mx-auto block text-xs text-[#1C1F1E] file:mr-3 file:rounded-lg file:border-0 file:bg-[#1B4332] file:px-3.5 file:py-2 file:text-xs file:font-semibold file:text-[#FAF8F5] hover:file:bg-[#122E22] cursor-pointer"
                  />

                  {previewUrl && (
                    <div className="pt-3 space-y-2">
                      <img
                        src={previewUrl}
                        alt="Selected evidence preview"
                        className="mx-auto max-h-56 rounded-xl border border-[#1B4332]/20 object-cover"
                      />
                      {uploadedIpfsUri && (
                        <div className="text-xs font-mono text-[#1B4332]">
                          Pinned to IPFS:{" "}
                          <a
                            href={uploadedGatewayUrl || "#"}
                            target="_blank"
                            rel="noreferrer"
                            className="underline"
                          >
                            {uploadedIpfsUri}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {errorMessage && (
                <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-xs text-red-900 flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 text-red-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold">Submission Blocked</div>
                    <p>{errorMessage}</p>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={
                  stepStatus === "uploading_ipfs" || stepStatus === "signing_tx"
                }
              >
                {stepStatus === "uploading_ipfs" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Step 1/2: Uploading Evidence Image to Pinata IPFS...
                  </>
                ) : stepStatus === "signing_tx" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Step 2/2: Signing submit_action() on NEAR Testnet...
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-4 w-4" />
                    Upload evidence and submit
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
