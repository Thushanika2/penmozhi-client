import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"

interface BrandLogoProps {
  href?: string
  linked?: boolean
  size?: "sm" | "md" | "lg" | "xl"
  showTagline?: boolean
  className?: string
}

const sizeMap = {
  sm: { height: 36, width: 120, img: "h-9 w-auto" },
  md: { height: 48, width: 160, img: "h-12 w-auto" },
  lg: { height: 64, width: 220, img: "h-16 w-auto" },
  xl: { height: 88, width: 300, img: "h-20 w-auto sm:h-24" },
} as const

export function BrandLogo({
  href = "/",
  linked = true,
  size = "md",
  showTagline = false,
  className,
}: BrandLogoProps) {
  const dimensions = sizeMap[size]

  const content = (
    <div className={cn("flex flex-col gap-1", className)}>
      <Image
        src="/penmozhi-logo.png"
        alt="Penmozhi — பெண்மொழி Women's Health"
        width={dimensions.width}
        height={dimensions.height}
        className={cn(dimensions.img, "object-contain object-left")}
        priority={size === "lg" || size === "xl"}
      />
      {showTagline ? (
        <p className="text-xs font-medium tracking-wide text-muted-foreground">
          Women&apos;s Health · Tamil &amp; English
        </p>
      ) : null}
    </div>
  )

  if (!linked) return content

  return (
    <Link href={href} className="inline-flex transition-opacity hover:opacity-90">
      {content}
    </Link>
  )
}
