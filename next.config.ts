import type { NextConfig } from "next"
import path from "path"
import { fileURLToPath } from "url"

const apiUrl = (process.env.API_URL ?? "http://127.0.0.1:5000").replace(/\/+$/, "")
const clientDir = path.dirname(fileURLToPath(import.meta.url))
const privateNoStoreHeaders = [
  {
    key: "Cache-Control",
    value: "private, no-store, no-cache, max-age=0, must-revalidate",
  },
  { key: "Pragma", value: "no-cache" },
  { key: "Expires", value: "0" },
]

const nextConfig: NextConfig = {
  turbopack: {
    root: clientDir,
  },
  async headers() {
    return [
      { source: "/dashboard/:path*", headers: privateNoStoreHeaders },
      { source: "/admin/:path*", headers: privateNoStoreHeaders },
      { source: "/onboarding", headers: privateNoStoreHeaders },
      { source: "/auth/:path*", headers: privateNoStoreHeaders },
      { source: "/backend/:path*", headers: privateNoStoreHeaders },
    ]
  },
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${apiUrl}/:path*`,
      },
    ]
  },
}

export default nextConfig
