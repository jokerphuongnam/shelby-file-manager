import { AccountAddress } from "@aptos-labs/ts-sdk";
import type { InputGenerateTransactionPayloadData } from "@aptos-labs/ts-sdk";
import {
  generateCommitments,
  createDefaultErasureCodingProvider,
  ShelbyBlobClient,
  ERASURE_CODE_PARAMS,
  ErasureCodingScheme,
} from "@shelby-protocol/sdk/node";
import { getShelbyClient } from "../integrations/shelbyClient";
import { randomUUID } from "crypto";

export interface BlobInfo {
  name: string;
  size: number;
  createdAt?: string;
  [key: string]: unknown;
}

export interface PrepareResult {
  uploadId: string;
  blobName: string;
  payload: InputGenerateTransactionPayloadData;
}

interface PendingUpload {
  blobData: Uint8Array;
  blobName: string;
  expiresAt: number;
}

const pendingUploads = new Map<string, PendingUpload>();

setInterval(() => {
  const now = Date.now();
  for (const [id, u] of pendingUploads) {
    if (u.expiresAt < now) pendingUploads.delete(id);
  }
}, 60_000);

export async function prepareUpload(
  fileName: string,
  buffer: Buffer,
  walletAddress: string
): Promise<PrepareResult> {
  const blobName = `uploads/${Date.now()}-${fileName}`;
  const expirationMicros = (Date.now() + 30 * 24 * 60 * 60 * 1000) * 1000;

  const provider = await createDefaultErasureCodingProvider();
  const commitments = await generateCommitments(provider, new Uint8Array(buffer));

  const encoding =
    ERASURE_CODE_PARAMS[ErasureCodingScheme.ClayCode_16Total_10Data_13Helper].enumIndex;

  const account = AccountAddress.fromString(walletAddress);

  const payload = ShelbyBlobClient.createRegisterBlobPayload({
    account,
    blobName,
    blobSize: buffer.length,
    blobMerkleRoot: commitments.blob_merkle_root,
    expirationMicros,
    numChunksets: commitments.chunkset_commitments.length,
    encoding,
  });

  const uploadId = randomUUID();

  pendingUploads.set(uploadId, {
    blobData: new Uint8Array(buffer),
    blobName,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  return { uploadId, blobName, payload };
}

export async function confirmUpload(
  uploadId: string,
  walletAddress: string
): Promise<{ name: string }> {
  const pending = pendingUploads.get(uploadId);
  if (!pending) {
    throw new Error("Upload session not found or expired.");
  }
  pendingUploads.delete(uploadId);

  const client = getShelbyClient();
  await client.rpc.putBlob({
    account: AccountAddress.fromString(walletAddress),
    blobName: pending.blobName,
    blobData: pending.blobData,
  });

  return { name: pending.blobName };
}

export async function listFiles(walletAddress: string): Promise<BlobInfo[]> {
  const client = getShelbyClient();
  const blobs = await client.coordination.getAccountBlobs({
    account: AccountAddress.fromString(walletAddress),
  });

  return blobs.map((blob) => ({
    name: blob.name,
    size: blob.size,
    createdAt: String(blob.creationMicros),
  }));
}

export async function downloadFile(
  blobName: string,
  walletAddress: string
): Promise<{ buffer: Buffer; contentType: string; fileName: string }> {
  const client = getShelbyClient();

  const blob = await client.download({
    account: AccountAddress.fromString(walletAddress),
    blobName,
  });

  const reader = blob.readable.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  return {
    buffer: Buffer.concat(chunks),
    contentType: "application/octet-stream",
    fileName: blobName.split("/").pop() ?? blobName,
  };
}
