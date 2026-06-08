import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      fabric: path.join(process.cwd(), "node_modules/fabric/dist/index.mjs"),
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      fabric: path.join(process.cwd(), "node_modules/fabric/dist/index.mjs"),
    };
    return config;
  },
};

export default nextConfig;
