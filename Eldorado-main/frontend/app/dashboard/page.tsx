"use client"
import { Dashboard } from "@/components/dashboard";
import { Navigation } from "@/components/navigation";
import RequireAuth from "@/components/require-auth";

export default function DashboardPage() {
  return (
    <RequireAuth>
      <Navigation />
      <Dashboard />
    </RequireAuth>
  );
}
