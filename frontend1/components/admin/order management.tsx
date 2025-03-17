"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { updateOrderStatus } from "@/lib/api"

interface Order {
  _id: string
  user: {
    name: string
  }
  total: number;
  status: string;
  createdAt: string;
  items: { menuItem: { name: string; price: number }; quantity: number }[];
}

export function OrderManagement({ orders }: { orders: Order[] }) {
  console.log("Rendering OrderManagement component with orders:", orders);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrder(orderId)
      await updateOrderStatus(orderId, newStatus)
      // Refresh orders
    } catch (error) {
      console.error("Failed to update order status:", error)
    } finally {
      setUpdatingOrder(null)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Order Management</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order._id}>
              <TableCell>{order._id}</TableCell>
              <TableCell>{order.user.name}</TableCell>
              <TableCell>₹{order.total.toFixed(2)}</TableCell>
              <TableCell>{order.status}</TableCell>
              <TableCell>
                {order.status === "pending" && (
                  <Button
                    onClick={() => handleUpdateStatus(order._id, "preparing")}
                    disabled={updatingOrder === order._id}
                  >
                    Start Preparing
                  </Button>
                )}
                {order.status === "preparing" && (
                  <Button
                    onClick={() => handleUpdateStatus(order._id, "completed")}
                    disabled={updatingOrder === order._id}
                  >
                    Mark as Completed
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

