import { describe, expect, it } from "vitest"

import {
  SHAPE_CATEGORIES,
  SHAPE_DRAG_MIME,
  SHAPE_OPTIONS,
  getShapeDefaultSize,
  getShapeRenderDescriptor,
  isShapeCatalogItem,
  isShapeType,
  listRecentShapes,
  parseShapeDragPayload,
  searchShapes,
  validateShapeCatalog,
  type ShapeCatalogItem,
  type ShapeType,
} from "./shapes"

const expectedCategoryIds = [
  "recent",
  "lines",
  "basic",
  "polygons",
  "stars",
  "arrows",
  "flowchart",
  "speech-bubbles",
  "clouds",
  "hearts",
] as const

const expectedItemsByCategory: Record<Exclude<(typeof expectedCategoryIds)[number], "recent">, string[]> = {
  lines: ["line-solid", "line-dashed", "line-dotted", "line-arrow", "line-double-arrow"],
  basic: ["basic-square", "basic-rounded-rectangle", "basic-circle", "basic-triangle", "basic-inverted-triangle"],
  polygons: [
    "polygon-pentagon",
    "polygon-hexagon-pointy",
    "polygon-hexagon-flat",
    "polygon-octagon",
    "polygon-decagon",
  ],
  stars: ["star-four-point", "star-five-point", "star-six-point", "star-eight-point", "starburst"],
  arrows: ["arrow-right", "arrow-left", "arrow-up", "arrow-down", "arrow-double"],
  flowchart: [
    "flowchart-preparation",
    "flowchart-terminator",
    "flowchart-process",
    "flowchart-decision",
    "flowchart-cylinder",
    "flowchart-document",
  ],
  "speech-bubbles": [
    "speech-rectangle",
    "speech-oval",
    "speech-cloud",
    "speech-rounded",
    "speech-tail",
  ],
  clouds: ["cloud-small", "cloud-wide", "cloud-puffy", "cloud-rounded", "cloud-silhouette"],
  hearts: ["heart-classic", "heart-rounded", "heart-slim", "heart-double", "heart-burst"],
}

describe("shape catalog", () => {
  it("keeps the ten reference sections in visual order", () => {
    expect(SHAPE_CATEGORIES.map((category) => category.id)).toEqual(expectedCategoryIds)
    expect(SHAPE_CATEGORIES.map((category) => category.label)).toEqual([
      "Usado recién",
      "Líneas",
      "Formas básicas",
      "Polígonos",
      "Estrellas",
      "Flechas",
      "Formas de diagrama de flujo",
      "Globos de diálogo",
      "Nubes",
      "Corazones",
    ])
    expect(SHAPE_CATEGORIES[0].isDynamic).toBe(true)
    expect(SHAPE_CATEGORIES.slice(1).every((category) => !category.isDynamic)).toBe(true)
  })

  it("contains the complete stable item order for each static section", () => {
    for (const category of SHAPE_CATEGORIES.slice(1)) {
      expect(category.itemTypes).toEqual(expectedItemsByCategory[category.id as Exclude<(typeof expectedCategoryIds)[number], "recent">])
    }

    expect(SHAPE_OPTIONS.map((item) => item.type)).toEqual(Object.values(expectedItemsByCategory).flat())
  })

  it("has unique IDs, Spanish labels, and searchable keywords", () => {
    const ids = SHAPE_OPTIONS.map((item) => item.type)

    expect(new Set(ids).size).toBe(ids.length)
    expect(SHAPE_OPTIONS.every((item) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.type))).toBe(true)
    expect(SHAPE_OPTIONS.every((item) => item.label.trim().length > 0 && item.keywords.length > 0)).toBe(true)
  })

  it("validates the shipped catalog and rejects duplicate or malformed records", () => {
    expect(validateShapeCatalog()).toEqual({ valid: true, errors: [] })
    expect(isShapeCatalogItem(SHAPE_OPTIONS[0])).toBe(true)
    expect(isShapeCatalogItem({ type: "bad" })).toBe(false)

    const duplicate = [...SHAPE_OPTIONS, SHAPE_OPTIONS[0]]
    const result = validateShapeCatalog(duplicate)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain("duplicate type: line-solid")
  })
})

