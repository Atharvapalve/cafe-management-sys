"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Minus, Plus, ShoppingBag, Trash2, CreditCard, Wallet } from "lucide-react"
import { CartItem } from "@/types/menu"
import { useState } from "react"
import { toast } from "sonner"
import { PaymentButton } from "@/components/ui/payment-button"

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  onPlaceOrder: () => Promise<void>
  walletBalance: number
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>
}

export function CartModal({
  isOpen,
  onClose,
  items,
  onPlaceOrder,
  walletBalance,
  setCartItems,
}: CartModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'razorpay'>('wallet')

  const updateQuantity = (itemId: string, change: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item._id === itemId) {
          const newQuantity = item.quantity + change
          if (newQuantity <= 0) {
            return item
          }
          return { ...item, quantity: newQuantity }
        }
        return item
      })
    )
  }

  const removeItem = (itemId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item._id !== itemId))
    toast.success("Item removed from cart")
  }

  const subtotal = items.reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0
  )

  const handlePlaceOrder = async () => {
    if (paymentMethod === 'wallet') {
      if (subtotal > walletBalance) {
        toast.error("Insufficient wallet balance")
        return
      }
    }

    if (items.length === 0) {
      toast.error("Your cart is empty")
      return
    }

    setIsProcessing(true)
    try {
      await onPlaceOrder()
      // Don't clear cart here as it's handled in the parent component
    } catch (error) {
      console.error("Failed to place order:", error)
      toast.error("Failed to place order. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRazorpaySuccess = (paymentData: any) => {
    // After successful payment, close the modal and place order
    toast.success(`Payment successful!`);
    onPlaceOrder();
    onClose();
  }

  const handleRazorpayFailure = (error: any) => {
    toast.error(error.message || "Payment failed. Please try again.");
    setIsProcessing(false);
  }

  const handleClose = () => {
    if (!isProcessing) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-[#EFEBE9] border-[#8D6E63]">
        <DialogHeader>
          <DialogTitle className="text-[#5D4037] flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Your Cart
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-[#8D6E63] opacity-50" />
              <h3 className="text-[#5D4037] font-medium mb-1">Your cart is empty</h3>
              <p className="text-[#8D6E63] text-sm">Add some delicious items to get started</p>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/50 border border-[#BCAAA4]"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-[#5D4037]">{item.name}</h4>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 border-[#8D6E63]"
                          onClick={() => updateQuantity(item._id, -1)}
                          disabled={item.quantity <= 1 || isProcessing}
                        >
                          <Minus className="h-4 w-4 text-[#8D6E63]" />
                        </Button>
                        <span className="w-8 text-center text-[#5D4037]">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 border-[#8D6E63]"
                          onClick={() => updateQuantity(item._id, 1)}
                          disabled={isProcessing}
                        >
                          <Plus className="h-4 w-4 text-[#8D6E63]" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-[#8D6E63] hover:text-red-500"
                        onClick={() => removeItem(item._id)}
                        disabled={isProcessing}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-[#5D4037]">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-sm text-[#8D6E63]">₹{item.price.toFixed(2)} each</p>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-[#BCAAA4]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#8D6E63]">Subtotal</span>
                  <span className="font-medium text-[#5D4037]">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[#8D6E63]">Wallet Balance</span>
                  <span className="font-medium text-[#5D4037]">₹{walletBalance.toFixed(2)}</span>
                </div>
                
                {/* Payment Method Selector */}
                <div className="mb-4">
                  <div className="text-[#5D4037] mb-2 font-medium">Select Payment Method</div>
                  <div className="flex gap-2">
                    <Button
                      variant={paymentMethod === 'wallet' ? 'default' : 'outline'}
                      className={`flex-1 ${paymentMethod === 'wallet' ? 'bg-[#5D4037] text-white' : 'border-[#8D6E63] text-[#5D4037]'}`}
                      onClick={() => setPaymentMethod('wallet')}
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      Wallet
                    </Button>
                    <Button
                      variant={paymentMethod === 'razorpay' ? 'default' : 'outline'}
                      className={`flex-1 ${paymentMethod === 'razorpay' ? 'bg-[#5D4037] text-white' : 'border-[#8D6E63] text-[#5D4037]'}`}
                      onClick={() => setPaymentMethod('razorpay')}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Card
                    </Button>
                  </div>
                </div>
                
                {paymentMethod === 'wallet' && subtotal > walletBalance && (
                  <p className="text-red-500 text-sm mb-4">
                    Insufficient wallet balance. Please add funds or use card payment.
                  </p>
                )}
                
                {/* Payment Buttons */}
                {paymentMethod === 'wallet' ? (
                  <Button
                    className="w-full bg-[#5D4037] hover:bg-[#4E342E] text-white"
                    onClick={handlePlaceOrder}
                    disabled={isProcessing || subtotal > walletBalance || items.length === 0}
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      `Pay with Wallet • ₹${subtotal.toFixed(2)}`
                    )}
                  </Button>
                ) : (
                  <PaymentButton
                    amount={subtotal}
                    onSuccess={handleRazorpaySuccess}
                    onFailure={handleRazorpayFailure}
                    isProcessing={isProcessing}
                    setIsProcessing={setIsProcessing}
                    disabled={isProcessing || items.length === 0}
                    className="w-full"
                  >
                    Pay with Card • ₹{subtotal.toFixed(2)}
                  </PaymentButton>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

