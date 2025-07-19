"use client"

import { useState } from "react"
import { ArrowLeft, ExternalLink, Copy, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

// Types pour la blockchain
interface WalletState {
  connected: boolean
  address: string | null
  chainId: number | null
  balance: string
}

interface GameState {
  gameId: string
  status: "waiting" | "spinning" | "completed"
  transactionHash?: string
  blockNumber?: number
}

export function Roulette() {
  const router = useRouter()
  const [isSpinning, setIsSpinning] = useState(false)
  const [currentNumber, setCurrentNumber] = useState(0)
  const [balance, setBalance] = useState(1000)
  const [bets, setBets] = useState<{ [key: string]: number }>({})
  const [recentResults, setRecentResults] = useState([7, 23, 14, 31, 9])
  const [rotation, setRotation] = useState(0)
  const [gameHistory, setGameHistory] = useState<any[]>([])
  const [duration, setDuration] = useState(0)
  const [gameState, setGameState] = useState<GameState>({
    gameId: "",
    status: "waiting",
  })
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [lastTransactionHash, setLastTransactionHash] = useState("")

  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationData, setCelebrationData] = useState<{
    winAmount: number
    winningBets: string[]
    message: string
  } | null>(null)

  // Add wallet state
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    chainId: null,
    balance: "0",
  })

  // European roulette wheel sequence (correct order)
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

  // SVG Roulette Wheel Component
  const RouletteWheel = () => {
    const centerX = 200
    const centerY = 200
    const radius = 180
    const innerRadius = 140
    const sectorAngle = 360 / 37

    return (
      <svg width="400" height="400" viewBox="0 0 400 400" className="w-full h-full">
        {/* Outer ring */}
        <circle cx={centerX} cy={centerY} r={radius + 10} fill="#fbbf24" stroke="#f59e0b" strokeWidth="4" />

        {/* Wheel sectors */}
        {numbers.map((num, index) => {
          const startAngle = (index * sectorAngle - 90) * (Math.PI / 180) // -90 to start at top
          const endAngle = ((index + 1) * sectorAngle - 90) * (Math.PI / 180)

          const x1 = centerX + innerRadius * Math.cos(startAngle)
          const y1 = centerY + innerRadius * Math.sin(startAngle)
          const x2 = centerX + radius * Math.cos(startAngle)
          const y2 = centerY + radius * Math.sin(startAngle)
          const x3 = centerX + radius * Math.cos(endAngle)
          const y3 = centerY + radius * Math.sin(endAngle)
          const x4 = centerX + innerRadius * Math.cos(endAngle)
          const y4 = centerY + innerRadius * Math.sin(endAngle)

          const color = getNumberColor(num)
          const fillColor = color === "red" ? "#dc2626" : color === "black" ? "#1f2937" : "#16a34a"

          // Text position (middle of sector)
          const textAngle = (index * sectorAngle - 90 + sectorAngle / 2) * (Math.PI / 180)
          const textRadius = (innerRadius + radius) / 2
          const textX = centerX + textRadius * Math.cos(textAngle)
          const textY = centerY + textRadius * Math.sin(textAngle)

          return (
            <g key={index}>
              {/* Sector */}
              <path
                d={`M ${x1} ${y1} L ${x2} ${y2} A ${radius} ${radius} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1}`}
                fill={fillColor}
                stroke="#ffffff"
                strokeWidth="1"
              />
              {/* Number */}
              <text
                x={textX}
                y={textY}
                fill="white"
                fontSize="14"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="central"
                transform={`rotate(${index * sectorAngle + sectorAngle / 2}, ${textX}, ${textY})`}
              >
                {num}
              </text>
            </g>
          )
        })}

        {/* Inner circle */}
        <circle cx={centerX} cy={centerY} r={innerRadius} fill="#1f2937" stroke="#374151" strokeWidth="2" />

        {/* Center circle */}
        <circle cx={centerX} cy={centerY} r="20" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      </svg>
    )
  }

  // Génération d'un ID de jeu unique
  const generateGameId = () => {
    return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Simulation d'une transaction blockchain
  const createBlockchainTransaction = async (bets: any, gameId: string) => {
    // Simulation d'un hash de transaction
    const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`

    // Simulation d'un délai de transaction
    await new Promise((resolve) => setTimeout(resolve, 2000))

    return {
      transactionHash: mockTxHash,
      blockNumber: Math.floor(Math.random() * 1000000) + 17000000,
      gasUsed: Math.floor(Math.random() * 100000) + 21000,
      status: "success",
    }
  }

  const placeBet = (betType: string, amount: number) => {
    if (balance >= amount && !isSpinning && !wallet.connected) {
      setBets((prev) => ({
        ...prev,
        [betType]: (prev[betType] || 0) + amount,
      }))
      setBalance((prev) => prev - amount)
    } else if (wallet.connected) {
      // Pour la blockchain, on stocke les bets mais on ne déduit pas encore le balance
      setBets((prev) => ({
        ...prev,
        [betType]: (prev[betType] || 0) + amount,
      }))
    }
  }

  const spin = async () => {
    if (isSpinning || Object.keys(bets).length === 0) return

    setIsSpinning(true)
    const gameId = generateGameId()

    setGameState({
      gameId,
      status: "spinning",
    })

    // Si connecté à la blockchain, créer une transaction
    if (wallet.connected) {
      try {
        const transaction = await createBlockchainTransaction(bets, gameId)
        setGameState((prev) => ({
          ...prev,
          transactionHash: transaction.transactionHash,
          blockNumber: transaction.blockNumber,
        }))
        setLastTransactionHash(transaction.transactionHash)
      } catch (error) {
        console.error("Erreur transaction blockchain:", error)
      }
    }

    // Tirage du numéro gagnant
    const winningNumber = numbers[Math.floor(Math.random() * numbers.length)]
    const winningIndex = numbers.indexOf(winningNumber)

    // Phase 1: Spin animation (multiple rotations for visual effect)
    const spinDuration = 5000 // 5 seconds of spinning
    const spinRotations = 8 + Math.random() * 4 // 8-12 full rotations
    const spinFinalRotation = rotation + spinRotations * 360

    setDuration(spinDuration)
    setRotation(spinFinalRotation)

    // Phase 2: After spinning, position the wheel exactly
    setTimeout(() => {
      // Reset rotation to 0 and calculate exact position for winning number
      const sectorAngle = 360 / 37
      // To put the winning number at the top (0°), we need to rotate by -index * sectorAngle
      const exactRotation = -winningIndex * sectorAngle

      // Apply the exact rotation with no transition (instant positioning)
      setDuration(0)
      setRotation(exactRotation)

      // Small delay to ensure the positioning is applied, then show results
      setTimeout(() => {
        setCurrentNumber(winningNumber)
        setRecentResults((prev) => [winningNumber, ...prev.slice(0, 4)])

        // Calculate winnings
        let totalWin = 0
        const winDetails: any[] = []
        const winningBets: string[] = []

        Object.entries(bets).forEach(([betType, betAmount]) => {
          let multiplier = 0
          let won = false
          let betName = ""

          switch (betType) {
            case `number-${winningNumber}`:
              multiplier = 35
              won = true
              betName = `Number ${winningNumber}`
              break
            case "red":
              if (getNumberColor(winningNumber) === "red") {
                multiplier = 1
                won = true
                betName = "Red"
              }
              break
            case "black":
              if (getNumberColor(winningNumber) === "black") {
                multiplier = 1
                won = true
                betName = "Black"
              }
              break
            case "even":
              if (winningNumber > 0 && winningNumber % 2 === 0) {
                multiplier = 1
                won = true
                betName = "Even"
              }
              break
            case "odd":
              if (winningNumber % 2 === 1) {
                multiplier = 1
                won = true
                betName = "Odd"
              }
              break
            case "low":
              if (winningNumber >= 1 && winningNumber <= 18) {
                multiplier = 1
                won = true
                betName = "1-18"
              }
              break
            case "high":
              if (winningNumber >= 19 && winningNumber <= 36) {
                multiplier = 1
                won = true
                betName = "19-36"
              }
              break
          }

          const winAmount = betAmount * (multiplier + 1)
          totalWin += winAmount

          if (won) {
            winningBets.push(`${betName} (${betAmount} → ${winAmount})`)
          }

          winDetails.push({
            betType,
            betAmount,
            won,
            multiplier,
            winAmount: won ? winAmount : 0,
          })
        })

        // Enregistrer dans l'historique
        const gameRecord = {
          gameId,
          winningNumber,
          bets: { ...bets },
          totalBet: Object.values(bets).reduce((sum, amount) => sum + amount, 0),
          totalWin,
          winDetails,
          timestamp: new Date().toISOString(),
          transactionHash: gameState.transactionHash,
          blockNumber: gameState.blockNumber,
        }

        setGameHistory((prev) => [gameRecord, ...prev.slice(0, 9)])
        setBalance((prev) => prev + totalWin)
        setBets({})
        setIsSpinning(false)

        setGameState({
          gameId: "",
          status: "completed",
        })

        // Show celebration only if player made actual profit
        const totalBet = Object.values(bets).reduce((sum, amount) => sum + amount, 0)
        const profit = totalWin - totalBet

        if (profit > 0) {
          let message = ""
          if (profit > 100) {
            message = "🎉 Big Win!"
          } else if (profit > 50) {
            message = "🔥 Nice Win!"
          } else {
            message = "✨ You Won!"
          }

          setCelebrationData({
            winAmount: profit, // Show profit instead of total win
            winningBets,
            message,
          })
          setShowCelebration(true)

          // Auto-hide celebration after 3 seconds (reduced from 5)
          setTimeout(() => {
            setShowCelebration(false)
          }, 3000)
        }

        // Afficher le modal de transaction si connecté
        if (wallet.connected && gameState.transactionHash) {
          setShowTransactionModal(true)
        }
      }, 100) // Small delay to ensure positioning is applied
    }, spinDuration)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const totalBetAmount = Object.values(bets).reduce((sum, amount) => sum + amount, 0)

  return (
    <div className="pt-24 pb-8 px-4 min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/dashboard')}
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
          <p className="text-sm text-green-400 mt-2">
            Chain ID: {wallet.chainId} | Wallet Balance: {wallet.balance} ELD
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Roulette Wheel */}
          <div className="lg:col-span-2">
            <div className="backdrop-blur-xl bg-black/30 border border-pink-500/30 rounded-3xl p-8">
              <div className="relative w-full max-w-md mx-auto aspect-square mb-8">
                {/* Wheel Container */}
                <div
                  className="w-full h-full"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: `transform ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
                  }}
                >
                  <RouletteWheel />
                </div>

                {/* Static pointer at the top */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
                  <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-white"></div>
                </div>
              </div>

              {/* Game Status */}
              {gameState.status === "spinning" && (
                <div className="text-center mb-4">
                  <div className="text-sm text-yellow-400">Game ID: {gameState.gameId}</div>
                  {gameState.transactionHash && (
                    <div className="text-xs text-gray-400 mt-1">
                      Transaction: {gameState.transactionHash.slice(0, 10)}...
                    </div>
                  )}
                </div>
              )}

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
                    : wallet.connected
                      ? "bg-gradient-to-r from-green-500 to-blue-500 text-white hover:shadow-lg hover:shadow-green-500/25"
                      : "bg-gradient-to-r from-pink-500 to-violet-500 text-white hover:shadow-lg hover:shadow-pink-500/25"
                }`}
              >
                {isSpinning ? "Spinning..." : wallet.connected ? "SPIN (Blockchain)" : "SPIN"}
              </button>
            </div>
          </div>

          {/* Betting Panel */}
          <div className="space-y-6">
            {/* Balance */}
            <div className="backdrop-blur-xl bg-black/20 border border-pink-500/20 rounded-2xl p-6">
              <div className="text-center">
                <div className="text-sm text-gray-400">{wallet.connected ? "Game Balance" : "Balance"}</div>
                <div className="text-2xl font-bold text-white">
                  {balance} {wallet.connected ? "tokens" : "ELD"}
                </div>
                <div className="text-sm text-gray-400 mt-2">
                  Total Bet: {totalBetAmount} {wallet.connected ? "tokens" : "ELD"}
                </div>
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

            {/* Game History */}
            {gameHistory.length > 0 && (
              <div className="backdrop-blur-xl bg-black/20 border border-pink-500/20 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Game History</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {gameHistory.slice(0, 5).map((game, i) => (
                    <div key={i} className="bg-black/30 rounded-lg p-3 text-sm">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                              getNumberColor(game.winningNumber) === "red"
                                ? "bg-red-600"
                                : getNumberColor(game.winningNumber) === "black"
                                  ? "bg-gray-800"
                                  : "bg-green-600"
                            }`}
                          >
                            {game.winningNumber}
                          </div>
                          <div className="text-gray-300">
                            Bet: {game.totalBet} | Win: {game.totalWin}
                          </div>
                        </div>
                        {game.transactionHash && (
                          <button
                            onClick={() => copyToClipboard(game.transactionHash)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      {game.transactionHash && (
                        <div className="text-xs text-gray-500 mt-1 font-mono">
                          {game.transactionHash.slice(0, 20)}...
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Subtle Celebration Modal */}
        {showCelebration && celebrationData && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            {/* Subtle celebration content */}
            <div className="pointer-events-auto bg-gradient-to-r from-green-500/90 to-blue-500/90 backdrop-blur-sm border border-green-400/50 rounded-2xl p-6 max-w-sm w-full mx-4 animate-fade-in">
              <div className="text-center">
                {/* Simple icon */}
                <div className="text-3xl mb-2">🎉</div>

                <h3 className="text-xl font-bold text-white mb-2">{celebrationData.message}</h3>

                <div className="text-2xl font-bold text-yellow-300 mb-3">
                  +{celebrationData.winAmount} {wallet.connected ? "tokens" : "ELD"}
                </div>

                {celebrationData.winningBets.length > 0 && (
                  <div className="space-y-1 mb-4">
                    <p className="text-sm text-gray-200">Winning Bets:</p>
                    {celebrationData.winningBets.slice(0, 2).map((bet, index) => (
                      <div key={index} className="text-xs text-green-200 bg-black/20 rounded px-2 py-1">
                        {bet}
                      </div>
                    ))}
                    {celebrationData.winningBets.length > 2 && (
                      <div className="text-xs text-gray-300">+{celebrationData.winningBets.length - 2} more...</div>
                    )}
                  </div>
                )}

                <button
                  onClick={() => setShowCelebration(false)}
                  className="w-full py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Modal */}
        {showTransactionModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-gray-900 to-purple-900 border border-pink-500/30 rounded-2xl p-8 max-w-md w-full mx-4">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Transaction Confirmed!</h3>
                <p className="text-gray-300 mb-6">Your bet has been recorded on the blockchain</p>

                <div className="space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Transaction:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-mono text-sm">{lastTransactionHash.slice(0, 10)}...</span>
                      <button
                        onClick={() => copyToClipboard(lastTransactionHash)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Block:</span>
                    <span className="text-white">{gameState.blockNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className="text-green-400">Success</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowTransactionModal(false)}
                  className="w-full mt-6 py-3 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}


// typescriptinterface WalletState {
//   connected: boolean
//   address: string | null
//   chainId: number | null
//   balance: string
// }

// interface GameState {
//   gameId: string
//   status: 'waiting' | 'spinning' | 'completed'
//   transactionHash?: string
//   blockNumber?: number
// }
// Fonctions Clés à Remplacer

// connectWallet() : Intégrer avec Web3/ethers.js
// createBlockchainTransaction() : Appel au smart contract
// placeBet() : Validation des fonds sur chain
// spin() : Interaction avec le contrat de roulette