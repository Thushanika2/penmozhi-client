import type { NextConfig } from "next"
import withPWAInit from "@ducanh2912/next-pwa"
import path from "path"
import { fileURLToPath } from "url"
import type { RuntimeCaching } from "workbox-build"

const runtimeCaching: RuntimeCaching[] = [
  {
    // Fetch/XHR requests have an empty destination. Keep all API traffic,
    // including cross-origin Flask requests, completely out of the cache.
    urlPattern: ({ request, url }) =>
      request.destination === "" ||
      url.pathname === "/api" ||
      url.pathname.startsWith("/api/") ||
      url.pathname === "/backend" ||
      url.pathname.startsWith("/backend/"),
    handler: "NetworkOnly",
  },
  {
    // Never persist rendered pages that can contain personal health data.
    urlPattern: ({ request, url }) =>
      request.mode === "navigate" &&
      ["/dashboard", "/admin", "/onboarding", "/auth", "/shared"].some(
        (pathPrefix) =>
          url.pathname === pathPrefix ||
          url.pathname.startsWith(`${pathPrefix}/`)
      ),
    handler: "NetworkOnly",
  },
  {
    urlPattern: ({ request }) =>
      ["script", "style", "worker"].includes(request.destination),
    handler: "CacheFirst",
    options: {
      cacheName: "penmozhi-static-v1",
      expiration: { maxEntries: 96, maxAgeSeconds: 60 * 60 * 24 * 30 },
    },
  },
  {
    urlPattern: ({ request }) => request.destination === "font",
    handler: "CacheFirst",
    options: {
      cacheName: "penmozhi-fonts-v1",
      expiration: { maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 * 365 },
    },
  },
  {
    urlPattern: ({ request }) => request.destination === "image",
    handler: "CacheFirst",
    options: {
      cacheName: "penmozhi-images-v1",
      expiration: { maxEntries: 128, maxAgeSeconds: 60 * 60 * 24 * 30 },
    },
  },
  {
    urlPattern: ({ request }) => request.mode === "navigate",
    handler: "NetworkFirst",
    options: {
      cacheName: "penmozhi-pages-v1",
      networkTimeoutSeconds: 5,
      expiration: { maxEntries: 16, maxAgeSeconds: 60 * 60 * 24 },
    },
  },
]

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  cacheStartUrl: false,
  customWorkerSrc: "worker",
  workboxOptions: { runtimeCaching },
})

const apiUrl = (process.env.API_URL ?? "http://127.0.0.1:5000").replace(
  /\/+$/,
  ""
)
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

export default withPWA(nextConfig)
