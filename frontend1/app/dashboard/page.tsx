"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { MenuGrid } from "@/components/menu/menu-grid"
import { WalletCard } from "@/components/wallet/wallet-card"
import { ProfileCard } from "@/components/profile/profile-card"
import { CartModal } from "@/components/cart/cart-modal"
import { SuccessModal } from "@/components/cart/success-modal"
import { Button } from "@/components/ui/button"
import { getMenuItems, placeOrder } from "@/lib/api"
import { Coffee, Wallet, User, ShoppingBag, MenuIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrderHistory } from "@/lib/api";


interface OrderItem {
  menuItem: {
    name: string;
    price: number;
  };
  quantity: number;
}
interface Order {
  _id: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
  status: string;
}
interface MenuItem {
  _id: string
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
  const { user, updateUser,isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("menu")
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [lastOrder, setLastOrder] = useState<any>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    async function fetchMenuItems() {
      try {
        const response = await fetch("/api/menu-items");
        const data = await response.json();
  
        const mappedItems = data.map((item: any) => ({
          ...item,
          id: item._id, // Map '_id' to 'id'
        }));
  
        setMenuItems(mappedItems);
      } catch (error) {
        console.error("Failed to fetch menu items:", error);
      }
    }
    fetchMenuItems();
  }, []);
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Please log in to access the dashboard.</div>
  }
  
  const handleAddToCart = (item: MenuItem, quantity: number) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i._id === item._id); // Use 'id' here
      if (existingItem) {
        return prevItems.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prevItems, { ...item, quantity }];
    });
  };

  const handlePlaceOrder = async (rewardPointsRedeemed: number) => {
    try {
      const order = await placeOrder({
        items: cartItems.map((item) => ({
          menuItemId: item._id,
          quantity: item.quantity,
        })),
        rewardPointsRedeemed, // Use the passed value
      });
      console.log("Order response from API:", order);
          updateUser(order.wallet);
        setLastOrder({
          
          subtotal: order.order.subtotal || 0,
          pointsRedeemed: order.order.rewardPointsRedeemed || 0,
          total: order.order.total || 0,
          newBalance: order.wallet.balance || 0,
          pointsEarned: order.order.rewardPointsEarned || 0,
          newPoints: order.wallet.rewardPoints || 0,
        }); // Update lastOrder with the order details
    setIsCartOpen(false);
    setCartItems([]); // Close the cart modal
    setIsSuccessOpen(true);
    } catch (error) {
      console.error("Failed to place order:", error);
    }
  };

  const tabContent = {
    menu: <MenuGrid items={menuItems} onAddToCart={handleAddToCart} />,
    wallet: <WalletCard />,
    profile: <ProfileCard />,
    orders: <OrderHistory />,
  }

  return (
    <div className="flex h-screen bg-[#F5F5DC]">
      {/* Sidebar for larger screens */}
      <aside className="hidden md:flex flex-col w-64 bg-[#2C1810] text-[#E6DCC3] p-6">
        <h1 className="text-2xl font-bold mb-8">Cafe Manager</h1>
        <nav className="space-y-4">
          <Button
            variant={activeTab === "menu" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("menu")}
          >
            <Coffee className="mr-2 h-4 w-4" /> Menu
          </Button>
          <Button
            variant={activeTab === "wallet" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("wallet")}
          >
            <Wallet className="mr-2 h-4 w-4" /> Wallet
          </Button>
          <Button
            variant={activeTab === "profile" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("profile")}
          >
            <User className="mr-2 h-4 w-4" /> Profile
          </Button>
          <Button
            variant={activeTab === "orders" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("orders")}
          >
            <ShoppingBag className="mr-2 h-4 w-4" /> Orders
          </Button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile header */}
        <header className="md:hidden bg-[#2C1810] text-[#E6DCC3] p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Cafe Manager</h1>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <MenuIcon className="h-6 w-6" />
          </Button>
        </header>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="md:hidden bg-[#2C1810] text-[#E6DCC3] p-4"
            >
              <nav className="space-y-2">
                <Button
                  variant={activeTab === "menu" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveTab("menu")
                    setIsMobileMenuOpen(false)
                  }}
                >
                  <Coffee className="mr-2 h-4 w-4" /> Menu
                </Button>
                <Button
                  variant={activeTab === "wallet" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveTab("wallet")
                    setIsMobileMenuOpen(false)
                  }}
                >
                  <Wallet className="mr-2 h-4 w-4" /> Wallet
                </Button>
                <Button
                  variant={activeTab === "profile" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveTab("profile")
                    setIsMobileMenuOpen(false)
                  }}
                >
                  <User className="mr-2 h-4 w-4" /> Profile
                </Button>
                <Button
                  variant={activeTab === "orders" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveTab("orders")
                    setIsMobileMenuOpen(false)
                  }}
                >
                  <ShoppingBag className="mr-2 h-4 w-4" /> Orders
                </Button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-[#2C1810]">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h2>
          {tabContent[activeTab as keyof typeof tabContent]}
        </div>
      </main>

      {/* Cart button */}
      <Button
        className="fixed bottom-4 right-4 bg-[#2C1810] text-[#E6DCC3] hover:bg-[#1F110B]"
        onClick={() => setIsCartOpen(true)}
      >
        <ShoppingBag className="mr-2 h-4 w-4" />
        Cart ({cartItems.length})
      </Button>

      {/* Modals */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onPlaceOrder={handlePlaceOrder}
      />
    {lastOrder && (
  <SuccessModal
    isOpen={isSuccessOpen}
    onClose={() => setIsSuccessOpen(false)}
    orderDetails={{
      items: lastOrder.items || [],
      subtotal: lastOrder.subtotal || 0,
      pointsRedeemed: lastOrder.rewardPointsRedeemed || 0,
      total: lastOrder.total || 0,
      newBalance: lastOrder.wallet?.balance || 0,
      pointsEarned: lastOrder.rewardPointsEarned || 0,
      newPoints: lastOrder.wallet?.rewardPoints || 0,
    }}
  />
)}
    </div>
  )
}
export function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const fetchedOrders = await getOrderHistory();
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Failed to fetch order history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (isLoading) {
    return <div>Loading order history...</div>;
  }

  return (
    <div>
      <h2>Order History</h2>
      {orders.map((order) => (
        <Card key={order._id}>
          <CardHeader>
            <CardTitle>Order #{order._id.slice(-6)}</CardTitle>
          </CardHeader>
          <CardContent>
            {order.items.map((item, index) => (
              <div key={index}>
                {item.menuItem.name} x{item.quantity} ₹
                {(item.menuItem.price * item.quantity).toFixed(2)}
              </div>
            ))}
            <div>Total: ₹{order.total.toFixed(2)}</div>
            <div>Date: {new Date(order.createdAt).toLocaleString()}</div>
            <div>Status: {order.status}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
