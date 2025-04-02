"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Coffee } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userType, setUserType] = useState("customer")
  const [error, setError] = useState("")
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const router = useRouter()
  const { login } = useAuth()

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = "/videos/coffee-bg.mp4"
      videoRef.current.load()
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.src = ""
        videoRef.current.load()
      }
    }
  }, [])

  const handleVideoLoad = () => {
    setIsVideoLoaded(true)
  }

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error("Video loading error:", e)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      await login(email, password, userType)
      router.push(userType === "admin" ? "/admin" : "/dashboard")
    } catch (error) {
      setError("Invalid email or password")
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#5D4037]">
      {/* Background Video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-700 ${
          isVideoLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ zIndex: 0 }}
        onLoadedData={handleVideoLoad}
        onError={handleVideoError}
        src="/videos/coffee-bg.mp4"
      />

      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-[#5D4037]/60 backdrop-blur-[2px]"
        style={{ zIndex: 1 }}
      ></div>

      {/* Login Form */}
      <div 
        className="relative w-[450px] p-10 rounded-2xl glass-effect transform hover:scale-[1.02] transition-all duration-300"
        style={{ zIndex: 2 }}
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Coffee size={48} className="text-[#5D4037]" />
          </div>
          <h2 className="text-4xl font-bold text-[#5D4037] mb-2">Welcome Back</h2>
          <p className="text-[#8D6E63]">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-[#5D4037]">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="coffee-input"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-[#5D4037]">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="coffee-input"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="userType" className="block text-sm font-medium text-[#5D4037]">
              Login As
            </label>
            <Select value={userType} onValueChange={setUserType}>
              <SelectTrigger className="coffee-input">
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="coffee-button w-full py-3"
          >
            Sign In
          </Button>

          <div className="mt-6 text-center text-[#8D6E63]">
            Don't have an account?{" "}
            <Button
              variant="link"
              onClick={() => router.push("/register")}
              className="coffee-link font-medium"
            >
              Create Account
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

