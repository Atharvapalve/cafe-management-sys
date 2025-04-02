"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Coffee, Gift, ShoppingBag, Wallet } from "lucide-react"
import { CartItem } from "@/types/menu"

interface LastOrder {
  items: CartItem[];
  subtotal: number;
  total: number;
  newBalance: number;
}

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderDetails: LastOrder;
}

export function SuccessModal({ isOpen, onClose, orderDetails }: SuccessModalProps) {
  const {
    items = [],
    subtotal = 0,
    total = 0,
    newBalance = 0,
  } = orderDetails || {};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[#EFEBE9] border-[#8D6E63]">
        <DialogHeader>
          <DialogTitle className="text-center text-[#5D4037] flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-[#5D4037]/10 flex items-center justify-center">
              <Coffee className="h-6 w-6 text-[#5D4037]" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-1">Thank you for your order!</h2>
              <p className="text-[#8D6E63] text-sm font-normal">
                Your coffee will be ready shortly
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="space-y-3">
            <h3 className="font-medium text-[#5D4037] flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Order Summary
            </h3>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center text-[#8D6E63]"
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-medium">
                    ₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                  </span>
                </div>
              ))}
              {items.length === 0 && (
                <p className="text-[#8D6E63] text-sm text-center py-2">
                  No items in this order
                </p>
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-3">
            <h3 className="font-medium text-[#5D4037] flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Payment Details
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-[#8D6E63]">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium text-[#5D4037] pt-2 border-t border-[#BCAAA4]">
                <span>Total Paid</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <Button
            className="w-full bg-[#5D4037] hover:bg-[#4E342E] text-white"
            onClick={onClose}
          >
            Continue Shopping
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}