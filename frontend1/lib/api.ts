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
  const response = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: buildHeaders(),
    credentials: "include",
    body: JSON.stringify(order),
    
  });
  if (!response.ok) {
    const errorData = await response.json();
    
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
    userData.wallet = { balance: 100, rewardPoints: 0 };
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
