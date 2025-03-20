"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { updateOrderStatus } from "@/lib/api"

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
  // Local stage state for order updates: "pending", "ready", or "done"
  const [orderStages, setOrderStages] = useState<{ [orderId: string]: "pending" | "ready" | "done" }>({});

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  const handleOrderAction = async (orderId: string) => {
    const currentStage = orderStages[orderId] || "pending";

    if (currentStage === "pending") {
      setUpdatingOrder(orderId);
      try {
        await updateOrderStatus(orderId, "preparing");
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: "preparing" } : order
          )
        );
        setOrderStages((prev) => ({ ...prev, [orderId]: "ready" }));
      } catch (error) {
        console.error("Failed to update order status to preparing:", error);
      } finally {
        setUpdatingOrder(null);
      }
    } else if (currentStage === "ready") {
      setUpdatingOrder(orderId);
      try {
        await updateOrderStatus(orderId, "Ready");
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: "Ready" } : order
          )
        );
        setOrderStages((prev) => ({ ...prev, [orderId]: "done" }));
      } catch (error) {
        console.error("Failed to update order status to Ready:", error);
      } finally {
        setUpdatingOrder(null);
      }
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Order Management</h2>
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
          {orders.map((order) => {
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
                    <div className="text-sm text-gray-600">{order.user.email}</div>
                  )}
                </TableCell>
                <TableCell>
                  {order.items.map((item, index) => (
                    <div key={index}>
                      {item.menuItem ? (
                        <>
                          {item.menuItem.name} x {item.quantity} (₹{(item.menuItem.price * item.quantity).toFixed(2)})
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
                  {(order.status === "pending" || order.status === "preparing") && (
                    <Button
                      onClick={() => handleOrderAction(order._id)}
                      disabled={buttonDisabled || updatingOrder === order._id}
                    >
                      {updatingOrder === order._id ? "Updating..." : buttonLabel}
                    </Button>
                  )}
                  {(order.status !== "pending" && order.status !== "preparing") && (
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
}
