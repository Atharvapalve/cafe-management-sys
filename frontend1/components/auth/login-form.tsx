"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
    console.log("Component mounted, checking video status...")
    
    // Debug video element
    if (videoRef.current) {
      console.log("Video element found:", {
        duration: videoRef.current.duration,
        paused: videoRef.current.paused,
        currentSrc: videoRef.current.currentSrc,
        readyState: videoRef.current.readyState,
        networkState: videoRef.current.networkState,
      })

      // Try to load the video manually
      videoRef.current.src = "/videos/coffee-bg.mp4"
      videoRef.current.load()
    } else {
      console.log("Video element not found in ref")
    }

    // Cleanup function
    return () => {
      if (videoRef.current) {
        videoRef.current.src = ""
        videoRef.current.load()
      }
    }
  }, [])

  const handleVideoLoad = () => {
    console.log("Video loaded successfully!")
    if (videoRef.current) {
      console.log("Video metadata:", {
        duration: videoRef.current.duration,
        videoWidth: videoRef.current.videoWidth,
        videoHeight: videoRef.current.videoHeight,
        currentSrc: videoRef.current.currentSrc,
        readyState: videoRef.current.readyState,
      })
    }
    setIsVideoLoaded(true)
  }

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error("Video loading error occurred")
    const video = e.target as HTMLVideoElement
    console.log("Video element error state:", {
      readyState: video.readyState,
      networkState: video.networkState,
      error: video.error?.code,
      errorMessage: video.error?.message,
      src: video.src,
      currentSrc: video.currentSrc,
    })
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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#2C1810]">
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
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        style={{ zIndex: 1 }}
      ></div>

      {/* Login Form */}
      <div 
        className="relative w-[450px] p-10 rounded-2xl bg-white/90 backdrop-blur-md shadow-2xl transform hover:scale-[1.02] transition-all duration-300"
        style={{ zIndex: 2 }}
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#2C1810] mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to your account</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-[#2C1810]">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2C1810] focus:border-transparent transition-all duration-200"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-[#2C1810]">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2C1810] focus:border-transparent transition-all duration-200"
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="userType" className="block text-sm font-medium text-[#2C1810]">
              Login As
            </label>
            <Select value={userType} onValueChange={setUserType}>
              <SelectTrigger className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2C1810] focus:border-transparent">
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <Button
            type="submit"
            className="w-full bg-[#2C1810] hover:bg-[#1F110B] text-white py-3 rounded-lg font-medium transition-colors duration-200"
          >
            Sign In
          </Button>
          <div className="mt-6 text-center text-gray-600">
            Don't have an account?{" "}
            <Button
              variant="link"
              onClick={() => router.push("/register")}
              className="text-[#2C1810] hover:text-[#1F110B] font-medium"
            >
              Create Account
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

