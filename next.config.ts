import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    // define explicit root for Turbopack to avoid workspace lockfile ambiguity
    root: ".",
  },
};

export default nextConfig;
