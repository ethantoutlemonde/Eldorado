"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Play, Volume2, VolumeX, Plus, Minus, Settings, HelpCircle, Award, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useAuth } from "./auth-context"
import { useEldBalance } from "@/hooks/use-eld-balance"
import { ethers, parseUnits } from "ethers"
import ELD_ABI from "../abis/erc20.json"
import ELDORADO_ABI from "../abis/eldorado.json"
import { ELDORADO_ADDRESS, WITHDRAW_CONTRACT_ADDRESS } from "../constants/addresses"
import withdrawAbi from "../abis/withdraw.json"

export function SlotMachine() {
  const router = useRouter()
  const { user } = useAuth()
  // Game state
  const [reels, setReels] = useState([0, 0, 0])
  const [visibleSymbols, setVisibleSymbols] = useState([
    [0, 1, 2], // First reel: 3 visible symbols (top, middle, bottom)
    [0, 1, 2], // Second reel
    [0, 1, 2], // Third reel
  ])
  const [isSpinning, setIsSpinning] = useState(false)
  const [spinSpeed, setSpinSpeed] = useState(1)
  const [balance, setBalance] = useState(10000)
  const [bet, setBet] = useState(50)
  const [betLevel, setBetLevel] = useState(1)
  const [lastWin, setLastWin] = useState(0)
  const [totalWin, setTotalWin] = useState(0)
  const [muted, setMuted] = useState(false)
  const [jackpot, setJackpot] = useState(25000)
  const [showPaytable, setShowPaytable] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [autoSpin, setAutoSpin] = useState(false)
  const [autoSpinCount, setAutoSpinCount] = useState(0)
  const [winLines, setWinLines] = useState<number[]>([])
  const [showWinAnimation, setShowWinAnimation] = useState(false)
  const [freeSpins, setFreeSpins] = useState(0)
  const [multiplier, setMultiplier] = useState(1)
  const [theme, setTheme] = useState<"luxury" | "neon" | "classic">("luxury")
  const { balance: eldBalance, refresh: refreshEldBalance } = useEldBalance()

  interface WalletState {
    connected: boolean
    address: string | null
    chainId: number | null
    balance: string
  }

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

  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`wins_${user.id}`)
      if (stored) {
        const val = parseFloat(stored)
        if (!isNaN(val)) setTotalWin(val)
      }
    }
  }, [user])

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
      const contract = new ethers.Contract(WITHDRAW_CONTRACT_ADDRESS, withdrawAbi.abi, signer)
      const tx = await contract.requestTokens(ethers.parseUnits(amount.toString(), 18))
      const receipt = await tx.wait()
      return receipt
    } catch (error) {
      console.error("Erreur lors de l'appel à requestTokens:", error)
      throw error
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

  // References for animations
  const machineRef = useRef<HTMLDivElement>(null)
  const reelRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)]
  const spinButtonRef = useRef<HTMLButtonElement>(null)
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({})

  // All possible symbols
  const symbols = ["💎", "7️⃣", "🔔", "⭐", "🍇", "🍊", "🍋", "🍒", "🎰", "🃏", "🎲", "💰", "👑", "🏆", "💍", "🔥"]

  // Symbol values (higher index = higher value)
  const symbolValues = [15, 12, 10, 8, 6, 5, 4, 3, 8, 7, 6, 10, 9, 8, 7, 9]

  // Paylines (center, top, bottom, diagonal down, diagonal up)
  const paylines = [
    [1, 1, 1], // Middle line
    [0, 0, 0], // Top line
    [2, 2, 2], // Bottom line
    [0, 1, 2], // Diagonal top-left to bottom-right
    [2, 1, 0], // Diagonal bottom-left to top-right
  ]

  // Theme configurations
  const themes = {
    luxury: {
      bgGradient: "from-gray-900 via-purple-900 to-black",
      accentColor: "pink",
      secondaryColor: "purple",
      borderStyle: "border-pink-500/30",
      titleGradient: "from-pink-400 via-purple-300 to-violet-500",
    },
    neon: {
      bgGradient: "from-gray-900 via-blue-900 to-black",
      accentColor: "blue",
      secondaryColor: "blue",
      borderStyle: "border-blue-500/30",
      titleGradient: "from-blue-400 via-gray-300 to-blue-500",
    },
    classic: {
      bgGradient: "from-gray-900 via-green-900 to-black",
      accentColor: "green",
      secondaryColor: "green",
      borderStyle: "border-green-500/30",
      titleGradient: "from-green-400 via-gray-300 to-green-500",
    },
  }

  const currentTheme = themes[theme]

  // Initialize audio elements
  useEffect(() => {
    audioRefs.current = {
      spin: null,
      reelStop: null,
      win: null,
      bigWin: null,
      jackpot: null,
      button: null,
    }

    // Audio would be initialized here in a real implementation
  }, [])

  // Increase jackpot over time
  useEffect(() => {
    const timer = setInterval(() => {
      setJackpot((prev) => prev + Math.floor(Math.random() * 5) + 1)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  // Handle auto spin
  useEffect(() => {
    if (autoSpin && autoSpinCount > 0 && !isSpinning && balance >= bet) {
      const timer = setTimeout(() => {
        spin()
        setAutoSpinCount((prev) => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (autoSpinCount === 0) {
      setAutoSpin(false)
    }
  }, [autoSpin, autoSpinCount, isSpinning, balance, bet])

  // Handle free spins
  useEffect(() => {
    if (freeSpins > 0 && !isSpinning) {
      const timer = setTimeout(() => {
        spinFree()
        setFreeSpins((prev) => prev - 1)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [freeSpins, isSpinning])

  const playSound = (sound: string) => {
    if (muted || !audioRefs.current[sound]) return

    try {
      const audio = audioRefs.current[sound]
      if (audio) {
        audio.currentTime = 0
        audio.play()
      }
    } catch (error) {
      console.error("Error playing sound:", error)
    }
  }

  const generateReelSymbols = (reelIndex: number) => {
    // Create a weighted distribution of symbols based on reel position
    // First reel has more low-value symbols, last reel has more high-value symbols
    const reelSymbols = []
    const reelBias = reelIndex * 2 // Bias increases with each reel

    for (let i = 0; i < 3; i++) {
      // Generate a random symbol with bias
      let symbolIndex
      if (Math.random() < 0.7) {
        // 70% chance of lower value symbols
        symbolIndex = Math.floor(Math.random() * (symbols.length - reelBias))
      } else {
        // 30% chance of higher value symbols
        symbolIndex = Math.floor(Math.random() * symbols.length)
      }

      reelSymbols.push(symbolIndex % symbols.length)
    }

    return reelSymbols
  }

  const animateReel = (reelIndex: number, duration: number) => {
    if (!reelRefs[reelIndex].current) return

    const reel = reelRefs[reelIndex].current!
    const symbolHeight = 80 // Height of each symbol in pixels
    const totalSymbols = symbols.length
    const totalHeight = symbolHeight * totalSymbols

    // Create a sequence of symbols that will appear during the spin
    const spinSymbols = []
    for (let i = 0; i < 30; i++) {
      // Generate 30 random symbols for the spin animation
      spinSymbols.push(Math.floor(Math.random() * symbols.length))
    }

    // Create animation
    const startTime = performance.now()
    const initialOffset = reelIndex * 100 // Stagger start positions
    let lastUpdateTime = startTime
    let currentSymbolIndex = 0

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const timeSinceLastUpdate = currentTime - lastUpdateTime

      if (elapsed < duration) {
        // Update visible symbols every 100ms during the spin
        if (timeSinceLastUpdate > 100 / spinSpeed) {
          lastUpdateTime = currentTime

          // Update the visible symbols for this reel
          setVisibleSymbols((prev) => {
            const newVisibleSymbols = [...prev]
            newVisibleSymbols[reelIndex] = [
              spinSymbols[currentSymbolIndex % spinSymbols.length],
              spinSymbols[(currentSymbolIndex + 1) % spinSymbols.length],
              spinSymbols[(currentSymbolIndex + 2) % spinSymbols.length],
            ]
            return newVisibleSymbols
          })

          currentSymbolIndex++
        }

        // Calculate rotation based on time
        // Accelerate at start, decelerate at end
        const progress = elapsed / duration
        const speed =
          progress < 0.2
            ? progress * 5 // Accelerate
            : progress > 0.8
              ? (1 - progress) * 5 // Decelerate
              : 1 // Constant speed

        // Apply a bouncing effect at the end
        const bounce = progress > 0.9 ? Math.sin((progress - 0.9) * 10 * Math.PI) * 5 : 0

        // Apply the transform
        reel.style.transform = `translateY(${bounce}px)`

        requestAnimationFrame(animate)
      } else {
        // Final position - set the final symbols
        const finalSymbols = generateReelSymbols(reelIndex)

        setVisibleSymbols((prev) => {
          const newVisibleSymbols = [...prev]
          newVisibleSymbols[reelIndex] = finalSymbols
          return newVisibleSymbols
        })

        // Update the center symbol in the reels state
        setReels((prev) => {
          const newReels = [...prev]
          newReels[reelIndex] = finalSymbols[1] // Center symbol
          return newReels
        })

        // Apply a small bounce at the end
        reel.style.transform = `translateY(0)`
      }
    }

    requestAnimationFrame(animate)
  }

  const spinFree = () => {
    // Same as spin but doesn't deduct bet
    if (isSpinning) return

    setIsSpinning(true)
    setLastWin(0)
    setWinLines([])

    playSound("spin")

    // Shake the machine slightly
    if (machineRef.current) {
      machineRef.current.classList.add("animate-shake")
      setTimeout(() => {
        if (machineRef.current) machineRef.current.classList.remove("animate-shake")
      }, 500)
    }

    // Spin durations for each reel (staggered)
    const spinDurations = [2000 / spinSpeed, 2500 / spinSpeed, 3000 / spinSpeed]

    // Start animations
    reels.forEach((_, index) => {
      animateReel(index, spinDurations[index])

      // Stop each reel after its duration
      setTimeout(() => {
        // Play stop sound
        playSound("reelStop")

        // Check if this is the last reel
        if (index === 2) {
          setTimeout(() => {
            checkWin(true) // Check win with free spin multiplier
          }, 500)
        }
      }, spinDurations[index])
    })
  }

  const spin = async () => {
    if (isSpinning || balance < bet) return

    if (!wallet.connected || !signer || !eldoradoContract || !eldTokenContract || !wallet.address) {
      // Prompt the user to connect their wallet before spinning
      await connectWallet()
      if (!wallet.connected) return
    }

    try {
      const amount = parseUnits(bet.toString(), 18)
      const allowance: bigint = await eldTokenContract!.allowance(wallet.address!, ELDORADO_ADDRESS)
      if (allowance < amount) {
        const approveTx = await eldTokenContract!.approve(ELDORADO_ADDRESS, amount)
        await approveTx.wait()
      }
      const tx = await eldoradoContract!.placeBet(0, amount)
      await tx.wait()
    } catch (err) {
      console.error(err)
      return
    }

    // Button press animation
    if (spinButtonRef.current) {
      spinButtonRef.current.classList.add("scale-95")
      setTimeout(() => {
        if (spinButtonRef.current) spinButtonRef.current.classList.remove("scale-95")
      }, 150)
    }

    setIsSpinning(true)
    setBalance((prev) => prev - bet)
    setLastWin(0)
    setWinLines([])

    playSound("spin")

    // Shake the machine slightly
    if (machineRef.current) {
      machineRef.current.classList.add("animate-shake")
      setTimeout(() => {
        if (machineRef.current) machineRef.current.classList.remove("animate-shake")
      }, 500)
    }

    // Spin durations for each reel (staggered)
    const spinDurations = [2000 / spinSpeed, 2500 / spinSpeed, 3000 / spinSpeed]

    // Start animations
    reels.forEach((_, index) => {
      animateReel(index, spinDurations[index])

      // Stop each reel after its duration
      setTimeout(() => {
        // Play stop sound
        playSound("reelStop")

        // Check if this is the last reel
        if (index === 2) {
          setTimeout(() => {
            checkWin()
          }, 500)
        }
      }, spinDurations[index])
    })
  }

  const checkWin = async (isFreeSpin = false) => {
    // Get visible symbols for all reels
    const currentVisibleSymbols = [...visibleSymbols]
    const winningLines: number[] = []
    let totalWinAmount = 0
    const currentMultiplier = isFreeSpin ? multiplier : 1

    // Check each payline
    paylines.forEach((payline, lineIndex) => {
      const lineSymbols = [
        currentVisibleSymbols[0][payline[0]],
        currentVisibleSymbols[1][payline[1]],
        currentVisibleSymbols[2][payline[2]],
      ]

      // Check for 3 of a kind
      if (lineSymbols[0] === lineSymbols[1] && lineSymbols[1] === lineSymbols[2]) {
        winningLines.push(lineIndex)
        const symbolValue = symbolValues[lineSymbols[0]]

        // Special case for jackpot symbol (index 1 is 7️⃣)
        if (lineSymbols[0] === 1) {
          totalWinAmount += jackpot
          playSound("jackpot")
          setJackpot(25000) // Reset jackpot
        } else {
          const winAmount = bet * symbolValue * betLevel * currentMultiplier
          totalWinAmount += winAmount
        }
      }
      // Check for 2 of a kind (first two or last two)
      else if (lineSymbols[0] === lineSymbols[1] || lineSymbols[1] === lineSymbols[2]) {
        winningLines.push(lineIndex)
        const symbolValue =
          lineSymbols[0] === lineSymbols[1] ? symbolValues[lineSymbols[0]] : symbolValues[lineSymbols[1]]
        const winAmount = bet * 0.5 * symbolValue * betLevel * currentMultiplier
        totalWinAmount += winAmount
      }
    })

    // Check for scatter symbols (🎲 at index 10) - award free spins
    const scatterCount = currentVisibleSymbols.flat().filter((s) => s === 10).length
    if (scatterCount >= 3) {
      const newFreeSpins = scatterCount * 3
      setFreeSpins((prev) => prev + newFreeSpins)
      setMultiplier(scatterCount === 5 ? 3 : scatterCount === 4 ? 2 : 1)
    }

    // Update win state
    if (totalWinAmount > 0) {
      setLastWin(totalWinAmount)
      setTotalWin((prev) => {
        const newTotal = prev + totalWinAmount
        if (user) {
          localStorage.setItem(`wins_${user.id}`, newTotal.toString())
        }
        return newTotal
      })
      setBalance((prev) => prev + totalWinAmount)
      setWinLines(winningLines)
      setShowWinAnimation(true)

      if (wallet.connected) {
        recordBet(true)
        try {
          if (eldoradoContract) {
            const currentBet: bigint = await eldoradoContract.bets(wallet.address)
            if (currentBet > 0n) {
              const onChainWin = await eldoradoContract.checkVictory(wallet.address)
              if (onChainWin) {
                const claimTx = await eldoradoContract.claimWinnings()
                await claimTx.wait()
                refreshEldBalance()
              }
            }
          }
        } catch (err) {
          console.error(err)
        }
      }

      if (totalWinAmount >= bet * 10) {
        playSound("bigWin")
      } else {
        playSound("win")
      }

      // Hide win animation after a delay
      setTimeout(() => {
        setShowWinAnimation(false)
      }, 3000)
    } else {
      playSound("lose")
      if (wallet.connected) recordBet(false)
    }

    setIsSpinning(false)
  }

  const increaseBet = () => {
    if (isSpinning) return
    const betOptions = [10, 25, 50, 100, 250, 500]
    const currentIndex = betOptions.indexOf(bet)
    if (currentIndex < betOptions.length - 1) {
      setBet(betOptions[currentIndex + 1])
      playSound("button")
    }
  }

  const decreaseBet = () => {
    if (isSpinning) return
    const betOptions = [10, 25, 50, 100, 250, 500]
    const currentIndex = betOptions.indexOf(bet)
    if (currentIndex > 0) {
      setBet(betOptions[currentIndex - 1])
      playSound("button")
    }
  }

  const increaseBetLevel = () => {
    if (isSpinning) return
    if (betLevel < 5) {
      setBetLevel((prev) => prev + 1)
      playSound("button")
    }
  }

  const decreaseBetLevel = () => {
    if (isSpinning) return
    if (betLevel > 1) {
      setBetLevel((prev) => prev - 1)
      playSound("button")
    }
  }

  const startAutoSpin = (spins: number) => {
    if (isSpinning) return
    setAutoSpin(true)
    setAutoSpinCount(spins)
    setShowSettings(false)
  }

  const stopAutoSpin = () => {
    setAutoSpin(false)
    setAutoSpinCount(0)
  }

  const changeTheme = (newTheme: "luxury" | "neon" | "classic") => {
    setTheme(newTheme)
    setShowSettings(false)
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme.bgGradient} p-4 md:p-8`}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden md:inline">Back to Lobby</span>
          </button>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-gray-300 hover:text-white transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button onClick={() => setMuted(!muted)} className="text-gray-300 hover:text-white transition-colors">
              {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="mt-16 text-center mb-6">
          <h1
            className={`text-4xl md:text-6xl font-bold bg-gradient-to-r ${currentTheme.titleGradient} bg-clip-text text-transparent mb-2`}
          >
            Neon Slots
          </h1>
          <div className="flex items-center justify-center space-x-2">
            <div
              className={`h-px bg-gradient-to-r from-transparent via-${currentTheme.accentColor}-500 to-transparent flex-grow`}
            ></div>
            <p className="text-gray-300 px-2 flex items-center">
              <Sparkles className={`w-4 h-4 ml-1 text-${currentTheme.accentColor}-400`} />
              First decentralized slot machine
              <Sparkles className={`w-4 h-4 ml-1 text-${currentTheme.accentColor}-400`} />
            </p>
            <div
              className={`h-px bg-gradient-to-r from-transparent via-${currentTheme.accentColor}-500 to-transparent flex-grow`}
            ></div>
          </div>
        </div>

        {/* Jackpot and Free Spins Display */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6">
          {/* <div
            className={`backdrop-blur-sm bg-black/30 border border-pink-500/30 rounded-full px-6 py-2 flex items-center`}
          >
            <Award className="w-5 h-5 mr-2 text-pink-400" />
            <div>
              <div className="text-sm text-pink-500">MEGA JACKPOT</div>
              <div className="text-2xl font-bold text-pink-400">{jackpot.toLocaleString()} ELD</div>
            </div>
          </div> */}

          {freeSpins > 0 && (
            <div
              className={`backdrop-blur-sm bg-black/30 border border-green-500/30 rounded-full px-6 py-2 animate-pulse`}
            >
              <div className="text-sm text-green-500">FREE SPINS</div>
              <div className="text-2xl font-bold text-green-400">
                {freeSpins} x{multiplier}
              </div>
            </div>
          )}
        </div>

        {/* Settings Panel */}
<AnimatePresence>
  {showSettings && (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "backdrop-blur-xl bg-black/70 border rounded-2xl shadow-2xl transition-all duration-300",
        currentTheme.borderStyle,
        "p-6 md:p-8 space-y-6 mb-6"
      )}
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold tracking-wide text-white">🎛️ Game Settings</h3>
        <button
          onClick={() => setShowSettings(false)}
          className="text-gray-400 hover:text-white transition duration-200"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Auto Spin */}
        <div>
          <h4 className="text-lg font-semibold text-gray-200 mb-3">Auto Spin</h4>
          <div className="flex flex-wrap gap-3">
            {[5, 10, 25, 50, 100].map((count) => (
              <button
                key={count}
                onClick={() => startAutoSpin(count)}
                className={cn(
                  "px-4 py-1.5 rounded-md border text-white font-semibold text-sm tracking-wide shadow",
                  `border-${currentTheme.accentColor}-500/30 hover:bg-${currentTheme.accentColor}-900/50`,
                  "bg-black/40 transition-all duration-200"
                )}
              >
                {count} Spins
              </button>
            ))}
          </div>
        </div>

        {/* Spin Speed */}
        <div>
          <h4 className="text-lg font-semibold text-gray-200 mb-3">Spin Speed</h4>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSpinSpeed(Math.max(0.5, spinSpeed - 0.5))}
              disabled={spinSpeed <= 0.5}
              className={cn(
                "px-3 py-1 rounded-md font-bold text-white text-xl",
                `border border-${currentTheme.accentColor}-500/30 hover:bg-${currentTheme.accentColor}-900/50`,
                "bg-black/40 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              )}
            >
              –
            </button>
            <div className="text-white font-semibold text-lg">{spinSpeed}x</div>
            <button
              onClick={() => setSpinSpeed(Math.min(2, spinSpeed + 0.5))}
              disabled={spinSpeed >= 2}
              className={cn(
                "px-3 py-1 rounded-md font-bold text-white text-xl",
                `border border-${currentTheme.accentColor}-500/30 hover:bg-${currentTheme.accentColor}-900/50`,
                "bg-black/40 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              )}
            >
              +
            </button>
          </div>
        </div>

        {/* Theme Chooser */}
        <div className="md:col-span-2">
          <h4 className="text-lg font-semibold text-gray-200 mb-3">Choose Theme</h4>
          <div className="flex flex-wrap gap-3">
            {theme !== "luxury" && (
              <button
                onClick={() => changeTheme("luxury")}
                className={cn(
                  "px-4 py-2 rounded-md border text-white font-semibold tracking-wide transition-colors",
                  "bg-black/40 border-gray-600 hover:border-pink-400"
                )}
              >
                Neon Pink
              </button>
            )}
            {theme !== "neon" && (
              <button
                onClick={() => changeTheme("neon")}
                className={cn(
                  "px-4 py-2 rounded-md border text-white font-semibold tracking-wide transition-colors",
                  "bg-black/40 border-gray-600 hover:border-cyan-400"
                )}
              >
                Neon Blue
              </button>
            )}
            {theme !== "classic" && (
              <button
                onClick={() => changeTheme("classic")}
                className={cn(
                  "px-4 py-2 rounded-md border text-white font-semibold tracking-wide transition-colors",
                  "bg-black/40 border-gray-600 hover:border-green-400"
                )}
              >
                Neon Green
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )}
</AnimatePresence>


        {/* Slot Machine */}
        <div
          ref={machineRef}
          className={`backdrop-blur-xl bg-black/40 border border-${currentTheme.accentColor}-500/30 rounded-3xl p-4 md:p-8 mb-8 shadow-2xl shadow-${currentTheme.accentColor}-500/10 transition-all duration-300`}
        >
          <div className="relative">
            {/* Machine Frame */}
            <div
              className={`bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-4 md:p-8 border-4 border-${currentTheme.accentColor}-500/50 shadow-2xl shadow-${currentTheme.accentColor}-500/25`}
            >
              {/* Win Lines Indicators */}
              <div className="flex justify-between mb-2">
                {[1, 2, 3, 4, 5].map((line) => (
                  <div
                    key={line}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      winLines.includes(line - 1)
                        ? `bg-${currentTheme.accentColor}-400 text-white animate-pulse`
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {line}
                  </div>
                ))}
              </div>

              {/* Reels Container */}
              <div className="flex justify-center space-x-2 md:space-x-4 mb-6 md:mb-8 relative">
                {/* Payline overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  {winLines.map((lineIndex) => (
                    <div
                      key={lineIndex}
                      className={`absolute inset-0 flex items-center ${
                        lineIndex === 0
                          ? "justify-center"
                          : // Middle
                            lineIndex === 1
                            ? "items-start"
                            : // Top
                              lineIndex === 2
                              ? "items-end"
                              : // Bottom
                                lineIndex === 3
                                ? "items-start justify-start"
                                : // Diagonal down
                                  "items-end justify-start" // Diagonal up
                      }`}
                    >
                      <div
                        className={`h-1 w-full bg-${currentTheme.accentColor}-400 animate-pulse rounded-full opacity-70 ${
                          lineIndex === 3
                            ? "transform rotate-12"
                            : // Diagonal down
                              lineIndex === 4
                              ? "transform -rotate-12"
                              : "" // Diagonal up
                        }`}
                      ></div>
                    </div>
                  ))}
                </div>

                {[0, 1, 2].map((reelIndex) => (
                  <div
                    key={reelIndex}
                    className={`relative w-24 h-[240px] md:w-28 md:h-[280px] bg-gradient-to-b from-black to-gray-900 rounded-xl border-2 border-${currentTheme.accentColor}-500/50 overflow-hidden`}
                  >
                    {/* Glass reflection effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none z-10"></div>

                    {/* Reel symbols container */}
                    <div
                      ref={reelRefs[reelIndex]}
                      className="flex flex-col items-center justify-center h-full transition-all"
                    >
                      {/* Display 3 visible symbols per reel */}
                      {[0, 1, 2].map((position) => (
                        <div
                          key={position}
                          className={cn(
                            "flex items-center justify-center w-full h-1/3 text-4xl md:text-5xl transition-all",
                            winLines.some(
                              (line) =>
                                paylines[line][reelIndex] === position &&
                                visibleSymbols[reelIndex][position] === visibleSymbols[1][paylines[line][1]],
                            ) && "animate-pulse text-yellow-400 scale-110",
                          )}
                        >
                          {symbols[visibleSymbols[reelIndex][position]]}
                        </div>
                      ))}
                    </div>

                    {/* Reel shine effect */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-t from-gray-500/5 to-transparent pointer-events-none`}
                    ></div>

                    {/* Reel separator lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                      <div className="h-px bg-gray-700/50 w-full"></div>
                      <div className="h-px bg-gray-700/50 w-full"></div>
                      <div className="h-px bg-gray-700/50 w-full"></div>
                      <div className="h-px bg-gray-700/50 w-full"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Win Display */}
              <AnimatePresence>
                {showWinAnimation && lastWin > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-center mb-6"
                  >
                    <motion.div
                      initial={{ y: -20 }}
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 0.5, repeat: 5 }}
                      className={`text-3xl md:text-4xl font-bold text-green-400`}
                    >
                      WIN! +{lastWin.toLocaleString()} ELD
                    </motion.div>
                    <div className="mt-4">
                      <Button
                        onClick={() => requestTokens(lastWin)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Redeem My Tokens
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div
                  className={`backdrop-blur-sm bg-black/30 rounded-xl px-4 py-3 border border-${currentTheme.accentColor}-500/20`}
                >
                  <div className="text-sm text-gray-400">ELD Balance</div>
                  <div className="text-xl font-bold text-white">{eldBalance.toLocaleString()} ELD</div>
                  <div className="mt-2">
                    {wallet.connected ? (
                      <Button onClick={disconnectWallet} size="sm" className="w-full bg-red-600 hover:bg-red-700 text-white">
                        Disconnect
                      </Button>
                    ) : (
                      <Button onClick={connectWallet} size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white">
                        Connect Wallet
                      </Button>
                    )}
                  </div>
                </div>

                <div
                  className={`backdrop-blur-sm bg-black/30 rounded-xl px-4 py-3 border border-${currentTheme.accentColor}-500/20`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-400">Bet</div>
                      <div className="flex items-center">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={decreaseBet}
                          disabled={isSpinning || bet <= 10}
                          className={`h-8 w-8 rounded-full bg-black/50 text-white hover:bg-${currentTheme.accentColor}-600/50`}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-md font-bold mx-2 text-gray-600">{bet}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={increaseBet}
                          disabled={isSpinning || bet >= 500}
                          className={`h-8 w-8 rounded-full bg-black/50 text-white hover:bg-${currentTheme.accentColor}-600/50`}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-400">Level</div>
                      <div className="flex items-center">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={decreaseBetLevel}
                          disabled={isSpinning || betLevel <= 1}
                          className={`h-8 w-8 rounded-full bg-black/50 text-white hover:bg-${currentTheme.accentColor}-600/50`}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-md font-bold mx-2 text-gray-600">{betLevel}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={increaseBetLevel}
                          disabled={isSpinning || betLevel >= 5}
                          className={`h-8 w-8 rounded-full bg-black/50 text-white hover:bg-${currentTheme.accentColor}-600/50`}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`backdrop-blur-sm bg-black/30 rounded-xl px-4 py-3 border border-${currentTheme.accentColor}-500/20`}
                >
                  <div className="text-sm text-gray-400">Total Win</div>
                  <div className="text-xl font-bold text-green-400">{totalWin.toLocaleString()} ELD</div>
                </div>
              </div>

              {/* Spin Button */}
              <div className="flex gap-4">
                {autoSpin ? (
                  <button
                    onClick={stopAutoSpin}
                    className={`flex-1 py-4 rounded-xl font-bold text-xl bg-red-600 text-white hover:bg-red-700 transition-all duration-300`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <span>STOP AUTO ({autoSpinCount})</span>
                    </div>
                  </button>
                ) : (
                  <button
                    ref={spinButtonRef}
                    onClick={spin}
                    disabled={isSpinning || balance < bet || freeSpins > 0}
                    className={cn(
                      "flex-1 py-4 rounded-xl font-bold text-xl transition-all duration-300",
                      isSpinning || balance < bet || freeSpins > 0
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : `bg-gradient-to-r from-${currentTheme.accentColor}-500 to-${currentTheme.secondaryColor}-500 text-white hover:shadow-lg hover:shadow-${currentTheme.accentColor}-500/50 active:scale-95`,
                    )}
                  >
                    {isSpinning ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>SPINNING...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Play className="w-6 h-6 fill-white" />
                        <span>SPIN</span>
                      </div>
                    )}
                  </button>
                )}

                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`py-4 px-4 rounded-xl font-bold text-xl bg-black/50 border border-${currentTheme.accentColor}-500/30 text-white hover:bg-${currentTheme.accentColor}-900/50 transition-colors`}
                >
                  <Settings className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Decorative lights */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 flex space-x-4">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-3 h-3 rounded-full",
                    isSpinning
                      ? `bg-${currentTheme.accentColor}-500 animate-ping`
                      : `bg-${currentTheme.accentColor}-500/70 animate-pulse`,
                  )}
                  style={{ animationDelay: `${i * 0.2}s` }}
                ></div>
              ))}
            </div>

            {/* Side lights */}
            <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 flex flex-col space-y-8">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-4 h-4 rounded-full",
                    isSpinning
                      ? `bg-${currentTheme.accentColor}-500 animate-ping`
                      : `bg-${currentTheme.accentColor}-500/70 animate-pulse`,
                  )}
                  style={{ animationDelay: `${i * 0.3}s` }}
                ></div>
              ))}
            </div>
            <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 flex flex-col space-y-8">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-4 h-4 rounded-full",
                    isSpinning
                      ? `bg-${currentTheme.accentColor}-500 animate-ping`
                      : `bg-${currentTheme.accentColor}-500/70 animate-pulse`,
                  )}
                  style={{ animationDelay: `${i * 0.3 + 0.15}s` }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Paytable Toggle */}
        <div className="text-center mb-4">
          <button
            onClick={() => setShowPaytable(!showPaytable)}
            className={`text-gray-300 hover:text-white transition-colors flex items-center justify-center mx-auto`}
          >
            <HelpCircle className="w-4 h-4 mr-1" />
            {showPaytable ? "Hide Paytable" : "Show Paytable"}
          </button>
        </div>

        {/* Paytable */}
        <AnimatePresence>
          {showPaytable && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`backdrop-blur-xl bg-black/20 border border-${currentTheme.accentColor}-500/20 rounded-2xl p-6 transition-all duration-300 overflow-hidden`}
            >
              <h3 className="text-xl font-bold text-white mb-4">Paytable</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div
                  className={`text-center backdrop-blur-sm bg-black/30 rounded-lg p-3 border border-${currentTheme.accentColor}-500/10`}
                >
                  <div className="text-2xl mb-2">7️⃣7️⃣7️⃣</div>
                  <div className="text-sm text-yellow-400">JACKPOT</div>
                </div>
                <div
                  className={`text-center backdrop-blur-sm bg-black/30 rounded-lg p-3 border border-${currentTheme.accentColor}-500/10`}
                >
                  <div className="text-2xl mb-2">💎💎💎</div>
                  <div className="text-sm text-gray-400">15x Bet</div>
                </div>
                <div
                  className={`text-center backdrop-blur-sm bg-black/30 rounded-lg p-3 border border-${currentTheme.accentColor}-500/10`}
                >
                  <div className="text-2xl mb-2">🔔🔔🔔</div>
                  <div className="text-sm text-gray-400">10x Bet</div>
                </div>
                <div
                  className={`text-center backdrop-blur-sm bg-black/30 rounded-lg p-3 border border-${currentTheme.accentColor}-500/10`}
                >
                  <div className="text-2xl mb-2">⭐⭐⭐</div>
                  <div className="text-sm text-gray-400">8x Bet</div>
                </div>
                <div
                  className={`text-center backdrop-blur-sm bg-black/30 rounded-lg p-3 border border-${currentTheme.accentColor}-500/10`}
                >
                  <div className="text-2xl mb-2">🍇🍇🍇</div>
                  <div className="text-sm text-gray-400">6x Bet</div>
                </div>
                <div
                  className={`text-center backdrop-blur-sm bg-black/30 rounded-lg p-3 border border-${currentTheme.accentColor}-500/10`}
                >
                  <div className="text-2xl mb-2">🍊🍊🍊</div>
                  <div className="text-sm text-gray-400">5x Bet</div>
                </div>
                <div
                  className={`text-center backdrop-blur-sm bg-black/30 rounded-lg p-3 border border-${currentTheme.accentColor}-500/10`}
                >
                  <div className="text-2xl mb-2">🍋🍋🍋</div>
                  <div className="text-sm text-gray-400">4x Bet</div>
                </div>
                <div
                  className={`text-center backdrop-blur-sm bg-black/30 rounded-lg p-3 border border-${currentTheme.accentColor}-500/10`}
                >
                  <div className="text-2xl mb-2">🍒🍒🍒</div>
                  <div className="text-sm text-gray-400">3x Bet</div>
                </div>
                <div
                  className={`text-center backdrop-blur-sm bg-black/30 rounded-lg p-3 border border-${currentTheme.accentColor}-500/10 col-span-2`}
                >
                  <div className="text-xl mb-2">Any Pair</div>
                  <div className="text-sm text-gray-400">0.5x Symbol Value</div>
                </div>
                <div
                  className={`text-center backdrop-blur-sm bg-black/30 rounded-lg p-3 border border-${currentTheme.accentColor}-500/10 col-span-2`}
                >
                  <div className="text-xl mb-2">🎲🎲🎲 Scatter</div>
                  <div className="text-sm text-green-400">9 Free Spins</div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-lg font-semibold text-white mb-2">Paylines</h4>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {paylines.map((payline, index) => (
                    <div
                      key={index}
                      className={`backdrop-blur-sm bg-black/30 rounded-lg p-3 border border-${currentTheme.accentColor}-500/10`}
                    >
                      <div className="text-center text-sm text-gray-400 mb-1">Line {index + 1}</div>
                      <div className="grid grid-cols-3 gap-1">
                        {[0, 1, 2].map((row) => (
                          <div
                            key={row}
                            className={`h-6 flex items-center justify-center ${
                              payline.includes(row) ? `bg-${currentTheme.accentColor}-900/50` : "bg-black/50"
                            } ${payline[0] === row ? "rounded-l-md" : ""} ${payline[2] === row ? "rounded-r-md" : ""}`}
                          >
                            {payline.includes(row) && (
                              <div className={`w-2 h-2 rounded-full bg-${currentTheme.accentColor}-500`}></div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
