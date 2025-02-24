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
    rewardPoints: number;
  };
  memberSince?: string; // Add this field (optional)
  phone?: string; // Add this field (optional)
  preferences?: {
    favoriteCoffee?: string; // Optional nested fields
    preferredMilk?: string;
    rewardsTier?: string;
  }; // Add this field (optional)
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, userType: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password, userType }),
      })

      console.log('Response status:', response.status); // Log response status

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Login error response:', errorData); // Log error response
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      console.log('Login successful, data:', { ...data, token: '***' }); // Log success data (hide token)
      
      // Store token and user data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call the logout API to clear the session (if needed)
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include", // Include credentials (cookies)
      });

      // Clear user data from local storage
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      // Update the authentication context
      setUser(null);

      // Redirect to the login page
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateUser = (updatedUser: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updatedUser }
      setUser(newUser)
      localStorage.setItem("user", JSON.stringify(newUser))
      // Here you would typically also make an API call to update the user on the server
    }
  }

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

