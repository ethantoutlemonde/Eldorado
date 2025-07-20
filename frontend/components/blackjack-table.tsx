"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

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
  return parseInt(rank)
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

export function BlackjackTable() {
  const router = useRouter()
  const [deck, setDeck] = useState<string[]>([])
  const [player, setPlayer] = useState<string[]>([])
  const [dealer, setDealer] = useState<string[]>([])
  const [revealed, setRevealed] = useState(false)

  const newDeck = () =>
    shuffle(
      suits.flatMap((s) => ranks.map((r) => s + r))
    )

  const startGame = () => {
    const d = newDeck()
    setDeck(d.slice(4))
    setPlayer([d[0], d[2]])
    setDealer([d[1], d[3]])
    setRevealed(false)
  }

  const hit = () => {
    if (revealed) return
    setPlayer((p) => {
      const [c, ...rest] = deck
      setDeck(rest)
      return [...p, c]
    })
  }

  const stand = () => {
    let d = [...dealer]
    let remaining = [...deck]
    while (handValue(d) < 17) {
      const [c, ...rest] = remaining
      d.push(c)
      remaining = rest
    }
    setDealer(d)
    setDeck(remaining)
    setRevealed(true)
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

  return (
    <div className="pt-24 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
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
            Blackjack
          </h1>
        </div>

        {player.length === 0 ? (
          <div className="text-center">
            <button
              onClick={startGame}
              className="px-6 py-3 rounded-xl font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-all"
            >
              Start Game
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col items-center space-y-2">
              <div className="flex space-x-2">
                {dealer.map((c, i) => (
                  <div key={i} className="w-12 h-16 bg-white rounded shadow flex items-center justify-center text-lg border border-gray-300">
                    {revealed || i === 0 ? c : '🂠'}
                  </div>
                ))}
              </div>
              <div className="text-gray-200">Dealer: {revealed ? dealerValue : '?'}</div>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <div className="flex space-x-2">
                {player.map((c, i) => (
                  <div key={i} className="w-12 h-16 bg-white rounded shadow flex items-center justify-center text-lg border border-gray-300">
                    {c}
                  </div>
                ))}
              </div>
              <div className="text-gray-200">You: {playerValue}</div>
            </div>

            <div className="flex justify-center space-x-4 pt-4">
              {!revealed && (
                <>
                  <button className="px-4 py-2 rounded bg-green-600 text-white" onClick={hit}>Hit</button>
                  <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={stand}>Stand</button>
                </>
              )}
              {revealed && (
                <button className="px-4 py-2 rounded bg-purple-600 text-white" onClick={reset}>New Game</button>
              )}
            </div>
            {revealed && (
              <div className="text-center text-xl text-pink-400 font-semibold mt-4">{result()}</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
