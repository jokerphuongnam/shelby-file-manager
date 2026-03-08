"use client";

import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { getAptBalance } from "@/services/api";

// max_gas_amount * gas_unit_price = 200_000 * 100 = 20_000_000 octas
const MIN_GAS_OCTAS = 20_000_000;

export function useAptBalance() {
  const { account, connected } = useWallet();
  const address = account?.address?.toString();

  const { data: balance } = useQuery({
    queryKey: ["apt-balance", address],
    queryFn: () => getAptBalance(address!),
    enabled: connected && !!address,
    refetchInterval: 30_000,
  });

  return {
    balance,
    insufficient: balance !== undefined && balance < MIN_GAS_OCTAS,
  };
}
