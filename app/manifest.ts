import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Penmozhi — Period & Cycle Tracker",
    short_name: "Penmozhi",
    description:
      "Science-based, privacy-first period and cycle tracking in Tamil and English.",
    start_url: "/",
    display: "standalone",
    background_color: "#120810",
    theme_color: "#f76dbe",
    orientation: "portrait",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
