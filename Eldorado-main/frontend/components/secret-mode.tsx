"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  X, Eye, EyeOff, Terminal,
  Zap, Target, Spade
} from "lucide-react"

interface SecretModeProps {
  onExit: () => void
}

export function SecretMode({ onExit }: SecretModeProps) {
  const [stage, setStage] = useState(0)
  const [showKey, setShowKey] = useState(false)
  const [revealedParts, setRevealedParts] = useState(0)
  const [isHacking, setIsHacking] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const fakePrivateKey = "0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890"
  const hackingText = [
    "INITIALIZING STRIP PROTOCOL...",
    "BYPASSING SECURITY LAYERS...",
    "ACCESSING ENCRYPTED VAULT...",
    "DECRYPTING PRIVATE KEYS...",
    "REVEALING HIDDEN ASSETS...",
  ]

  const games = [
    {
      id: "slots",
      title: "Strip Slots",
      subtitle: "Spin to Win",
      icon: Zap,
      gradient: "from-green-500 to-vert-500",
      description: "3-reel classic with mega multipliers",
    },
    {
      id: "roulette",
      title: "Strip Roulette",
      subtitle: "Place Your Bets",
      icon: Target,
      gradient: "from-green-500 to-vert-500",
      description: "European roulette with live results",
    },
    {
      id: "poker",
      title: "Strip Poker",
      subtitle: "Texas Hold'em",
      icon: Spade,
      gradient: "from-green-500 to-vert-500",
      description: "Multi-player poker table",
    },
  ]

  useEffect(() => {
    if (stage === 0) {
      const timer = setTimeout(() => setStage(1), 1200)
      return () => clearTimeout(timer)
    }
  }, [stage])

  const handleHack = () => {
    setIsHacking(true)
    let currentStep = 0

    const interval = setInterval(() => {
      currentStep++
      if (currentStep >= hackingText.length) {
        clearInterval(interval)
        setIsHacking(false)
        setStage(2)

        const revealInterval = setInterval(() => {
          setRevealedParts(prev => {
            if (prev >= 5) {
              clearInterval(revealInterval)
              return prev
            }
            return prev + 1
          })
        }, 1000)
      }
    }, 500)
  }

  const router = useRouter()
  const onNavigate = (id: string) => {
    const path = id === 'roulette' ? '/spin' : `/${id}`
    router.push(path)
  }

  return (
    <div className=" bg-black z-50 overflow-x-hidden max-w-full scrollbar-none">
      {/* Matrix-style background */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute text-green-400 font-mono text-xs animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          >
            {Math.random().toString(36).substring(7)}
          </div>
        ))}
      </div>

      {/* Exit button */}
      <button
        onClick={onExit}
        className="absolute top-4 right-4 z-[9999] p-2 bg-red-600/20 hover:bg-red-600/40 rounded-lg transition-colors pointer-events-auto"
      >
        <X className="w-6 h-6 text-red-400" />
      </button>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        {/* STAGE 0 */}
        {stage === 0 && (
          <div className="text-center">
            <div className="text-6xl mb-8 animate-pulse">🔐</div>
            <h1 className="text-4xl font-bold text-green-400 mb-4 font-mono">STRIP MODE ACTIVATED</h1>
            <div className="text-green-300 font-mono">Initializing secure connection...</div>
            <div className="w-64 h-2 bg-gray-800 rounded-full mx-auto mt-4">
              <div className="h-full bg-gradient-to-r from-green-400 to-cyan-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}

        {/* STAGE 1 */}
        {stage === 1 && (
          <div className="max-w-2xl w-full">
            <div className="backdrop-blur-xl bg-black/80 border border-green-400/50 rounded-2xl p-8">
              <div className="flex items-center space-x-4 mb-6">
                <Terminal className="w-8 h-8 text-green-400" />
                <h2 className="text-2xl font-bold text-green-400 font-mono">STRIP TERMINAL</h2>
              </div>

              <div className="bg-black/60 border border-green-400/30 rounded-xl p-6 mb-6 font-mono text-green-300">
                <div className="mb-4">{"> "} <span className="animate-pulse">█</span></div>
                <div className="text-sm space-y-1">
                  <div>Welcome to CyberCasino Secret Mode</div>
                  <div>This is a hidden easter egg interface</div>
                  <div>WARNING: For entertainment purposes only</div>
                  <div className="text-yellow-400">No real private keys will be exposed</div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-gray-300 mb-6">Ready to access the vault? This is just a visual demonstration.</p>
                <button
                  onClick={handleHack}
                  disabled={isHacking}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-cyan-500 text-black font-bold rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 disabled:opacity-50"
                >
                  {isHacking ? "HACKING..." : "ACCESS VAULT"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 2 */}
        {stage === 2 && (
          <div className="max-w-4xl w-full">
            <div className="backdrop-blur-xl bg-black/80 border border-green-400/50 rounded-2xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-green-400 font-mono mb-4">VAULT ACCESSED</h2>
                <p className="text-gray-300">This is a fake demonstration - No real keys are exposed!</p>
              </div>

              {/* FAKE KEY */}
              <div className="bg-red-900/20 border border-red-400/50 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-red-400 font-mono">PRIVATE KEY (FAKE)</h3>
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                  >
                    {showKey ? <EyeOff className="w-5 h-5 text-red-400" /> : <Eye className="w-5 h-5 text-red-400" />}
                  </button>
                </div>
                <div className="font-mono text-sm bg-black/40 text-white p-4 rounded-lg overflow-x-hidden">
                  {showKey ? fakePrivateKey : "•".repeat(66)}
                </div>
                <div className="text-yellow-400 text-sm mt-2 font-bold">
                  ⚠️ THIS IS A FAKE KEY FOR DEMONSTRATION ONLY ⚠️
                </div>
              </div>

              {/* VAULT CONTENTS */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {[ 
                  { name: "Hidden ETH", amount: "42.069", revealed: revealedParts >= 1 },
                  { name: "Secret ELDORADO", amount: "13,337", revealed: revealedParts >= 2 },
                  { name: "Mystery NFTs", amount: "7", revealed: revealedParts >= 3 },
                  { name: "Bonus Tokens", amount: "99,999", revealed: revealedParts >= 4 },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`bg-black/40 border border-green-400/30 rounded-xl p-6 transition-all duration-500 ${
                      item.revealed ? "opacity-100 scale-100" : "opacity-30 scale-95"
                    }`}
                  >
                    <h4 className="text-green-400 font-bold mb-2">{item.name}</h4>
                    <div className="text-2xl font-bold text-white">{item.revealed ? item.amount : "???"}</div>
                  </div>
                ))}
              </div>

              {/* DISCLAIMER */}
              {/* <div className="bg-yellow-900/20 border border-yellow-400/50 rounded-xl p-6 text-center mb-8">
                <h3 className="text-xl font-bold text-yellow-400 mb-4">🎪 ENTERTAINMENT MODE 🎪</h3>
                <p className="text-gray-300 text-sm">
                  This is a fun easter egg interface! No real cryptocurrency, private keys, or sensitive information
                  is displayed. This is purely for entertainment and demonstrates UI/UX design concepts. Always keep
                  your real private keys secure!
                </p>
              </div> */}

              {/* GAME CARDS */}
              <div className="mt-8">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                  {games.map((game) => (
                    <div
                      key={game.id}
                      className="group cursor-pointer"
                      onMouseEnter={() => setHoveredCard(game.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                      onClick={() => onNavigate(game.id)}
                    >
                      <div
                        className={`relative backdrop-blur-xl bg-black/20 border border-green-500/20 rounded-3xl p-6 sm:p-8 transition-all duration-500 transform ${
                          hoveredCard === game.id ? "scale-[1.03] border-green-500/60 shadow-2xl shadow-green-500/25" : ""
                        }`}
                      >
                        {/* Background gradient effect */}
                        <div
                          className={`absolute inset-0 bg-gradient-to-r ${game.gradient} opacity-0 rounded-3xl transition-opacity duration-500 ${
                            hoveredCard === game.id ? "opacity-10" : ""
                          }`}
                        ></div>

                        <div className="relative z-10">
                          <div
                            className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${game.gradient} rounded-2xl flex items-center justify-center mb-4 sm:mb-6 transform transition-transform duration-300 ${
                              hoveredCard === game.id ? "rotate-12 scale-110" : ""
                            }`}
                          >
                            <game.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                          </div>

                          <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">{game.title}</h3>
                          <p className="text-green-400 font-semibold mb-2 sm:mb-3">{game.subtitle}</p>
                          <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6">{game.description}</p>

                          <button
                            className={`w-full py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 ${
                              hoveredCard === game.id
                                ? `bg-gradient-to-r ${game.gradient} text-white shadow-lg`
                                : "bg-white/10 text-gray-300 hover:bg-white/20"
                            }`}
                          >
                            Play Now
                          </button>
                        </div>

                        {/* Particles */}
                        {hoveredCard === game.id && (
                          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                            {[...Array(10)].map((_, i) => (
                              <div
                                key={i}
                                className="absolute w-1 h-1 bg-green-400 rounded-full animate-ping"
                                style={{
                                  left: `${Math.random() * 100}%`,
                                  top: `${Math.random() * 100}%`,
                                  animationDelay: `${Math.random() * 2}s`,
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
