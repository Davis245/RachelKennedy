import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/journeys",
        destination: "/#all-trips",
        permanent: true,
      },
      {
        source: "/trips",
        destination: "/#all-trips",
        permanent: true,
      },
      {
        source: "/journeys/:slug",
        destination: "/trips/:slug",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
};

export default nextConfig;
