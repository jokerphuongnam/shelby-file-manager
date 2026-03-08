export interface BlobInfo {
  name: string;
  size: number;
  contentType?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UploadResult {
  name: string;
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

export interface FileStore {
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;

  isUploading: boolean;
  setIsUploading: (uploading: boolean) => void;
}
