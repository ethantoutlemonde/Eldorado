"use client"
import TokenSwap from "@/components/token-swap";
import { Navigation } from "@/components/navigation";
import RequireAuth from "@/components/require-auth";

export default function SwapPage() {
  return (
    <RequireAuth>
      <Navigation />
      <TokenSwap />
    </RequireAuth>
  );
}
