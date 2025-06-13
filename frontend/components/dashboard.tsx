"use client"

import { useState } from "react"
import { Zap, Target, Spade, TrendingUp, TrendingDown } from "lucide-react"

interface DashboardProps {
  onNavigate: (view: string) => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const games = [
    {
      id: "slots",
      title: "Neon Slots",
      subtitle: "Spin to Win",
      icon: Zap,
      gradient: "from-purple-500 to-fuchsia-400",
      description: "3-reel classic with mega multipliers",
    },
    {
      id: "roulette",
      title: "Cyber Roulette",
      subtitle: "Place Your Bets",
      icon: Target,
      gradient: "from-purple-400 to-fuchsia-500",
      description: "European roulette with live results",
    },
    {
      id: "poker",
      title: "Hologram Poker",
      subtitle: "Texas Hold'em",
      icon: Spade,
      gradient: "from-purple-500 to-fuchsia-400",
      description: "Multi-player poker table",
    },
  ]

  const stats = [
    { label: "Total Wins", value: "1,247 ETH", change: "-12.5%" },
    { label: "Games Played", value: "8,432", change: "+8.2%" },
    { label: "Win Rate", value: "67.3%", change: "+2.1%" },
    { label: "Eldorado Tokens", value: "15,678", change: "15.7%" },
  ]

  return (
    <div className="pt-24 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-violet-400 bg-clip-text text-transparent mb-4">
            ELDORADO
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8">Experience the future of blockchain gambling</p>
          <div className="flex justify-center">
            <div className="backdrop-blur-xl bg-gradient-to-r from-pink-500/20 to-violet-500/20 border border-pink-500/30 rounded-2xl p-4 sm:p-6">
              <div className="flex items-center space-x-2 sm:space-x-4 flex-wrap justify-center">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-semibold">Live Network</span>
                <span className="hidden sm:inline text-gray-400">|</span>
                <span className="text-white">2,847 Players Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8 md:mb-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="backdrop-blur-xl bg-black/20 border border-pink-500/20 rounded-2xl p-3 sm:p-6 hover:border-pink-500/40 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <span className="text-gray-400 text-xs sm:text-sm">{stat.label}</span>
                {parseFloat(stat.change.replace('%', '')) < 0 ? (
                  <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                ) : (
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                )}
                {/* <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" /> */}
              </div>
              <div className="text-base sm:text-2xl font-bold text-white mb-0 sm:mb-1">{stat.value}</div>
              <div
                className={`${
                  parseFloat(stat.change) < 0 ? 'text-red-400' : 'text-green-400'
                } text-xs sm:text-sm`}
              >
                {stat.change}
              </div>            
            </div>
          ))}
        </div>

        {/* Game Cards */}
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
                className={`relative backdrop-blur-xl bg-black/20 border border-pink-500/20 rounded-3xl p-6 sm:p-8 transition-all duration-500 transform ${
                  hoveredCard === game.id ? "scale-[1.03] border-pink-500/60 shadow-2xl shadow-pink-500/25" : ""
                }`}
              >
                {/* 3D Card Effect */}
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
                  <p className="text-pink-400 font-semibold mb-2 sm:mb-3">{game.subtitle}</p>
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

                {/* Animated particles */}
                {hoveredCard === game.id && (
                  <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-1 bg-pink-400 rounded-full animate-ping"
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
  )
}
