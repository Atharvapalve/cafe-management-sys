"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { getMenuItems } from "@/lib/api";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  rewardPoints: number;
  category?: string;
  image?: string; // Optional image property
}

interface MenuGridProps {
  onAddToCart: (item: MenuItem, quantity: number) => void;
}

export function MenuGrid({ onAddToCart }: MenuGridProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
  });

  useEffect(() => {
    fetchFilteredMenuItems();
  }, [filters]);

  const fetchFilteredMenuItems = async () => {
    try {
      const params = new URLSearchParams(filters as Record<string, string>);
      const items = await getMenuItems(params.toString());
      setMenuItems(items);
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta),
    }));
  };

  const handleAddToCart = (item: MenuItem) => {
    const quantity = quantities[item.id] || 0;
    if (quantity > 0) {
      onAddToCart(item, quantity);
      setQuantities((prev) => ({ ...prev, [item.id]: 0 }));
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
            onValueChange={(value) => setFilters({ ...filters, category: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
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
          <div key={item.id} className="border p-4 rounded-lg shadow-md bg-coffee-medium text-coffee-cream">
            {/* Display the item's image if available */}
            {item.image ? (
              <img
                src={item.image}
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
              <p className="text-sm text-coffee-cream dark:tetext-coffee-cream">
                Reward Points: {item.rewardPoints}
              </p>
              {/* Quantity Selector */}
              <div className="flex items-center justify-center space-x-6 mt-2">
                <Button
                  onClick={() => updateQuantity(item.id, -1)}
                  className="h-8 w-8 rounded-full bg-[#2C1810] text-[#2C1810]"
                >
                  <Minus size={16} color="#2C1810" />
                </Button>
                <span className="text-lg font-medium">{quantities[item.id] || 0}</span>
                <Button
                  onClick={() => updateQuantity(item.id, 1)}
                  className="h-8 w-8 rounded-full bg-[#2C1810] text-[#2C1810]"
                >
                  <Plus size={16} color="#2C1810" />
                </Button>
              </div>
              {/* Add to Cart Button */}
              <Button
                onClick={() => handleAddToCart(item)}
                disabled={!quantities[item.id]}
                className="mt-2 w-full bg-[#2C1810] hover:bg-[#6B4F3D] text-[#E6DCC3]"
              >
                Add to Cart
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}