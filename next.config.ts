import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.mzstatic.com",
        pathname: "/image/**",
      },
      {
        protocol: "https",
        hostname: "**.podbean.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "megaphone.imgix.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.scdn.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.simplecastcdn.com",
        pathname: "/**",
      },
    ],
  },
  // Both `openai` (file uploads via fs streams) and `ffmpeg-static` (binary
  // resolved via __dirname + dynamic strings) confuse Turbopack's bundle
  // tracer. Treat them as external runtime requires so the whole project
  // doesn't get pulled into the function bundle.
  serverExternalPackages: ["ffmpeg-static", "openai"],
};

export default nextConfig;
