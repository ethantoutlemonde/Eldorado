"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"

interface RouletteProps {
  onBack: () => void
}

export function Roulette({ onBack }: RouletteProps) {
  const [isSpinning, setIsSpinning] = useState(false)
  const [currentNumber, setCurrentNumber] = useState(0)
  const [balance, setBalance] = useState(1000)
  const [bets, setBets] = useState<{ [key: string]: number }>({})
  const [recentResults, setRecentResults] = useState([7, 23, 14, 31, 9])
  const [rotation, setRotation] = useState(0)

  // European roulette wheel sequence
  const numbers = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29,
    7, 28, 12, 35, 3, 26,
  ]

  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
  const blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35]

  const getNumberColor = (num: number) => {
    if (num === 0) return "green"
    return redNumbers.includes(num) ? "red" : "black"
  }

  const placeBet = (betType: string, amount: number) => {
    if (balance >= amount && !isSpinning) {
      setBets((prev) => ({
        ...prev,
        [betType]: (prev[betType] || 0) + amount,
      }))
      setBalance((prev) => prev - amount)
    }
  }

  const spin = async () => {
    if (isSpinning || Object.keys(bets).length === 0) return

    setIsSpinning(true)

    // Random winning number
    const winningNumber = Math.floor(Math.random() * 37)
    const winningIndex = numbers.indexOf(winningNumber)
    const spins = 5 + Math.random() * 5
    const finalRotation = rotation + spins * 360 + winningIndex * (360 / 37)

    setRotation(finalRotation)

    setTimeout(() => {
      setCurrentNumber(winningNumber)
      setRecentResults((prev) => [winningNumber, ...prev.slice(0, 4)])

      // Calculate winnings
      let totalWin = 0
      Object.entries(bets).forEach(([betType, betAmount]) => {
        let multiplier = 0

        switch (betType) {
          case `number-${winningNumber}`:
            multiplier = 35
            break
          case "red":
            if (getNumberColor(winningNumber) === "red") multiplier = 1
            break
          case "black":
            if (getNumberColor(winningNumber) === "black") multiplier = 1
            break
          case "even":
            if (winningNumber > 0 && winningNumber % 2 === 0) multiplier = 1
            break
          case "odd":
            if (winningNumber % 2 === 1) multiplier = 1
            break
          case "low":
            if (winningNumber >= 1 && winningNumber <= 18) multiplier = 1
            break
          case "high":
            if (winningNumber >= 19 && winningNumber <= 36) multiplier = 1
            break
        }

        totalWin += betAmount * (multiplier + 1)
      })

      setBalance((prev) => prev + totalWin)
      setBets({})
      setIsSpinning(false)
    }, 5000)
  }

  const totalBetAmount = Object.values(bets).reduce((sum, amount) => sum + amount, 0)

  return (
    <div className="pt-24 pb-8 px-4">
      <div className="max-w-6xl mx-auto">
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
            Cyber Roulette
          </h1>
          <p className="text-gray-300">Place your bets and spin the wheel!</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Roulette Wheel */}
          <div className="lg:col-span-2">
            <div className="backdrop-blur-xl bg-black/30 border border-pink-500/30 rounded-3xl p-8">
              <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto aspect-square mb-8">
                {/* Wheel */}
                <div
                  className="w-full h-full rounded-full border-8 border-yellow-400 relative transition-transform duration-5000 ease-out"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    background: `conic-gradient(${numbers
                      .map((num, i) => {
                        const color = getNumberColor(num)
                        const colorCode = color === "red" ? "#ef4444" : color === "black" ? "#1f2937" : "#22c55e"
                        return `${colorCode} ${(i * 360) / 37}deg ${((i + 1) * 360) / 37}deg`
                      })
                      .join(", ")})`,
                  }}
                >
                  {/* Numbers on wheel */}
                  {numbers.map((num, i) => {
                    // Calculate position on the wheel
                    const angle = (i * 360) / 37
                    const radius = 42 // percentage of wheel radius

                    return (
                      <div
                        key={i}
                        className="absolute text-white text-xs font-bold flex items-center justify-center"
                        style={{
                          left: `50%`,
                          top: `50%`,
                          width: "24px",
                          height: "24px",
                          transform: `rotate(${angle}deg) translate(0, -${radius}%) rotate(-${angle}deg)`,
                          transformOrigin: "center",
                        }}
                      >
                        {num}
                      </div>
                    )
                  })}
                </div>

                {/* Static pointer/ball indicator */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-10">
                  <div className="w-6 h-6 bg-white rounded-full shadow-lg"></div>
                  <div className="w-2 h-4 bg-yellow-400 mx-auto"></div>
                </div>
              </div>

              {/* Current Number Display */}
              <div className="text-center mb-6">
                <div className="text-5xl sm:text-6xl font-bold text-white mb-2">{currentNumber}</div>
                <div
                  className={`text-xl font-semibold ${
                    getNumberColor(currentNumber) === "red"
                      ? "text-red-400"
                      : getNumberColor(currentNumber) === "black"
                        ? "text-gray-300"
                        : "text-green-400"
                  }`}
                >
                  {getNumberColor(currentNumber).toUpperCase()}
                </div>
              </div>

              {/* Spin Button */}
              <button
                onClick={spin}
                disabled={isSpinning || Object.keys(bets).length === 0}
                className={`w-full py-4 rounded-xl font-bold text-xl transition-all duration-300 ${
                  isSpinning || Object.keys(bets).length === 0
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-pink-500 to-violet-500 text-white hover:shadow-lg hover:shadow-pink-500/25"
                }`}
              >
                {isSpinning ? "Spinning..." : "SPIN"}
              </button>
            </div>
          </div>

          {/* Betting Panel */}
          <div className="space-y-6">
            {/* Balance */}
            <div className="backdrop-blur-xl bg-black/20 border border-pink-500/20 rounded-2xl p-6">
              <div className="text-center">
                <div className="text-sm text-gray-400">Balance</div>
                <div className="text-2xl font-bold text-white">{balance} ETH</div>
                <div className="text-sm text-gray-400 mt-2">Total Bet: {totalBetAmount} ETH</div>
              </div>
            </div>

            {/* Betting Options */}
            <div className="backdrop-blur-xl bg-black/20 border border-pink-500/20 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Place Bets</h3>

              <div className="space-y-3">
                {/* Color Bets */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => placeBet("red", 10)}
                    disabled={isSpinning}
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    Red {bets.red && `(${bets.red})`}
                  </button>
                  <button
                    onClick={() => placeBet("black", 10)}
                    disabled={isSpinning}
                    className="bg-gray-800 hover:bg-gray-900 text-white py-2 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    Black {bets.black && `(${bets.black})`}
                  </button>
                </div>

                {/* Even/Odd */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => placeBet("even", 10)}
                    disabled={isSpinning}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    Even {bets.even && `(${bets.even})`}
                  </button>
                  <button
                    onClick={() => placeBet("odd", 10)}
                    disabled={isSpinning}
                    className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    Odd {bets.odd && `(${bets.odd})`}
                  </button>
                </div>

                {/* High/Low */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => placeBet("low", 10)}
                    disabled={isSpinning}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    1-18 {bets.low && `(${bets.low})`}
                  </button>
                  <button
                    onClick={() => placeBet("high", 10)}
                    disabled={isSpinning}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    19-36 {bets.high && `(${bets.high})`}
                  </button>
                </div>
              </div>

              <button
                onClick={() => setBets({})}
                disabled={isSpinning}
                className="w-full mt-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                Clear Bets
              </button>
            </div>

            {/* Recent Results */}
            <div className="backdrop-blur-xl bg-black/20 border border-pink-500/20 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Recent Results</h3>
              <div className="flex flex-wrap gap-2">
                {recentResults.map((num, i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      getNumberColor(num) === "red"
                        ? "bg-red-600"
                        : getNumberColor(num) === "black"
                          ? "bg-gray-800"
                          : "bg-green-600"
                    }`}
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
