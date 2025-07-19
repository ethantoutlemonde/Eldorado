"use client"
import { WalletConnect } from "@/components/wallet-connect";
import { Navigation } from "@/components/navigation";
import RequireAuth from "@/components/require-auth";

export default function WalletPage() {
  return (
    <RequireAuth>
      <Navigation />
      <WalletConnect />
    </RequireAuth>
  );
}
