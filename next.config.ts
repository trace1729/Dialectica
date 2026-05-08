import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use webpack due to Turbopack env compatibility
  allowedDevOrigins: ["172.19.20.3", "localhost:3000"],
};

export default nextConfig;
