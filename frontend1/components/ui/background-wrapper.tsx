"use client"

import { usePathname } from 'next/navigation'
import { ReactNode, useState, useEffect, useRef } from 'react'

interface BackgroundWrapperProps {
  children: ReactNode
}

export function BackgroundWrapper({ children }: BackgroundWrapperProps) {
  const pathname = usePathname()
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  
  // Skip background for login and register pages
  const skipBackground = pathname === '/' || pathname === '/register'
  
  // Direct access to a reliable Unsplash CDN URL with cache busting to prevent caching issues
  const imageUrl = "https://images.unsplash.com/photo-1447933601403-0c6688de566e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1456&q=80&v=" + new Date().getTime()
  
  useEffect(() => {
    // Log current path for debugging
    console.log("BackgroundWrapper - Current path:", pathname)
    console.log("BackgroundWrapper - Skip background:", skipBackground)
    console.log("BackgroundWrapper - Image URL:", imageUrl)
    
    // Try manually preloading the image
    if (!skipBackground) {
      const preloadImg = new Image()
      preloadImg.onload = () => {
        console.log("Background image preloaded successfully")
        setIsImageLoaded(true)
        setLoadError(null)
      }
      preloadImg.onerror = (e) => {
        const errorMsg = "Failed to preload background image"
        console.error(errorMsg, e)
        setLoadError(errorMsg)
      }
      preloadImg.src = imageUrl
    }
    
    return () => {
      // Cleanup function
      setIsImageLoaded(false)
    }
  }, [pathname, skipBackground, imageUrl])
  
  const handleImageLoad = () => {
    console.log("Background image loaded successfully in DOM")
    setIsImageLoaded(true)
    setLoadError(null)
  }
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const errorMsg = "Background image loading error in DOM"
    console.error(errorMsg, e)
    setLoadError(errorMsg)
  }
  
  if (skipBackground) {
    return <>{children}</>
  }
  
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#5D4037]">
      {/* Debug message for image loading status */}
      {loadError && (
        <div className="fixed top-20 right-4 z-[9999] bg-red-600 text-white p-2 rounded shadow-lg text-sm">
          Error: {loadError}
        </div>
      )}
      
      {/* Background Image - Fixed position with fallback background color */}
      <img
        ref={imgRef}
        src={imageUrl}
        className={`fixed top-0 left-0 w-full h-full object-cover transition-opacity duration-700 ${
          isImageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ zIndex: 0 }}
        onLoad={handleImageLoad}
        onError={handleImageError}
        alt=""
        crossOrigin="anonymous"
      />

      {/* Overlay - Fixed position */}
      <div 
        className="fixed top-0 left-0 right-0 bottom-0 bg-[#5D4037]/60 backdrop-blur-[2px]"
        style={{ zIndex: 1 }}
      ></div>

      {/* Content */}
      <div 
        className="relative min-h-screen w-full"
        style={{ zIndex: 2 }}
      >
        {children}
      </div>
    </div>
  )
}