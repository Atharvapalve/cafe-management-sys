"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Coffee, 
  ShoppingBag, 
  DollarSign, 
  Calendar, 
  ChevronRight,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { getMenuItems, getUsers, getAdminOrders } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import Image from "next/image";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
}

interface OrderItem {
  menuItem: MenuItem | null;
  quantity: number;
}

interface Order {
  _id: string;
  user: {
    name: string;
    email?: string;
  } | null;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
}

interface DashboardMetrics {
  totalMenuItems: number;
  totalOrdersToday: number;
  totalClientsToday: number;
  averageOrderValue: number;
  totalRevenueToday: number;
}

interface TrendingItem {
  id: string;
  name: string;
  orders: number;
  image: string;
  trend: number; // percentage increase/decrease
}

interface RevenueData {
  date: string;
  revenue: number;
}

const timeOptions = ["Weekly", "Monthly"];

export function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalMenuItems: 0,
    totalOrdersToday: 0,
    totalClientsToday: 0,
    averageOrderValue: 0,
    totalRevenueToday: 0,
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [timeFrame, setTimeFrame] = useState("Monthly");
  const [orderTimeFrame, setOrderTimeFrame] = useState("Monthly");
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch menu items
        const menuData = await getMenuItems();
        setMenuItems(menuData);
        
        // Fetch orders
        const orderData = await getAdminOrders();
        setOrders(orderData);
        
        // Fetch users
        const userData = await getUsers();
        setUsers(userData);
        
        // Calculate metrics
        calculateMetrics(menuData, orderData, userData);
        
        // Generate trending items
        generateTrendingItems(orderData, menuData);
        
        // Generate revenue data
        generateRevenueData(orderData, timeFrame.toLowerCase());
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    
    fetchData();
  }, [timeFrame]);

  const calculateMetrics = (menuData: MenuItem[], orderData: Order[], userData: any[]) => {
    // Total menu items
    const totalMenuItems = menuData.length;
    
    // Set default values in case of empty data
    let totalOrdersToday = 0;
    let totalClientsToday = 0;
    let averageOrderValue = 0;
    let totalRevenueToday = 0;
    
    // Only calculate if we have order data
    if (orderData && orderData.length > 0) {
      // Today's date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // For testing/demo purposes, consider all orders from the past 30 days
      // This ensures we have data to show even without today's orders
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Filter recent orders (last 30 days)
      const recentOrders = orderData.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= thirtyDaysAgo;
      });
      
      // Filter orders for today (for metrics)
      const todayOrders = orderData.filter(order => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      });
      
      // If no orders today, use the most recent day with orders for demo purposes
      const ordersToUse = todayOrders.length > 0 ? todayOrders : recentOrders.slice(0, 5);
      
      // Total orders today
      totalOrdersToday = ordersToUse.length;
      
      // Unique clients
      const uniqueClientIds = new Set(ordersToUse.map(order => {
        // Safely check for user and user._id property
        if (order.user && '_id' in order.user) {
          return (order.user as any)._id;
        }
        return null;
      }).filter(Boolean));
      totalClientsToday = uniqueClientIds.size;
      
      // Total revenue today
      totalRevenueToday = ordersToUse.reduce((sum, order) => sum + order.total, 0);
      
      // Average order value 
      averageOrderValue = totalOrdersToday > 0 
        ? parseFloat((totalRevenueToday / totalOrdersToday).toFixed(2)) 
        : 0;
    }
    
    setMetrics({
      totalMenuItems,
      totalOrdersToday,
      totalClientsToday,
      averageOrderValue,
      totalRevenueToday
    });
  };

  const generateTrendingItems = (orderData: Order[], menuData: MenuItem[]) => {
    // Count orders per menu item - for current period (last 30 days)
    const currentPeriodCounts: Record<string, { count: number, name: string, image: string }> = {};
    
    // Get dates for current and previous periods
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(today.getDate() - 60);
    
    // Filter orders for current period (last 30 days)
    const currentPeriodOrders = orderData.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= thirtyDaysAgo && orderDate <= today;
    });
    
    // Filter orders for previous period (30-60 days ago)
    const previousPeriodOrders = orderData.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= sixtyDaysAgo && orderDate < thirtyDaysAgo;
    });
    
    // Process current period orders
    currentPeriodOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.menuItem) {
          const id = item.menuItem._id;
          if (!currentPeriodCounts[id]) {
            // Find the menu item in menuData to get the full details
            const fullMenuItem = menuData.find(m => m._id === id);
            
            currentPeriodCounts[id] = { 
              count: 0, 
              name: item.menuItem.name,
              image: item.menuItem.image || ""
            };
          }
          currentPeriodCounts[id].count += item.quantity;
        }
      });
    });
    
    // Count orders for previous period
    const previousPeriodCounts: Record<string, number> = {};
    
    previousPeriodOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.menuItem) {
          const id = item.menuItem._id;
          if (!previousPeriodCounts[id]) {
            previousPeriodCounts[id] = 0;
          }
          previousPeriodCounts[id] += item.quantity;
        }
      });
    });
    
    // Calculate trends and sort by current period popularity
    const trendingItemsData = Object.entries(currentPeriodCounts)
      .map(([id, data]) => {
        const currentCount = data.count;
        const previousCount = previousPeriodCounts[id] || 0;
        
        // Calculate trend percentage
        let trendPercent = 0;
        if (previousCount > 0) {
          // Calculate percentage change
          trendPercent = Math.round(((currentCount - previousCount) / previousCount) * 100);
        } else if (currentCount > 0) {
          // If no previous orders but has current orders, mark as new/trending up (100%)
          trendPercent = 100;
        }
        
        return {
          id,
          name: data.name,
          orders: currentCount,
          image: data.image,
          trend: trendPercent
        };
      })
      .sort((a, b) => b.orders - a.orders) // Sort by current period popularity
      .slice(0, 3); // Top 3 items
    
    console.log("Trending items with real trends:", trendingItemsData);
    setTrendingItems(trendingItemsData);
  };

  const generateRevenueData = (orderData: Order[], period: string) => {
    const today = new Date();
    let startDate = new Date();
    
    // Set start date based on period
    if (period === 'weekly') {
      // For weekly view, show last 7 days
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 6); // Start from 6 days ago to include today
      startDate.setHours(0, 0, 0, 0);
    } else {
      // For monthly view, start from 6 months ago
      startDate.setMonth(today.getMonth() - 5);
    }
    
    // Group orders by date
    const revenueByDate: Record<string, { revenue: number, monthNumber?: number, fullDate?: Date }> = {};
    
    // Initialize all dates in range
    let currentDate = new Date(startDate);
    while (currentDate <= today) {
      const dateKey = period === 'weekly'
        ? format(currentDate, 'MM/dd') // Use MM/dd for weekly view
        : format(currentDate, 'MMM'); // Use MMM for monthly view
      
      if (period === 'weekly') {
        if (!revenueByDate[dateKey]) {
          revenueByDate[dateKey] = { 
            revenue: 0,
            fullDate: new Date(currentDate) // Store full date for weekly sorting
          };
        }
        currentDate.setDate(currentDate.getDate() + 1);
      } else {
        if (!revenueByDate[dateKey]) {
          revenueByDate[dateKey] = { 
            revenue: 0,
            monthNumber: currentDate.getMonth()
          };
        }
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }
    
    // Sum revenue by date
    orderData.forEach(order => {
      const orderDate = new Date(order.createdAt);
      
      if (orderDate >= startDate && orderDate <= today) {
        const dateKey = period === 'weekly'
          ? format(orderDate, 'MM/dd')
          : format(orderDate, 'MMM');
        
        if (dateKey in revenueByDate) {
          revenueByDate[dateKey].revenue += order.total;
        }
      }
    });
    
    // Convert to array and sort
    const chartData = Object.entries(revenueByDate)
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        monthNumber: data.monthNumber,
        fullDate: data.fullDate
      }))
      .sort((a, b) => {
        if (period === 'weekly') {
          // Sort by actual dates for weekly view
          return a.fullDate!.getTime() - b.fullDate!.getTime();
        } else {
          // Sort by month number with November as reference
          const referenceMonth = 10; // November
          let aMonth = a.monthNumber!;
          let bMonth = b.monthNumber!;
          
          // If month is less than November, add 12 to make it next year
          if (aMonth < referenceMonth) aMonth += 12;
          if (bMonth < referenceMonth) bMonth += 12;
          
          return aMonth - bMonth;
        }
      })
      .map(({ date, revenue }) => ({
        date: period === 'weekly' 
          ? format(new Date(today.getFullYear(), parseInt(date.split('/')[0]) - 1, parseInt(date.split('/')[1])), 'EEE') // Show day names for weekly
          : date,
        revenue
      }));
    
    setRevenueData(chartData);
  };

  // Generate data for orders summary (bar chart)
  const generateOrderSummaryData = () => {
    const today = new Date();
    let startDate = new Date();
    let dateFormat = 'MMM';
    
    // Set start date based on selected timeframe
    if (orderTimeFrame === 'Weekly') {
      startDate.setDate(today.getDate() - 6);
      dateFormat = 'MM/dd';
    } else { // monthly
      startDate.setMonth(today.getMonth() - 5); // Show last 6 months
    }
    
    // Group orders by date
    const countByDate: Record<string, { completed: number, pending: number, monthNumber: number }> = {};
    
    // Initialize all dates in range
    let currentDate = new Date(startDate);
    while (currentDate <= today) {
      const monthKey = format(currentDate, dateFormat);
      const monthNumber = currentDate.getMonth();
      
      if (!countByDate[monthKey]) {
        countByDate[monthKey] = { completed: 0, pending: 0, monthNumber };
      }
      
      if (orderTimeFrame === 'Weekly') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }
    
    // Count orders by date and status
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      
      if (orderDate >= startDate && orderDate <= today) {
        const monthKey = format(orderDate, dateFormat);
        
        if (monthKey in countByDate) {
          if (order.status === 'Ready' || order.status === 'Completed') {
            countByDate[monthKey].completed += 1;
          } else {
            countByDate[monthKey].pending += 1;
          }
        }
      }
    });
    
    // Convert to array and sort by actual month number
    return Object.entries(countByDate)
      .map(([date, data]) => ({
        date,
        completed: data.completed,
        pending: data.pending,
        monthNumber: data.monthNumber
      }))
      .sort((a, b) => {
        if (orderTimeFrame === 'Weekly') {
          const [aMonth, aDay] = a.date.split('/').map(Number);
          const [bMonth, bDay] = b.date.split('/').map(Number);
          return (aMonth * 100 + aDay) - (bMonth * 100 + bDay);
        } else {
          // Get reference month (November)
          const referenceMonth = 10; // 0-based month number for November
          
          // Adjust month numbers relative to November
          let aMonth = a.monthNumber;
          let bMonth = b.monthNumber;
          
          // If month is less than November, add 12 to make it next year
          if (aMonth < referenceMonth) aMonth += 12;
          if (bMonth < referenceMonth) bMonth += 12;
          
          return aMonth - bMonth;
        }
      })
      .map(({ date, completed, pending }) => ({ date, completed, pending }));
  };

  // Recent orders for the orders list
  const recentOrders = orders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const statusColors = {
    pending: "bg-yellow-500 text-white",
    preparing: "bg-blue-500 text-white",
    Ready: "bg-emerald-500 text-white",
    Completed: "bg-purple-500 text-white",
    "On the Way": "bg-indigo-500 text-white"
  };

  const handleOrderUpdate = async (orderId: string, currentStatus: string) => {
    try {
      setUpdatingOrder(orderId);
      let newStatus = '';
      
      // Determine next status
      switch(currentStatus.toLowerCase()) {
        case 'pending':
          newStatus = 'preparing';
          break;
        case 'preparing':
          newStatus = 'ready';
          break;
        case 'ready':
          newStatus = 'completed';
          break;
        default:
          return; // Don't update if already completed
      }

      // Update order in the backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      // Update order in state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId 
            ? { ...order, status: newStatus } 
            : order
        )
      );

      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdatingOrder(null);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-[#5D4037] mb-6">Admin Dashboard</h1>
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-[#BCAAA4]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8D6E63] font-medium">Total Menus</p>
                <h3 className="text-3xl font-bold text-[#5D4037]">{metrics.totalMenuItems}</h3>
              </div>
              <div className="bg-[#EFEBE9] p-3 rounded-full">
                <Coffee className="h-6 w-6 text-[#5D4037]" />
              </div>
            </div>
            <div className="mt-4 h-1.5 w-full bg-[#D7CCC8] rounded-full overflow-hidden">
              <div className="bg-[#5D4037] h-full rounded-full" style={{ width: '65%' }}></div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-[#BCAAA4]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8D6E63] font-medium">Total Orders Today</p>
                <h3 className="text-3xl font-bold text-[#5D4037]">{metrics.totalOrdersToday}</h3>
              </div>
              <div className="bg-[#EFEBE9] p-3 rounded-full">
                <ShoppingBag className="h-6 w-6 text-[#5D4037]" />
              </div>
            </div>
            <div className="mt-4 h-1.5 w-full bg-[#D7CCC8] rounded-full overflow-hidden">
              <div className="bg-[#5D4037] h-full rounded-full" style={{ width: '45%' }}></div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-[#BCAAA4]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8D6E63] font-medium">Total Clients Today</p>
                <h3 className="text-3xl font-bold text-[#5D4037]">{metrics.totalClientsToday}</h3>
              </div>
              <div className="bg-[#EFEBE9] p-3 rounded-full">
                <User className="h-6 w-6 text-[#5D4037]" />
              </div>
            </div>
            <div className="mt-4 h-1.5 w-full bg-[#D7CCC8] rounded-full overflow-hidden">
              <div className="bg-[#5D4037] h-full rounded-full" style={{ width: '40%' }}></div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-[#BCAAA4]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8D6E63] font-medium">Revenue Today</p>
                <h3 className="text-3xl font-bold text-[#5D4037]">₹{metrics.totalRevenueToday.toFixed(2)}</h3>
              </div>
              <div className="bg-[#EFEBE9] p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-[#5D4037]" />
              </div>
            </div>
            <div className="mt-4 h-1.5 w-full bg-[#D7CCC8] rounded-full overflow-hidden">
              <div className="bg-[#5D4037] h-full rounded-full" style={{ width: '85%' }}></div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Revenue Chart and Orders Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-[#BCAAA4]">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <CardTitle className="text-lg font-semibold text-[#5D4037]">Revenue</CardTitle>
              <div className="flex space-x-2">
                {timeOptions.map(option => (
                  <Button 
                    key={option}
                    variant={timeFrame === option ? "default" : "outline"}
                    className={timeFrame === option ? "bg-[#5D4037] text-white" : "text-[#5D4037] border-[#5D4037]"}
                    size="sm"
                    onClick={() => setTimeFrame(option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`₹${value}`, 'Revenue']}
                    contentStyle={{ backgroundColor: 'white', borderColor: '#5D4037' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#5D4037" 
                    activeDot={{ r: 8 }} 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-[#BCAAA4]">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <CardTitle className="text-lg font-semibold text-[#5D4037]">Orders Summary</CardTitle>
              <div className="flex space-x-2">
                {timeOptions.map(option => (
                  <Button 
                    key={option}
                    variant={orderTimeFrame === option ? "default" : "outline"}
                    className={orderTimeFrame === option ? "bg-[#5D4037] text-white" : "text-[#5D4037] border-[#5D4037]"}
                    size="sm"
                    onClick={() => setOrderTimeFrame(option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={generateOrderSummaryData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'completed') return [value, 'Completed Orders'];
                      if (name === 'pending') return [value, 'Pending Orders'];
                      return [value, name];
                    }}
                    contentStyle={{ backgroundColor: 'white', borderColor: '#5D4037' }}
                    labelStyle={{ color: '#5D4037', fontWeight: 'bold' }}
                  />
                  <Legend formatter={(value) => {
                    if (value === 'completed') return 'Completed Orders';
                    if (value === 'pending') return 'Pending Orders';
                    return value;
                  }} />
                  <Bar dataKey="completed" fill="#5D4037" name="completed" />
                  <Bar dataKey="pending" fill="#BCAAA4" name="pending" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Trending items and Orders Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="col-span-12 lg:col-span-4 bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-[#BCAAA4]">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <CardTitle className="text-lg font-semibold text-[#5D4037]">Trending</CardTitle>
              <Button variant="ghost" size="sm" className="text-[#5D4037]">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {trendingItems.map((item, index) => (
                <div key={item.id} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-[#EFEBE9]">
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden flex items-center justify-center">
                    {item.image ? (
                      <img
                        src={item.image.startsWith("http") ? item.image : `http://localhost:5000${item.image}`}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#D7CCC8] flex items-center justify-center">
                        <Coffee className="w-8 h-8 text-[#8D6E63]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-[#5D4037]">{item.name}</h4>
                    <div className="flex items-center">
                      <span className="text-[#8D6E63] mr-2">{index + 1}</span>
                      <span className={`flex items-center ${item.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.trend > 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                        {item.trend}%
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-[#5D4037]">{item.orders}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-12 lg:col-span-8 bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-[#BCAAA4]">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <CardTitle className="text-lg font-semibold text-[#5D4037]">Recent Orders</CardTitle>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#BCAAA4]">
                  <TableHead className="text-[#5D4037]">Order ID</TableHead>
                  <TableHead className="text-[#5D4037]">Date</TableHead>
                  <TableHead className="text-[#5D4037]">Customer</TableHead>
                  <TableHead className="text-[#5D4037]">Amount</TableHead>
                  <TableHead className="text-[#5D4037]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 10)
                  .map(order => (
                    <TableRow key={order._id} className="hover:bg-[#EFEBE9] border-b border-[#BCAAA4]">
                      <TableCell className="font-medium text-[#5D4037]">#{order._id.substring(order._id.length - 6)}</TableCell>
                      <TableCell className="text-[#8D6E63]">{format(new Date(order.createdAt), 'MMM d, yyyy HH:mm')}</TableCell>
                      <TableCell className="text-[#5D4037]">{order.user?.name || 'Guest'}</TableCell>
                      <TableCell className="text-[#5D4037]">₹{order.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                          order.status.toLowerCase() === 'pending' ? 'bg-yellow-500 text-white' :
                          order.status.toLowerCase() === 'preparing' ? 'bg-blue-500 text-white' :
                          order.status.toLowerCase() === 'ready' ? 'bg-emerald-500 text-white' :
                          order.status.toLowerCase() === 'completed' ? 'bg-purple-500 text-white' :
                          'bg-indigo-500 text-white'
                        }`}>
                          {order.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}