"use client"

import { useState, useEffect } from "react"
import { Menu, X, Home, Zap, Target, Spade, CreditCard, ArrowLeftRight, Lock } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

interface BurgerMenuProps {
  currentView: string
  onNavigate: (view: string) => void
  onSecretMode: () => void
}

export function BurgerMenu({ currentView, onNavigate, onSecretMode }: BurgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Close menu when view changes
  useEffect(() => {
    setIsOpen(false)
  }, [currentView])

  // Close menu when clicking outside the menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (isOpen && !target.closest("[data-burger-menu]")) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const menuItems = [
    { id: "dashboard", label: "Home", icon: Home },
    { id: "slots", label: "Slots", icon: Zap },
    { id: "roulette", label: "Roulette", icon: Target },
    { id: "poker", label: "Poker", icon: Spade },
    { id: "wallet", label: "Wallet", icon: CreditCard },
    { id: "swap", label: "Token Swap", icon: ArrowLeftRight },
    { id: "secret", label: "Strip Mode", icon: Lock, action: onSecretMode },
  ]

  return (
    <>
      {/* Burger button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-black/30 backdrop-blur-md border border-pink-500/30 text-white z-50"
        aria-label="Toggle menu"
        data-burger-menu
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Background overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            data-burger-menu
          />
        )}
      </AnimatePresence>

      {/* Slide-in menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            key="menu"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 left-0 bottom-0 h-screen w-64 bg-gradient-to-br from-gray-900 to-purple-900 border-r border-pink-500/30 z-50 overflow-y-auto"
            data-burger-menu
            aria-label="Mobile navigation"
          >
            <div className="p-6">
              <header className="flex items-center space-x-2 mb-8">
                <img src="/eldorado-preview.png" alt="Eldorado Preview" className="h-10"/>
              </header>

              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.action) {
                        item.action()
                      } else {
                        onNavigate(item.id)
                      }
                      setIsOpen(false)
                    }}
                    className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all duration-300 ${
                      currentView === item.id
                        ? "bg-gradient-to-r from-pink-500 to-violet-500 text-white"
                        : "text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>

              <footer className="mt-8 pt-6 border-t border-pink-500/20">
                <p className="text-xs text-gray-400 mb-2">Eldorado, futur of decentralized gambling</p>
              </footer>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}
