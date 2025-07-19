"use client"
import { PokerTable } from "@/components/poker-table";
import { Navigation } from "@/components/navigation";
import RequireAuth from "@/components/require-auth";

export default function SpinPage() {
  return (
    <RequireAuth>
      <Navigation />
      <PokerTable />
    </RequireAuth>
  );
}
