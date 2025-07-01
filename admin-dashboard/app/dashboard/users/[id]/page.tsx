"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Check, Ban, Trash2, Calendar, Wallet } from "lucide-react"
import Link from "next/link"

interface UserProfile {
  id: string
  prenom: string
  nom: string
  date_naissance: string
  statut: "verified" | "banned" | "pending" | "admin"
}

const statusColors = {
  verified: "bg-green-100 text-green-800",
  banned: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
  admin: "bg-blue-100 text-blue-800",
}

const statusLabels = {
  verified: "Verified",
  banned: "Banned",
  pending: "Pending",
  admin: "Admin",
}

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchUser()
  }, [params.id])

  const fetchUser = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/users/${params.id}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        mode: "cors",
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data)
      } else {
        console.error("User not found or API error:", response.status)
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Failed to fetch user:", error)
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const updateUserStatus = async (newStatus: string) => {
    if (!user) return

    setUpdating(true)
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors",
        body: JSON.stringify({
          ...user,
          statut: newStatus,
        }),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser)
      } else {
        console.error("Failed to update user:", response.status)
        alert("Failed to update user status. Please try again.")
      }
    } catch (error) {
      console.error("Failed to update user:", error)
      alert("Network error. Please check your connection.")
    } finally {
      setUpdating(false)
    }
  }

  const deleteUser = async () => {
    if (!user || !confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    setUpdating(true)
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/users/${user.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
        mode: "cors",
      })

      if (response.ok) {
        router.push("/dashboard")
      } else {
        console.error("Failed to delete user:", response.status)
        alert("Failed to delete user. Please try again.")
      }
    } catch (error) {
      console.error("Failed to delete user:", error)
      alert("Network error. Please check your connection.")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading user...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-8 sm:py-12">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">User not found</h2>
        <Link href="/dashboard">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              {user.prenom} {user.nom}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">User Profile</p>
          </div>
        </div>
        <Badge className={statusColors[user.statut]}>{statusLabels[user.statut]}</Badge>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Profile Card */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <span>Profile Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-lg flex items-center justify-center mx-auto sm:mx-0">
                <span className="text-xl sm:text-2xl font-medium text-gray-600">
                  {user.prenom.charAt(0)}
                  {user.nom.charAt(0)}
                </span>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-base sm:text-lg font-medium text-gray-900">ID Card Photo</h3>
                <p className="text-sm text-gray-500">Profile picture from ID verification</p>
              </div>
            </div>

            {/* User Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <div className="text-gray-900 text-sm sm:text-base">{user.prenom}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <div className="text-gray-900 text-sm sm:text-base">{user.nom}</div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Wallet className="inline h-4 w-4 mr-1" />
                  Wallet Address
                </label>
                <div className="text-gray-900 font-mono text-xs sm:text-sm break-all bg-gray-50 p-2 rounded">
                  {user.id}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Birth Date
                </label>
                <div className="text-gray-900 text-sm sm:text-base">
                  {new Date(user.date_naissance).toLocaleDateString()}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Badge className={statusColors[user.statut]}>{statusLabels[user.statut]}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            <Button variant="outline" className="w-full justify-start bg-transparent" disabled={updating} size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit User
            </Button>

            {user.statut === "pending" && (
              <Button
                onClick={() => updateUserStatus("verified")}
                className="w-full justify-start bg-green-600 hover:bg-green-700 text-white"
                disabled={updating}
                size="sm"
              >
                <Check className="mr-2 h-4 w-4" />
                Verify User
              </Button>
            )}

            {user.statut !== "banned" && (
              <Button
                onClick={() => updateUserStatus("banned")}
                variant="outline"
                className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                disabled={updating}
                size="sm"
              >
                <Ban className="mr-2 h-4 w-4" />
                Ban User
              </Button>
            )}

            {user.statut === "banned" && (
              <Button
                onClick={() => updateUserStatus("verified")}
                className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
                disabled={updating}
                size="sm"
              >
                <Check className="mr-2 h-4 w-4" />
                Unban User
              </Button>
            )}

            <Button
              onClick={deleteUser}
              variant="outline"
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
              disabled={updating}
              size="sm"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete User
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
