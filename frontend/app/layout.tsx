import type { Metadata } from "next";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";
import { Providers } from "./providers";

const WalletButton = dynamic(
  () => import("@/components/WalletButton").then((m) => ({ default: m.WalletButton })),
  { ssr: false }
);

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME ?? "Shelby File Manager",
  description: "Upload and manage files stored on the Shelby Protocol",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <header className="border-b border-gray-200 bg-white">
            <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-7 w-7 text-brand-600"
              >
                <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15zM1.5 10.146V6a3 3 0 013-3h5.379a2.25 2.25 0 011.59.659l2.122 2.121c.14.141.293.249.455.332A3.744 3.744 0 0012 4.5H3a2.25 2.25 0 00-1.5.646z" />
              </svg>

              <span className="text-xl font-bold tracking-tight text-gray-900">
                Shelby
              </span>

              <span className="ml-1 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                File Manager
              </span>

              <div className="ml-auto">
                <WalletButton />
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
