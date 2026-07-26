self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {}
  event.waitUntil(
    self.registration.showNotification(data.title ?? "Penmozhi", {
      body: data.body ?? "",
      icon: "/icon-192.png",
    }),
  )
})
