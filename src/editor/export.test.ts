import { describe, expect, it } from "vitest"

import {
  EXPORT_FORMATS,
  EXPORT_SCALES,
  buildExportFileName,
  buildExportPageFileName,
  createExportOptions,
  getExportOutputSize,
  getExportPageIds,
  getExportMimeType,
} from "./export"

describe("export helpers", () => {
  it("offers professional export formats", () => {
    expect(EXPORT_FORMATS.map((format) => format.id)).toEqual(["png", "jpg", "pdf"])
    expect(EXPORT_SCALES.map((resolution) => resolution.scale)).toEqual([1, 2, 3])
  })

  it("builds safe filenames from document names", () => {
    expect(buildExportFileName("  Nuevo Lanzamiento  ", "png")).toBe("nuevo-lanzamiento.png")
    expect(buildExportFileName("", "pdf")).toBe("bacan.pdf")
    expect(buildExportPageFileName("Nuevo Lanzamiento", 2, "jpg")).toBe("nuevo-lanzamiento-pagina-2.jpg")
  })

  it("returns the correct canvas mime type", () => {
    expect(getExportMimeType("png")).toBe("image/png")
    expect(getExportMimeType("jpg")).toBe("image/jpeg")
    expect(getExportMimeType("pdf")).toBe("image/png")
  })

  it("creates stable default options", () => {
    expect(createExportOptions()).toEqual({
      format: "png",
      quality: 0.92,
      pageSelection: "all",
      scale: 1,
      transparentBackground: false,
    })
  })

  it("resolves all pages or only the active page", () => {
    const pageIds = ["page-1", "page-2", "page-3"]

    expect(getExportPageIds(pageIds, "page-2", "all")).toEqual(pageIds)
    expect(getExportPageIds(pageIds, "page-2", "current")).toEqual(["page-2"])
    expect(getExportPageIds(pageIds, null, "current")).toEqual(["page-1"])
  })

  it("calculates the requested output resolution", () => {
    expect(getExportOutputSize({ width: 1080, height: 1080 }, 2)).toEqual({
      width: 2160,
      height: 2160,
    })
  })

  it("clamps jpg quality into the browser-safe range", () => {
    expect(createExportOptions({ format: "jpg", quality: 1.8 }).quality).toBe(1)
    expect(createExportOptions({ format: "jpg", quality: -0.2 }).quality).toBe(0.1)
  })
})
