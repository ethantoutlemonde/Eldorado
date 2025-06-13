"use client"

import { useState } from "react"
import { ArrowLeft, Play } from "lucide-react"

interface SlotMachineProps {
  onBack: () => void
}

export function SlotMachine({ onBack }: SlotMachineProps) {
  const [reels, setReels] = useState([0, 0, 0])
  const [isSpinning, setIsSpinning] = useState(false)
  const [balance, setBalance] = useState(1000)
  const [bet, setBet] = useState(10)
  const [lastWin, setLastWin] = useState(0)

  const symbols = ["🍒", "🍋", "🍊", "🍇", "⭐", "💎", "🔥", "⚡"]
  const symbolNames = ["Cherry", "Lemon", "Orange", "Grape", "Star", "Diamond", "Fire", "Lightning"]

  const spin = async () => {
    if (isSpinning || balance < bet) return

    setIsSpinning(true)
    setBalance((prev) => prev - bet)
    setLastWin(0)

    // Animate reels
    const spinDuration = 2000
    const intervals = reels.map((_, index) => {
      return setInterval(() => {
        setReels((prev) => {
          const newReels = [...prev]
          newReels[index] = Math.floor(Math.random() * symbols.length)
          return newReels
        })
      }, 100)
    })

    // Stop reels one by one
    setTimeout(() => clearInterval(intervals[0]), spinDuration)
    setTimeout(() => clearInterval(intervals[1]), spinDuration + 500)
    setTimeout(() => {
      clearInterval(intervals[2])

      // Final result
      const finalReels = [
        Math.floor(Math.random() * symbols.length),
        Math.floor(Math.random() * symbols.length),
        Math.floor(Math.random() * symbols.length),
      ]

      setReels(finalReels)

      // Check for wins
      if (finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]) {
        const winAmount = bet * 10
        setLastWin(winAmount)
        setBalance((prev) => prev + winAmount)
      } else if (
        finalReels[0] === finalReels[1] ||
        finalReels[1] === finalReels[2] ||
        finalReels[0] === finalReels[2]
      ) {
        const winAmount = bet * 2
        setLastWin(winAmount)
        setBalance((prev) => prev + winAmount)
      }

      setIsSpinning(false)
    }, spinDuration + 1000)
  }

  return (
    <div className="pt-24 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
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
            Neon Slots
          </h1>
          <p className="text-gray-300">Match 3 symbols to win big!</p>
        </div>

        {/* Slot Machine */}
        <div className="backdrop-blur-xl bg-black/30 border border-pink-500/30 rounded-3xl p-8 mb-8">
          <div className="relative">
            {/* Machine Frame */}
            <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-8 border-4 border-pink-500/50 shadow-2xl shadow-pink-500/25">
              {/* Reels */}
              <div className="flex justify-center space-x-4 mb-8">
                {reels.map((symbolIndex, reelIndex) => (
                  <div
                    key={reelIndex}
                    className={`w-24 h-24 bg-black rounded-xl border-2 border-pink-500/50 flex items-center justify-center text-4xl transition-all duration-300 ${
                      isSpinning ? "animate-spin" : ""
                    } ${lastWin > 0 && !isSpinning ? "animate-pulse border-green-400" : ""}`}
                  >
                    {symbols[symbolIndex]}
                  </div>
                ))}
              </div>

              {/* Win Display */}
              {lastWin > 0 && (
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-green-400 animate-bounce">WIN! +{lastWin} ETH</div>
                </div>
              )}

              {/* Controls */}
              <div className="flex items-center justify-between mb-6">
                <div className="text-white">
                  <div className="text-sm text-gray-400">Balance</div>
                  <div className="text-xl font-bold">{balance} ETH</div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-white">
                    <div className="text-sm text-gray-400">Bet</div>
                    <select
                      value={bet}
                      onChange={(e) => setBet(Number(e.target.value))}
                      className="bg-black/50 border border-pink-500/30 rounded-lg px-3 py-1 text-white"
                      disabled={isSpinning}
                    >
                      <option value={5}>5 ETH</option>
                      <option value={10}>10 ETH</option>
                      <option value={25}>25 ETH</option>
                      <option value={50}>50 ETH</option>
                    </select>
                  </div>
                </div>

                <div className="text-white">
                  <div className="text-sm text-gray-400">Last Win</div>
                  <div className="text-xl font-bold text-green-400">{lastWin} ETH</div>
                </div>
              </div>

              {/* Spin Button */}
              <button
                onClick={spin}
                disabled={isSpinning || balance < bet}
                className={`w-full py-4 rounded-xl font-bold text-xl transition-all duration-300 ${
                  isSpinning || balance < bet
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-pink-500 to-violet-500 text-white hover:shadow-lg hover:shadow-pink-500/25 active:scale-95"
                }`}
              >
                {isSpinning ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Spinning...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Play className="w-6 h-6" />
                    <span>SPIN</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Paytable */}
        <div className="backdrop-blur-xl bg-black/20 border border-pink-500/20 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Paytable</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-2">🍒🍒🍒</div>
              <div className="text-sm text-gray-400">10x Bet</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">⭐⭐⭐</div>
              <div className="text-sm text-gray-400">10x Bet</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">💎💎💎</div>
              <div className="text-sm text-gray-400">10x Bet</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">Any Pair</div>
              <div className="text-sm text-gray-400">2x Bet</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
