import { User } from "@/contexts/auth-context";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
import { MenuItem } from "@/components/menu/menu-grid";

function buildHeaders(tokenRequired = true, isFormData = false) {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {};

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  if (tokenRequired && token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  console.log("Request headers:", headers); // Debug log
  return headers;
}

export async function login(email: string, password: string, userType: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, password, userType }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Login failed");
  }

  return response.json();
}
// frontend1/lib/api.ts

export async function updateProfile(updatedUser: Partial<User>) {
  const response = await fetch(`${API_URL}/users/profile`, {
    method: "PUT",
    headers: buildHeaders(),
    credentials: "include",
    body: JSON.stringify(updatedUser),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update profile");
  }

  return response.json();
}
// Rest of your API functions remain the same
export async function placeOrder(order: any) {
  // Ensure rewardPointsRedeemed is included and set to 0
  const orderWithPoints = { 
    ...order, 
    rewardPointsRedeemed: 0 
  };

  console.log("Placing order with data:", JSON.stringify(orderWithPoints, null, 2));

  const response = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: buildHeaders(),
    credentials: "include",
    body: JSON.stringify(orderWithPoints),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    console.error("Order error:", errorData);
    throw new Error(errorData.message || "Failed to place order");
  }
  
  return response.json();
}

export async function getProfile() {
  const response = await fetch(`${API_URL}/users/profile`, {
    headers: buildHeaders(),
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch profile");
  }

  const userData = await response.json();

  // ✅ Ensure wallet is initialized in case backend fails to set it
  if (!userData.wallet) {
    userData.wallet = { balance: 100 };
  }

  return userData;
}


export async function addFunds(amount: number) {
  const response = await fetch(`${API_URL}/users/wallet/add`, {
    method: "POST",
    headers: buildHeaders(),
    credentials: "include",
    body: JSON.stringify({ amount }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    console.error("Add funds error:", errorData); // Log the error details
    throw new Error(errorData.message || "Failed to add funds");
  }
  return response.json();
}

export async function getMenuItems(queryParams = "") {
  const response = await fetch(`${API_URL}/menu?${queryParams}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch menu items");
  }
  return response.json();
}

export async function getOrderHistory() {
  const response = await fetch(`${API_URL}/orders/history`, {
    headers: buildHeaders(),
    credentials: "include",
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch order history");
  }
  return response.json();
}

export async function getUsers() {
  try {
    console.log("Fetching users from:", `${API_URL}/users/admin/users`);
    const response = await fetch(`${API_URL}/users/admin/users`, {
      headers: buildHeaders(),
      credentials: "include",
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to fetch users:", errorData); // Debug log
      throw new Error(errorData.message || "Failed to fetch users");
    }
    const users = await response.json();
    console.log("Fetched users:", users); // Debug log
    return users;
  } catch (error) {
    console.error("Network or server error:", error); // Log network errors
    throw error;
    
  }
}



export async function addMenuItem(data: FormData) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/menu`, {
    method: "POST",
    headers: buildHeaders(true, true), // Use buildHeaders function correctly
    body: data,

  });
  if (!res.ok) {
    throw new Error("Failed to add menu item");
  }
  return res.json();
}


// frontend1/lib/api.ts

// Add this function to fetch admin orders
export async function getOrders() {
  const response = await fetch(`${API_URL}/admin/orders`, {
    headers: buildHeaders(),
    credentials: "include",
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch orders");
  }
  
  return response.json();
}
// Example of proper export
export async function updateMenuItem(id: string, data: FormData) {
  console.log("Sending update request for:", id);
  console.log("Request Body:",  Array.from(data.entries()));
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/menu/${id}`, {
    method: "PUT",
    headers: buildHeaders(true, true), // Use buildHeaders function correctly
    body: data,
  });
  
  
  if (!res.ok) {
    try {
      const errorData = await res.json(); // ✅ Ensure it's read only once
      console.error("Update error:", errorData);
      throw new Error(errorData.message || "Failed to update menu item");
    } catch {
      throw new Error("Failed to update menu item (Unknown Error)");
    }
  }

  return res.json();
}


export async function deleteMenuItem(id: string) {
  const res = await fetch(`${API_URL}/menu/${id}`, {
    method: "DELETE",
    headers: buildHeaders(true),
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Failed to delete menu item");
  }
  return await res.json();
}


export async function getAdminOrders() {
  console.log("Fetching admin orders from:", `${API_URL}/admin/orders`);
  const response = await fetch(`${API_URL}/orders/admin/orders`, {
      headers: buildHeaders(),
      credentials: "include",
  });

  if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to fetch admin orders. Error:", errorData);
      throw new Error(errorData.message || "Failed to fetch admin orders");
  }
  const orders = await response.json();
  console.log("Fetched admin orders:", orders); // Debug log
  return orders;
}
export async function updateOrderStatus(orderId: string, status: string) {
  const response = await fetch(`${API_URL}/orders/${orderId}`, {
    method: "PUT",
    headers: buildHeaders(),
    credentials: "include",
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update order status");
  }
  return response.json();
}

/**
 * Create a Razorpay order
 * @param amount Amount in INR (will be converted to paise)
 * @returns Order details or error
 */
export async function createRazorpayOrder(amount: number) {
  console.log(`Creating Razorpay order for amount: ${amount} INR`);
  
  try {
    // In a production app, this would call your server API
    // For now, we'll use our test implementation
    // Convert to paise (Razorpay uses smallest currency unit)
    const amountInPaise = Math.round(amount * 100);
    
    // In development/test mode: create a mock order
    const order = {
      id: `order_${Math.random().toString(36).substring(2, 15)}`,
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${Math.random().toString(36).substring(2, 10)}`,
      status: "created"
    };
    
    console.log("Created test Razorpay order:", order);
    
    return {
      success: true,
      message: "Order created successfully",
      order
    };
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    
    // Return a structured error response
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create order",
      error
    };
  }
}

/**
 * Verify a Razorpay payment
 * @param paymentData Payment data from Razorpay
 * @returns Verification result or error
 */
export async function verifyRazorpayPayment(paymentData: {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}) {
  console.log("Verifying Razorpay payment:", paymentData);
  
  try {
    // In a production app, this would call your server API
    // For now, we'll simulate a successful verification
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock verification response
    return {
      success: true,
      message: "Payment verified successfully",
      data: {
        paymentId: paymentData.razorpay_payment_id,
        orderId: paymentData.razorpay_order_id,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error("Error verifying Razorpay payment:", error);
    
    // Return a structured error response
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to verify payment",
      error
    };
  }
}

// End of Razorpay API functions

export const getFilteredOrders = async (startDate: string, endDate: string) => {
  try {
    const response = await fetch(
      `${API_URL}/orders/filter?startDate=${startDate}&endDate=${endDate}`,
      {
        method: "GET",
        credentials: "include",
        headers: buildHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch filtered orders");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching filtered orders:", error);
    throw error;
  }
};
