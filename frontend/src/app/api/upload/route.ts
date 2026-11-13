import { NextRequest, NextResponse } from "next/server";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
  try {
    const pinataJwt = process.env.PINATA_JWT?.trim();
    if (!pinataJwt) {
      return NextResponse.json(
        {
          error:
            "PINATA_JWT is not configured on the server. Add PINATA_JWT in the Vercel/project environment, then redeploy.",
          code: "PINATA_JWT_MISSING",
        },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        {
          error: "No evidence image file was provided in multipart form-data.",
          code: "MISSING_FILE",
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error: `Unsupported file type '${file.type}'. Only JPEG, PNG, and WEBP evidence images are accepted.`,
          code: "INVALID_MIME_TYPE",
        },
        { status: 400 }
      );
    }

    if (file.size <= 0 || file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: "Evidence image must be between 1 byte and 10 MB.",
          code: "INVALID_FILE_SIZE",
        },
        { status: 400 }
      );
    }

    const pinataForm = new FormData();
    pinataForm.append("file", file, file.name);
    pinataForm.append(
      "pinataMetadata",
      JSON.stringify({
        name: `foodsort-evidence-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`,
      })
    );
    pinataForm.append(
      "pinataOptions",
      JSON.stringify({
        cidVersion: 1,
      })
    );

    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${pinataJwt}`,
        },
        body: pinataForm,
      }
    );

    if (!response.ok) {
      const errBody = await response.text().catch(() => "Unknown Pinata error");
      return NextResponse.json(
        {
          error: `Pinata IPFS upload failed (HTTP ${response.status}): ${errBody}`,
          code: "PINATA_UPLOAD_FAILED",
        },
        { status: 502 }
      );
    }

    const result = (await response.json()) as { IpfsHash?: string };
    const cid = result.IpfsHash;

    if (!cid) {
      return NextResponse.json(
        {
          error: "Pinata response did not contain an IpfsHash CID.",
          code: "INVALID_PINATA_RESPONSE",
        },
        { status: 502 }
      );
    }

    const gatewayBase = (
      process.env.NEXT_PUBLIC_IPFS_GATEWAY ||
      "https://gateway.pinata.cloud/ipfs"
    ).replace(/\/$/, "");

    return NextResponse.json({
      cid,
      ipfsUri: `ipfs://${cid}`,
      gatewayUrl: `${gatewayBase}/${cid}`,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unexpected IPFS upload error";
    return NextResponse.json(
      {
        error: message,
        code: "UPLOAD_INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
