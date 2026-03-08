import axios from "axios";
import type { ApiResponse, BlobInfo, UploadResult, PrepareResult } from "@/types";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
  timeout: 60_000,
});

export async function prepareUpload(file: File, walletAddress: string): Promise<PrepareResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("walletAddress", walletAddress);
  const { data } = await apiClient.post<ApiResponse<PrepareResult>>("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  if (!data.success || !data.data) throw new Error(data.error ?? "Prepare failed");
  return data.data;
}

export async function confirmUpload(uploadId: string, walletAddress: string): Promise<UploadResult> {
  const { data } = await apiClient.post<ApiResponse<UploadResult>>("/confirm", { uploadId, walletAddress });
  if (!data.success || !data.data) throw new Error(data.error ?? "Confirm failed");
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
