"use client"

import { motion, type HTMLMotionProps } from "framer-motion"
import * as React from "react"

import { cn } from "@/lib/utils"

type MotionCardProps = HTMLMotionProps<"div"> & {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function MotionCard({ children, className, delay = 0, ...props }: MotionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut", delay }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
