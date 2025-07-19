"use client"

import { useState } from "react"
import { ArrowLeft, User } from "lucide-react"

interface PokerTableProps {
  onBack: () => void
}

export function PokerTable({ onBack }: PokerTableProps) {
  const [playerCards, setPlayerCards] = useState(["🂡", "🂮"])
  const [communityCards, setCommunityCards] = useState(["🂣", "🂧", "🂪", "🂫", "🂭"])
  const [pot, setPot] = useState(450)
  const [playerChips, setPlayerChips] = useState(1000)
  const [currentBet, setCurrentBet] = useState(50)

  const players = [
    { id: 1, name: "You", chips: playerChips, position: "bottom", active: true, bet: currentBet },
    { id: 2, name: "Alice", chips: 850, position: "left", active: true, bet: 50 },
    { id: 3, name: "Bob", chips: 1200, position: "top-left", active: false, bet: 0 },
    { id: 4, name: "Charlie", chips: 750, position: "top", active: true, bet: 50 },
    { id: 5, name: "Diana", chips: 950, position: "top-right", active: true, bet: 50 },
    { id: 6, name: "Eve", chips: 600, position: "right", active: false, bet: 0 },
  ]

  const getPositionClasses = (position: string) => {
    switch (position) {
      case "bottom":
        return "bottom-4 left-1/2 transform -translate-x-1/2"
      case "left":
        return "left-4 top-1/2 transform -translate-y-1/2"
      case "top-left":
        return "left-8 top-8"
      case "top":
        return "top-4 left-1/2 transform -translate-x-1/2"
      case "top-right":
        return "right-8 top-8"
      case "right":
        return "right-4 top-1/2 transform -translate-y-1/2"
      default:
        return ""
    }
  }

  const actions = [
    { name: "Fold", color: "bg-red-600 hover:bg-red-700" },
    { name: "Call", color: "bg-blue-600 hover:bg-blue-700" },
    { name: "Raise", color: "bg-green-600 hover:bg-green-700" },
    { name: "All In", color: "bg-purple-600 hover:bg-purple-700" },
  ]

  return (
    <div className="pt-24 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent mb-4">
            Hologram Poker
          </h1>
          <p className="text-gray-300">Texas Hold'em - No Limit</p>
        </div>

        {/* Poker Table */}
        <div className="relative">
          <div
            className="backdrop-blur-xl bg-black/30 border border-pink-500/30 rounded-full p-8"
            style={{ height: "600px" }}
          >
            {/* Table Surface */}
            <div className="relative w-full h-full bg-gradient-to-br from-green-800 to-green-900 rounded-full border-8 border-yellow-600 shadow-2xl overflow-hidden">
              {/* Felt Pattern */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `radial-gradient(circle at 25% 25%, #22c55e 2px, transparent 2px),
                                 radial-gradient(circle at 75% 75%, #22c55e 2px, transparent 2px)`,
                  backgroundSize: "50px 50px",
                }}
              ></div>

              {/* Community Cards */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="flex space-x-2 mb-4">
                  {communityCards.map((card, i) => (
                    <div
                      key={i}
                      className="w-16 h-24 bg-white rounded-lg shadow-lg flex items-center justify-center text-2xl border-2 border-gray-300 transform hover:scale-105 transition-transform"
                    >
                      {card}
                    </div>
                  ))}
                </div>

                {/* Pot */}
                <div className="text-center">
                  <div className="bg-black/50 rounded-lg px-4 py-2 border border-yellow-400">
                    <div className="text-yellow-400 font-bold text-lg">POT: {pot} ETH</div>
                  </div>
                </div>
              </div>

              {/* Players */}
              {players.map((player) => (
                <div key={player.id} className={`absolute ${getPositionClasses(player.position)}`}>
                  <div
                    className={`flex flex-col items-center space-y-2 ${player.active ? "opacity-100" : "opacity-50"}`}
                  >
                    {/* Player Avatar */}
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold border-4 ${
                        player.active
                          ? "border-green-400 bg-gradient-to-r from-pink-500 to-violet-500"
                          : "border-gray-500 bg-gray-600"
                      }`}
                    >
                      <User className="w-8 h-8" />
                    </div>

                    {/* Player Info */}
                    <div className="text-center">
                      <div className="text-white font-semibold text-sm">{player.name}</div>
                      <div className="text-yellow-400 text-xs">{player.chips} ETH</div>
                      {player.bet > 0 && (
                        <div className="bg-red-600 text-white text-xs px-2 py-1 rounded mt-1">Bet: {player.bet}</div>
                      )}
                    </div>

                    {/* Player Cards (only for main player) */}
                    {player.id === 1 && (
                      <div className="flex space-x-1 mt-2">
                        {playerCards.map((card, i) => (
                          <div
                            key={i}
                            className="w-12 h-16 bg-white rounded shadow-lg flex items-center justify-center text-lg border border-gray-300"
                          >
                            {card}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Other players' hidden cards */}
                    {player.id !== 1 && player.active && (
                      <div className="flex space-x-1 mt-2">
                        {[1, 2].map((i) => (
                          <div
                            key={i}
                            className="w-12 h-16 bg-gradient-to-br from-blue-900 to-purple-900 rounded shadow-lg border border-pink-500/30"
                          ></div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full mt-4">
            <div className="flex space-x-4">
              {actions.map((action) => (
                <button
                  key={action.name}
                  className={`px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 ${action.color} hover:scale-105 shadow-lg`}
                >
                  {action.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Game Info */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="backdrop-blur-xl bg-black/20 border border-pink-500/20 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Your Hand</h3>
            <div className="flex space-x-2 justify-center">
              {playerCards.map((card, i) => (
                <div
                  key={i}
                  className="w-16 h-24 bg-white rounded-lg shadow-lg flex items-center justify-center text-2xl border-2 border-gray-300"
                >
                  {card}
                </div>
              ))}
            </div>
            <div className="text-center mt-4">
              <div className="text-pink-400 font-semibold">Ace High</div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-black/20 border border-pink-500/20 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Game Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Blinds:</span>
                <span className="text-white">25/50 ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Players:</span>
                <span className="text-white">4/6</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Round:</span>
                <span className="text-white">Flop</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Your Position:</span>
                <span className="text-white">Button</span>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-black/20 border border-pink-500/20 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Betting</h3>
            <div className="space-y-3">
              <div>
                <label className="text-gray-400 text-sm">Bet Amount</label>
                <input
                  type="range"
                  min="50"
                  max={playerChips}
                  value={currentBet}
                  onChange={(e) => setCurrentBet(Number(e.target.value))}
                  className="w-full mt-1"
                />
                <div className="text-white font-semibold">{currentBet} ETH</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
