"use client"

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export interface UserData {
  id: string;
  statut: string;
  [key: string]: any;
}

interface AuthContextValue {
  user: UserData | null;
  login: (data: UserData) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("userData");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("userData");
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !(window as any).ethereum) return;
    const handleAccountsChanged = () => {
      setUser(null);
      localStorage.removeItem("userData");
      router.push("/login");
    };
    (window as any).ethereum.on("accountsChanged", handleAccountsChanged);
    return () => {
      (window as any).ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, [router]);

  const login = (data: UserData) => {
    setUser(data);
    localStorage.setItem("userData", JSON.stringify(data));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("userData");
    router.push("/login");
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
