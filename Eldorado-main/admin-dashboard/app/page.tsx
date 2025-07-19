"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet } from "lucide-react"

declare global {
  interface Window {
    ethereum?: any
  }
}

export default function LoginPage() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Check if user is already authenticated
    const walletAddress = localStorage.getItem("walletAddress")
    const isAdmin = localStorage.getItem("isAdmin")
    if (walletAddress && isAdmin === "true") {
      router.push("/dashboard")
    }
  }, [router])

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError("MetaMask is not installed. Please install MetaMask to continue.")
      return
    }

    setIsConnecting(true)
    setError("")

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length === 0) {
        setError("No accounts found. Please connect your wallet.")
        return
      }

      const walletAddress = accounts[0]

      // Check user status with Laravel API
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/users/${walletAddress}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          mode: "cors",
        })

        if (!response.ok) {
          if (response.status === 404) {
            setError("User not found. Please contact administrator.")
          } else if (response.status === 0 || response.status >= 500) {
            setError("Server is not available. Please check if the Laravel API is running on http://127.0.0.1:8000")
          } else {
            setError(`API Error: ${response.status} - ${response.statusText}`)
          }
          return
        }

        const userData = await response.json()

        if (userData.statut !== "admin") {
          setError("Access denied. Admin privileges required.")
          return
        }

        // Store authentication data
        localStorage.setItem("walletAddress", walletAddress)
        localStorage.setItem("isAdmin", "true")
        localStorage.setItem("userData", JSON.stringify(userData))

        // Redirect to dashboard
        router.push("/dashboard")
      } catch (fetchError: any) {
        console.error("API fetch error:", fetchError)
        if (fetchError.name === "TypeError" && fetchError.message.includes("fetch")) {
          setError(
            "Cannot connect to API server. Please ensure the Laravel API is running on http://127.0.0.1:8000 and CORS is properly configured.",
          )
        } else {
          setError("Network error. Please check your connection and try again.")
        }
      }
    } catch (error: any) {
      console.error("Wallet connection error:", error)
      if (error.code === 4001) {
        setError("Connection rejected. Please approve the connection request in MetaMask.")
      } else {
        setError("Failed to connect wallet. Please try again.")
      }
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-sm sm:max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-xl sm:text-2xl font-semibold text-gray-900">Admin Dashboard</CardTitle>
          <CardDescription className="text-sm sm:text-base text-gray-600">
            Connect your wallet to access the user management system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white"
            size="lg"
          >
            <Wallet className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            {isConnecting ? "Connecting..." : "Connect MetaMask"}
          </Button>

          <Button
            onClick={async () => {
              try {
                const response = await fetch("http://127.0.0.1:8000/api/users", {
                  method: "GET",
                  headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                  },
                  mode: "cors",
                })
                if (response.ok) {
                  setError("")
                  alert("API connection successful!")
                } else {
                  setError(`API test failed: ${response.status}`)
                }
              } catch (err) {
                setError("API server is not reachable. Please start your Laravel server.")
              }
            }}
            variant="outline"
            className="w-full"
            size="sm"
          >
            Test API Connection
          </Button>

          {error && (
            <div className="p-3 text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="text-xs text-gray-500 text-center">Only admin users can access this dashboard</div>
        </CardContent>
      </Card>
    </div>
  )
}
