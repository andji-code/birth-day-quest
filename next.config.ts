import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/birth-day-quest',
  assetPrefix: '/birth-day-quest/',
  trailingSlash: true, // важливо!
};

export default nextConfig;
