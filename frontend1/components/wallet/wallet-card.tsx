"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { addFunds } from "@/lib/api"
import { CreditCard } from "lucide-react"
import { toast } from "sonner"

export function WalletCard() {
  const { user, updateUser } = useAuth()
  const [amount, setAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Clean up useEffect
  useEffect(() => {
    // Empty useEffect to keep component functionality without debug logs
  }, [user]);

  const validateAmount = () => {
    // Remove debug logs but keep validation logic
    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount greater than 0.");
      return false;
    }
    setError(null);
    return true;
  }

  const handlePayment = () => {
    if (!validateAmount()) return;
    
    if (typeof window === 'undefined' || !window.Razorpay) {
      toast.error("Payment system is not available");
      return;
    }

    setIsProcessing(true);
    setError(null);
    toast.info("Initializing payment...");

    // Convert to numerical amount
    const numAmount = Number(amount);
    
    // Amount in paise (multiply by 100)
    const amountInPaise = Math.round(numAmount * 100);

    var options = {
      "key": "rzp_test_nBLYKGUo8Qyd40", // Using your test key
      "amount": amountInPaise.toString(), // amount in paise
      "currency": "INR",
      "name": "Cafe Delight",
      "description": "Add Funds to Wallet",
      "image": "https://i.imgur.com/3g7nmJC.png", // Logo URL
      "prefill": {
        "name": user?.name || "Test User",
        "email": user?.email || "customer@example.com",
        "contact": user?.phone || "9900000000",
      },
      "theme": {
        "color": "#5D4037"
      },
      "handler": async function (response: any) {
        try {
          toast.success("Payment successful!");
          
          // Add funds to wallet
          try {
            const updatedUser = await addFunds(numAmount);
            
            // Update user context with new balance
            updateUser(updatedUser);
            setAmount("");
            
            toast.success(`₹${numAmount} added to your wallet!`);
          } catch (error) {
            toast.error("Payment was successful but wallet update failed");
          }
        } catch (error) {
          toast.error("Error processing payment");
        } finally {
          setIsProcessing(false);
        }
      },
      "modal": {
        "ondismiss": function () {
          toast.info("Payment cancelled");
          setIsProcessing(false);
        }
      }
    };

    try {
      var rzp1 = new window.Razorpay(options);
      
      // Register for payment failed event
      rzp1.on('payment.failed', function(response: any) {
        toast.error("Payment failed: " + (response.error?.description || "Unknown error"));
        setIsProcessing(false);
      });
      
      rzp1.open();
    } catch (error) {
      toast.error("Failed to open payment form");
      setIsProcessing(false);
    }
  };

  if (!user) {
    return null;
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
                <CreditCard className="h-4 w-4" />
                Add Funds with Card Payment
              </h2>
              
              {/* Error Message */}
              {error && <div className="text-red-500 text-xs mb-2">{error}</div>}
              
              {/* Add Funds Form */}
              <div className="space-y-3">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    if (error) validateAmount();
                  }}
                  placeholder="Enter amount in ₹"
                  min="1"
                  step="1"
                  required
                  className="border border-[#BCAAA4] focus:border-[#8D6E63] text-[#5D4037] h-9 text-sm w-full px-3 py-2 rounded-md"
                />
                
                <button
                  onClick={handlePayment}
                  disabled={!amount || Number(amount) <= 0 || isProcessing}
                  className="w-full h-9 text-sm bg-[#5D4037] hover:bg-[#8D6E63] text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center gap-1">
                      <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : `Pay ₹${amount || 0} with Card`}
                </button>

                <div className="text-xs text-[#8D6E63] text-center mt-2">
                  For testing, use card number: 4111 1111 1111 1111
                  <br/>
                  Any future date, any CVV and any name.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}