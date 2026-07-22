"use client"

import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { useLanguage } from "@/providers/language-provider"

interface BrandLogoProps {
  href?: string
  linked?: boolean
  size?: "sm" | "md" | "lg" | "xl"
  showTagline?: boolean
  className?: string
}

const sizeMap = {
  sm: { px: 40, img: "size-10" },
  md: { px: 52, img: "size-[3.25rem]" },
  lg: { px: 72, img: "size-[4.5rem]" },
  xl: { px: 128, img: "size-32" },
} as const

export function BrandLogo({
  href = "/",
  linked = true,
  size = "md",
  showTagline = false,
  className,
}: BrandLogoProps) {
  const { t } = useLanguage()
  const dimensions = sizeMap[size]

  const content = (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          dimensions.img,
          "relative shrink-0 overflow-hidden rounded-full shadow-md shadow-primary/15 ring-1 ring-primary/15",
        )}
      >
        <Image
          src="/penmozhi-logo.png"
          alt={t("brandLogo.alt")}
          width={dimensions.px}
          height={dimensions.px}
          className="h-full w-full object-contain"
          priority={size === "lg" || size === "xl"}
        />
      </div>
      {showTagline ? (
        <div className="min-w-0">
          <p className="font-heading text-xl font-bold tracking-tight text-foreground">
            {t("brandLogo.name")}
          </p>
          <p className="font-tamil text-sm font-medium text-primary">{t("brand.tamilMark")}</p>
          <p className="text-xs text-muted-foreground">{t("brandLogo.tagline")}</p>
        </div>
      ) : null}
    </div>
  )

  if (!linked) return content

  return (
    <Link href={href} className="inline-flex transition-opacity hover:opacity-85">
      {content}
    </Link>
  )
}
