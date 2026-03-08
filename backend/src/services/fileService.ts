import { AccountAddress } from "@aptos-labs/ts-sdk";
import {
  ShelbyBlobClient,
  createDefaultErasureCodingProvider,
  defaultErasureCodingConfig,
  generateCommitments,
} from "@shelby-protocol/sdk/node";
import { getShelbyClient } from "../integrations/shelbyClient.js";

export interface BlobInfo {
  name: string;
  size: number;
  createdAt?: string;
  [key: string]: unknown;
}

export interface PrepareResult {
  blobName: string;
  registerFunction: string;
  blobMerkleRoot: string;
  expirationMicros: string;
  numChunksets: number;
  blobSize: number;
  encoding: number;
}

const pendingUploads = new Map<string, Buffer>();

export async function prepareUpload(
  fileName: string,
  buffer: Buffer,
  walletAddress: string
): Promise<PrepareResult> {
  const blobName = `${walletAddress}/uploads/${Date.now()}-${fileName}`;
  const expirationMicros = (Date.now() + 30 * 24 * 60 * 60 * 1000) * 1000;

  const provider = await createDefaultErasureCodingProvider();
  const commitments = await generateCommitments(provider, new Uint8Array(buffer));
  const ecConfig = defaultErasureCodingConfig();

  const payload = ShelbyBlobClient.createRegisterBlobPayload({
    account: AccountAddress.from(walletAddress),
    blobName,
    blobSize: commitments.raw_data_size,
    blobMerkleRoot: commitments.blob_merkle_root,
    expirationMicros,
    numChunksets: commitments.chunkset_commitments.length,
    encoding: ecConfig.enumIndex,
  });

  pendingUploads.set(blobName, buffer);

  return {
    blobName,
    registerFunction: String((payload as { function: string }).function),
    blobMerkleRoot: commitments.blob_merkle_root,
    expirationMicros: String(expirationMicros),
    numChunksets: commitments.chunkset_commitments.length,
    blobSize: commitments.raw_data_size,
    encoding: ecConfig.enumIndex,
  };
}

export async function commitUpload(
  blobName: string,
  walletAddress: string,
  txHash: string
): Promise<{ name: string }> {
  const buffer = pendingUploads.get(blobName);
  if (!buffer) throw new Error("No pending upload found for this blob.");

  const client = getShelbyClient();
  await client.coordination.aptos.waitForTransaction({ transactionHash: txHash });

  await client.rpc.putBlob({
    account: AccountAddress.from(walletAddress),
    blobData: new Uint8Array(buffer),
    blobName,
  });

  pendingUploads.delete(blobName);
  return { name: blobName };
}

export async function listFiles(walletAddress: string): Promise<BlobInfo[]> {
  const client = getShelbyClient();
  const blobs = await client.coordination.getAccountBlobs({
    account: AccountAddress.from(walletAddress),
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
    account: AccountAddress.from(walletAddress),
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
