"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import React from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMenuItems, getUsers, getAdminOrders } from "@/lib/api";
import { MenuManagement } from "@/components/admin/menu management";
import { UserManagement } from "@/components/admin/user management";
import { OrderManagement } from "@/components/admin/order management";
import { AdminDashboard } from "@/components/admin/dashboard";

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  memberSince: string;
}

const AdminPage = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [menuItems, setMenuItems] = useState([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState([]);
  const usersRef = useRef<User[]>([]);

  const fetchData = useCallback(async () => {
    let menuData: any = [];
    let userData: any = [];
    let orderData: any = [];

    try {
      menuData = await getMenuItems();
    } catch (error) {
      console.error("❌ getMenuItems failed:", error);
    }

    try {
      userData = await getUsers();
    } catch (error) {
      console.error("❌ getUsers failed:", error);
    }

    try {
      orderData = await getAdminOrders();
    } catch (error) {
      console.error("❌ getOrders failed:", error);
    }

    usersRef.current = userData;
    setUsers(userData);
    setMenuItems(menuData);
    setOrders(orderData);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // In case users get reset, restore from the ref
  useEffect(() => {
    if (users.length === 0 && usersRef.current.length > 0) {
      setUsers([...usersRef.current]);
    }
  }, [users]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-screen">
        Access denied. Admin only.
      </div>
    );
  }

  const tabContent = {
    dashboard: <AdminDashboard />,
    menu: <MenuManagement items={menuItems} />,
    users: <UserManagement users={users} />,
    orders: <OrderManagement orders={orders} />,
  };

  return (
    <div className="min-h-screen bg-[#F5F5DC] p-6">
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-[#5D4037]">
            Admin Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              onClick={() => setActiveTab("dashboard")}
              variant={activeTab === "dashboard" ? "default" : "outline"}
              className={activeTab === "dashboard" ? "bg-[#5D4037]" : "text-[#5D4037] border-[#5D4037]"}
            >
              Dashboard
            </Button>
            <Button
              onClick={() => setActiveTab("menu")}
              variant={activeTab === "menu" ? "default" : "outline"}
              className={activeTab === "menu" ? "bg-[#5D4037]" : "text-[#5D4037] border-[#5D4037]"}
            >
              Menu Management
            </Button>
            <Button
              onClick={() => setActiveTab("users")}
              variant={activeTab === "users" ? "default" : "outline"}
              className={activeTab === "users" ? "bg-[#5D4037]" : "text-[#5D4037] border-[#5D4037]"}
            >
              User Management
            </Button>
            <Button
              onClick={() => setActiveTab("orders")}
              variant={activeTab === "orders" ? "default" : "outline"}
              className={activeTab === "orders" ? "bg-[#5D4037]" : "text-[#5D4037] border-[#5D4037]"}
            >
              Order Management
            </Button>
          </div>
          {tabContent[activeTab as keyof typeof tabContent]}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPage;
