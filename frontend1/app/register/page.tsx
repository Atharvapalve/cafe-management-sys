"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Coffee, User, Mail, Lock } from "lucide-react";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Registration failed");
      }
      
      setRegistered(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#D7CCC8] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Coffee size={48} className="text-[#5D4037]" />
          </div>
          <h1 className="text-4xl font-bold text-[#5D4037] mb-2">Create Account</h1>
          <p className="text-[#8D6E63]">Join our coffee community today</p>
        </div>

        <div className="glass-effect p-8 rounded-2xl">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          {registered ? (
            <div className="text-center">
              <div className="bg-[#5D4037]/10 text-[#5D4037] p-4 rounded-lg mb-6">
                <p className="text-lg font-medium mb-2">Registration Successful!</p>
                <p className="text-[#8D6E63]">Your account has been created.</p>
              </div>
              <Button 
                onClick={() => router.push("/login")} 
                className="coffee-button w-full py-3"
              >
                Continue to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8D6E63] w-5 h-5" />
                <Input
                  placeholder="Your Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="coffee-input pl-11"
                  required
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8D6E63] w-5 h-5" />
                <Input
                  placeholder="Email Address"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="coffee-input pl-11"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8D6E63] w-5 h-5" />
                <Input
                  placeholder="Create Password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="coffee-input pl-11"
                  required
                />
              </div>

              <Button type="submit" className="coffee-button w-full py-3">
                Create Account
              </Button>

              <div className="text-center text-[#8D6E63] pt-4">
                Already have an account?{" "}
                <Button
                  variant="link"
                  onClick={() => router.push("/login")}
                  className="coffee-link font-medium"
                >
                  Sign In
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
