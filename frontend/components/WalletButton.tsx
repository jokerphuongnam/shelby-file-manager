"use client";

import { useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { saveSession, clearSession } from "@/lib/walletSession";
import { useWalletHydration } from "@/components/WalletSessionProvider";

export function WalletButton() {
  const { connected, account, wallet, connect, disconnect, wallets } = useWallet();
  const { hydrated } = useWalletHydration();

  useEffect(() => {
    if (connected && account && wallet) {
      saveSession(wallet.name, account.address.toString());
    }
  }, [connected, account, wallet]);

  function handleDisconnect() {
    clearSession();
    disconnect();
  }

  if (!hydrated) {
    return <div className="h-9 w-36 animate-pulse rounded-lg bg-gray-200" />;
  }

  if (connected && account) {
    const addr = account.address.toString();
    const short = `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    return (
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
          {short}
        </span>
        <button
          onClick={handleDisconnect}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Disconnect
        </button>
      </div>
    );
  }

  const petra = wallets?.find((w) => w.name === "Petra") ?? wallets?.[0];

  return (
    <button
      onClick={() => petra && connect(petra.name)}
      disabled={!petra}
      className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
    >
      Connect Wallet
    </button>
  );
}
