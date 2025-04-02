"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"
import { addFunds } from "@/lib/api"
import { Wallet } from "lucide-react"

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
    <div>
      {/* Outer Container with slightly increased size */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-[#BCAAA4] mx-auto max-w-3xl">
        {/* Hero Section - Slightly larger */}
        <div className="text-center py-6 px-5 bg-[#EFEBE9]/80 backdrop-blur-sm rounded-t-xl border-b border-[#BCAAA4]">
          <h1 className="text-3xl font-bold text-[#5D4037] mb-2">Wallet</h1>
          <p className="text-[#8D6E63] max-w-xl mx-auto text-sm">
            Manage your wallet balance and add funds
          </p>
        </div>

        {/* Content Area with slightly increased padding */}
        <div className="p-7 flex justify-center">
          <div className="w-full max-w-md">
            {/* Display Balance - slightly larger */}
            <div className="bg-[#F0EDEB] rounded-lg p-5 text-center mb-5">
              <p className="text-[#8D6E63] mb-1">Available Balance</p>
              <p className="text-2xl font-bold text-[#5D4037]">
                ₹{(user?.wallet?.balance || 0).toFixed(2)}
              </p>
            </div>
            
            {/* Add Funds Card */}
            <div className="bg-[#F0EDEB] backdrop-blur-sm rounded-lg p-4 shadow-md border border-[#BCAAA4]">
              <h2 className="text-lg font-medium text-[#5D4037] mb-3 flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Add Funds
              </h2>
              
              {/* Error Message */}
              {error && <div className="text-red-500 text-xs mb-2">{error}</div>}
              
              {/* Add Funds Form */}
              <form onSubmit={handleAddFunds} className="space-y-3">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount to add"
                  min="0"
                  step="0.01"
                  required
                  className="border border-[#BCAAA4] focus:border-[#8D6E63] text-[#5D4037] h-9 text-sm"
                />
                <Button
                  type="submit"
                  className="w-full bg-[#5D4037] hover:bg-[#8D6E63] text-white h-9 text-sm"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Adding Funds...</span>
                    </div>
                  ) : (
                    "Add Funds"
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}