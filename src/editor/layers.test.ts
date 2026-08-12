import { describe, expect, it } from "vitest"

import { getLayerDropTargetIndex, getLayerPreviewOrder } from "./layers"

describe("layer panel ordering", () => {
  const frontToBackIds = ["front", "middle", "back"]

  it("converts a visual drop before another layer to the canonical stack index", () => {
    expect(getLayerDropTargetIndex(frontToBackIds, "back", "front", "before")).toBe(2)
    expect(getLayerDropTargetIndex(frontToBackIds, "middle", "front", "before")).toBe(2)
  })

  it("converts a visual drop after another layer to the canonical stack index", () => {
    expect(getLayerDropTargetIndex(frontToBackIds, "front", "back", "after")).toBe(0)
    expect(getLayerDropTargetIndex(frontToBackIds, "middle", "back", "after")).toBe(0)
  })

  it("keeps adjacent visual drops at their existing canonical index", () => {
    expect(getLayerDropTargetIndex(frontToBackIds, "front", "middle", "before")).toBe(2)
    expect(getLayerDropTargetIndex(frontToBackIds, "back", "middle", "after")).toBe(0)
  })

  it("rejects missing and self-referential drop targets", () => {
    expect(getLayerDropTargetIndex(frontToBackIds, "missing", "front", "before")).toBeNull()
    expect(getLayerDropTargetIndex(frontToBackIds, "front", "missing", "after")).toBeNull()
    expect(getLayerDropTargetIndex(frontToBackIds, "front", "front", "before")).toBeNull()
  })

  it("previews the visible order as a dragged layer crosses its neighbors", () => {
    const firstPreview = getLayerPreviewOrder(frontToBackIds, "back", "middle", "before")
    const secondPreview = getLayerPreviewOrder(firstPreview ?? [], "back", "front", "before")

    expect(firstPreview).toEqual(["front", "back", "middle"])
    expect(secondPreview).toEqual(["back", "front", "middle"])
  })

  it("returns the same preview when the pointer has not crossed the target midpoint", () => {
    expect(getLayerPreviewOrder(frontToBackIds, "back", "middle", "after")).toEqual(frontToBackIds)
    expect(getLayerPreviewOrder(frontToBackIds, "front", "middle", "before")).toEqual(frontToBackIds)
  })
})
