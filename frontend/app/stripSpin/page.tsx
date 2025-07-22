"use client"
import { Roulette } from "@/components/stripRoulette";
import { Navigation } from "@/components/navigation";
import RequireAuth from "@/components/require-auth";

export default function SpinPage() {
  return (
    <RequireAuth>
      <Navigation />
      <Roulette />
    </RequireAuth>
  );
}
