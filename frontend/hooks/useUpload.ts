"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { prepareUpload, confirmUpload } from "@/services/api";
import { useFileStore } from "@/store/fileStore";

export function useUpload() {
  const queryClient = useQueryClient();
  const { account, signAndSubmitTransaction } = useWallet();
  const { setSelectedFile, setIsUploading } = useFileStore();

  return useMutation<{ name: string }, Error, File>({
    mutationFn: async (file) => {
      if (!account) throw new Error("Wallet not connected");
      const walletAddress = account.address.toString();

      const { uploadId, payload } = await prepareUpload(file, walletAddress);

      await signAndSubmitTransaction({ data: payload as any });

      return confirmUpload(uploadId, walletAddress);
    },

    onMutate: () => setIsUploading(true),

    onSuccess: () => {
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },

    onSettled: () => setIsUploading(false),
  });
}
