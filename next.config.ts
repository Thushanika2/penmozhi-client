import type { NextConfig } from "next"
import path from "path"
import { fileURLToPath } from "url"

const apiUrl = process.env.API_URL ?? "http://127.0.0.1:5000"
const clientDir = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  turbopack: {
    root: clientDir,
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
