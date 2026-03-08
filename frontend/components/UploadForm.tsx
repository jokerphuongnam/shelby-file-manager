"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useFileStore } from "@/store/fileStore";
import { useUpload } from "@/hooks/useUpload";
import { useAptBalance } from "@/hooks/useAptBalance";
import { useWalletHydration } from "@/components/WalletSessionProvider";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadForm() {
  const { connected } = useWallet();
  const { hydrated } = useWalletHydration();
  const { selectedFile, setSelectedFile, isUploading } = useFileStore();
  const { mutate: upload, isError, error, isSuccess, reset } = useUpload();
  const { insufficient } = useAptBalance();
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreview(null);
      return;
    }
    if (selectedFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreview(null);
  }, [selectedFile]);

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) {
        reset();
        setSelectedFile(accepted[0]);
      }
    },
    [setSelectedFile, reset]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    disabled: isUploading,
  });

  function handleUpload() {
    if (!selectedFile) return;
    upload(selectedFile);
  }

  function handleRemove() {
    setSelectedFile(null);
    reset();
  }

  if (!hydrated) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 h-6 w-32 animate-pulse rounded bg-gray-200" />
        <div className="h-40 animate-pulse rounded-xl bg-gray-100" />
      </section>
    );
  }

  if (!connected) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Upload File</h2>
        <p className="text-sm text-gray-500">Please connect your wallet to upload files.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">Upload File</h2>

      <div
        {...getRootProps()}
        className={[
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition",
          isDragActive
            ? "border-brand-500 bg-brand-50"
            : "border-gray-300 bg-gray-50 hover:border-brand-500 hover:bg-brand-50",
          isUploading ? "cursor-not-allowed opacity-60" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <input {...getInputProps()} />

        {preview ? (
          <img
            src={preview}
            alt="preview"
            className="mb-3 h-24 w-24 rounded-lg object-cover shadow"
          />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mb-3 h-10 w-10 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
        )}

        {isDragActive ? (
          <p className="text-sm font-medium text-brand-600">Drop it here…</p>
        ) : selectedFile ? (
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">
              {selectedFile.name}
            </p>
            <p className="mt-0.5 text-xs text-gray-400">
              {formatBytes(selectedFile.size)}
              {selectedFile.type ? ` · ${selectedFile.type}` : ""}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Click or drop to replace
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Drag & drop a file here, or click to select
          </p>
        )}
      </div>

      {insufficient && (
        <p className="mt-3 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          Your wallet does not have enough APT to pay transaction gas fees.
          Please fund your wallet using the{" "}
          <a
            href="https://aptos.dev/en/network/faucet"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-yellow-900"
          >
            Aptos testnet faucet
          </a>
          .
        </p>
      )}

      {isError && (
        <p className="mt-3 text-sm text-red-600">
          {error?.message ?? "Upload failed. Please try again."}
        </p>
      )}

      {isSuccess && (
        <p className="mt-3 text-sm text-green-600">
          File uploaded successfully!
        </p>
      )}

      <div className="mt-4 flex gap-2">
        {selectedFile && !isUploading && (
          <button
            onClick={handleRemove}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            Remove
          </button>
        )}

        <button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading || !!insufficient}
          className="flex-1 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUploading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
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
              Uploading…
            </span>
          ) : (
            "Upload to Shelby"
          )}
        </button>
      </div>
    </section>
  );
}
