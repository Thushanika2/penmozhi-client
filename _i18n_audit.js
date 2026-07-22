import fs from "node:fs"
import path from "node:path"

const readJson = (file) =>
  JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""))

const en = readJson("./i18n/messages/en.json")
const ta = readJson("./i18n/messages/ta.json")

function flatten(obj, prefix = "") {
  const keys = []
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      keys.push(...flatten(v, key))
    } else {
      keys.push(key)
    }
  }
  return keys
}

const enKeys = new Set(flatten(en))
const taKeys = new Set(flatten(ta))

const used = new Set()
const root = process.cwd()

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next" || entry.name.startsWith(".")) {
      continue
    }
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(fullPath)
      continue
    }
    if (!/\.(ts|tsx)$/.test(entry.name)) continue
    const content = fs.readFileSync(fullPath, "utf8")

    const patterns = [
      /t\("([^"]+)"/g,
      /labelKey:\s*"([^"]+)"/g,
      /titleKey:\s*"([^"]+)"/g,
      /descriptionKey:\s*"([^"]+)"/g,
    ]

    for (const pattern of patterns) {
      for (const match of content.matchAll(pattern)) {
        const key = match[1]
        if (key && key !== ".") {
          used.add(key)
        }
      }
    }
  }
}
walk(root)
used.add("languageSwitcher.updateFailed")

const missingEn = [...used].filter((k) => !enKeys.has(k)).sort()
const missingTa = [...used].filter((k) => !taKeys.has(k)).sort()
const unusedInJson = [...enKeys].filter((k) => !used.has(k)).sort()
const onlyEn = [...enKeys].filter((k) => !taKeys.has(k)).sort()
const onlyTa = [...taKeys].filter((k) => !enKeys.has(k)).sort()

console.log("USED_COUNT", used.size)
console.log("EN_COUNT", enKeys.size)
console.log("TA_COUNT", taKeys.size)
console.log("---USED---")
console.log([...used].sort().join("\n"))
console.log("---MISSING_EN---")
console.log(missingEn.length ? missingEn.join("\n") : "(none)")
console.log("---MISSING_TA---")
console.log(missingTa.length ? missingTa.join("\n") : "(none)")
console.log("---ONLY_EN---")
console.log(onlyEn.length ? onlyEn.join("\n") : "(none)")
console.log("---ONLY_TA---")
console.log(onlyTa.length ? onlyTa.join("\n") : "(none)")
console.log("---UNUSED_IN_JSON---")
console.log(unusedInJson.join("\n"))
