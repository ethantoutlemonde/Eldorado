"use client"

import { useState, useEffect } from "react"
import { Dashboard } from "@/components/dashboard"
import { SlotMachine } from "@/components/slot-machine"
import { Roulette } from "@/components/roulette"
import { PokerTable } from "@/components/poker-table"
import { WalletConnect } from "@/components/wallet-connect"
import { TokenSwap } from "@/components/token-swap"
import { SecretMode } from "@/components/secret-mode"
import { Navigation } from "@/components/navigation"

export default function CasinoApp() {
  const [currentView, setCurrentView] = useState("dashboard")
  const [isSecretMode, setIsSecretMode] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  const renderView = () => {
    if (isSecretMode) {
      return <SecretMode onExit={() => setIsSecretMode(false)} />
    }

    switch (currentView) {
      case "dashboard":
        return <Dashboard onNavigate={setCurrentView} />
      case "slots":
        return <SlotMachine onBack={() => setCurrentView("dashboard")} />
      case "roulette":
        return <Roulette onBack={() => setCurrentView("dashboard")} />
      case "poker":
        return <PokerTable onBack={() => setCurrentView("dashboard")} />
      case "wallet":
        return <WalletConnect onBack={() => setCurrentView("dashboard")} />
      case "swap":
        return <TokenSwap onBack={() => setCurrentView("dashboard")} />
      default:
        return <Dashboard onNavigate={setCurrentView} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 relative overflow-hidden">
      {/* Animated background particles - reduced for mobile performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(window.innerWidth > 768 ? 50 : 25)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-pink-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {!isSecretMode && (
        <Navigation currentView={currentView} onNavigate={setCurrentView} onSecretMode={() => setIsSecretMode(true)} />
      )}

      <main className="relative z-10">{renderView()}</main>
    </div>
  )
}
