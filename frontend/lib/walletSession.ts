const SESSION_KEY = "shelby_wallet_session";
const SESSION_TTL_MS = 6 * 60 * 60 * 1000;

interface WalletSession {
  walletName: string;
  walletAddress: string;
  connectedAt: number;
}

export function saveSession(walletName: string, walletAddress: string): void {
  const session: WalletSession = {
    walletName,
    walletAddress,
    connectedAt: Date.now(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function loadSession(): WalletSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WalletSession;
  } catch {
    return null;
  }
}

export function isSessionValid(): boolean {
  const session = loadSession();
  if (!session) return false;
  return Date.now() - session.connectedAt < SESSION_TTL_MS;
}

export function isExpired(): boolean {
  const session = loadSession();
  if (!session) return true;
  return Date.now() - session.connectedAt >= SESSION_TTL_MS;
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}
