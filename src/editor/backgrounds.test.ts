import { describe, expect, it } from "vitest"

import {
  BACKGROUND_PALETTES,
  filterBackgroundPalettes,
  normalizeBackgroundColorForPicker,
} from "./backgrounds"

describe("editor backgrounds", () => {
  it("provides simple starter palettes", () => {
    expect(BACKGROUND_PALETTES.map((palette) => palette.name)).toEqual([
      "Atardecer",
      "Bosque",
      "Oceano",
      "Neutros",
    ])
    expect(BACKGROUND_PALETTES.every((palette) => palette.colors.length === 5)).toBe(true)
  })

  it("filters palettes by name or color", () => {
    expect(filterBackgroundPalettes("bosque").map((palette) => palette.id)).toEqual(["forest"])
    expect(filterBackgroundPalettes("#264653").map((palette) => palette.id)).toEqual(["ocean"])
  })

  it("normalizes canvas colors for the native color picker", () => {
    expect(normalizeBackgroundColorForPicker("#ABC")).toBe("#aabbcc")
    expect(normalizeBackgroundColorForPicker("#12A4EF")).toBe("#12a4ef")
    expect(normalizeBackgroundColorForPicker("transparent")).toBe("#ffffff")
  })
})
