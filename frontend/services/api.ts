import axios from "axios";
import type { ApiResponse, BlobInfo, PrepareResult, UploadResult } from "@/types";

const APTOS_NODE_URLS: Record<string, string> = {
  testnet: "https://api.testnet.aptoslabs.com",
  mainnet: "https://api.mainnet.aptoslabs.com",
  local: "http://localhost:8080",
};

function aptosNodeUrl(): string {
  const network = process.env.NEXT_PUBLIC_APTOS_NETWORK ?? "testnet";
  return APTOS_NODE_URLS[network] ?? APTOS_NODE_URLS.testnet;
}

interface CoinStoreResource {
  data: { coin: { value: string } };
}

export async function getAptBalance(address: string): Promise<number> {
  const url = `${aptosNodeUrl()}/v1/accounts/${address}/resources`;
  const res = await fetch(url);
  if (!res.ok) return 0;
  const resources: { type: string; data: unknown }[] = await res.json();
  const coinStore = resources.find(
    (r) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
  ) as CoinStoreResource | undefined;
  return coinStore ? Number(coinStore.data.coin.value) : 0;
}

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
  timeout: 60_000,
});

export async function prepareUpload(file: File, walletAddress: string): Promise<PrepareResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("accountAddress", walletAddress);
  const { data } = await apiClient.post<ApiResponse<PrepareResult>>("/upload/prepare", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  if (!data.success || !data.data) throw new Error(data.error ?? "Upload prepare failed");
  return data.data;
}

export async function commitUpload(
  blobName: string,
  walletAddress: string,
  txHash: string
): Promise<UploadResult> {
  const { data } = await apiClient.post<ApiResponse<UploadResult>>("/upload/commit", {
    blobName,
    accountAddress: walletAddress,
    txHash,
  });
  if (!data.success || !data.data) throw new Error(data.error ?? "Upload commit failed");
  return data.data;
}

export async function fetchFiles(account: string): Promise<BlobInfo[]> {
  const { data } = await apiClient.get<ApiResponse<BlobInfo[]>>("/files", { params: { account } });
  if (!data.success || !data.data) throw new Error(data.error ?? "Failed to fetch files");
  return data.data;
}

export function getDownloadUrl(name: string, account: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  return `${base}/file/${encodeURIComponent(name)}?account=${encodeURIComponent(account)}`;
}
