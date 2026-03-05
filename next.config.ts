import type { NextConfig } from "next";
// @ts-ignore
import withPWAInit from "next-pwa";

// Configure the PWA plugin itself
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

// Base Next.js config
const nextConfig: NextConfig = {
  // reactCompiler: true,
  // @ts-ignore
  turbopack: {},
};

// Export wrapped config
export default withPWA(nextConfig);
