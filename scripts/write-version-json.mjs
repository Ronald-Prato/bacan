import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const outputPath = resolve(rootDir, process.argv[2] ?? "dist/version.json")
const packageJsonPath = resolve(rootDir, "package.json")

async function getPackageVersion() {
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"))
  return typeof packageJson.version === "string" ? packageJson.version : "local"
}

async function getProductionVersion() {
  return (
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.GITHUB_SHA ||
    process.env.VITE_APP_VERSION ||
    `${await getPackageVersion()}-${new Date().toISOString()}`
  )
}

const version = await getProductionVersion()

await mkdir(dirname(outputPath), { recursive: true })
await writeFile(outputPath, `${JSON.stringify({ version }, null, 2)}\n`)

console.log(`Wrote ${relative(rootDir, outputPath)} for ${version}`)
