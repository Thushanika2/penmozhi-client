const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "/backend"
const origin = process.env.VERIFY_ORIGIN ?? "http://127.0.0.1:3000"
const url = `${origin}${apiBase.replace(/\/$/, "")}/`

const res = await fetch(url)
if (!res.ok) {
  console.error(`API proxy check failed: ${res.status} ${res.statusText}`)
  console.error("Make sure penmozhi-api is running on port 5000 and penmozhi-client dev server is up.")
  process.exit(1)
}

const data = await res.json()
console.log("Connected:", data.message ?? "OK")
console.log("Proxy:", url)
process.exit(0)
