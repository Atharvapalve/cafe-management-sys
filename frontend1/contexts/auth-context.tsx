"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, userType: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: User) => void;
  isLoading: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  wallet: {
    balance: number;
  };
  memberSince?: string;
  phone: string;
  preferences?: {
    favoriteCoffee?: string;
    preferredMilk?: string;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.push("/");
    } else {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []); // Removed `router` from dependencies to prevent unnecessary re-renders

  const login = async (email: string, password: string, userType: string) => {
    try {
      console.log("Login attempt:", { email, userType });
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      console.log("Login response status:", response.status);
      
      // Clone the response so we can log it and still use it
      const responseClone = response.clone();
      const responseText = await responseClone.text();
      console.log("Raw response:", responseText);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          errorData = { message: "Failed to parse error response" };
        }
        console.error("Login error response:", errorData);
        throw new Error(errorData.message || "Login failed");
      }

      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Login success data:", { 
          ...data, 
          token: data.token ? "[REDACTED]" : "undefined",
          user: data.user ? {
            id: data.user.id,
            role: data.user.role,
            email: data.user.email
          } : "undefined"
        });
      } catch (e) {
        console.error("Error parsing success response:", e);
        throw new Error("Failed to parse login response");
      }
      
      if (!data.token || !data.user) {
        console.error("Malformed login response - missing token or user data");
        throw new Error("Invalid response from server");
      }
      
      // Ensure wallet is properly initialized
      data.user.wallet = data.user.wallet || { balance: 0 };

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      // Navigate based on user role instead of userType from form
      if (data.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);

      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateUser = (updatedUser: Partial<User>) => {
    if (user) {
      const newUser: User = {
        ...user,
        ...updatedUser,
        wallet: {
          balance: updatedUser.wallet?.balance ?? user.wallet.balance,
        },
      };

      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
