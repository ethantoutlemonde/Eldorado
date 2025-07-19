"use client"

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./auth-context";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || (user.statut !== "verified" && user.statut !== "admin")) {
      router.replace("/login");
    }
  }, [user, router]);

  if (!user || (user.statut !== "verified" && user.statut !== "admin")) {
    return null;
  }

  return <>{children}</>;
}
