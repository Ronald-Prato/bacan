import { filterSearchItems } from "./search"

export type BackgroundPalette = {
  id: string
  name: string
  colors: readonly string[]
}

export const BACKGROUND_PALETTES: readonly BackgroundPalette[] = [
  {
    id: "sunset",
    name: "Atardecer",
    colors: ["#fff1d6", "#ffd6a5", "#ffadad", "#cdb4db", "#6d597a"],
  },
  {
    id: "forest",
    name: "Bosque",
    colors: ["#edf6e5", "#b7d3a8", "#7fa06a", "#496a48", "#263d2d"],
  },
  {
    id: "ocean",
    name: "Oceano",
    colors: ["#e8f6f8", "#a8dadc", "#74b3ce", "#457b9d", "#264653"],
  },
  {
    id: "neutrals",
    name: "Neutros",
    colors: ["#faf9f6", "#e7e2da", "#c9c1b7", "#817970", "#34312f"],
  },
]

export function filterBackgroundPalettes(query: string): BackgroundPalette[] {
  return filterSearchItems(BACKGROUND_PALETTES, query, [
    "name",
    (palette) => palette.colors.join(" "),
  ])
}

export function normalizeBackgroundColorForPicker(
  color: string,
  fallback = "#ffffff",
): string {
  const normalized = color.trim().toLowerCase()
  const shortHexMatch = normalized.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/)

  if (shortHexMatch) {
    return `#${shortHexMatch.slice(1).map((value) => `${value}${value}`).join("")}`
  }

  return /^#[0-9a-f]{6}$/.test(normalized) ? normalized : fallback
}
