"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getMenuItems, getUsers, getOrders } from "@/lib/api"
import { MenuManagement } from "@/components/admin/menu management"
import { UserManagement } from "@/components/admin/user management"
import { OrderManagement } from "@/components/admin/order management"

export default function AdminDashboard() {
  const { user, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("menu")
  const [menuItems, setMenuItems] = useState([])
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])

  useEffect(() => {
    async function fetchData() {
      try {
        const [menuData, userData, orderData] = await Promise.all([getMenuItems(), getUsers(), getOrders()])
        console.log("Fetched menu data:", menuData); // Debug log: Confirm menu data
        console.log("Fetched user data:", userData); // Debug log: Confirm user data
        console.log("Fetched order data:", orderData); // Debug log: Confirm order data
        setMenuItems(menuData)
        setUsers(userData)
        setOrders(orderData)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      }
    }
    fetchData()
  }, [])

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!user || user.role !== "admin") {
    return <div className="flex items-center justify-center h-screen">Access denied. Admin only.</div>
  }

  const tabContent = {
    menu: <MenuManagement items={menuItems} />,
    users: <UserManagement users={users} />,
    orders: <OrderManagement orders={orders} />,
  }

  return (
    <div className="min-h-screen bg-[#F5F5DC] p-6">
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-6">
            <Button onClick={() => setActiveTab("menu")} variant={activeTab === "menu" ? "default" : "outline"}>
              Menu Management
            </Button>
            <Button onClick={() => setActiveTab("users")} variant={activeTab === "users" ? "default" : "outline"}>
              User Management
            </Button>
            <Button onClick={() => setActiveTab("orders")} variant={activeTab === "orders" ? "default" : "outline"}>
              Order Management
            </Button>
          </div>
          {tabContent[activeTab as keyof typeof tabContent]}
        </CardContent>
      </Card>
    </div>
  )
}

