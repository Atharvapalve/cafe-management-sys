"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Minus, Coffee, Search, Cake, Pizza, ShoppingCart } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { getMenuItems } from "@/lib/api"

export interface MenuItem {
  _id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  quantity?: number;
  description?: string;
}

interface MenuGridProps {
  items: MenuItem[];
  onAddToCart: (item: MenuItem, quantity: number) => void;
}

export function MenuGrid({ onAddToCart }: MenuGridProps) {
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([])
  const [displayedItems, setDisplayedItems] = useState<MenuItem[]>([])
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    search: "",
  })
  const [isLoading, setIsLoading] = useState(true)

  // Fetch all menu items on component mount or when server filters change
  useEffect(() => {
    fetchMenuItems()
  }, [filters.category, filters.minPrice, filters.maxPrice])

  // Apply client-side filters whenever they change
  useEffect(() => {
    applyFilters()
  }, [filters.search, allMenuItems])

  const fetchMenuItems = async () => {
    try {
      setIsLoading(true)
      // Only send category and price to backend
      const params = new URLSearchParams()
      if (filters.category && filters.category !== "All") {
        params.append('category', filters.category)
      }
      if (filters.minPrice) params.append('minPrice', filters.minPrice)
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice)
      
      console.log("Fetching with params:", params.toString())
      const items = await getMenuItems(params.toString())
      console.log("Fetched items:", items.length)
      setAllMenuItems(items)
      setDisplayedItems(items) // Initialize displayed items
    } catch (error) {
      console.error("Failed to fetch menu items:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Apply client-side filters (search only)
  const applyFilters = () => {
    if (!allMenuItems.length) return
    
    let filteredItems = [...allMenuItems]
    
    // Apply search filter - search only in names for more accuracy
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase().trim()
      filteredItems = filteredItems.filter(item => {
        // For single letter searches, only match the beginning of words
        if (searchTerm.length === 1) {
          const words = item.name.toLowerCase().split(' ')
          return words.some(word => word.startsWith(searchTerm))
        }
        
        // For longer searches, allow matches anywhere in the name but not description
        return item.name.toLowerCase().includes(searchTerm)
      })
    }
    
    setDisplayedItems(filteredItems)
  }

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const updateQuantity = (_id: string, delta: number) => {
    setQuantities((prev) => {
      const newQuantity = Math.max(0, (prev[_id] || 0) + delta)
      return { ...prev, [_id]: newQuantity }
    })
  }

  const handleAddToCart = (item: MenuItem) => {
    const quantity = quantities[item._id] || 0;
    if (quantity > 0) {
      onAddToCart(item, quantity);
      setQuantities((prev) => ({ ...prev, [item._id]: 0 }));
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'beverages':
        return <Coffee className="w-5 h-5" />
      case 'desserts':
        return <Cake className="w-5 h-5" />
      case 'snacks':
        return <Pizza className="w-5 h-5" />
      default:
        return <Coffee className="w-5 h-5" />
    }
  }

  return (
    <div className="min-h-screen">
      {/* Outer Container without extra padding */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-[#BCAAA4] max-w-full mx-auto">
        {/* Hero Section - Slightly Reduced */}
        <div className="text-center py-8 px-6 bg-[#EFEBE9]/80 backdrop-blur-sm rounded-t-xl border-b border-[#BCAAA4]">
          <h1 className="text-5xl font-bold text-[#5D4037] mb-4">Our Menu</h1>
          <p className="text-[#8D6E63] max-w-2xl mx-auto text-lg">
            Discover our handcrafted selection of coffee, delicious snacks, and sweet treats.
          </p>
        </div>

        {/* Content Area with padding */}
        <div className="p-8">
          {/* Filter Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-8 shadow-lg border border-[#BCAAA4]">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1 w-full md:max-w-md">
                <Input
                  type="text"
                  placeholder="Search menu items..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 pr-4 py-2 w-full rounded-lg border-2 border-[#BCAAA4] focus:border-[#8D6E63] focus:ring-[#8D6E63] text-[#5D4037] placeholder-[#A1887F]"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8D6E63] w-4 h-4" />
              </div>

              {/* Category Filter */}
              <Select
                value={filters.category}
                onValueChange={(value) => handleFilterChange('category', value === "All" ? "" : value)}
              >
                <SelectTrigger className="w-[180px] border-2 border-[#BCAAA4] text-[#5D4037]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Items</SelectItem>
                  <SelectItem value="Beverages">Beverages</SelectItem>
                  <SelectItem value="Snacks">Snacks</SelectItem>
                  <SelectItem value="Desserts">Desserts</SelectItem>
                </SelectContent>
              </Select>

              {/* Price Range */}
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  placeholder="Min ₹"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="w-24 border-2 border-[#BCAAA4] text-[#5D4037] placeholder-[#A1887F]"
                />
                <span className="text-[#8D6E63]">to</span>
                <Input
                  type="number"
                  placeholder="Max ₹"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="w-24 border-2 border-[#BCAAA4] text-[#5D4037] placeholder-[#A1887F]"
                />
              </div>
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedItems.map((item) => (
              <div 
                key={item._id} 
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Image Container */}
                <div className="relative h-48">
                  {item.image ? (
                    <img
                      src={item.image.startsWith("http") ? item.image : `http://localhost:5000${item.image}`}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#D7CCC8] flex items-center justify-center">
                      {getCategoryIcon(item.category || '')}
                    </div>
                  )}
                  {/* Category Badge */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-[#5D4037]">
                    {item.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#5D4037] mb-2">{item.name}</h3>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold text-[#5D4037]">₹{item.price.toFixed(2)}</span>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 bg-[#D7CCC8] rounded-lg px-2">
                      <button
                        onClick={() => updateQuantity(item._id, -1)}
                        className="p-2 text-[#5D4037] hover:text-[#8D6E63] transition-colors"
                        disabled={!quantities[item._id]}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium text-[#5D4037]">{quantities[item._id] || 0}</span>
                      <button
                        onClick={() => updateQuantity(item._id, 1)}
                        className="p-2 text-[#5D4037] hover:text-[#8D6E63] transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <Button
                      onClick={() => handleAddToCart(item)}
                      disabled={!quantities[item._id]}
                      className={`w-16 h-10 ${
                        quantities[item._id]
                          ? 'bg-[#5D4037] hover:bg-[#8D6E63] text-white'
                          : 'bg-[#D7CCC8] text-[#5D4037] cursor-not-allowed'
                      } transition-colors duration-200`}
                      title="Add to Cart"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5D4037]"></div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && displayedItems.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-[#5D4037] mb-2">No items found</h3>
              <p className="text-[#8D6E63]">Try adjusting your filters or search terms</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

