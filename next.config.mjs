/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { hostname: "images.pexels.com" },
      { hostname: "img.clerk.com" }
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  }
};

export default nextConfig;
