// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest"

import { SHAPE_DRAG_MIME, SHAPE_OPTIONS } from "@/editor/shapes"

import { startShapeDrag } from "./shape-drag-preview"

describe("startShapeDrag", () => {
  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ""
  })

  it("uses only the rendered shape as the drag image", () => {
    vi.useFakeTimers()
    const item = SHAPE_OPTIONS.find(({ type }) => type === "arrow-right")
    expect(item).toBeDefined()

    const tile = document.createElement("button")
    tile.className = "shapes-panel__tile"
    tile.innerHTML = `
      <svg class="shapes-panel__preview" viewBox="0 0 56 56">
        <path d="M 8 20 L 40 20 L 48 28 L 40 36 L 8 36 Z" />
      </svg>
      <span class="tile-decoration">Ver todo</span>
    `
    document.body.append(tile)

    const dataTransfer = {
      effectAllowed: "none" as DataTransfer["effectAllowed"],
      setData: vi.fn(),
      setDragImage: vi.fn(),
    }

    startShapeDrag(dataTransfer, tile, item!)

    expect(dataTransfer.effectAllowed).toBe("copy")
    expect(dataTransfer.setData).toHaveBeenCalledWith(SHAPE_DRAG_MIME, item!.type)
    expect(dataTransfer.setDragImage).toHaveBeenCalledOnce()

    const [dragImage, offsetX, offsetY] = dataTransfer.setDragImage.mock.calls[0]!
    expect(dragImage).not.toBe(tile)
    expect(dragImage).toBeInstanceOf(HTMLDivElement)
    expect(dragImage.querySelector(".shapes-panel__preview")).toBeInstanceOf(SVGElement)
    expect(dragImage.querySelector(".tile-decoration")).toBeNull()
    expect(dragImage.style.background).toBe("transparent")
    const expectedColor = document.createElement("div")
    expectedColor.style.color = item!.fill
    expect(dragImage.style.color).toBe(expectedColor.style.color)
    expect(dragImage.style.width).toBe("96px")
    expect(dragImage.style.height).toBe("72px")
    expect(offsetX).toBe(48)
    expect(offsetY).toBe(36)
    expect(dragImage.querySelector("svg")?.getAttribute("preserveAspectRatio")).toBe("none")
    expect(document.body.contains(dragImage)).toBe(true)

    vi.runAllTimers()
    expect(document.body.contains(dragImage)).toBe(false)
  })
})
