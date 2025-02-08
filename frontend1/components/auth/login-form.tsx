"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      console.log('Submitting login form:', { email }); // Log form submission
      await login(email, password);
    } catch (err) {
      console.error('Login form error:', err); // Log form error
      setError(err instanceof Error ? err.message : "Failed to login");
    }
  };

  return (
    <div className="min-h-screen bg-[#2C1810] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#E6DCC3] rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Welcome Back</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}
          
          <Button type="submit" className="w-full bg-[#2C1810] text-[#E6DCC3] hover:bg-[#1F110B]">
            Login
          </Button>
        </form>
      </div>
    </div>
  );
}