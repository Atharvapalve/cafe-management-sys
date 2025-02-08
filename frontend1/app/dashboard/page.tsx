"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { MenuGrid } from "@/components/menu/menu-grid"
import { WalletCard } from "@/components/wallet/wallet-card"
import { ProfileCard } from "@/components/profile/profile-card"
import { OrderHistory } from "@/components/orders/order-history"
import { CartModal } from "@/components/cart/cart-modal"
import { SuccessModal } from "@/components/cart/success-modal"
import { Button } from "@/components/ui/button"
import { getMenuItems, placeOrder } from "@/lib/api"

interface MenuItem {
  id: string
  name: string
  price: number
  rewardPoints: number
  description?: string
  category?: string
}

interface CartItem extends MenuItem {
  quantity: number
}

export default function Dashboard() {
  const { user, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("menu")
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [lastOrder, setLastOrder] = useState<any>(null)

  useEffect(() => {
    async function fetchMenuItems() {
      try {
        const items = await getMenuItems()
        setMenuItems(items)
      } catch (error) {
        console.error("Failed to fetch menu items:", error)
      }
    }
    fetchMenuItems()
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <div>Please log in to access the dashboard.</div>
  }

  const handleAddToCart = (item: MenuItem, quantity: number) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id)
      if (existingItem) {
        return prevItems.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i))
      }
      return [...prevItems, { ...item, quantity }]
    })
  }

  const handlePlaceOrder = async () => {
    try {
      const order = await placeOrder({
        items: cartItems.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity,
        })),
      })
      setLastOrder(order)
      setIsSuccessOpen(true)
      setCartItems([])
    } catch (error) {
      console.error("Failed to place order:", error)
    }
  }

  return (
    <div className="min-h-screen bg-[#2C1810] text-[#E6DCC3] p-6">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user.name}!</h1>
      <div className="flex space-x-4 mb-6">
        <Button onClick={() => setActiveTab("menu")} variant={activeTab === "menu" ? "default" : "outline"}>
          Menu
        </Button>
        <Button onClick={() => setActiveTab("wallet")} variant={activeTab === "wallet" ? "default" : "outline"}>
          Wallet
        </Button>
        <Button onClick={() => setActiveTab("profile")} variant={activeTab === "profile" ? "default" : "outline"}>
          Profile
        </Button>
        <Button onClick={() => setActiveTab("orders")} variant={activeTab === "orders" ? "default" : "outline"}>
          Orders
        </Button>
      </div>
      <div className="mb-6">
        {activeTab === "menu" && <MenuGrid items={menuItems} onAddToCart={handleAddToCart} />}
        {activeTab === "wallet" && <WalletCard />}
        {activeTab === "profile" && <ProfileCard />}
        {activeTab === "orders" && <OrderHistory />}
      </div>
      <Button onClick={() => setIsCartOpen(true)}>View Cart ({cartItems.length})</Button>
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onPlaceOrder={handlePlaceOrder}
      />
      {lastOrder && (
        <SuccessModal isOpen={isSuccessOpen} onClose={() => setIsSuccessOpen(false)} orderDetails={lastOrder} />
      )}
    </div>
  )
}