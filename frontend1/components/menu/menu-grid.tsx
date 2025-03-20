"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Minus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { getMenuItems } from "@/lib/api"

export interface MenuItem {
  _id: string
  name: string
  price: number
  rewardPoints: number
  category?: string
  image?: string // Optional image property
}

interface MenuGridProps {
  items: MenuItem[];
  onAddToCart: (item: MenuItem, quantity: number) => void;
}

export function MenuGrid({ onAddToCart }: MenuGridProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
  })
  
  useEffect(() => {
    fetchFilteredMenuItems()
  }, [filters])

  const fetchFilteredMenuItems = async () => {
    try {
      const params = new URLSearchParams(filters as Record<string, string>)
      const items = await getMenuItems(params.toString())
      setMenuItems(items)
    } catch (error) {
      console.error("Failed to fetch menu items:", error)
    }
  }

  const updateQuantity = (_id: string, delta: number) => {
    setQuantities((prev) => {
      const newQuantity = Math.max(0, (prev[_id] || 0) + delta)
      return {
        ...prev,
        [_id]: newQuantity,
      }
    })
  }
  const handleAddToCart = (item: MenuItem) => {
    const quantity = quantities[item._id] || 0;
    console.log("Adding to cart:", { item, quantity });
    if (quantity > 0) {
      onAddToCart(item, quantity);
      setQuantities((prev) => {
        const newQuantities = { ...prev, [item._id]: 0 };
        console.log("After resetting quantity:", newQuantities);
        return newQuantities;
      });
    }
  };

  return (
    <div>
      {/* Filter Section */}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-4">Filter Menu</h3>
        <div className="flex flex-wrap gap-4">
          {/* Category Filter */}
          <Select
  value={filters.category}
  onValueChange={(value) => {
    // Set category to an empty string for "All"
    setFilters({ ...filters, category: value === "All" ? "" : value });
  }}
>
  <SelectTrigger className="w-60">
    <SelectValue placeholder="Select Category" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="All">All</SelectItem>
    <SelectItem value="Beverages">Beverages</SelectItem>
    <SelectItem value="Snacks">Snacks</SelectItem>
    <SelectItem value="Desserts">Desserts</SelectItem>
  </SelectContent>
</Select>
          {/* Price Range Filter */}
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              className="w-24"
            />
            <span>-</span>
            <Input
              type="number"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              className="w-24"
            />
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {menuItems.map((item) => (
  <div key={item._id} className="border p-4 rounded-lg shadow-md bg-coffee-medium text-coffee-cream">
            {/* Display the item's image if available */}
            {item.image ? (
              <img
              src={item.image.startsWith("http") ? item.image : `http://localhost:5000${item.image}`} 
                alt={item.name}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-md mb-4">
                <p className="text-gray-500 dark:text-gray-400">No Image Available</p>
              </div>
            )}
            {/* Item Details */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-coffee-cream dark:text-coffee-cream">{item.name}</h3>
              <p className="text-coffee-cream dark:text-coffee-cream">₹{item.price.toFixed(2)}</p>
              <p className="text-sm text-coffee-cream dark:text-coffee-cream">Reward Points: {item.rewardPoints}</p>
              {/* Quantity Selector */}
              <div className="flex items-center justify-center space-x-6 mt-2">
                <Button
                  onClick={() => updateQuantity(item._id, -1)}
                  className="h-8 w-8 rounded-full bg-coffee-medium hover:bg-[#6B4F3D] text-[#E6DCC3]" // Corrected button color
                >-
                  <Minus size={16} color="#E6DCC3" /> {/* Corrected minus icon color */}
                </Button>
                <span className="text-lg font-medium">{quantities[item._id] || 0}</span>
                <Button
                  onClick={() => updateQuantity(item._id, 1)}
                  className="h-8 w-8 rounded-full bg-coffee-medium hover:bg-[#6B4F3D] text-[#E6DCC3]" // Corrected button color
                >+
                  <Plus size={16} color="#E6DCC3" /> {/* Corrected plus icon color */}
                </Button>
              </div>
              {/* Add to Cart Button */}
              <Button
                onClick={() => handleAddToCart(item)}
                disabled={!quantities[item._id]}
                className="mt-2 w-full bg-[#2C1810] hover:bg-[#6B4F3D] text-[#E6DCC3]"
              >
                Add to Cart
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

