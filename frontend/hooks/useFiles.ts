import { useQuery } from "@tanstack/react-query";
import { fetchFiles } from "@/services/api";
import type { BlobInfo } from "@/types";

export function useFiles(account: string | undefined) {
  return useQuery<BlobInfo[], Error>({
    queryKey: ["files", account],
    queryFn: () => fetchFiles(account!),
    enabled: !!account,
    refetchInterval: 30_000,
    placeholderData: (prev) => prev,
  });
}
