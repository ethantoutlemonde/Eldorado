"use client"
import { SlotMachine } from "@/components/stripSlot-machine";
import { Navigation } from "@/components/navigation";
import RequireAuth from "@/components/require-auth";

export default function SpinPage() {
  return (
    <RequireAuth>
      <Navigation />
      <SlotMachine />
    </RequireAuth>
  );
}
