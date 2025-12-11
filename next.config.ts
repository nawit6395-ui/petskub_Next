import type { NextConfig } from "next";

import path from "path";

const nextConfig = {
  turbopack: {
    root: path.join(__dirname, ".."),
  },
  experimental: {
    externalDir: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "img5.pic.in.th",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      }
    ],
  },
};

export default nextConfig;
