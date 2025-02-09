"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  rewardPoints: number;
  description?: string;
  category?: string;
  image?: string; // Add this line
}

interface MenuGridProps {
  items: MenuItem[];
  onAddToCart: (item: MenuItem, quantity: number) => void;
}

export function MenuGrid({ items, onAddToCart }: MenuGridProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const updateQuantity = (id: string, delta: number) => {
    setQuantities((prev) => {
      const newQuantities = {
        ...prev,
        [id]: Math.max(0, (prev[id] || 0) + delta),
      };
      console.log("Updated quantities:", newQuantities); // Log the updated state
      return newQuantities;
    });
  };

  const handleAddToCart = (item: MenuItem) => {
    const quantity = quantities[item.id] || 0;
    if (quantity > 0) {
      onAddToCart(item, quantity);
      setQuantities((prev) => ({ ...prev, [item.id]: 0 }));
    }
    
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      {items.map((item) => (
        <div key={item.id} className="border p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-bold">{item.name}</h3>
          {item.image && (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-48 object-cover mt-2 rounded-md"
            />
          )}
          <p className="mt-2">₹{item.price}</p>
          <p>Reward Points: {item.rewardPoints}</p>
          <div className="flex items-center space-x-2 mt-2">
            <button
              onClick={() => updateQuantity(item.id, -1)}
              className="h-8 w-8 rounded-full bg-[#2C1810] text-[#E6DCC3] flex items-center justify-center"
            >
              <Minus size={16} />
            </button>
            <span>{quantities[item.id] || 0}</span>
            <button
              onClick={() => updateQuantity(item.id, 1)}
              className="h-8 w-8 rounded-full bg-[#2C1810] text-[#E6DCC3] flex items-center justify-center"
            >
              <Plus size={16} />
            </button>
          </div>
          <Button
            onClick={() => handleAddToCart(item)}
            disabled={!quantities[item.id]}
            className="mt-4 w-full"
          >
            Add to Cart
          </Button>
        </div>
      ))}
    </div>
  );
}