describe("shape presets and render descriptors", () => {
  it("defines dimensions and aspect policy for every catalog item", () => {
    for (const item of SHAPE_OPTIONS) {
      expect(item.size.width).toBeGreaterThan(0)
      expect(item.size.height).toBeGreaterThan(0)
      expect(item.aspectRatio).toBeCloseTo(item.size.width / item.size.height)
      expect(typeof item.preserveAspectRatio).toBe("boolean")

      const constrained = getShapeDefaultSize(item.type, { width: 320, height: 240 })
      expect(constrained.width).toBeGreaterThan(0)
      expect(constrained.height).toBeGreaterThan(0)
      expect(constrained.width).toBeLessThanOrEqual(320)
      expect(constrained.height).toBeLessThanOrEqual(240)
    }
  })

  it("uses square defaults for circular and radial presets", () => {
    expect(SHAPE_OPTIONS.find((item) => item.type === "basic-circle")).toMatchObject({
      size: { width: 560, height: 560 },
      aspectRatio: 1,
      preserveAspectRatio: true,
    })
    expect(SHAPE_OPTIONS.find((item) => item.type === "star-five-point")).toMatchObject({
      size: { width: 560, height: 560 },
      aspectRatio: 1,
      preserveAspectRatio: true,
    })
  })

  it("provides an exhaustive descriptor kind for every geometry family", () => {
    const kinds = new Map<ShapeType, string>()

    for (const item of SHAPE_OPTIONS) {
      const descriptor = getShapeRenderDescriptor(item.type)
      kinds.set(item.type, descriptor.kind)
      expect(descriptor.kind).toBe(item.render.kind)
    }

    expect(kinds.get("line-solid")).toBe("line")
    expect(kinds.get("line-arrow")).toBe("arrow")
    expect(kinds.get("line-double-arrow")).toBe("arrow")
    expect(kinds.get("arrow-right")).toBe("path")
    expect(kinds.get("arrow-double")).toBe("path")
    expect(kinds.get("polygon-hexagon-pointy")).toBe("polygon")
    expect(kinds.get("star-five-point")).toBe("star")
    expect(kinds.get("flowchart-process")).toBe("path")
    expect(kinds.get("speech-cloud")).toBe("path")
    expect(kinds.get("cloud-puffy")).toBe("path")
    expect(kinds.get("heart-classic")).toBe("path")
  })

  it("describes lines and arrows in normalized bounds", () => {
    const line = getShapeRenderDescriptor("line-dashed")
    const arrow = getShapeRenderDescriptor("line-double-arrow")

    expect(line).toMatchObject({
      kind: "line",
      points: [0.05, 0.5, 0.95, 0.5],
      dashed: true,
    })
    expect(arrow).toMatchObject({
      kind: "arrow",
      points: [0.08, 0.5, 0.92, 0.5],
      startPointer: true,
      endPointer: true,
    })
  })

  it("keeps block arrows distinct from thin line arrows", () => {
    const lineArrow = getShapeRenderDescriptor("line-arrow")
    const blockArrow = getShapeRenderDescriptor("arrow-right")

    expect(lineArrow.kind).toBe("arrow")
    expect(blockArrow.kind).toBe("path")
    if (blockArrow.kind !== "path") {
      return
    }

    expect(blockArrow.commands).toEqual([
      { command: "M", x: 0.05, y: 0.34 },
      { command: "L", x: 0.62, y: 0.34 },
      { command: "L", x: 0.62, y: 0.12 },
      { command: "L", x: 0.95, y: 0.5 },
      { command: "L", x: 0.62, y: 0.88 },
      { command: "L", x: 0.62, y: 0.66 },
      { command: "L", x: 0.05, y: 0.66 },
      { command: "Z" },
    ])
  })

  it("describes polygon side counts and star inner radii", () => {
    expect(getShapeRenderDescriptor("polygon-pentagon")).toMatchObject({ kind: "polygon", sides: 5 })
    expect(getShapeRenderDescriptor("polygon-hexagon-pointy")).toMatchObject({
      kind: "polygon",
      sides: 6,
      rotation: 0,
    })
    expect(getShapeRenderDescriptor("polygon-hexagon-flat")).toMatchObject({
      kind: "polygon",
      sides: 6,
      rotation: Math.PI / 6,
    })
    expect(getShapeRenderDescriptor("polygon-decagon")).toMatchObject({ kind: "polygon", sides: 10 })
    expect(getShapeRenderDescriptor("star-four-point")).toMatchObject({
      kind: "star",
      points: 4,
      innerRadiusRatio: 0.42,
      rotation: 0,
    })
    expect(getShapeRenderDescriptor("starburst")).toMatchObject({
      kind: "star",
      points: 12,
      innerRadiusRatio: 0.7,
    })
  })

  it("describes custom path families with closed normalized commands", () => {
    const customPathTypes = SHAPE_OPTIONS
      .filter((item) => item.render.kind === "path")
      .map((item) => item.type)

    for (const type of customPathTypes) {
      const descriptor = getShapeRenderDescriptor(type)

      expect(descriptor.kind).toBe("path")
      if (descriptor.kind !== "path") {
        continue
      }
      expect(descriptor.commands.length).toBeGreaterThan(2)
      expect(descriptor.commands.at(-1)).toEqual({ command: "Z" })

      for (const command of descriptor.commands) {
        if (command.command === "Z") {
          continue
        }

        expect(command.x).toBeGreaterThanOrEqual(0)
        expect(command.x).toBeLessThanOrEqual(1)
        expect(command.y).toBeGreaterThanOrEqual(0)
        expect(command.y).toBeLessThanOrEqual(1)

        if (command.command === "Q") {
          expect(command.controlX).toBeGreaterThanOrEqual(0)
          expect(command.controlX).toBeLessThanOrEqual(1)
          expect(command.controlY).toBeGreaterThanOrEqual(0)
          expect(command.controlY).toBeLessThanOrEqual(1)
        }

        if (command.command === "C") {
          for (const coordinate of [command.controlX1, command.controlY1, command.controlX2, command.controlY2]) {
            expect(coordinate).toBeGreaterThanOrEqual(0)
            expect(coordinate).toBeLessThanOrEqual(1)
          }
        }
      }
    }
  })

  it("keeps critical Bézier paths continuous and geometrically closed", () => {
    const criticalTypes = [
      "basic-circle",
      "basic-rounded-rectangle",
      "flowchart-terminator",
      "speech-oval",
      "speech-rounded",
    ] as const

    for (const type of criticalTypes) {
      const descriptor = getShapeRenderDescriptor(type)

      if (descriptor.kind !== "path") {
        throw new Error(`${type} must use a path descriptor`)
      }

      expect(descriptor.commands[0]).toMatchObject({ command: "M" })
      expect(descriptor.commands.at(-1)).toEqual({ command: "Z" })
      expect(descriptor.commands.filter((command) => command.command === "M")).toHaveLength(1)

      const first = descriptor.commands[0]
      const last = descriptor.commands.at(-2)
      if (first.command === "M" && last && last.command !== "Z") {
        expect(last).toMatchObject({ x: first.x, y: first.y })
      }
    }

    expect(getShapeRenderDescriptor("basic-circle")).toEqual({
      kind: "path",
      commands: [
        { command: "M", x: 0.5, y: 0.04 },
        { command: "C", x: 0.96, y: 0.5, controlX1: 0.754, controlY1: 0.04, controlX2: 0.96, controlY2: 0.246 },
        { command: "C", x: 0.5, y: 0.96, controlX1: 0.96, controlY1: 0.754, controlX2: 0.754, controlY2: 0.96 },
        { command: "C", x: 0.04, y: 0.5, controlX1: 0.246, controlY1: 0.96, controlX2: 0.04, controlY2: 0.754 },
        { command: "C", x: 0.5, y: 0.04, controlX1: 0.04, controlY1: 0.246, controlX2: 0.246, controlY2: 0.04 },
        { command: "Z" },
      ],
    })

    expect(getShapeRenderDescriptor("flowchart-terminator")).toEqual({
      kind: "path",
      commands: [
        { command: "M", x: 0.35, y: 0.2 },
        { command: "L", x: 0.65, y: 0.2 },
        { command: "C", x: 0.95, y: 0.5, controlX1: 0.816, controlY1: 0.2, controlX2: 0.95, controlY2: 0.334 },
        { command: "C", x: 0.65, y: 0.8, controlX1: 0.95, controlY1: 0.666, controlX2: 0.816, controlY2: 0.8 },
        { command: "L", x: 0.35, y: 0.8 },
        { command: "C", x: 0.05, y: 0.5, controlX1: 0.184, controlY1: 0.8, controlX2: 0.05, controlY2: 0.666 },
        { command: "C", x: 0.35, y: 0.2, controlX1: 0.05, controlY1: 0.334, controlX2: 0.184, controlY2: 0.2 },
        { command: "Z" },
      ],
    })

    expect(getShapeRenderDescriptor("speech-oval")).toEqual({
      kind: "path",
      commands: [
        { command: "M", x: 0.5, y: 0.08 },
        { command: "C", x: 0.95, y: 0.4, controlX1: 0.749, controlY1: 0.08, controlX2: 0.95, controlY2: 0.223 },
        { command: "C", x: 0.5, y: 0.72, controlX1: 0.95, controlY1: 0.577, controlX2: 0.749, controlY2: 0.72 },
        { command: "L", x: 0.4, y: 0.94 },
        { command: "L", x: 0.4, y: 0.7 },
        { command: "C", x: 0.05, y: 0.4, controlX1: 0.251, controlY1: 0.72, controlX2: 0.05, controlY2: 0.577 },
        { command: "C", x: 0.5, y: 0.08, controlX1: 0.05, controlY1: 0.223, controlX2: 0.251, controlY2: 0.08 },
        { command: "Z" },
      ],
    })

    expect(getShapeRenderDescriptor("basic-rounded-rectangle")).toEqual({
      kind: "path",
      commands: [
        { command: "M", x: 0.18, y: 0.05 },
        { command: "L", x: 0.82, y: 0.05 },
        { command: "C", x: 0.95, y: 0.18, controlX1: 0.892, controlY1: 0.05, controlX2: 0.95, controlY2: 0.108 },
        { command: "L", x: 0.95, y: 0.82 },
        { command: "C", x: 0.82, y: 0.95, controlX1: 0.95, controlY1: 0.892, controlX2: 0.892, controlY2: 0.95 },
        { command: "L", x: 0.18, y: 0.95 },
        { command: "C", x: 0.05, y: 0.82, controlX1: 0.108, controlY1: 0.95, controlX2: 0.05, controlY2: 0.892 },
        { command: "L", x: 0.05, y: 0.18 },
        { command: "C", x: 0.18, y: 0.05, controlX1: 0.05, controlY1: 0.108, controlX2: 0.108, controlY2: 0.05 },
        { command: "Z" },
      ],
    })

    expect(getShapeRenderDescriptor("speech-rounded")).toEqual({
      kind: "path",
      commands: [
        { command: "M", x: 0.18, y: 0.08 },
        { command: "L", x: 0.82, y: 0.08 },
        { command: "C", x: 0.95, y: 0.21, controlX1: 0.892, controlY1: 0.08, controlX2: 0.95, controlY2: 0.138 },
        { command: "L", x: 0.95, y: 0.61 },
        { command: "C", x: 0.95, y: 0.74, controlX1: 0.95, controlY1: 0.682, controlX2: 0.892, controlY2: 0.74 },
        { command: "L", x: 0.55, y: 0.74 },
        { command: "L", x: 0.45, y: 0.94 },
        { command: "L", x: 0.35, y: 0.74 },
        { command: "L", x: 0.18, y: 0.74 },
        { command: "C", x: 0.05, y: 0.61, controlX1: 0.108, controlY1: 0.74, controlX2: 0.05, controlY2: 0.682 },
        { command: "L", x: 0.05, y: 0.21 },
        { command: "C", x: 0.18, y: 0.08, controlX1: 0.05, controlY1: 0.138, controlX2: 0.108, controlY2: 0.08 },
        { command: "Z" },
      ],
    })
  })

  it("uses a visible canonical content fill for every preset", () => {
    expect(SHAPE_OPTIONS.every((item) => item.fill === "#5C6A72")).toBe(true)
    expect(SHAPE_OPTIONS.every((item) => item.fill !== "transparent")).toBe(true)
  })
})

