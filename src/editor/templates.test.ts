import { describe, expect, it } from "vitest"

import { addElementToPage, createInitialDocument, createShapeElement } from "./document"
import {
  DESIGN_FORMATS,
  DESIGN_TEMPLATES,
  createBlankDocumentForFormat,
  createBlankDocumentForSize,
  createDocumentFromTemplate,
  createDocumentFromSharedTemplate,
  createSharedTemplateDraft,
  resizeDocumentToFormat,
  resolveCustomDesignSize,
} from "./templates"

function idSequence() {
  let index = 0

  return () => {
    index += 1
    return `id-${index}`
  }
}

describe("design templates and formats", () => {
  it("offers essential Canva-like starting formats", () => {
    expect(DESIGN_FORMATS.map((format) => format.id)).toEqual([
      "square-post",
      "story",
      "presentation",
      "poster",
    ])
  })

  it("creates blank documents for a selected format", () => {
    const document = createBlankDocumentForFormat("story", idSequence())

    expect(document.name).toBe("Historia vertical")
    expect(document.size).toEqual({ width: 1080, height: 1920 })
    expect(document.pages).toHaveLength(1)
    expect(document.pages[0].elements).toHaveLength(0)
  })

  it("converts centimetres to whole pixels at the requested print resolution", () => {
    expect(resolveCustomDesignSize({ width: 21, height: 29.7, unit: "cm", dpi: 300 })).toEqual({
      width: 2480,
      height: 3508,
    })
  })

  it("keeps pixel dimensions exact and independent from print resolution", () => {
    expect(resolveCustomDesignSize({ width: 1200, height: 628, unit: "px", dpi: 300 })).toEqual({
      width: 1200,
      height: 628,
    })
  })

  it("rejects invalid or unsafe custom canvas dimensions", () => {
    expect(() => resolveCustomDesignSize({ width: 0, height: 200, unit: "px", dpi: 96 })).toThrow(
      "mayores que cero",
    )
    expect(() => resolveCustomDesignSize({ width: 20000, height: 200, unit: "px", dpi: 96 })).toThrow(
      "16384",
    )
  })

  it("creates a blank custom document with the resolved pixel size", () => {
    const document = createBlankDocumentForSize(
      { width: 10, height: 15, unit: "cm", dpi: 300 },
      idSequence(),
    )

    expect(document.name).toBe("Diseño 1181 × 1772 px")
    expect(document.size).toEqual({ width: 1181, height: 1772 })
    expect(document.pages[0].elements).toHaveLength(0)
  })

  it("creates a complete editable document from a template", () => {
    const document = createDocumentFromTemplate("launch-post", idSequence())

    expect(document.name).toBe("Post promocional")
    expect(document.size).toEqual({ width: 1080, height: 1080 })
    expect(document.pages[0].background).toBe("#101827")
    expect(document.pages[0].elements.length).toBeGreaterThanOrEqual(3)

    for (const element of document.pages[0].elements) {
      expect(element.x).toBeGreaterThanOrEqual(0)
      expect(element.y).toBeGreaterThanOrEqual(0)
      expect(element.x + element.width).toBeLessThanOrEqual(document.size.width)
      expect(element.y + element.height).toBeLessThanOrEqual(document.size.height)
    }
  })

  it("scales an existing document when changing format", () => {
    const nextId = idSequence()
    const document = createInitialDocument(nextId)
    const pageId = document.pages[0].id
    const shape = createShapeElement("rect", nextId, { x: 1024, y: 2048 })
    const withShape = addElementToPage(document, pageId, shape)

    const resized = resizeDocumentToFormat(withShape, "presentation")
    const resizedShape = resized.pages[0].elements[0]

    expect(resized.size).toEqual({ width: 1920, height: 1080 })
    expect(resizedShape.x).toBe(480)
    expect(resizedShape.y).toBe(540)
    expect(resizedShape.width).toBeCloseTo(337.5)
    expect(resizedShape.height).toBeCloseTo(147.65625)
  })

  it("keeps template definitions discoverable for the UI", () => {
    expect(DESIGN_TEMPLATES.map((template) => template.id)).toEqual([
      "launch-post",
      "story-announcement",
      "pitch-deck",
    ])
  })

  it("creates a shared template draft without mutating the source document", () => {
    const nextId = idSequence()
    const document = createDocumentFromTemplate("launch-post", nextId)

    const draft = createSharedTemplateDraft({
      document,
      name: "Campana reutilizable",
      description: "Lista para duplicar.",
      authorName: "Ron",
      createdAt: 123,
    })

    document.pages[0].name = "Mutada"

    expect(draft).toMatchObject({
      name: "Campana reutilizable",
      description: "Lista para duplicar.",
      authorName: "Ron",
      createdAt: 123,
      pageCount: 1,
      elementCount: 4,
    })
    expect(draft.canvas.pages[0].name).toBe("Pagina 1")
  })

  it("creates a fresh editable document from a shared template record", () => {
    const template = createSharedTemplateDraft({
      document: createDocumentFromTemplate("launch-post", idSequence()),
      name: "Post reusable",
      description: "",
      authorName: "Equipo",
      createdAt: 456,
    })
    const nextId = (() => {
      let index = 0

      return () => {
        index += 1
        return `new-${index}`
      }
    })()

    const document = createDocumentFromSharedTemplate(
      {
        id: "template-1",
        ...template,
      },
      nextId,
    )

    expect(document.name).toBe("Post reusable")
    expect(document.pages[0].id).toBe("new-1")
    expect(document.pages[0].elements.map((element) => element.id)).toEqual(["new-2", "new-3", "new-4", "new-5"])
    expect(document.pages[0].elements[0].id).not.toBe(template.canvas.pages[0].elements[0].id)
  })
})
