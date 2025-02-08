"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  orderDetails: {
    items: Array<{ name: string; quantity: number; price: number }>
    subtotal: number
    pointsRedeemed: number
    total: number
    newBalance: number
    pointsEarned: number
    newPoints: number
  }
}

export function SuccessModal({ isOpen, onClose, orderDetails }: SuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#E6DCC3] max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            Order Placed Successfully!
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-gray-600">Thank you for your order. Your coffee will be ready shortly.</p>
          <div className="space-y-2">
            <h4 className="font-semibold text-lg">Order Summary:</h4>
            {orderDetails.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>
                  {item.name} x{item.quantity}
                </span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{orderDetails.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Reward Points Redeemed:</span>
              <span>
                {orderDetails.pointsRedeemed} (₹{orderDetails.pointsRedeemed * 0.5})
              </span>
            </div>
            <div className="flex justify-between font-semibold text-lg">
              <span>Total:</span>
              <span>₹{orderDetails.total}</span>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>New balance:</span>
              <span>₹{orderDetails.newBalance}</span>
            </div>
            <div className="flex justify-between">
              <span>Reward Points earned:</span>
              <span>{orderDetails.pointsEarned}</span>
            </div>
            <div className="flex justify-between">
              <span>New Reward Points balance:</span>
              <span>{orderDetails.newPoints}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 pt-4">
            <Button className="bg-[#2C1810] text-[#E6DCC3] hover:bg-[#1F110B]">Continue Ordering</Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

