"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Users, LogOut, Settings, Menu } from "lucide-react"
import Link from "next/link"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [userData, setUserData] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const walletAddress = localStorage.getItem("walletAddress")
    const isAdmin = localStorage.getItem("isAdmin")
    const storedUserData = localStorage.getItem("userData")

    if (!walletAddress || isAdmin !== "true") {
      router.push("/")
      return
    }

    if (storedUserData) {
      setUserData(JSON.parse(storedUserData))
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("walletAddress")
    localStorage.removeItem("isAdmin")
    localStorage.removeItem("userData")
    router.push("/")
  }

  const navigation = [
    { name: "Users", href: "/dashboard", icon: Users },
    { name: "Settings", href: "/dashboard/settings", icon: Settings }
  ]

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center px-4 sm:px-6 py-4 border-b border-gray-200">
        <img src="eldorado-preview.png" alt="eldorado logo" className="invert h-10 md:h-12"  />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-1 sm:space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center px-2 sm:px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User info and logout */}
      <div className="border-t border-gray-200 p-3 sm:p-4">
        <div className="flex items-center mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {userData.prenom} {userData.nom}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {userData.id.slice(0, 6)}...{userData.id.slice(-4)}
            </p>
          </div>
        </div>
        <Button onClick={handleLogout} variant="outline" size="sm" className="w-full bg-transparent">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:block">
        <div className="bg-white border-r border-gray-200 h-full">
          <SidebarContent />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Mobile header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          </Sheet>
          <div className="flex items-center">
            <img src="eldorado-preview.png" alt="eldorado logo" className="invert h-8"  />
          </div>
          <div className="w-8" />
        </div>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
