"use client"
import { WalletConnect } from "@/components/wallet-connect";
import { useAuth } from "@/components/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && (user.statut === "verified" || user.statut === "admin")) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  return <WalletConnect />;
}
