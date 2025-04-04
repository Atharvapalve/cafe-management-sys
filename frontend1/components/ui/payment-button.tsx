"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { initializeRazorpayPayment, loadRazorpayScript } from "@/lib/razorpay"
import { createRazorpayOrder, verifyRazorpayPayment } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { CreditCard } from "lucide-react"

interface PaymentButtonProps {
  amount: number // amount in INR
  onSuccess: (paymentData: any) => void
  onFailure: (error: any) => void
  className?: string
  disabled?: boolean
  children?: React.ReactNode
  buttonText?: string
  isProcessing: boolean
  setIsProcessing: (isProcessing: boolean) => void
}

export function PaymentButton({
  amount,
  onSuccess,
  onFailure,
  className = "",
  disabled = false,
  children,
  buttonText = "Pay with Razorpay",
  isProcessing,
  setIsProcessing,
}: PaymentButtonProps) {
  const { user } = useAuth()
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false)
  
  // Check and load Razorpay on mount
  useEffect(() => {
    const loadScript = async () => {
      console.log("[DEBUG] Attempting to load Razorpay script");
      const loaded = await loadRazorpayScript();
      console.log("[DEBUG] Razorpay script loaded:", loaded);
      setIsRazorpayLoaded(loaded);
    };
    
    loadScript();
  }, []);
  
  const handlePayment = async () => {
    console.log("[DEBUG] Payment button clicked");
    console.log("[DEBUG] Amount:", amount);
    console.log("[DEBUG] User info:", user ? `${user.name} (${user.email})` : "No user");
    
    // Basic validation
    if (!amount || amount <= 0) {
      console.log("[DEBUG] Invalid amount:", amount);
      toast.error("Please enter a valid amount");
      return;
    }
    
    if (isProcessing) {
      console.log("[DEBUG] Payment already in progress, skipping");
      return; // Prevent multiple clicks
    }
    
    // Check if Razorpay is loaded
    if (!isRazorpayLoaded) {
      console.log("[DEBUG] Razorpay not loaded, attempting to load again");
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        console.error("[DEBUG] Failed to load Razorpay");
        toast.error("Payment system is not available. Please try again later.");
        return;
      }
      setIsRazorpayLoaded(true);
    }
    
    // Extra debugging to check Razorpay is properly accessible
    if (typeof window !== "undefined" && window.Razorpay) {
      console.log("[DEBUG] Razorpay object available in window:", typeof window.Razorpay);
      
      // Try to inspect the Razorpay object (safely)
      try {
        console.log("[DEBUG] Can create Razorpay instance:", typeof new window.Razorpay({}) === 'object');
      } catch (err) {
        console.error("[DEBUG] Error creating test Razorpay instance:", err);
      }
    }
    
    setIsProcessing(true);
    console.log("[DEBUG] Set processing state to true");
    
    try {
      // Initialize payment directly using the new method
      const rzpInstance = await initializeRazorpayPayment({
        amount: amount,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        onSuccess: async (paymentData) => {
          console.log("[DEBUG] Payment success callback triggered with data:", paymentData);
          
          try {
            // Verify payment
            console.log("[DEBUG] Verifying payment...");
            const verification = await verifyRazorpayPayment(paymentData);
            console.log("[DEBUG] Verification response:", verification);
            
            if (verification.success) {
              console.log("[DEBUG] Payment verified successfully");
              toast.success("Payment successful!");
              onSuccess(verification);
            } else {
              console.log("[DEBUG] Payment verification failed:", verification.message);
              throw new Error("Payment verification failed");
            }
          } catch (error) {
            console.error("[DEBUG] Payment verification error:", error);
            toast.error("Payment verification failed");
            onFailure(error);
          } finally {
            setIsProcessing(false);
          }
        },
        onFailure: (error) => {
          console.error("[DEBUG] Payment failure callback triggered:", error);
          toast.error("Payment failed: " + (typeof error === 'string' ? error : "Unknown error"));
          onFailure(error);
          setIsProcessing(false);
        }
      });
      
      console.log("[DEBUG] Razorpay instance created:", !!rzpInstance);
    } catch (error) {
      console.error("[DEBUG] Payment process error:", error);
      toast.error("Payment process failed");
      onFailure(error);
      setIsProcessing(false);
    }
  };
  
  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || isProcessing || !isRazorpayLoaded}
      className={cn("bg-[#5D4037] hover:bg-[#8D6E63] text-white", className)}
      type="button"
    >
      {isProcessing ? (
        <div className="flex items-center justify-center gap-1">
          <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Processing...</span>
        </div>
      ) : children || buttonText}
    </Button>
  )
} 