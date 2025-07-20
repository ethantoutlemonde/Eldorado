"use client"
import { WalletConnect } from "@/components/wallet-connect";
import { Navigation } from "@/components/navigation";

export default function WalletPage() {
  return (
    <>
      <Navigation />
      <WalletConnect redirectOnLogin={false} />
    </>
  );
}
