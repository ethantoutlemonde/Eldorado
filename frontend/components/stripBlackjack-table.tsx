"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "./auth-context"
import { useEldBalance } from "@/hooks/use-eld-balance"
import { Sparkles, Frown } from "lucide-react"
import { ethers, parseUnits } from "ethers"
import ELD_ABI from "../abis/erc20.json"
import ELDORADO_ABI from "../abis/eldorado.json"
import { ELDORADO_ADDRESS } from "../constants/addresses"
import { WITHDRAW_CONTRACT_ADDRESS } from "../constants/addresses"
import withdrawAbi from "../abis/withdraw.json"

const suits = ["♠", "♥", "♦", "♣"]
const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]

function shuffle<T>(array: T[]): T[] {
  const a = [...array]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function cardValue(card: string): number {
  const rank = card.slice(1)
  if (rank === "A") return 11
  if (["K", "Q", "J"].includes(rank)) return 10
  return Number.parseInt(rank)
}

function handValue(hand: string[]): number {
  let value = 0
  let aces = 0
  for (const card of hand) {
    const val = cardValue(card)
    value += val
    if (val === 11) aces++
  }
  while (value > 21 && aces) {
    value -= 10
    aces--
  }
  return value
}

interface WalletState {
  connected: boolean
  address: string | null
  chainId: number | null
  balance: string
}

export function BlackjackTable() {
  const router = useRouter()
  const [deck, setDeck] = useState<string[]>([])
  const [player, setPlayer] = useState<string[]>([])
  const [dealer, setDealer] = useState<string[]>([])
  const [revealed, setRevealed] = useState(false)
  const [balance, setBalance] = useState(1000)
  const [bet, setBet] = useState(50)
  const [totalWins, setTotalWins] = useState(0)
  const { user } = useAuth()
  const { balance: eldBalance, refresh: refreshEldBalance } = useEldBalance()
  const [winAmount, setWinAmount] = useState<number | null>(null)


  const [showCelebration, setShowCelebration] = useState(false)
  const [showSadness, setShowSadness] = useState(false)

  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    chainId: null,
    balance: "0",
  })
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [eldoradoContract, setEldoradoContract] = useState<ethers.Contract | null>(null)
  const [eldTokenContract, setEldTokenContract] = useState<ethers.Contract | null>(null)
  const ELD_TOKEN_ADDRESS = "0xae1056bB5fd8EF47f324B39831ca8db14573014f"

  const connectWallet = async () => {
    try {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const prov = new ethers.BrowserProvider((window as any).ethereum)
        await prov.send("eth_requestAccounts", [])
        const sign = await prov.getSigner()
        const addr = await sign.getAddress()
        const { chainId } = await prov.getNetwork()
        const bal = await prov.getBalance(addr)
        setWallet({
          connected: true,
          address: addr,
          chainId: Number(chainId),
          balance: ethers.formatEther(bal),
        })
        setProvider(prov)
        setSigner(sign)
        setEldoradoContract(new ethers.Contract(ELDORADO_ADDRESS, ELDORADO_ABI, sign))
        setEldTokenContract(new ethers.Contract(ELD_TOKEN_ADDRESS, ELD_ABI, sign))
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    const autoConnect = async () => {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          const prov = new ethers.BrowserProvider((window as any).ethereum)
          const sign = await prov.getSigner()
          const { chainId } = await prov.getNetwork()
          const bal = await prov.getBalance(accounts[0])
          setWallet({
            connected: true,
            address: accounts[0],
            chainId: Number(chainId),
            balance: ethers.formatEther(bal),
          })
          setProvider(prov)
          setSigner(sign)
          setEldoradoContract(new ethers.Contract(ELDORADO_ADDRESS, ELDORADO_ABI, sign))
          setEldTokenContract(new ethers.Contract(ELD_TOKEN_ADDRESS, ELD_ABI, sign))
        }
      }
    }
    autoConnect()
  }, [])

  const disconnectWallet = () => {
    setWallet({ connected: false, address: null, chainId: null, balance: "0" })
    setProvider(null)
    setSigner(null)
    setEldoradoContract(null)
    setEldTokenContract(null)
  }

  async function requestTokens(amount: string | number) {
    try {
      const contract = new ethers.Contract(WITHDRAW_CONTRACT_ADDRESS, withdrawAbi.abi, signer);

      const tx = await contract.requestTokens(ethers.parseUnits(amount.toString(), 18));
      console.log("Transaction sent:", tx.hash);

      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt.transactionHash);

      return receipt;
    } catch (error) {
      console.error("Erreur lors de l'appel à requestTokens:", error);
      throw error;
    }
  }

  const recordBet = async (won: boolean) => {
    if (!wallet.connected || !eldoradoContract || !eldTokenContract || !wallet.address) return
    try {
      const rand: bigint = await eldoradoContract.getRandomNumber()
      const guess = won ? rand : 37n
      const amount = parseUnits(bet.toString(), 18)
      const allowance: bigint = await eldTokenContract.allowance(wallet.address, ELDORADO_ADDRESS)
      if (allowance < amount) {
        const approveTx = await eldTokenContract.approve(ELDORADO_ADDRESS, amount)
        await approveTx.wait()
      }
      const tx = await eldoradoContract.placeBet(guess, amount)
      await tx.wait()
      refreshEldBalance()
    } catch (err) {
      console.error(err)
    }
  }

  const redeem = async () => {
    if (!wallet.connected || !eldoradoContract) return
    try {
      const tx = await eldoradoContract.claimWinnings()
      await tx.wait()
      refreshEldBalance()
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`wins_${user.id}_bj`)
      if (stored) {
        const val = Number.parseFloat(stored)
        if (!isNaN(val)) setTotalWins(val)
      }
    }
  }, [user])

  const determineResult = (pv: number, dv: number) => {
    if (pv > 21) return "Dealer wins"
    if (dv > 21) return "Player wins"
    if (pv > dv) return "Player wins"
    if (dv > pv) return "Dealer wins"
    return "Push"
  }

  const handlePayout = (res: string, pv: number) => {
    if (res === "Player wins") {
      let win = bet * 2.2
      if (pv === 21 && player.length === 2) win = bet * 2.5
      const profit = win - bet
      setBalance((b) => b + win)
      setShowCelebration(true)
      setWinAmount(profit)
      setTimeout(() => {
        setShowCelebration(false)
        setWinAmount(null)
      }, 15000)
      if (profit > 0 && user) {
        const prev = Number.parseFloat(localStorage.getItem(`wins_${user.id}_bj`) || "0")
        const newTotal = prev + profit
        localStorage.setItem(`wins_${user.id}_bj`, newTotal.toString())
        setTotalWins(newTotal)
      }
    } else if (res === "Push") {
      setBalance((b) => b + bet)
    } else {
      setShowSadness(true)
      setTimeout(() => setShowSadness(false), 3000)
    }
    recordBet(res === "Player wins")
  }

  const newDeck = () => shuffle(suits.flatMap((s) => ranks.map((r) => s + r)))

  const startGame = async () => {
    if (balance < bet || player.length > 0) return

    if (!wallet.connected || !eldoradoContract || !eldTokenContract || !wallet.address) {
      console.warn("Wallet not connected")
      return
    }

    try {
      const amount = parseUnits(bet.toString(), 18)
      const allowance: bigint = await eldTokenContract.allowance(wallet.address, ELDORADO_ADDRESS)
      if (allowance < amount) {
        const approveTx = await eldTokenContract.approve(ELDORADO_ADDRESS, amount)
        await approveTx.wait()
      }

      const tx = await eldoradoContract.placeBet(0, amount)
      await tx.wait()

      setBalance((b) => b - bet)
      const d = newDeck()
      setDeck(d.slice(4))
      setPlayer([d[0], d[2]])
      setDealer([d[1], d[3]])
      setRevealed(false)
    } catch (err) {
      console.error(err)
    }
  }

  const hit = () => {
    if (revealed) return
    setPlayer((p) => {
      const [c, ...rest] = deck
      setDeck(rest)
      const newHand = [...p, c]
      if (handValue(newHand) > 21) {
        setRevealed(true)
        const res = determineResult(handValue(newHand), handValue(dealer))
        handlePayout(res, handValue(newHand))
      }
      return newHand
    })
  }

  const stand = () => {
    const d = [...dealer]
    let remaining = [...deck]
    while (handValue(d) < 17) {
      const [c, ...rest] = remaining
      d.push(c)
      remaining = rest
    }
    setDealer(d)
    setDeck(remaining)
    setRevealed(true)
    const res = determineResult(handValue(player), handValue(d))
    handlePayout(res, handValue(player))
  }

  const reset = () => {
    setPlayer([])
    setDealer([])
    setDeck([])
    setRevealed(false)
  }

  const playerValue = handValue(player)
  const dealerValue = revealed ? handValue(dealer) : cardValue(dealer[0] || "0")
  const result = () => {
    if (!revealed) return ""
    if (playerValue > 21) return "Dealer wins"
    if (dealerValue > 21) return "Player wins"
    if (playerValue > dealerValue) return "Player wins"
    if (dealerValue > playerValue) return "Dealer wins"
    return "Push"
  }

  const Card = ({ card, hidden = false }: { card: string; hidden?: boolean }) => {
    if (hidden) {
      return (
        <div className="relative w-20 h-28 sm:w-24 sm:h-32 bg-gradient-to-br from-green-900 to-green-900 rounded-lg shadow-lg border border-green-400/30 flex items-center justify-center transform hover:scale-105 transition-transform">
          <div className="text-4xl">🂠</div>
        </div>
      )
    }

    const suit = card[0]
    const rank = card.slice(1)
    const isRed = suit === "♥" || suit === "♦"

    return (
      <div className="relative w-20 h-28 sm:w-24 sm:h-32 bg-white rounded-lg shadow-lg border border-gray-200 transform hover:scale-105 transition-transform">
        {/* Top left corner */}
        <div className={`absolute top-1 left-1 text-xs sm:text-sm font-bold ${isRed ? "text-red-500" : "text-black"}`}>
          <div>{rank}</div>
          <div className="text-lg leading-none">{suit}</div>
        </div>

        {/* Center logo */}
        <div
          className={`absolute inset-0 flex items-center justify-center text-4xl sm:text-5xl ${isRed ? "text-red-500" : "text-black"}`}
        >
          {suit}
        </div>

        {/* Bottom right corner (rotated) */}
        <div
          className={`absolute bottom-1 right-1 text-xs sm:text-sm font-bold transform rotate-180 ${isRed ? "text-red-500" : "text-black"}`}
        >
          <div>{rank}</div>
          <div className="text-lg leading-none">{suit}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-8 px-4 relative">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Title and Stats */}
        <div className="text-center mb-12">
          <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-green-400 via-green-400 to-black bg-clip-text text-transparent mb-6">
            Blackjack
          </h1>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-8 text-gray-200">
            <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
              <span className="text-sm text-gray-400">ELD Balance:</span>
              <span className="ml-2 font-bold text-green-400">{eldBalance.toLocaleString()} ELD</span>
            </div>
          <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
            <span className="text-sm text-gray-400">Total Wins:</span>
            <span className="ml-2 font-bold text-yellow-400">${totalWins}</span>
          </div>
        </div>
        <div className="mt-4 flex justify-center space-x-4">
          {wallet.connected ? (
            <>
            </>
          ) : (
            <button
              onClick={connectWallet}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>

        {/* Game Area */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 sm:p-8">
        {/* Celebration Animation */}
          {showCelebration && (
            <div className="relative bg-gradient-to-br from-green-300 via-green-400 to-violet-500 text-white rounded-2xl px-10 py-8 shadow-2xl border-4 border-green-200 animate-bounce-slow pointer-events-auto">
              <div className="text-4xl sm:text-5xl font-extrabold text-center mb-4 drop-shadow-lg">
                You Win!
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-center text-green-800 mb-6 animate-pulse">
                +{winAmount} ELD
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => requestTokens(winAmount)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-lg px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 active:scale-95"
                >
                  Redeem My Tokens
                </button>
              </div>
            </div>
          )}

          {/* Sadness Animation */}
          {showSadness && (
            <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
              <Frown className="absolute animate-pulse text-blue-400 w-12 h-12" />
              <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 text-2xl font-bold text-blue-400 animate-pulse">
                Better luck next time!
              </div>
            </div>
          )}


          {player.length === 0 ? (
            <div className="text-center space-y-8">
              {/* Betting Controls */}
              <div className="flex flex-col items-center space-y-4">
                <div className="text-gray-300 text-lg font-medium">Place Your Bet</div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setBet((b) => Math.max(10, b - 10))}
                    className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-green-500 text-white font-bold hover:from-green-600 hover:to-green-600 transition-all transform hover:scale-105 active:scale-95"
                  >
                    -10
                  </button>
                  <div className="px-6 py-3 bg-white/10 rounded-xl border border-white/20 backdrop-blur-sm">
                    <span className="text-2xl font-bold text-white">${bet}</span>
                  </div>
                  <button
                    onClick={() => setBet((b) => b + 10)}
                    className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-green-500 text-white font-bold hover:from-green-600 hover:to-green-600 transition-all transform hover:scale-105 active:scale-95"
                  >
                    +10
                  </button>
                </div>
              </div>

              <button
                onClick={startGame}
                disabled={balance < bet}
                className="px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-green-500 via-green-500 to-green-500 hover:from-green-600 hover:via-green-600 hover:to-green-600 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                Deal Cards
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Current Bet and Balance */}
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 text-gray-200">
                <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                  <span className="text-sm text-gray-400">Current Bet:</span>
                  <span className="ml-2 font-bold text-orange-400">${bet}</span>
                </div>
                <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                  <span className="text-sm text-gray-400">ELD Balance:</span>
                  <span className="ml-2 font-bold text-green-400">{eldBalance.toLocaleString()} ELD</span>
                </div>
              </div>

              {/* Dealer's Hand */}
              <div className="text-center space-y-4">
                <div className="text-gray-300 text-lg font-medium">Dealer</div>
                <div className="flex justify-center space-x-2 sm:space-x-3">
                  {dealer.map((card, i) => (
                    <Card key={i} card={card} hidden={!revealed && i === 1} />
                  ))}
                </div>
                <div className="text-xl font-bold text-gray-200">
                  {revealed ? `Total: ${dealerValue}` : `Showing: ${cardValue(dealer[0] || "")}`}
                </div>
              </div>

              {/* Player's Hand */}
              <div className="text-center space-y-4">
                <div className="text-gray-300 text-lg font-medium">Your Hand</div>
                <div className="flex justify-center space-x-2 sm:space-x-3">
                  {player.map((card, i) => (
                    <Card key={i} card={card} />
                  ))}
                </div>
                <div className="text-xl font-bold text-white">Total: {playerValue}</div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
                {!revealed && (
                  <>
                    <button
                      className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                      onClick={hit}
                    >
                      Hit
                    </button>
                    <button
                      className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                      onClick={stand}
                    >
                      Stand
                    </button>
                  </>
                )}
                {revealed && (
                  <button
                    className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-green-500 to-green-500 hover:from-green-600 hover:to-green-600 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                    onClick={reset}
                  >
                    New Game
                  </button>
                )}
              </div>

              {/* Game Result */}
              {revealed && (
                <div className="text-center pt-4">
                  <div
                    className={`text-2xl sm:text-3xl font-bold animate-pulse ${
                      result() === "Player wins"
                        ? "text-green-400"
                        : result() === "Push"
                          ? "text-yellow-400"
                          : "text-red-400"
                    }`}
                  >
                    {result()}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
