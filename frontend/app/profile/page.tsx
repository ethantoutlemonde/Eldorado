"use client"
import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { useAuth } from "@/components/auth-context";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, logout, login } = useAuth();
  const [message, setMessage] = useState("");
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  if (!user) return null;

  const handleDelete = async () => {
    if (!confirm("Delete your account?")) return;
    try {
      const res = await fetch(`${API_URL}/api/users/${user.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("failed");
      logout();
    } catch (e) {
      setMessage("Error deleting account");
    }
  };

  const handleSelfExclude = async () => {
    if (!confirm("Self exclude this account?")) return;
    try {
      const res = await fetch(`${API_URL}/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: "banned" }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      login(data);
      setMessage("Account self-excluded");
    } catch (e) {
      setMessage("Error updating account");
    }
  };

  return (
    <>
      <Navigation />
      <div className="pt-24 pb-8 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-white">Profile</h1>
          <div className="bg-black/30 backdrop-blur-xl border border-pink-500/30 rounded-2xl p-6 space-y-2">
            <div><span className="text-gray-400 mr-2">Address:</span><span className="break-all text-white">{user.id}</span></div>
            {user.prenom && (
              <div><span className="text-gray-400 mr-2">Name:</span><span className="text-white">{user.prenom} {user.nom}</span></div>
            )}
            {user.date_naissance && (
              <div><span className="text-gray-400 mr-2">Birth:</span><span className="text-white">{user.date_naissance}</span></div>
            )}
            <div><span className="text-gray-400 mr-2">Status:</span><span className="text-white capitalize">{user.statut}</span></div>
          </div>
          {message && <div className="text-center text-red-500">{message}</div>}
          <div className="flex space-x-4">
            <button onClick={handleSelfExclude} className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-xl text-white">
              Self Exclude
            </button>
            <button onClick={handleDelete} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl text-white">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
