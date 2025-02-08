"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"

interface CartItem {
  id: string
  name: string
  quantity: number
  price: number
}

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  onPlaceOrder: () => Promise<void>
}

export function CartModal({ isOpen, onClose, items, onPlaceOrder }: CartModalProps) {
  const [rewardPoints, setRewardPoints] = useState("0")
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discount = Number(rewardPoints) * 0.5
  const total = subtotal - discount

  const handlePlaceOrder = async () => {
    await onPlaceOrder()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#E6DCC3] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Checkout</DialogTitle>
          <Button variant="ghost" className="absolute right-4 top-4" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between text-lg">
              <span>
                {item.name} x{item.quantity}
              </span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="border-t pt-4">
            <div className="flex justify-between font-semibold text-lg">
              <span>Subtotal:</span>
              <span>₹{subtotal}</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm">Redeem Reward Points (max 100)</label>
            <Select value={rewardPoints} onValueChange={setRewardPoints}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[0, 10, 20, 50, 100].map((points) => (
                  <SelectItem key={points} value={String(points)}>
                    {points}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between font-bold text-xl">
              <span>Total:</span>
              <span>₹{total}</span>
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button className="flex-1 bg-[#2C1810] text-[#E6DCC3] hover:bg-[#1F110B]" onClick={handlePlaceOrder}>
              Confirm Order
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

