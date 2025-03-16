"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import React from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMenuItems, getUsers, getOrders } from "@/lib/api";
import { MenuManagement } from "@/components/admin/menu management";
import { UserManagement } from "@/components/admin/user management";
import { OrderManagement } from "@/components/admin/order management";

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  memberSince: string;
}

const AdminDashboard = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("menu");
  const [menuItems, setMenuItems] = useState([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState([]);
  const usersRef = useRef<User[]>([]);

  console.log("🔄 AdminDashboard re-rendered, users state:", users);

  const fetchData = useCallback(async () => {
    let menuData: any = [];
    let userData: any = [];
    let orderData: any = [];

    // Fetch menu items separately
    try {
      menuData = await getMenuItems();
    } catch (error) {
      console.error("❌ getMenuItems failed:", error);
    }

    // Fetch users separately
    try {
      userData = await getUsers();
    } catch (error) {
      console.error("❌ getUsers failed:", error);
    }

    // Fetch orders separately
    try {
      orderData = await getOrders();
    } catch (error) {
      console.error("❌ getOrders failed:", error);
    }

    console.log("✅ Fetched user data:", userData);
    usersRef.current = userData;
    setUsers(prevUsers => {
      console.log("🛠 setUsers triggered, updating users from:", prevUsers, "to:", userData);
      return [...userData];
    });
    setMenuItems(menuData);
    setOrders(orderData);
  }, []);

  useEffect(() => {
    fetchData();
    console.log("🛠 useEffect triggered, fetching data...");
  }, [fetchData]);

  useEffect(() => {
    console.log("✅ Users state updated:", users);
  }, [users]);

  // In case users get reset, restore from the ref
  useEffect(() => {
    if (users.length === 0 && usersRef.current.length > 0) {
      console.log("⏳ Manually updating state from usersRef...");
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
    menu: <MenuManagement items={menuItems} />,
    users: (
      <>
        {console.log("➡ Passing users to UserManagement:", users)}
        <UserManagement users={users} />
      </>
    ),
    orders: <OrderManagement orders={orders} />,
  };

  return (
    <div className="min-h-screen bg-[#F5F5DC] p-6">
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            Admin Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-6">
            <Button
              onClick={() => setActiveTab("menu")}
              variant={activeTab === "menu" ? "default" : "outline"}
            >
              Menu Management
            </Button>
            <Button
              onClick={() => setActiveTab("users")}
              variant={activeTab === "users" ? "default" : "outline"}
            >
              User Management
            </Button>
            <Button
              onClick={() => setActiveTab("orders")}
              variant={activeTab === "orders" ? "default" : "outline"}
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

export default React.memo(AdminDashboard);
