"use client"

import * as React from "react"

import { useAuth } from "@/providers/auth-provider"
import { registerPushSubscription } from "@/services/account"

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const raw = window.atob(base64)
  const output = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; ++i) {
    output[i] = raw.charCodeAt(i)
  }
  return output
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { healthProfile } = useAuth()
  const registeredRef = React.useRef(false)

  React.useEffect(() => {
    if (registeredRef.current || !healthProfile) return

    const notifyEnabled =
      healthProfile.notify_period ||
      healthProfile.notify_ovulation ||
      healthProfile.notify_medication ||
      healthProfile.notify_daily_health

    if (!notifyEnabled) return
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!vapidKey) return

    registeredRef.current = true
    const publicKey = vapidKey

    async function register() {
      try {
        const permission = await Notification.requestPermission()
        if (permission !== "granted") return

        const registration = await navigator.serviceWorker.register("/sw.js")
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        })

        const json = subscription.toJSON()
        if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return

        await registerPushSubscription({
          endpoint: json.endpoint,
          p256dh: json.keys.p256dh,
          auth: json.keys.auth,
          device_type: /Mobile/i.test(navigator.userAgent) ? "mobile" : "desktop",
        })
      } catch {
        registeredRef.current = false
      }
    }

    void register()
  }, [healthProfile])

  return <>{children}</>
}
