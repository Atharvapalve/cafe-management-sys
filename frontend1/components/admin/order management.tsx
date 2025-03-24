"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { updateOrderStatus } from "@/lib/api";
import toast from "react-hot-toast";

interface OrderItem {
  menuItem: {
    name: string;
    price: number;
  } | null;
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

export function OrderManagement({ orders: initialOrders }: { orders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  // Keep track of the current stage for each order
  const [orderStages, setOrderStages] = useState<{ [orderId: string]: "pending" | "ready" | "done" }>({});

  // Update orders when initialOrders change (for example on first load)
  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  // Optimistic UI update with notification
  const handleOrderAction = async (orderId: string) => {
    console.log("Admin clicked update for order:", orderId); // Debug log for admin

    const currentStage = orderStages[orderId] || "pending";

    if (currentStage === "pending") {
      setUpdatingOrder(orderId);
      try {
        // Optimistically update the UI
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: "preparing" } : order
          )
        );
        setOrderStages((prev) => ({ ...prev, [orderId]: "ready" }));
        // Update on the server
        await updateOrderStatus(orderId, "preparing");
        console.log(`Order ${orderId} updated to preparing`); // Debug log for admin
        toast.success("Order updated to preparing");
      } catch (error) {
        console.error("Failed to update status to preparing:", error);
        toast.error("Failed to update order to preparing");
      } finally {
        setUpdatingOrder(null);
      }
    } else if (currentStage === "ready") {
      setUpdatingOrder(orderId);
      try {
        // Optimistically update the UI
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: "Ready" } : order
          )
        );
        setOrderStages((prev) => ({ ...prev, [orderId]: "done" }));
        // Update on the server
        await updateOrderStatus(orderId, "Ready");
        console.log(`Order ${orderId} updated to Ready`); // Debug log for admin
        toast.success("Order updated to Ready");
      } catch (error) {
        console.error("Failed to update status to Ready:", error);
        toast.error("Failed to update order to Ready");
      } finally {
        setUpdatingOrder(null);
      }
    }
  };

  // Group orders by their creation date (using locale date string)
  const groupedOrders = orders.reduce((acc: { [key: string]: Order[] }, order) => {
    const date = new Date(order.createdAt).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(order);
    return acc;
  }, {});

  // Compute total sales for a day's orders
  const computeTotalSales = (orders: Order[]) =>
    orders.reduce((total, order) => total + order.total, 0);

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedOrders).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Order Management</h2>
      {sortedDates.map((date) => {
        const ordersForDate = groupedOrders[date];
        return (
          <div key={date} className="mb-8">
            <h3 className="text-xl font-semibold mb-2">Date: {date}</h3>
            <div className="mb-2 text-lg font-semibold">
              Day's Total Sales: ₹{computeTotalSales(ordersForDate).toFixed(2)}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordersForDate.map((order) => {
                  let buttonLabel = "";
                  let buttonDisabled = false;
                  if (order.status === "pending") {
                    const stage = orderStages[order._id] || "pending";
                    if (stage === "pending") {
                      buttonLabel = "Prepare";
                      buttonDisabled = false;
                    } else if (stage === "ready") {
                      buttonLabel = "Ready";
                      buttonDisabled = true;
                    }
                  } else if (order.status === "preparing") {
                    buttonLabel = "Ready";
                    buttonDisabled = false;
                  } else {
                    buttonLabel = order.status;
                    buttonDisabled = true;
                  }
                  return (
                    <TableRow key={order._id}>
                      <TableCell>{order._id.slice(-6)}</TableCell>
                      <TableCell>
                        {order.user ? order.user.name : "Unknown"}
                        {order.user && order.user.email && (
                          <div className="text-sm text-gray-600">
                            {order.user.email}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {order.items.map((item, index) => (
                          <div key={index}>
                            {item.menuItem ? (
                              <>
                                {item.menuItem.name} x {item.quantity} (₹
                                {(item.menuItem.price * item.quantity).toFixed(2)})
                              </>
                            ) : (
                              <span>Item Deleted x {item.quantity} (₹0)</span>
                            )}
                          </div>
                        ))}
                      </TableCell>
                      <TableCell>₹{order.total.toFixed(2)}</TableCell>
                      <TableCell>{order.status}</TableCell>
                      <TableCell>
                        {(order.status === "pending" ||
                          order.status === "preparing") && (
                          <Button
                            onClick={() => handleOrderAction(order._id)}
                            disabled={
                              buttonDisabled || updatingOrder === order._id
                            }
                          >
                            {updatingOrder === order._id
                              ? "Updating..."
                              : buttonLabel}
                          </Button>
                        )}
                        {(order.status !== "pending" &&
                          order.status !== "preparing") && (
                          <Button disabled>{buttonLabel}</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        );
      })}
    </div>
  );
}
