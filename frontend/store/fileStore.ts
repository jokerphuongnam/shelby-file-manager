import { create } from "zustand";
import type { FileStore } from "@/types";

export const useFileStore = create<FileStore>((set) => ({
  selectedFile: null,
  setSelectedFile: (file) => set({ selectedFile: file }),

  isUploading: false,
  setIsUploading: (uploading) => set({ isUploading: uploading }),
}));
