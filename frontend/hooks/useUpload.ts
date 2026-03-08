"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { prepareUpload, commitUpload } from "@/services/api";
import { useFileStore } from "@/store/fileStore";
import type { PrepareResult } from "@/types";

function merkleRootToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function buildRegisterPayload(prepared: PrepareResult) {
  return {
    function: prepared.registerFunction as `${string}::${string}::${string}`,
    functionArguments: [
      prepared.blobName,
      BigInt(prepared.expirationMicros),
      merkleRootToBytes(prepared.blobMerkleRoot),
      prepared.numChunksets,
      prepared.blobSize,
      0,
      prepared.encoding,
    ],
  };
}

export function useUpload() {
  const queryClient = useQueryClient();
  const { account, signAndSubmitTransaction } = useWallet();
  const { setSelectedFile, setIsUploading } = useFileStore();

  return useMutation<{ name: string }, Error, File>({
    mutationFn: async (file) => {
      if (!account) throw new Error("Wallet not connected");
      const walletAddress = account.address.toString();

      const prepared = await prepareUpload(file, walletAddress);
      const payload = buildRegisterPayload(prepared);

      const response = await signAndSubmitTransaction({
        data: payload,
        options: { maxGasAmount: 200000, gasUnitPrice: 100 },
      });

      return commitUpload(prepared.blobName, walletAddress, response.hash);
    },

    onMutate: () => setIsUploading(true),

    onSuccess: () => {
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },

    onSettled: () => setIsUploading(false),
  });
}
