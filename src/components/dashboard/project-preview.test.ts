import { describe, expect, it, vi } from "vitest"

import {
  findProjectMissingPreview,
  getProjectPreviewScale,
  renderProjectPreview,
} from "./project-preview"

describe("project preview rendering", () => {
  it("fits the first page into a lightweight 360px thumbnail", () => {
    expect(getProjectPreviewScale({ width: 1080, height: 1080 })).toBe(1 / 3)
    expect(getProjectPreviewScale({ width: 320, height: 180 })).toBe(1)
  })

  it("encodes a compact JPEG and tolerates an unavailable canvas", () => {
    const toDataURL = vi.fn(() => "data:image/jpeg;base64,preview")

    expect(renderProjectPreview({ toDataURL })).toBe("data:image/jpeg;base64,preview")
    expect(toDataURL).toHaveBeenCalledWith({
      mimeType: "image/jpeg",
      quality: 0.76,
      pixelRatio: 1,
    })
    expect(renderProjectPreview(null)).toBeUndefined()
    expect(renderProjectPreview({
      toDataURL: () => {
        throw new Error("tainted canvas")
      },
    })).toBeUndefined()
  })

  it("selects only an unattempted project that still needs a preview", () => {
    const projects = [
      { id: "ready", previewUrl: "data:image/jpeg;base64,ready" },
      { id: "attempted" },
      { id: "pending" },
    ]

    expect(findProjectMissingPreview(projects, new Set(["attempted"]))).toEqual({ id: "pending" })
    expect(findProjectMissingPreview(projects, new Set(["attempted", "pending"]))).toBeUndefined()
  })
})
