import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the Turbopack workspace root to this project. Without this, Next 16's
  // Turbopack can infer the parent directory (C:\Users\jawed\Downloads) as the
  // root, which makes the `@import "tailwindcss"` in globals.css resolve from
  // the wrong directory and fail with "Can't resolve 'tailwindcss'".
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
