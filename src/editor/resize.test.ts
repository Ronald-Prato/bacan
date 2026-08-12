import { describe, expect, it } from "vitest"

import { getLiveElementResize } from "./resize"

describe("live element resize", () => {
  it("converts text scaling into dimensions on every transform frame", () => {
    const resized = getLiveElementResize(
      { width: 800, height: 240 },
      { x: 120, y: 80, scaleX: 0.5, scaleY: 1.5, rotation: 0 },
    )

    expect(resized).toEqual({
      x: 120,
      y: 80,
      width: 400,
      height: 360,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    })
  })

  it("keeps the minimum size while returning an unscaled preview", () => {
    const resized = getLiveElementResize(
      { width: 100, height: 100 },
      { x: 24, y: 36, scaleX: 0.1, scaleY: 0.2, rotation: 12 },
    )

    expect(resized).toMatchObject({
      width: 28,
      height: 28,
      rotation: 12,
      scaleX: 1,
      scaleY: 1,
    })
  })

  it("uses the previous live dimensions for consecutive transform frames", () => {
    const firstFrame = getLiveElementResize(
      { width: 800, height: 240 },
      { x: 100, y: 80, scaleX: 0.75, scaleY: 1, rotation: 0 },
    )
    const secondFrame = getLiveElementResize(firstFrame, {
      x: 100,
      y: 80,
      scaleX: 2 / 3,
      scaleY: 1,
      rotation: 0,
    })

    expect(firstFrame.width).toBe(600)
    expect(secondFrame).toMatchObject({ width: 400, height: 240, scaleX: 1, scaleY: 1 })
  })
})
