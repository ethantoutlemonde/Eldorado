"use client"

import { useState } from "react"
import { ArrowLeft, ArrowUpDown, Settings, Info } from "lucide-react"

interface TokenSwapProps {
  onBack: () => void
}

export function TokenSwap({ onBack }: TokenSwapProps) {
  const [fromToken, setFromToken] = useState("ETH")
  const [toToken, setToToken] = useState("ELDORADO")
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [slippage, setSlippage] = useState(0.5)
  const [isSwapping, setIsSwapping] = useState(false)


  const EthereumIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 327.5 533.3" className="w-6 h-6">
    <path fill="#8A92B2" d="M163.7,197.2V0L0,271.6L163.7,197.2z"/>
    <path fill="#62688F" d="M163.7,368.4V197.2L0,271.6L163.7,368.4z M163.7,197.2l163.7,74.4L163.7,0V197.2z"/>
    <path fill="#454A75" d="M163.7,197.2v171.2l163.7-96.8L163.7,197.2z"/>
    <path fill="#8A92B2" d="M163.7,399.4L0,302.7l163.7,230.7V399.4z"/>
    <path fill="#62688F" d="M327.5,302.7l-163.8,96.7v134L327.5,302.7z"/>
  </svg>);

  const UsdcIcon = () => (
    <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 2000 2000"
    width="24"
    height="24"
  >
  <path d="M1000 2000c554.17 0 1000-445.83 1000-1000S1554.17 0 1000 0 0 445.83 0 1000s445.83 1000 1000 1000z" fill="#2775ca"/>
  <path d="M1275 1158.33c0-145.83-87.5-195.83-262.5-216.66-125-16.67-150-50-150-108.34s41.67-95.83 125-95.83c75 0 116.67 25 137.5 87.5 4.17 12.5 16.67 20.83 29.17 20.83h66.66c16.67 0 29.17-12.5 29.17-29.16v-4.17c-16.67-91.67-91.67-162.5-187.5-170.83v-100c0-16.67-12.5-29.17-33.33-33.34h-62.5c-16.67 0-29.17 12.5-33.34 33.34v95.83c-125 16.67-204.16 100-204.16 204.17 0 137.5 83.33 191.66 258.33 212.5 116.67 20.83 154.17 45.83 154.17 112.5s-58.34 112.5-137.5 112.5c-108.34 0-145.84-45.84-158.34-108.34-4.16-16.66-16.66-25-29.16-25h-70.84c-16.66 0-29.16 12.5-29.16 29.17v4.17c16.66 104.16 83.33 179.16 220.83 200v100c0 16.66 12.5 29.16 33.33 33.33h62.5c16.67 0 29.17-12.5 33.34-33.33v-100c125-20.84 208.33-108.34 208.33-220.84z" fill="#fff"/>
  <path d="M787.5 1595.83c-325-116.66-491.67-479.16-370.83-800 62.5-175 200-308.33 370.83-370.83 16.67-8.33 25-20.83 25-41.67V325c0-16.67-8.33-29.17-25-33.33-4.17 0-12.5 0-16.67 4.16-395.83 125-612.5 545.84-487.5 941.67 75 233.33 254.17 412.5 487.5 487.5 16.67 8.33 33.34 0 37.5-16.67 4.17-4.16 4.17-8.33 4.17-16.66v-58.34c0-12.5-12.5-29.16-25-37.5zM1229.17 295.83c-16.67-8.33-33.34 0-37.5 16.67-4.17 4.17-4.17 8.33-4.17 16.67v58.33c0 16.67 12.5 33.33 25 41.67 325 116.66 491.67 479.16 370.83 800-62.5 175-200 308.33-370.83 370.83-16.67 8.33-25 20.83-25 41.67V1700c0 16.67 8.33 29.17 25 33.33 4.17 0 12.5 0 16.67-4.16 395.83-125 612.5-545.84 487.5-941.67-75-237.5-258.34-416.67-487.5-491.67z" fill="#fff"/>
</svg>);

const UsdtIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 339.43 295.27" className="w-6 h-6">
    <path 
      d="M62.15,1.45l-61.89,130a2.52,2.52,0,0,0,.54,2.94L167.95,294.56a2.55,2.55,0,0,0,3.53,0L338.63,134.4a2.52,2.52,0,0,0,.54-2.94l-61.89-130A2.5,2.5,0,0,0,275,0H64.45a2.5,2.5,0,0,0-2.3,1.45h0Z" 
      fill="#50af95" 
      fillRule="evenodd"
    />
    <path 
      d="M191.19,144.8v0c-1.2.09-7.4,0.46-21.23,0.46-11,0-18.81-.33-21.55-0.46v0c-42.51-1.87-74.24-9.27-74.24-18.13s31.73-16.25,74.24-18.15v28.91c2.78,0.2,10.74.67,21.74,0.67,13.2,0,19.81-.55,21-0.66v-28.9c42.42,1.89,74.08,9.29,74.08,18.13s-31.65,16.24-74.08,18.12h0Zm0-39.25V79.68h59.2V40.23H89.21V79.68H148.4v25.86c-48.11,2.21-84.29,11.74-84.29,23.16s36.18,20.94,84.29,23.16v82.9h42.78V151.83c48-2.21,84.12-11.73,84.12-23.14s-36.09-20.93-84.12-23.15h0Zm0,0h0Z" 
      fill="#fff" 
      fillRule="evenodd" 
    />
  </svg>
);

  const tokens = [
    { symbol: "ETH", name: "Ethereum", balance: "12.5847", icon: <EthereumIcon /> },
    { symbol: "ELDORADO", name: "Eldorado Token", balance: "2,450.00", icon: <UsdcIcon /> },
    { symbol: "USDC", name: "USD Coin", balance: "156.23", icon: <UsdcIcon /> },
    { symbol: "USDT", name: "Tether", balance: "89.45", icon: <UsdtIcon /> },
  ]

  const exchangeRate = 195.5 // 1 ETH = 195.5 ELDORADO

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value)
    if (value && !isNaN(Number(value))) {
      if (fromToken === "ETH" && toToken === "ELDORADO") {
        setToAmount((Number(value) * exchangeRate).toFixed(2))
      } else if (fromToken === "ELDORADO" && toToken === "ETH") {
        setToAmount((Number(value) / exchangeRate).toFixed(6))
      }
    } else {
      setToAmount("")
    }
  }

  const handleSwapTokens = () => {
    const tempToken = fromToken
    const tempAmount = fromAmount
    setFromToken(toToken)
    setToToken(tempToken)
    setFromAmount(toAmount)
    setToAmount(tempAmount)
  }

  const handleSwap = async () => {
    if (!fromAmount || !toAmount) return

    setIsSwapping(true)
    // Simulate swap process
    setTimeout(() => {
      setIsSwapping(false)
      setFromAmount("")
      setToAmount("")
    }, 3000)
  }

  const getTokenInfo = (symbol: string) => {
    return tokens.find((token) => token.symbol === symbol)
  }

  return (
    <div className="pt-24 pb-8 px-4">
      <div className="max-w-2xl mx-auto">
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
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent mb-4">
            Token Swap
          </h1>
          <p className="text-gray-300">Exchange tokens instantly with zero fees</p>
        </div>

        {/* Swap Interface */}
        <div className="backdrop-blur-xl bg-black/30 border border-pink-500/30 rounded-3xl p-5 sm:p-8">
          {/* Settings */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-white">Swap Tokens</h2>
            <button className="p-2 bg-pink-500/20 hover:bg-pink-500/30 rounded-lg transition-colors">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />
            </button>
          </div>

          {/* From Token */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-gray-400 text-xs sm:text-sm">From</label>
              <span className="text-gray-400 text-xs sm:text-sm">
                Balance: {getTokenInfo(fromToken)?.balance} {fromToken}
              </span>
            </div>
            <div className="bg-black/30 border border-pink-500/20 rounded-2xl p-3 sm:p-4">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="flex-1">
                  <input
                    type="number"
                    value={fromAmount}
                    onChange={(e) => handleFromAmountChange(e.target.value)}
                    placeholder="0.0"
                    className="w-full bg-transparent text-white text-xl sm:text-2xl font-bold outline-none"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={fromToken}
                    onChange={(e) => setFromToken(e.target.value)}
                    className="bg-pink-500/20 border border-pink-500/30 rounded-xl px-2 py-1 sm:px-4 sm:py-2 text-white text-sm sm:text-base font-semibold outline-none"
                  >
                    {tokens.map((token) => (
                      <option key={token.symbol} value={token.symbol} className="bg-gray-900">
                        {token.symbol}
                      </option>
                    ))}
                  </select>
                  <div className="text-xl sm:text-2xl">{getTokenInfo(fromToken)?.icon}</div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="text-gray-400 text-xs sm:text-sm">{getTokenInfo(fromToken)?.name}</div>
                <button
                  onClick={() => {
                    const balance = getTokenInfo(fromToken)?.balance.replace(",", "") || "0"
                    handleFromAmountChange(balance)
                  }}
                  className="text-pink-400 text-xs sm:text-sm hover:text-pink-300 transition-colors"
                >
                  MAX
                </button>
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center my-4">
            <button
              onClick={handleSwapTokens}
              className="p-2 sm:p-3 bg-pink-500/20 hover:bg-pink-500/30 rounded-full transition-all duration-300 hover:scale-110"
            >
              <ArrowUpDown className="w-5 h-5 sm:w-6 sm:h-6 text-pink-400" />
            </button>
          </div>

          {/* To Token */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="text-gray-400 text-xs sm:text-sm">To</label>
              <span className="text-gray-400 text-xs sm:text-sm">
                Balance: {getTokenInfo(toToken)?.balance} {toToken}
              </span>
            </div>
            <div className="bg-black/30 border border-pink-500/20 rounded-2xl p-3 sm:p-4">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="flex-1">
                  <input
                    type="number"
                    value={toAmount}
                    readOnly
                    placeholder="0.0"
                    className="w-full bg-transparent text-white text-xl sm:text-2xl font-bold outline-none"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={toToken}
                    onChange={(e) => setToToken(e.target.value)}
                    className="bg-pink-500/20 border border-pink-500/30 rounded-xl px-2 py-1 sm:px-4 sm:py-2 text-white text-sm sm:text-base font-semibold outline-none"
                  >
                    {tokens.map((token) => (
                      <option key={token.symbol} value={token.symbol} className="bg-gray-900">
                        {token.symbol}
                      </option>
                    ))}
                  </select>
                  <div className="text-xl sm:text-2xl">{getTokenInfo(toToken)?.icon}</div>
                </div>
              </div>
              <div className="text-gray-400 text-xs sm:text-sm mt-2">{getTokenInfo(toToken)?.name}</div>
            </div>
          </div>

          {/* Exchange Rate */}
          {fromAmount && toAmount && (
            <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-3 sm:p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Info className="w-3 h-3 sm:w-4 sm:h-4 text-pink-400" />
                  <span className="text-white text-xs sm:text-sm">Exchange Rate</span>
                </div>
                <div className="text-white text-xs sm:text-sm font-semibold">
                  1 {fromToken} = {fromToken === "ETH" ? exchangeRate : (1 / exchangeRate).toFixed(6)} {toToken}
                </div>
              </div>
              <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                <span>Slippage Tolerance</span>
                <span>{slippage}%</span>
              </div>
            </div>
          )}

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            disabled={!fromAmount || !toAmount || isSwapping}
            className={`w-full py-3 sm:py-4 rounded-xl font-bold text-base sm:text-xl transition-all duration-300 ${
              !fromAmount || !toAmount || isSwapping
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-pink-500 to-violet-500 text-white hover:shadow-lg hover:shadow-pink-500/25 active:scale-95"
            }`}
          >
            {isSwapping ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Swapping...</span>
              </div>
            ) : (
              "Swap Tokens"
            )}
          </button>
        </div>

        {/* Recent Swaps */}
        <div className="backdrop-blur-xl bg-black/20 border border-pink-500/20 rounded-2xl p-4 sm:p-6 mt-8">
          <h3 className="text-base sm:text-lg font-bold text-white mb-4">Recent Swaps</h3>
          <div className="space-y-2 sm:space-y-3">
            {[
              { from: "ETH", to: "ELDORADO", fromAmount: "0.5", toAmount: "97.75", time: "2 min ago" },
              { from: "ELDORADO", to: "USDC", fromAmount: "200", toAmount: "156.23", time: "1 hour ago" },
              { from: "ETH", to: "USDT", fromAmount: "1.2", toAmount: "2,847.50", time: "3 hours ago" },
            ].map((swap, i) => (
              <div key={i} className="flex items-center justify-between p-2 sm:p-3 bg-black/30 rounded-xl">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="flex items-center space-x-1">
                    <span className="text-base sm:text-lg">{getTokenInfo(swap.from)?.icon}</span>
                    <ArrowUpDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                    <span className="text-base sm:text-lg">{getTokenInfo(swap.to)?.icon}</span>
                  </div>
                  <div>
                    <div className="text-white font-semibold text-xs sm:text-sm">
                      {swap.fromAmount} {swap.from} → {swap.toAmount} {swap.to}
                    </div>
                    <div className="text-gray-400 text-xs">{swap.time}</div>
                  </div>
                </div>
                <button className="text-pink-400 hover:text-pink-300 transition-colors">
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 transform rotate-180" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