describe("shape search, recents, and drag payloads", () => {
  it("searches labels, category labels, and keywords without accents", () => {
    expect(searchShapes("líneas discontinua").map((item) => item.type)).toEqual(["line-dashed"])
    expect(searchShapes("diagrama flujo").every((item) => item.category === "flowchart")).toBe(true)
    expect(searchShapes("corazón").map((item) => item.type)).toEqual(expectedItemsByCategory.hearts)
    expect(searchShapes("nubes puffy").map((item) => item.type)).toEqual(["cloud-puffy"])
    expect(searchShapes("sin-coincidencia")).toEqual([])
  })

  it("orders recent shapes by recency, removes duplicates, and ignores unknown IDs", () => {
    expect(listRecentShapes(["basic-circle", "basic-circle", "unknown", "heart-classic", "line-solid"], 3).map((item) => item.type)).toEqual([
      "basic-circle",
      "heart-classic",
      "line-solid",
    ])
    expect(listRecentShapes(["basic-circle", "heart-classic"], 0)).toEqual([])
  })

  it("validates shape IDs and drag payloads at the untrusted boundary", () => {
    expect(isShapeType("basic-circle")).toBe(true)
    expect(isShapeType("circle")).toBe(false)
    expect(parseShapeDragPayload("basic-circle")).toBe("basic-circle")
    expect(parseShapeDragPayload("unknown")).toBeNull()
    expect(parseShapeDragPayload(null)).toBeNull()
    expect(SHAPE_DRAG_MIME).toBe("application/x-bacan-shape")
  })
})

describe("shape catalog item validator", () => {
  it("accepts a complete item and rejects unsafe runtime values", () => {
    const item = SHAPE_OPTIONS[0]
    const clone: ShapeCatalogItem = {
      ...item,
      keywords: [...item.keywords],
      size: { ...item.size },
    }

    expect(isShapeCatalogItem(clone)).toBe(true)
    expect(isShapeCatalogItem({ ...clone, size: { width: 0, height: 10 } })).toBe(false)
    expect(isShapeCatalogItem({ ...clone, aspectRatio: Number.NaN })).toBe(false)
    expect(isShapeCatalogItem({ ...clone, render: null })).toBe(false)
  })
})
