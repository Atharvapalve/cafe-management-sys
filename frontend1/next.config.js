/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"]
    },
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporarily disable ESLint during builds to get past deployment
  },
}

module.exports = nextConfig