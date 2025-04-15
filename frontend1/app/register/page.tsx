"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Coffee, User, Mail, Lock, Phone } from "lucide-react";
import { toast } from "react-hot-toast";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"details" | "verification">("details");
  const [otp, setOtp] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = "/videos/coffee-bg.mp4";
      videoRef.current.load();
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.src = "";
        videoRef.current.load();
      }
    };
  }, []);

  const handleVideoLoad = () => {
    setIsVideoLoaded(true);
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error("Video loading error:", e);
  };

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error("API URL is not configured");
      }

      console.log("Sending registration request to:", `${apiUrl}/auth/register/init`);
      
      const res = await fetch(`${apiUrl}/auth/register/init`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(form),
      });

      console.log("Registration response status:", res.status);

      // Check if the response is JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        throw new Error("Server returned an invalid response");
      }

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }
      
      setTempToken(data.tempToken);
      setStep("verification");
      toast.success("Verification code sent to your email");
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otp,
          tempToken
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Verification failed");
      }
      
      toast.success("Registration successful!");
      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setIsLoading(true);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tempToken
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to resend code");
      }
      
      toast.success("New verification code sent to your email");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

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

      <div className="relative w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Coffee size={48} className="text-[#FFF]" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-[#D7CCC8]">Join our coffee community today</p>
        </div>

        <div className="glass-effect p-8 rounded-2xl transform hover:scale-[1.02] transition-all duration-300">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-sm mb-6">
              {error}
              {error.includes("email") && (
                <div className="mt-2 pt-2 border-t border-red-100 text-xs">
                  Please ensure you're using a real, valid email address that can receive verification emails.
                </div>
              )}
            </div>
          )}

          {step === "details" ? (
            <form onSubmit={handleInitialSubmit} className="space-y-6">
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
                  title="Please enter a valid email address that you have access to"
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8D6E63] w-5 h-5" />
                <Input
                  placeholder="Phone Number"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="coffee-input pl-11"
                  required
                  pattern="[0-9]{10}"
                  title="Please enter a valid 10-digit phone number"
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

              <Button 
                type="submit" 
                className="coffee-button w-full py-3"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Continue"}
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
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="text-center mb-6">
                <p className="text-[#5D4037] mb-2">
                  Please enter the verification code sent to your email
                </p>
                <p className="text-[#8D6E63] text-sm">
                  The code will expire in 10 minutes
                </p>
              </div>

              <div className="relative">
                <Input
                  placeholder="Enter Verification Code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="coffee-input text-center text-2xl tracking-[0.5em] font-mono"
                  maxLength={6}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="coffee-button w-full py-3"
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </Button>

              <div className="text-center text-[#8D6E63] pt-4">
                Didn't receive the code?{" "}
                <Button
                  variant="link"
                  onClick={handleResendOTP}
                  className="coffee-link font-medium"
                  disabled={isLoading}
                >
                  Resend Code
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
