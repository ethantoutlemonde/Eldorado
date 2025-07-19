"use client"

import { useState, useEffect } from "react"

export default function Background({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [count, setCount] = useState(50)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== "undefined") {
      setCount(window.innerWidth > 768 ? 50 : 25)
    }
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-pink-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
      <main className="relative z-10">{children}</main>
    </div>
  )
}
