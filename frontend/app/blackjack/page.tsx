"use client"
import { BlackjackTable } from "@/components/blackjack-table"
import { Navigation } from "@/components/navigation"
import RequireAuth from "@/components/require-auth"

export default function BlackjackPage() {
  return (
    <RequireAuth>
      <Navigation />
      <BlackjackTable />
    </RequireAuth>
  )
}
