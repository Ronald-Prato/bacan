import { describe, expect, it } from "vitest"

import { getEditorWheelZoom, getZoomedScrollPosition } from "./zoom"

describe("editor zoom", () => {
  it("zooms only when the wheel gesture uses Command or Alt", () => {
    expect(
      getEditorWheelZoom({
        currentScale: 0.5,
        deltaY: -100,
        metaKey: false,
        altKey: false,
        minScale: 0.1,
        maxScale: 1,
      }),
    ).toBeNull()

    expect(
      getEditorWheelZoom({
        currentScale: 0.5,
        deltaY: -100,
        metaKey: true,
        altKey: false,
        minScale: 0.1,
        maxScale: 1,
      }),
    ).toBeGreaterThan(0.5)

    expect(
      getEditorWheelZoom({
        currentScale: 0.5,
        deltaY: 100,
        metaKey: false,
        altKey: true,
        minScale: 0.1,
        maxScale: 1,
      }),
    ).toBeLessThan(0.5)
  })

  it("keeps the content point under the cursor stable after zooming", () => {
    expect(
      getZoomedScrollPosition({
        pointer: { x: 200, y: 300 },
        scroll: { left: 100, top: 400 },
        previousContentSize: { width: 1000, height: 2000 },
        nextContentSize: { width: 1500, height: 3000 },
        viewportSize: { width: 500, height: 600 },
      }),
    ).toEqual({ left: 250, top: 750 })
  })
})
