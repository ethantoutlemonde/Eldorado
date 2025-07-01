"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Filter, Eye, UsersIcon} from "lucide-react"
import Link from "next/link"

interface User {
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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, selectedStatuses])

  const fetchUsers = async () => {
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
        const data = await response.json()
        setUsers(data)
      } else {
        console.error("Failed to fetch users:", response.status, response.statusText)
        setUsers([])
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.id.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((user) => selectedStatuses.includes(user.statut))
    }

    setFilteredUsers(filtered)
  }

  const handleStatusFilter = (status: string, checked: boolean) => {
    if (checked) {
      setSelectedStatuses([...selectedStatuses, status])
    } else {
      setSelectedStatuses(selectedStatuses.filter((s) => s !== status))
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedStatuses([])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading users...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">User Management</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage and monitor user accounts</p>
        </div>
        <div className="flex items-center space-x-2">
          <UsersIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          <span className="text-sm text-gray-600">{filteredUsers.length} users</span>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or wallet address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center justify sm:justify-start gap-3 sm:gap-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2"
                  size="sm"
                >
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filters</span>
                </Button>
                {(searchTerm || selectedStatuses.length > 0) && (
                  <Button variant="ghost" onClick={clearFilters} size="sm">
                    Clear
                  </Button>
                )}
              </div>
              <div className="inline gap-2">
                <Link href={`/dashboard/users/create`}>
                    <Button
                    variant="outline"
                    className="flex items-center space-x-2"
                    size="sm">
                    <UsersIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Create</span>
                    </Button>
                </Link>
              </div>
            </div>
            
          </div>

          {/* Status Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-6">
                  {Object.entries(statusLabels).map(([status, label]) => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={status}
                        checked={selectedStatuses.includes(status)}
                        onCheckedChange={(checked) => handleStatusFilter(status, checked as boolean)}
                      />
                      <label htmlFor={status} className="text-sm text-gray-600">
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="grid gap-3 sm:gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm sm:text-lg font-medium text-gray-600">
                      {user.prenom.charAt(0)}
                      {user.nom.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                      {user.prenom} {user.nom}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">
                      {user.id.slice(0, 8)}...{user.id.slice(-6)}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Born: {new Date(user.date_naissance).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end space-x-3">
                  <Badge className={statusColors[user.statut]}>{statusLabels[user.statut]}</Badge>
                  <Link href={`/dashboard/users/${user.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="p-8 sm:p-12 text-center">
            <UsersIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-sm sm:text-base text-gray-600">
              {searchTerm || selectedStatuses.length > 0
                ? "Try adjusting your search or filters"
                : "No users available"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
