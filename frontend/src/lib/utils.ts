import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const YOCTO_PER_NEAR = 1_000_000_000_000_000_000_000_000n;

export function formatYoctoToNear(
  yocto: string | bigint | number,
  decimals = 4
): string {
  try {
    const raw =
      typeof yocto === "bigint" ? yocto : BigInt(String(yocto || "0"));
    const whole = raw / YOCTO_PER_NEAR;
    const remainder = raw % YOCTO_PER_NEAR;
    const fractionStr = remainder
      .toString()
      .padStart(24, "0")
      .slice(0, decimals)
      .replace(/0+$/, "");
    return fractionStr.length > 0
      ? `${whole.toString()}.${fractionStr}`
      : whole.toString();
  } catch {
    return "0";
  }
}

/**
 * Pure integer/string decimal to yoctoNEAR converter.
 * Never uses IEEE-754 floating-point math for on-chain NEAR accounting.
 */
export function parseNearToYocto(nearAmount: string | number): string {
  const clean = String(nearAmount).trim();
  if (!/^\d+(\.\d{1,24})?$/.test(clean)) {
    throw new Error("Invalid NEAR amount format");
  }
  const [wholePart, fracPart = ""] = clean.split(".");
  const paddedFrac = (fracPart + "0".repeat(24)).slice(0, 24);
  const total = BigInt(wholePart || "0") * YOCTO_PER_NEAR + BigInt(paddedFrac);
  if (total <= 0n) {
    throw new Error("NEAR amount must be greater than zero");
  }
  return total.toString();
}

export function resolveIpfsUrl(uri: string): string {
  if (!uri) return "";
  if (uri.startsWith("ipfs://")) {
    const cid = uri.replace("ipfs://", "");
    const gateway =
      process.env.NEXT_PUBLIC_IPFS_GATEWAY ||
      "https://gateway.pinata.cloud/ipfs";
    return `${gateway.replace(/\/$/, "")}/${cid}`;
  }
  return uri;
}

export function formatTimestamp(ms?: number | null): string {
  if (!ms) return "—";
  try {
    return new Date(ms).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}
