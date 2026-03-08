"use client";

import React from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useFiles } from "@/hooks/useFiles";
import { getDownloadUrl } from "@/services/api";
import type { BlobInfo } from "@/types";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

function FileRow({ blob, account }: { blob: BlobInfo; account: string }) {
  const downloadUrl = getDownloadUrl(blob.name, account);

  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50">
      <td className="px-4 py-3 text-sm font-medium text-gray-800 break-all">
        {blob.name}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
        {formatBytes(blob.size)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">
        {blob.contentType ?? "—"}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
        {blob.createdAt ? new Date(blob.createdAt).toLocaleString() : "—"}
      </td>
      <td className="px-4 py-3 text-right">
        <a
          href={downloadUrl}
          download={blob.name}
          className="inline-flex items-center gap-1.5 rounded-lg border border-brand-600 px-3 py-1.5 text-xs font-medium text-brand-600 transition hover:bg-brand-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
          Download
        </a>
      </td>
    </tr>
  );
}

export function FileList() {
  const { account } = useWallet();
  const accountAddress = account?.address.toString();
  const { data: files, isLoading, isError, error, isFetching } = useFiles(accountAddress);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-800">Stored Files</h2>
        {isFetching && (
          <span className="text-xs text-gray-400 animate-pulse">
            Refreshing…
          </span>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <svg
            className="h-6 w-6 animate-spin text-brand-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        </div>
      )}

      {isError && (
        <p className="px-6 py-8 text-center text-sm text-red-500">
          {error?.message ?? "Failed to load files."}
        </p>
      )}

      {!isLoading && !isError && (!files || files.length === 0) && (
        <p className="px-6 py-12 text-center text-sm text-gray-400">
          No files uploaded yet. Use the form above to upload your first file.
        </p>
      )}

      {files && files.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {files.map((blob) => (
                <FileRow key={blob.name} blob={blob} account={accountAddress ?? ""} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
