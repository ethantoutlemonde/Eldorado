"use client"
import { SecretMode } from "@/components/secret-mode";
import { Navigation } from "@/components/navigation";
import RequireAuth from "@/components/require-auth";

export default function SpinPage() {
  return (
    <RequireAuth>
      <Navigation />
      <SecretMode />
    </RequireAuth>
  );
}
