import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.mzstatic.com",
        pathname: "/image/**",
      },
    ],
  },
};

export default nextConfig;
