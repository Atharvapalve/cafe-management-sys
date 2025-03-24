"use client";

import { useState, useEffect } from "react";
import io from "socket.io-client";

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

export interface OrderUpdate {
  orderId: string;
  status: string;
  user: string;
}

export default function useOrderStatusListener(currentUserId: string) {
  const [orderUpdates, setOrderUpdates] = useState<OrderUpdate[]>([]);

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL, {
      withCredentials: true,
      transports: ["polling"], // Force polling transport
    });
    
    socket.on("connect", () => {
      console.log("Connected to socket server:", socket.id);
    });

    // Listen for the generic event
    socket.on("orderStatusUpdated", (data: OrderUpdate) => {
      console.log("Received order status update:", data);
      // Process only updates for the current user
      if (data.user === currentUserId) {
        setOrderUpdates((prev) => [...prev, data]);
      }
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    return () => {
      socket.off("orderStatusUpdated");
      socket.disconnect();
    };
  }, [currentUserId]);

  return orderUpdates;
}
