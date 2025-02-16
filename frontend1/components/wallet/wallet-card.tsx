"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"
import { addFunds } from "@/lib/api"

export function WalletCard() {
  const { user, updateUser } = useAuth()
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null) // Clear previous errors

    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount greater than 0.")
      return
    }

    setIsLoading(true)
    try {
      const updatedUser = await addFunds(Number(amount))
      updateUser(updatedUser) // Update user state
      setAmount("") // Reset input field
    } catch (error) {
      console.error("Failed to add funds:", error)
      setError("An error occurred while adding funds. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-[#E6DCC3]">
      <CardHeader>
        <CardTitle>Wallet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Display Balance */}
        <div className="text-2xl font-bold">
          Balance: ₹{(user?.wallet?.balance || 0).toFixed(2)}
        </div>

        {/* Display Reward Points */}
        <div className="text-lg">
          Reward Points: {user?.wallet?.rewardPoints || 0}
        </div>

        {/* Error Message */}
        {error && <div className="text-red-500 text-sm">{error}</div>}

        {/* Add Funds Form */}
        <form onSubmit={handleAddFunds} className="space-y-4">
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount to add"
            min="0"
            step="0.01"
            required
          />
          <Button
            type="submit"
            className="w-full bg-[#2C1810] hover:bg-[#1F110B]"
            disabled={isLoading}
          >
            {isLoading ? "Adding Funds..." : "Add Funds"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}