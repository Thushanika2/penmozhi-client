import type { Metadata, Viewport } from "next"
import {
  Cormorant_Garamond,
  Geist_Mono,
  Inter,
  Noto_Sans_Tamil,
} from "next/font/google"
import { Toaster } from "sonner"

import { ThemeProvider } from "@/components/theme-provider"
import { DocumentLocale } from "@/components/document-locale"
import { InstallAppPrompt } from "@/components/install-app-prompt"
import { cn } from "@/lib/utils"
import { themeInitScript } from "@/lib/theme-script"
import { AuthProvider } from "@/providers/auth-provider"
import { LanguageProvider } from "@/providers/language-provider"
import { QueryProvider } from "@/providers/query-provider"

import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
})

const notoTamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-tamil",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Penmozhi — Period & Cycle Tracker",
  description:
    "Science-based, privacy-first period and cycle tracking in Tamil and English.",
  applicationName: "Penmozhi",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Penmozhi",
  },
  icons: {
    apple: "/icons/icon-192.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#f76dbe",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        cormorant.variable,
        notoTamil.variable,
        "font-sans",
        inter.variable
      )}
    >
      <head>
        {/* Next 16 emits mobile-web-app-capable; retain the iOS-specific alias too. */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <LanguageProvider>
                <DocumentLocale />
                {children}
                <InstallAppPrompt />
                <Toaster richColors position="top-right" />
              </LanguageProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
