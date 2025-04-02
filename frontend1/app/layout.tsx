import "./globals.css"
import { Playfair_Display, Poppins } from "next/font/google"
import { AuthProvider } from "@/contexts/auth-context"
import { BackgroundWrapper } from "@/components/ui/background-wrapper"
import type React from "react"
import { Toaster } from "sonner"

const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair' })
const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  variable: '--font-poppins'
})

export const metadata = {
  title: "Café Delight",
  description: "A modern café management system",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${poppins.variable}`}>
      <body className="min-h-screen">
        <AuthProvider>
          <BackgroundWrapper>
            {children}
          </BackgroundWrapper>
        </AuthProvider>
        <Toaster position="top-center" 
          toastOptions={{
            style: {
              background: '#5D4037',
              color: '#FFFFFF',
              border: '1px solid #BCAAA4',
            },
          }}
        />
      </body>
    </html>
  )
}


