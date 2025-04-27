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
import { updateOrderStatus, getFilteredOrders } from "@/lib/api";
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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalSales, setTotalSales] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Keep track of the current stage for each order
  const [orderStages, setOrderStages] = useState<{ [orderId: string]: "pending" | "ready" | "done" }>({});

  // Status color mapping
  const statusColors = {
    pending: "bg-yellow-500 text-white",
    preparing: "bg-blue-500 text-white",
    ready: "bg-emerald-500 text-white",
    completed: "bg-purple-500 text-white",
    "on the way": "bg-indigo-500 text-white"
  };

  // Get status color
  const getStatusColor = (status: string) => {
    return statusColors[status.toLowerCase()] || "bg-gray-500 text-white";
  };

  // Update orders when initialOrders change (for example on first load)
  useEffect(() => {
    setOrders(initialOrders);
    calculateTotalSales(initialOrders);
  }, [initialOrders]);

  const calculateTotalSales = (orders: Order[]) => {
    const total = orders.reduce((sum, order) => sum + order.total, 0);
    setTotalSales(total);
    setOrderCount(orders.length);
  };

  const handleFilter = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    try {
      setLoading(true);
      const data = await getFilteredOrders(startDate, endDate);
      setOrders(data.orders);
      setTotalSales(data.totalSales);
      setOrderCount(data.orderCount);
      toast.success(`Found ${data.orderCount} orders`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to filter orders");
      toast.error("Failed to filter orders");
    } finally {
      setLoading(false);
    }
  };

  // Optimistic UI update with notification
  const handleOrderAction = async (orderId: string) => {
    console.log("Admin clicked update for order:", orderId);

    const currentStage = orderStages[orderId] || "pending";

    if (currentStage === "pending") {
      setUpdatingOrder(orderId);
      try {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: "preparing" } : order
          )
        );
        setOrderStages((prev) => ({ ...prev, [orderId]: "ready" }));
        await updateOrderStatus(orderId, "preparing");
        console.log(`Order ${orderId} updated to preparing`);
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
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: "Ready" } : order
          )
        );
        setOrderStages((prev) => ({ ...prev, [orderId]: "done" }));
        await updateOrderStatus(orderId, "Ready");
        console.log(`Order ${orderId} updated to Ready`);
        toast.success("Order updated to Ready");
      } catch (error) {
        console.error("Failed to update status to Ready:", error);
        toast.error("Failed to update order to Ready");
      } finally {
        setUpdatingOrder(null);
      }
    }
  };

  // Group orders by their creation date
  const groupedOrders = orders.reduce((acc: { [key: string]: Order[] }, order) => {
    const date = new Date(order.createdAt).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(order);
    return acc;
  }, {});

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedOrders).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Order Management</h2>

      {/* Date Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Filter Orders by Date</h3>
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleFilter}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {loading ? "Filtering..." : "Filter"}
            </Button>
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium mb-2">Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-xl font-semibold">{orderCount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-xl font-semibold">₹{totalSales.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {sortedDates.map((date) => {
        const ordersForDate = groupedOrders[date];
        return (
          <div key={date} className="mb-8">
            <h3 className="text-xl font-semibold mb-2">Date: {date}</h3>
            <div className="mb-2 text-lg font-semibold">
              Day's Total Sales: ₹{ordersForDate.reduce((total, order) => total + order.total, 0).toFixed(2)}
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
                      <TableCell>
                        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {(order.status === "pending" ||
                          order.status === "preparing") && (
                          <Button
                            onClick={() => handleOrderAction(order._id)}
                            disabled={
                              buttonDisabled || updatingOrder === order._id
                            }
                            className={`${
                              order.status.toLowerCase() === "pending"
                                ? "bg-blue-500 hover:bg-blue-600"
                                : "bg-emerald-500 hover:bg-emerald-600"
                            } text-white`}
                          >
                            {updatingOrder === order._id
                              ? "Updating..."
                              : buttonLabel}
                          </Button>
                        )}
                        {(order.status !== "pending" &&
                          order.status !== "preparing") && (
                          <Button 
                            disabled 
                            className="bg-gray-400 text-white cursor-not-allowed opacity-50"
                          >
                            {buttonLabel}
                          </Button>
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
