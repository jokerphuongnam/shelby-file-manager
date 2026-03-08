"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { isSessionValid } from "@/lib/walletSession";

interface WalletHydrationContextValue {
  hydrated: boolean;
}

const WalletHydrationContext = createContext<WalletHydrationContextValue>({
  hydrated: true,
});

export function useWalletHydration(): WalletHydrationContextValue {
  return useContext(WalletHydrationContext);
}

export function WalletSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { connected } = useWallet();
  const [expectingReconnect, setExpectingReconnect] = useState(false);
  const [hydrated, setHydrated] = useState(true);

  useEffect(() => {
    if (!isSessionValid()) return;
    setExpectingReconnect(true);
    setHydrated(false);
  }, []);

  useEffect(() => {
    if (expectingReconnect && connected) {
      setHydrated(true);
    }
  }, [connected, expectingReconnect]);

  useEffect(() => {
    if (!expectingReconnect) return;
    const timer = setTimeout(() => setHydrated(true), 2000);
    return () => clearTimeout(timer);
  }, [expectingReconnect]);

  return (
    <WalletHydrationContext.Provider value={{ hydrated }}>
      {children}
    </WalletHydrationContext.Provider>
  );
}
