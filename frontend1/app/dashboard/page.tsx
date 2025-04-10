"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { MenuGrid } from "@/components/menu/menu-grid";
import { WalletCard } from "@/components/wallet/wallet-card";
import { ProfileCard } from "@/components/profile/profile-card";
import { CartModal } from "@/components/cart/cart-modal";
import { SuccessModal } from "@/components/cart/success-modal";
import { Button } from "@/components/ui/button";
import { getMenuItems, placeOrder, getOrderHistory, getProfile } from "@/lib/api";
import { Coffee, Wallet, User, ShoppingBag, MenuIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import io from "socket.io-client";
import useOrderStatusListener from "@/hooks/useOrderStatusListener"; // This hook must be defined in /hooks/useOrderStatusListener.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface LastOrder {
  items: CartItem[];
  subtotal: number;
  total: number;
  newBalance: number;
}

interface OrderItem {
  menuItem: {
    name: string;
    price: number;
  };
  quantity: number;
}

export interface Order {
  _id: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
  status: string;
}

export interface MenuItem {
  _id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  image?: string;
}

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
}

const buildHeaders = () => {
  const token = localStorage.getItem("token"); // Ensure token is available
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export default function Dashboard() {
  const { user, updateUser, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("menu");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState<LastOrder | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [isLoading, user, router]);

  // Fetch menu items on mount (using absolute URL)
  useEffect(() => {
    async function fetchMenuItems() {
      try {
        const response = await fetch(`${API_URL}/menu-items`);
        if (!response.ok) {
          // Silent fail instead of throwing an error
          if (process.env.NODE_ENV === 'development') {
            console.log("Could not fetch menu items, status:", response.status);
          }
          return; // Early return instead of throwing
        }
        const data = await response.json();
        if (process.env.NODE_ENV === 'development') {
          console.log("Fetched menu items:", data.length);
        }
        const mappedItems = data.map((item: any) => ({
          ...item,
          id: item._id, // Map '_id' to 'id'
        }));
        setMenuItems(mappedItems);
      } catch (error) {
        // Use info level log instead of error in production
        if (process.env.NODE_ENV === 'development') {
          console.log("Menu items fetch issue:", error instanceof Error ? error.message : 'Unknown error');
        }
      }
    }
    fetchMenuItems();
  }, []);

  const handleAddToCart = (item: MenuItem, quantity: number) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i._id === item._id);
      if (existingItem) {
        return prevItems.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prevItems, { ...item, quantity }];
    });
    setIsCartOpen(true); // Open cart when adding items
  };

  const handlePlaceOrder = async () => {
    try {
      const currentUser = await getProfile();
      if (!currentUser.wallet || typeof currentUser.wallet.balance !== "number") {
        throw new Error("Wallet data is missing or invalid.");
      }

      const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      if (currentUser.wallet.balance < subtotal) {
        throw new Error("Insufficient balance in wallet.");
      }

      const orderDetails = {
        items: cartItems.map((item) => ({
          menuItemId: item._id,
          quantity: item.quantity,
        })),
      };

      const orderData = await placeOrder(orderDetails);
      
      const updatedProfile = await getProfile();
      
      if (!updatedProfile) {
        throw new Error("Failed to get updated profile after order.");
      }

      updateUser(updatedProfile);

      const lastOrderDetails = {
        items: cartItems,
        subtotal: subtotal,
        total: subtotal,
        newBalance: updatedProfile.wallet?.balance || 0,
      };

      setLastOrder(lastOrderDetails);
      setIsCartOpen(false);
      setCartItems([]);
      toast.success("Order placed successfully!");
      setIsSuccessOpen(true);
    } catch (error) {
      console.error("Failed to place order:", error);
      toast.error(error instanceof Error ? error.message : "Failed to place order");
    }
  };

  // Define tab content components
  const tabContent = {
    menu: <MenuGrid items={menuItems} onAddToCart={handleAddToCart} />,
    wallet: (
      <>
        <WalletCard />
      </>
    ),
    profile: <ProfileCard />,
    orders: <OrderHistory />,
  };

  useEffect(() => {
    // Set dynamic values here
  }, []);

  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <nav className="bg-[#5D4037] text-white shadow-lg sticky top-0 z-50">
        <div className="coffee-container">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Coffee className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Café Delight</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Button
                variant="ghost"
                onClick={() => setActiveTab("menu")}
                className={`text-white hover:text-[#BCAAA4] ${
                  activeTab === "menu" ? "border-b-2 border-[#BCAAA4]" : ""
                }`}
              >
                <Coffee className="mr-2 h-4 w-4" /> Menu
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveTab("wallet")}
                className={`text-white hover:text-[#BCAAA4] ${
                  activeTab === "wallet" ? "border-b-2 border-[#BCAAA4]" : ""
                }`}
              >
                <Wallet className="mr-2 h-4 w-4" /> Wallet
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveTab("orders")}
                className={`text-white hover:text-[#BCAAA4] ${
                  activeTab === "orders" ? "border-b-2 border-[#BCAAA4]" : ""
                }`}
              >
                <ShoppingBag className="mr-2 h-4 w-4" /> Orders
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveTab("profile")}
                className={`text-white hover:text-[#BCAAA4] ${
                  activeTab === "profile" ? "border-b-2 border-[#BCAAA4]" : ""
                }`}
              >
                <User className="mr-2 h-4 w-4" /> Profile
              </Button>

              {/* Cart Button */}
              <Button
                variant="ghost"
                onClick={() => setIsCartOpen(true)}
                className="relative text-white hover:text-[#BCAAA4]"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#8D6E63] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setIsCartOpen(true)}
                className="relative text-white hover:text-[#BCAAA4]"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#8D6E63] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </Button>
              <Button
                variant="ghost"
                className="text-white"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <MenuIcon className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-[#5D4037] text-white"
          >
            <div className="coffee-container py-4 space-y-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setActiveTab("menu");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-white hover:text-[#BCAAA4] justify-start"
              >
                <Coffee className="mr-2 h-4 w-4" /> Menu
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setActiveTab("wallet");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-white hover:text-[#BCAAA4] justify-start"
              >
                <Wallet className="mr-2 h-4 w-4" /> Wallet
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setActiveTab("orders");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-white hover:text-[#BCAAA4] justify-start"
              >
                <ShoppingBag className="mr-2 h-4 w-4" /> Orders
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setActiveTab("profile");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-white hover:text-[#BCAAA4] justify-start"
              >
                <User className="mr-2 h-4 w-4" /> Profile
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="coffee-container py-8">
        {activeTab === "menu" || activeTab === "wallet" || activeTab === "profile" ? (
          // When menu, wallet, or profile tab is active, don't show the heading or extra container
          <div>
            {tabContent[activeTab as keyof typeof tabContent]}
          </div>
        ) : (
          // For other tabs, keep the original heading and container
          <div className="glass-effect rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-6 text-[#2C1810]">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
            {tabContent[activeTab as keyof typeof tabContent]}
          </div>
        )}
      </main>

      {/* Cart Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onPlaceOrder={handlePlaceOrder}
        walletBalance={user?.wallet?.balance || 0}
        setCartItems={setCartItems}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => {
          setIsSuccessOpen(false);
          setActiveTab("orders"); // Switch to orders tab after successful order
        }}
        orderDetails={lastOrder || {
          items: [],
          subtotal: 0,
          total: 0,
          newBalance: 0,
        }}
      />
    </div>
  );
}

function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const fetchedOrders = await getOrderHistory();
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Failed to fetch order history:", error);
        toast.error("Failed to load order history");
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    type StatusType = 'pending' | 'preparing' | 'ready' | 'completed' | 'on the way';
    
    const statusColors: Record<StatusType, string> = {
      pending: "bg-yellow-500 text-white",
      preparing: "bg-blue-500 text-white",
      ready: "bg-emerald-500 text-white",
      completed: "bg-purple-500 text-white",
      "on the way": "bg-indigo-500 text-white"
    };
    
    return statusColors[status.toLowerCase() as StatusType] || "bg-gray-500 text-white";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5D4037]"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-[#8D6E63] opacity-50" />
        <h3 className="text-xl font-medium text-[#5D4037] mb-2">No orders yet</h3>
        <p className="text-[#8D6E63]">Your order history will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order._id} className="overflow-hidden">
          <CardHeader className="bg-[#5D4037]/5">
            <div className="flex justify-between items-center">
              <CardTitle className="text-[#5D4037]">
                Order #{order._id.slice(-6)}
              </CardTitle>
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center text-[#8D6E63]"
                >
                  <div className="flex-1">
                    <p className="font-medium text-[#5D4037]">
                      {item.menuItem?.name || "Removed Item"}
                    </p>
                    <p className="text-sm">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-medium">
                    ₹{((item.menuItem?.price || 0) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
              <div className="pt-4 border-t border-[#BCAAA4]">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-[#5D4037]">Total</p>
                  <p className="font-bold text-[#5D4037]">₹{order.total.toFixed(2)}</p>
                </div>
                <p className="text-sm text-[#8D6E63] mt-1">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
