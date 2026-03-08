"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";
import { isSessionValid, clearSession } from "@/lib/walletSession";
import { WalletSessionProvider } from "@/components/WalletSessionProvider";

function resolveNetwork(network: string | undefined): Network {
  const map: Record<string, Network> = {
    testnet: Network.TESTNET,
    mainnet: Network.MAINNET,
    devnet: Network.DEVNET,
    local: Network.LOCAL,
  };
  return map[network ?? "testnet"] ?? Network.TESTNET;
}

const aptosNetwork = resolveNetwork(process.env.NEXT_PUBLIC_APTOS_NETWORK);

function autoConnect(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (!isSessionValid()) {
    clearSession();
    return Promise.resolve(false);
  }
  return Promise.resolve(true);
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 10_000,
            retry: 1,
          },
        },
      })
  );

  return (
    <AptosWalletAdapterProvider
      autoConnect={autoConnect}
      dappConfig={{ network: aptosNetwork }}
    >
      <WalletSessionProvider>
        <QueryClientProvider client={queryClient}>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </WalletSessionProvider>
    </AptosWalletAdapterProvider>
  );
}
