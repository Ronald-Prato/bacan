import { describe, expect, it } from "vitest"

import { FONT_OPTIONS } from "./document"
import {
  TEXT_PRESETS,
  TEXT_PRESET_DRAG_MIME,
  createTextPresetElements,
  filterTextPresets,
  getTextPreset,
} from "./text-presets"

const canvasSize = { width: 1200, height: 800 }

const createId = (() => {
  let nextId = 0

  return () => `preset-${nextId++}`
})()

function getBounds(elements: ReturnType<typeof createTextPresetElements>) {
  const left = Math.min(...elements.map((element) => element.x))
  const top = Math.min(...elements.map((element) => element.y))
  const right = Math.max(...elements.map((element) => element.x + element.width))
  const bottom = Math.max(...elements.map((element) => element.y + element.height))

  return { left, top, right, bottom, width: right - left, height: bottom - top }
}

describe("text font catalog", () => {
  it("includes the local open-source display fonts in the safe font union", () => {
    expect(FONT_OPTIONS).toEqual(
      expect.arrayContaining(["Bebas Neue", "Bungee", "Caveat", "DM Serif Display", "Oswald"]),
    )
  })
})

describe("text presets", () => {
  it("exposes stable drag metadata and the required catalog sections", () => {
    expect(TEXT_PRESET_DRAG_MIME).toBe("application/x-bacan-text-preset")
    expect(new Set(TEXT_PRESETS.map((preset) => preset.id)).size).toBe(TEXT_PRESETS.length)
    expect(new Set(TEXT_PRESETS.map((preset) => preset.section))).toEqual(
      new Set(["basic", "style", "combination"]),
    )
    expect(TEXT_PRESETS.filter((preset) => preset.section === "basic")).toHaveLength(3)
    expect(TEXT_PRESETS.filter((preset) => preset.section === "style")).toHaveLength(5)
    expect(TEXT_PRESETS.filter((preset) => preset.section === "combination")).toHaveLength(5)
  })

  it("finds presets by accent-insensitive Spanish labels and search terms", () => {
    expect(filterTextPresets("titulo").map((preset) => preset.id)).toContain("title")
    expect(filterTextPresets("manuscrita").map((preset) => preset.id)).toContain("handwritten")
    expect(filterTextPresets("  ")).toEqual(TEXT_PRESETS)
    expect(getTextPreset("does-not-exist")).toBeUndefined()
  })

  it("creates one normalized text element for a simple preset", () => {
    const elements = createTextPresetElements({
      presetId: "title",
      createId,
      canvasSize,
    })

    expect(elements).toHaveLength(1)
    expect(elements[0]).toMatchObject({
      id: "preset-0",
      type: "text",
      text: "Tu idea empieza aquí",
      fontFamily: "Bebas Neue",
      fontWeight: "bold",
      align: "center",
    })
    expect(getBounds(elements)).toEqual({ left: 102, top: 304, right: 1098, bottom: 496, width: 996, height: 192 })
  })

  it("creates creative combinations as one grouped set centered on a drop", () => {
    const elements = createTextPresetElements({
      presetId: "editorial-pair",
      createId,
      canvasSize,
      position: { x: 600, y: 400 },
    })
    const bounds = getBounds(elements)

    expect(elements.length).toBeGreaterThan(1)
    expect(new Set(elements.map((element) => element.groupId)).size).toBe(1)
    expect(elements[0].groupId).toBeTruthy()
    expect(bounds).toMatchObject({ width: 996, height: 272 })
    expect(bounds.left + bounds.width / 2).toBe(600)
    expect(bounds.top + bounds.height / 2).toBe(400)
  })

  it("keeps every generated element inside a smaller canvas", () => {
    const smallCanvas = { width: 240, height: 160 }

    for (const preset of TEXT_PRESETS) {
      const elements = createTextPresetElements({
        presetId: preset.id,
        createId,
        canvasSize: smallCanvas,
        position: { x: 0, y: 0 },
      })
      const bounds = getBounds(elements)

      expect(elements.length).toBeGreaterThan(0)
      expect(bounds.left).toBeGreaterThanOrEqual(0)
      expect(bounds.top).toBeGreaterThanOrEqual(0)
      expect(bounds.right).toBeLessThanOrEqual(smallCanvas.width)
      expect(bounds.bottom).toBeLessThanOrEqual(smallCanvas.height)
    }
  })
})
