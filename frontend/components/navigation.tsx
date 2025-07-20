"use client"

import { useState, useEffect } from "react"
import { Home, Coins, CreditCard, ArrowLeftRight, User } from "lucide-react"
import { BurgerMenu } from "./burger-menu"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavigationProps {
  onSecretMode?: () => void
}

export function Navigation({ onSecretMode }: NavigationProps = {}) {
  const [secretSequence, setSecretSequence] = useState("")
  const pathname = usePathname()

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase()

      if (["S", "T", "R", "I", "P"].includes(key)) {
        const newSequence = secretSequence + key
        setSecretSequence(newSequence)

        if (newSequence === "STRIP") {
          onSecretMode()
          setSecretSequence("")
        } else if (newSequence.length > 5 || !"STRIP".startsWith(newSequence)) {
          setSecretSequence("")
        }
      } else {
        setSecretSequence("")
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [secretSequence, onSecretMode])

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/wallet", icon: CreditCard, label: "Wallet" },
    { href: "/swap", icon: ArrowLeftRight, label: "Swap" },
    { href: "/profile", icon: User, label: "Profile" },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="backdrop-blur-xl bg-black/20 border border-pink-500/30 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Burger Menu for Mobile */}
              <div className="md:hidden mr-2">
                <BurgerMenu onSecretMode={onSecretMode} />
              </div>

              {/* <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-violet-500 rounded-xl flex items-center justify-center">
                <Coins className="w-6 h-6 text-white" />
              </div> */}
              <img src="/eldorado-preview.png" alt="Eldorado Preview" className="h-6 md:h-8"/>
              <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
                Online Casino
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    pathname === item.href
                      ? "bg-gradient-to-r from-pink-500 to-violet-500 text-white shadow-lg shadow-pink-500/25"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Secret sequence indicator (hidden) */}
            {secretSequence && (
              <div className="absolute top-full left-4 mt-2 text-xs text-green-400 font-mono opacity-50">
                {secretSequence}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
