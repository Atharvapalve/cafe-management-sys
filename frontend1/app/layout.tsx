import "./globals.css"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/contexts/auth-context"
import type React from "react" // Added import for React
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Cafe Management System",
  description: "Manage your cafe with ease",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}


