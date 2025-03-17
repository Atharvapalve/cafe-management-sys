  "use client"

  import { useState,useEffect } from "react"
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


  export function OrderManagement({ orders: initialOrders }: { orders: Order[] }) {
    // Maintain a local copy of orders for optimistic updates
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
    // Local stage state: tracks an order's current interactive stage.
    // "pending" → initial state, "ready" → after first click (button text becomes "Ready"), "done" → after backend update to Ready.
    const [orderStages, setOrderStages] = useState<{ [orderId: string]: "pending" | "ready" | "done" }>({});
  
    // Update local orders state if initialOrders prop changes.
    useEffect(() => {
      setOrders(initialOrders);
    }, [initialOrders]);
  
    const handleOrderAction = async (orderId: string) => {
      // Get current stage for this order; default to "pending"
      const currentStage = orderStages[orderId] || "pending";
  
      if (currentStage === "pending") {
        // First click: update backend status to "preparing"
        setUpdatingOrder(orderId);
        try {
          await updateOrderStatus(orderId, "preparing");
          // Update local order status to "preparing"
          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order._id === orderId ? { ...order, status: "preparing" } : order
            )
          );
          // Change local stage to "ready" (so the button now shows "Ready" and can be clicked for final update)
          setOrderStages((prev) => ({ ...prev, [orderId]: "ready" }));
        } catch (error) {
          console.error("Failed to update order status to preparing:", error);
        } finally {
          setUpdatingOrder(null);
        }
      } else if (currentStage === "ready") {
        // Second click: update backend status to "Ready"
        setUpdatingOrder(orderId);
        try {
          await updateOrderStatus(orderId, "Ready");
          // Update local order status to "Ready"
          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order._id === orderId ? { ...order, status: "Ready" } : order
            )
          );
          // Mark this order as done; button will be disabled
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
                  buttonDisabled = true; // greyed out until further action, if any
                }
              } else if (order.status === "preparing") {
                // In case the order is in preparing state but not updated via our local flow
                buttonLabel = "Ready";
                buttonDisabled = false;
              } else {
                buttonLabel = order.status;
                buttonDisabled = true;
              }
              return (
                <TableRow key={order._id}>
                  <TableCell>{order._id}</TableCell>
                  <TableCell>{order.user.name}</TableCell>
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