/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: "standalone",

  experimental: {
    serverComponentsExternalPackages: ["sharp"],
  },

  images: {
    domains: ["localhost", "127.0.0.1", "yourdomain.com"],
    formats: ["image/webp", "image/avif"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  },
  async rewrites() {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const baseUrl = apiUrl.replace("/api", "");

    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/:path*`,
      },
      {
        source: "/r/:path*",
        destination: `${baseUrl}/r/:path*`,
      },
      {
        source: "/media/:path*",
        destination: `${baseUrl}/media/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
