import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

// Configure the PWA plugin itself
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

// Base Next.js config
const nextConfig: NextConfig = {
  reactCompiler: true,
};

// Export wrapped config
export default withPWA(nextConfig);
