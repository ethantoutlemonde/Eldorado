"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Check, Ban, Trash2, Calendar, Wallet, Save, IdCard } from "lucide-react"
import Link from "next/link"
import UserIdCard from "./UserIdCard"

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
  const [editedUser, setEditedUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchUser()
  }, [params.id])

  const fetchUser = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/users/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setUser(data)
        setEditedUser(data)
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
        },
        body: JSON.stringify({ ...user, statut: newStatus }),
      })
      if (response.ok) {
        const updated = await response.json()
        setUser(updated)
        setEditedUser(updated)
      } else {
        alert("Failed to update status")
      }
    } catch (error) {
      alert("Network error")
    } finally {
      setUpdating(false)
    }
  }

  const saveEdits = async () => {
    if (!editedUser) return
    setUpdating(true)
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/users/${editedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedUser),
      })
      if (response.ok) {
        const updated = await response.json()
        setUser(updated)
        setEditedUser(updated)
        setIsEditing(false)
      } else {
        alert("Failed to update user")
      }
    } catch (error) {
      alert("Network error")
    } finally {
      setUpdating(false)
    }
  }

  const deleteUser = async () => {
    if (!user || !confirm("Are you sure you want to delete this user?")) return
    setUpdating(true)
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/users/${user.id}`, {
        method: "DELETE",
      })
      if (response.ok) router.push("/dashboard")
      else alert("Failed to delete user")
    } catch {
      alert("Network error")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading user...</div>
  }

  if (!user || !editedUser) {
    return (
      <div className="text-center py-8">
        <h2>User not found</h2>
        <Link href="/dashboard">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
        </Link>
      </div>
    )
  }

  {console.log("UserId dans UserIdCard:", user.id)}


  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">{user.prenom} {user.nom}</h1>
        </div>
        <Badge className={statusColors[user.statut]}>{statusLabels[user.statut]}</Badge>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
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
                  <UserIdCard userId={user.id} />
                  {/* {user.prenom.charAt(0)}
                  {user.nom.charAt(0)} */}
                </span>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-base sm:text-lg font-medium text-gray-900">ID Card Photo</h3>
                <p className="text-sm text-gray-500">Profile picture from ID verification</p>
              </div>
            </div>
          </CardContent>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">First Name</label>
                {isEditing ? (
                  <input
                    value={editedUser.prenom}
                    onChange={(e) => setEditedUser({ ...editedUser, prenom: e.target.value })}
                    className="w-full border p-2 rounded mt-1"
                  />
                ) : (
                  <div className="text-gray-800">{user.prenom}</div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Last Name</label>
                {isEditing ? (
                  <input
                    value={editedUser.nom}
                    onChange={(e) => setEditedUser({ ...editedUser, nom: e.target.value })}
                    className="w-full border p-2 rounded mt-1"
                  />
                ) : (
                  <div className="text-gray-800">{user.nom}</div>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">Birth Date</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={editedUser.date_naissance}
                    onChange={(e) => setEditedUser({ ...editedUser, date_naissance: e.target.value })}
                    className="w-full border p-2 rounded mt-1"
                  />
                ) : (
                  <div>{new Date(user.date_naissance).toLocaleDateString()}</div>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">Wallet Address</label>
                <div className="font-mono text-sm break-all bg-gray-50 p-2 rounded">
                  {user.id}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="w-full justify-start"
                disabled={updating}
                variant="outline"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit User
              </Button>
            ) : (
              <Button
                onClick={saveEdits}
                className="w-full justify-start bg-blue-600 text-white hover:bg-blue-700"
                disabled={updating}
              >
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            )}

            {user.statut === "pending" && (
              <Button
                onClick={() => updateUserStatus("verified")}
                className="w-full justify-start bg-green-600 text-white hover:bg-green-700"
                disabled={updating}
              >
                <Check className="mr-2 h-4 w-4" />
                Verify User
              </Button>
            )}

            {user.statut !== "banned" ? (
              <Button
                onClick={() => updateUserStatus("banned")}
                variant="outline"
                className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                disabled={updating}
              >
                <Ban className="mr-2 h-4 w-4" />
                Ban User
              </Button>
            ) : (
              <Button
                onClick={() => updateUserStatus("verified")}
                className="w-full justify-start bg-blue-600 text-white hover:bg-blue-700"
                disabled={updating}
              >
                <Check className="mr-2 h-4 w-4" />
                Unban User
              </Button>
            )}

            <Button
              onClick={deleteUser}
              variant="outline"
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
              disabled={updating}
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
