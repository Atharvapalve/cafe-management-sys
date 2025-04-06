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
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [timeFrame, setTimeFrame] = useState("Monthly");
  const [orderTimeFrame, setOrderTimeFrame] = useState("Monthly");

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
      const uniqueClientIds = new Set(ordersToUse.map(order => order.user?._id).filter(Boolean));
      totalClientsToday = uniqueClientIds.size;
      
      // Average order value (revenue per ratio)
      const totalRevenue = ordersToUse.reduce((sum, order) => sum + order.total, 0);
      averageOrderValue = totalOrdersToday > 0 
        ? parseFloat((totalRevenue / totalOrdersToday).toFixed(2)) 
        : 0;
    }
    
    setMetrics({
      totalMenuItems,
      totalOrdersToday,
      totalClientsToday,
      averageOrderValue
    });
  };

  const generateTrendingItems = (orderData: Order[], menuData: MenuItem[]) => {
    // Count orders per menu item
    const itemCounts: Record<string, { count: number, name: string, image: string }> = {};
    
    orderData.forEach(order => {
      order.items.forEach(item => {
        if (item.menuItem) {
          const id = item.menuItem._id;
          if (!itemCounts[id]) {
            itemCounts[id] = { 
              count: 0, 
              name: item.menuItem.name,
              image: item.menuItem.image || "/images/default-coffee.jpg"
            };
          }
          itemCounts[id].count += item.quantity;
        }
      });
    });
    
    // Convert to array and sort by count
    const sortedItems = Object.entries(itemCounts)
      .map(([id, data]) => ({
        id,
        name: data.name,
        orders: data.count,
        image: data.image,
        trend: Math.floor(Math.random() * 30) // Mock trend data (random for demo)
      }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 3); // Top 3 items
    
    setTrendingItems(sortedItems);
  };

  const generateRevenueData = (orderData: Order[], period: string) => {
    const today = new Date();
    let startDate = new Date();
    
    // Set start date based on period
    if (period === 'weekly') {
      startDate.setDate(today.getDate() - 7);
    } else { // monthly
      startDate.setMonth(today.getMonth() - 7);
    }
    
    // Group orders by date
    const revenueByDate: Record<string, number> = {};
    
    // Initialize all dates in range
    let currentDate = new Date(startDate);
    while (currentDate <= today) {
      const dateKey = period === 'weekly' 
        ? format(currentDate, 'MM/dd') 
        : format(currentDate, 'MMM');
      
      if (!revenueByDate[dateKey]) {
        revenueByDate[dateKey] = 0;
      }
      
      if (period === 'weekly') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else {
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
        
        revenueByDate[dateKey] = (revenueByDate[dateKey] || 0) + order.total;
      }
    });
    
    // Convert to array for chart
    const chartData = Object.entries(revenueByDate)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => {
        if (period === 'weekly') {
          const [aMonth, aDay] = a.date.split('/').map(Number);
          const [bMonth, bDay] = b.date.split('/').map(Number);
          return (aMonth * 100 + aDay) - (bMonth * 100 + bDay);
        } else {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return months.indexOf(a.date) - months.indexOf(b.date);
        }
      });
    
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
      startDate.setMonth(today.getMonth() - 5);
    }
    
    // Group orders by date
    const countByDate: Record<string, { completed: number, pending: number }> = {};
    
    // Initialize all dates in range
    let currentDate = new Date(startDate);
    while (currentDate <= today) {
      const dateKey = format(currentDate, dateFormat);
      
      if (!countByDate[dateKey]) {
        countByDate[dateKey] = { completed: 0, pending: 0 };
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
        const dateKey = format(orderDate, dateFormat);
        
        if (dateKey in countByDate) {
          if (order.status === 'Ready' || order.status === 'Completed') {
            countByDate[dateKey].completed += 1;
          } else {
            countByDate[dateKey].pending += 1;
          }
        }
      }
    });
    
    // Convert to array for chart
    return Object.entries(countByDate)
      .map(([date, counts]) => ({ 
        date, 
        completed: counts.completed, 
        pending: counts.pending 
      }))
      .sort((a, b) => {
        if (orderTimeFrame === 'Weekly') {
          const [aMonth, aDay] = a.date.split('/').map(Number);
          const [bMonth, bDay] = b.date.split('/').map(Number);
          return (aMonth * 100 + aDay) - (bMonth * 100 + bDay);
        } else {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return months.indexOf(a.date) - months.indexOf(b.date);
        }
      });
  };

  // Recent orders for the orders list
  const recentOrders = orders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const statusColors = {
    pending: "bg-amber-100 text-amber-800",
    preparing: "bg-blue-100 text-blue-800",
    Ready: "bg-green-100 text-green-800",
    Completed: "bg-purple-100 text-purple-800",
    "On the Way": "bg-indigo-100 text-indigo-800"
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-[#5D4037] mb-6">Admin Dashboard</h1>
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Menus</p>
                <h3 className="text-3xl font-bold text-[#5D4037]">{metrics.totalMenuItems}</h3>
              </div>
              <div className="bg-[#5D4037]/10 p-3 rounded-full">
                <Coffee className="h-6 w-6 text-[#5D4037]" />
              </div>
            </div>
            <div className="mt-4 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="bg-[#5D4037] h-full rounded-full" style={{ width: '65%' }}></div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Orders Today</p>
                <h3 className="text-3xl font-bold text-[#5D4037]">{metrics.totalOrdersToday}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: '45%' }}></div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Clients Today</p>
                <h3 className="text-3xl font-bold text-[#5D4037]">{metrics.totalClientsToday}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <User className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="bg-green-500 h-full rounded-full" style={{ width: '40%' }}></div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Revenue Per Ratio</p>
                <h3 className="text-3xl font-bold text-[#5D4037]">₹{metrics.averageOrderValue.toFixed(2)}</h3>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="bg-red-500 h-full rounded-full" style={{ width: '85%' }}></div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Revenue Chart and Orders Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
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
        
        <Card className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
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
                  <Bar dataKey="pending" fill="#D7CCC8" name="pending" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Trending items and Orders Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="col-span-12 lg:col-span-4 bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <CardTitle className="text-lg font-semibold text-[#5D4037]">Trending</CardTitle>
              <Button variant="ghost" size="sm" className="text-[#5D4037]">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {trendingItems.map((item, index) => (
                <div key={item.id} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-50">
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden">
                    <Image
                      src={item.image || "/images/default-coffee.jpg"}
                      alt={item.name}
                      fill
                      sizes="64px"
                      style={{ objectFit: "cover" }}
                      onError={(e) => {
                        // Fallback to default image if the original fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/default-coffee.jpg";
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-[#5D4037]">{item.name}</h4>
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-2">{index + 1}</span>
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
        
        <Card className="col-span-12 lg:col-span-8 bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <CardTitle className="text-lg font-semibold text-[#5D4037]">Order List</CardTitle>
              <div className="flex space-x-2">
                {timeOptions.map(option => (
                  <Button 
                    key={option}
                    variant="outline"
                    className="text-[#5D4037] border-[#5D4037]"
                    size="sm"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map(order => (
                  <TableRow key={order._id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">#{order._id.substring(order._id.length - 6)}</TableCell>
                    <TableCell>{format(new Date(order.createdAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{order.user?.name || 'Guest'}</TableCell>
                    <TableCell>₹{order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${statusColors[order.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="text-[#5D4037]">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
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