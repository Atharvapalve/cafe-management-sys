"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderDetails: {
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    subtotal: number;
    pointsRedeemed: number;
    total: number;
    newBalance: number;
    pointsEarned: number;
    newPoints: number;
  };
}

export function SuccessModal({ isOpen, onClose, orderDetails }: SuccessModalProps) {
  const {
    items = [],
    subtotal = 0,
    pointsRedeemed = 0,
    total = 0,
    newBalance = 0,
    pointsEarned = 0,
    newPoints = 0,
  } = orderDetails;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Order Placed Successfully!</DialogTitle>
        </DialogHeader>
        <div>
          <p>Thank you for your order</p>
          <p>Your coffee will be ready shortly.</p>
          <h3>Order Summary:</h3>
          {items.map((item, index) => (
            <div key={index}>
              {item.name} x{item.quantity} ₹{item.price * item.quantity}
            </div>
          ))}
          <p>Subtotal: ₹{subtotal}</p>
          <p>Reward Points Redeemed: {pointsRedeemed} (₹{pointsRedeemed * 0.5})</p>
          <p>Total: ₹{total}</p>
          <p>New balance: ₹{newBalance}</p>
          <p>Reward Points earned: {pointsEarned}</p>
          <p>New Reward Points balance: {newPoints}</p>
          
        </div>
        
        <Button onClick={onClose}>Close</Button>
      </DialogContent>
    </Dialog>
  );
}