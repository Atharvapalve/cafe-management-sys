"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getOrderHistory } from "@/lib/api"

interface OrderItem {
  menuItem: {
    name: string
    price: number
  }
  quantity: number
}

interface Order {
  _id: string
  items: OrderItem[]
  total: number
  createdAt: string
  status: string
}

export function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const fetchedOrders = await getOrderHistory()
        setOrders(fetchedOrders)
      } catch (error) {
        console.error("Failed to fetch order history:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [])

  if (isLoading) {
    return <div>Loading order history...</div>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Order History</h2>
      {orders.map((order) => (
        <Card key={order._id} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-[#BCAAA4]">
          <CardHeader>
            <CardTitle>Order #{order._id.slice(-6)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>
                    {item.menuItem.name} x{item.quantity}
                  </span>
                  <span>₹{(item.menuItem.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>₹{order.total.toFixed(2)}</span>
              </div>
              <div className="text-sm text-gray-600">Date: {new Date(order.createdAt).toLocaleString()}</div>
              <div className="text-sm font-semibold">Status: {order.status}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

