import { filterSearchItems, normalizeSearchText } from "./search"

export const SHAPE_DRAG_MIME = "application/x-bacan-shape"

export type ShapeCategoryId =
  | "recent"
  | "lines"
  | "basic"
  | "polygons"
  | "stars"
  | "arrows"
  | "flowchart"
  | "speech-bubbles"
  | "clouds"
  | "hearts"

export type ShapeType =
  | "line-solid"
  | "line-dashed"
  | "line-dotted"
  | "line-arrow"
  | "line-double-arrow"
  | "basic-square"
  | "basic-rounded-rectangle"
  | "basic-circle"
  | "basic-triangle"
  | "basic-inverted-triangle"
  | "polygon-pentagon"
  | "polygon-hexagon-pointy"
  | "polygon-hexagon-flat"
  | "polygon-octagon"
  | "polygon-decagon"
  | "star-four-point"
  | "star-five-point"
  | "star-six-point"
  | "star-eight-point"
  | "starburst"
  | "arrow-right"
  | "arrow-left"
  | "arrow-up"
  | "arrow-down"
  | "arrow-double"
  | "flowchart-preparation"
  | "flowchart-terminator"
  | "flowchart-process"
  | "flowchart-decision"
  | "flowchart-cylinder"
  | "flowchart-document"
  | "speech-rectangle"
  | "speech-oval"
  | "speech-cloud"
  | "speech-rounded"
  | "speech-tail"
  | "cloud-small"
  | "cloud-wide"
  | "cloud-puffy"
  | "cloud-rounded"
  | "cloud-silhouette"
  | "heart-classic"
  | "heart-rounded"
  | "heart-slim"
  | "heart-double"
  | "heart-burst"

export type ShapeSize = {
  width: number
  height: number
}

export type LineRenderDescriptor = {
  kind: "line"
  points: readonly [number, number, number, number]
  dashed: boolean
  dotted?: boolean
}

export type ArrowRenderDescriptor = {
  kind: "arrow"
  points: readonly [number, number, number, number]
  startPointer: boolean
  endPointer: boolean
  dashed?: boolean
}

export type PolygonRenderDescriptor = {
  kind: "polygon"
  sides: number
  rotation: number
}

export type StarRenderDescriptor = {
  kind: "star"
  points: number
  innerRadiusRatio: number
  rotation: number
}

export type PathMoveCommand = {
  command: "M"
  x: number
  y: number
}

export type PathLineCommand = {
  command: "L"
  x: number
  y: number
}

export type PathCubicCommand = {
  command: "C"
  x: number
  y: number
  controlX1: number
  controlY1: number
  controlX2: number
  controlY2: number
}

export type PathQuadraticCommand = {
  command: "Q"
  x: number
  y: number
  controlX: number
  controlY: number
}

export type PathCloseCommand = {
  command: "Z"
}

export type PathCommand =
  | PathMoveCommand
  | PathLineCommand
  | PathCubicCommand
  | PathQuadraticCommand
  | PathCloseCommand

export type PathRenderDescriptor = {
  kind: "path"
  commands: readonly PathCommand[]
}

export type ShapeRenderDescriptor =
  | LineRenderDescriptor
  | ArrowRenderDescriptor
  | PolygonRenderDescriptor
  | StarRenderDescriptor
  | PathRenderDescriptor

export type ShapeCatalogItem = {
  type: ShapeType
  category: Exclude<ShapeCategoryId, "recent">
  label: string
  keywords: readonly string[]
  fill: string
  size: ShapeSize
  aspectRatio: number
  preserveAspectRatio: boolean
  render: ShapeRenderDescriptor
}

export function createStarRenderPoints(
  descriptor: StarRenderDescriptor,
  size: ShapeSize,
): number[] {
  const pointCount = Math.max(2, descriptor.points)
  const centerX = size.width / 2
  const centerY = size.height / 2
  const outerRadius = Math.min(size.width, size.height) / 2

  return Array.from({ length: pointCount * 2 }, (_, index) => {
    const radius = index % 2 === 0 ? outerRadius : outerRadius * descriptor.innerRadiusRatio
    const angle = -Math.PI / 2 + descriptor.rotation + (index * Math.PI) / pointCount

    return [centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius]
  }).flat()
}

export type ShapeCategory = {
  id: ShapeCategoryId
  label: string
  itemTypes: readonly ShapeType[]
  isDynamic?: boolean
}

const CATEGORY_LABELS: Record<ShapeCategoryId, string> = {
  recent: "Usado recién",
  lines: "Líneas",
  basic: "Formas básicas",
  polygons: "Polígonos",
  stars: "Estrellas",
  arrows: "Flechas",
  flowchart: "Formas de diagrama de flujo",
  "speech-bubbles": "Globos de diálogo",
  clouds: "Nubes",
  hearts: "Corazones",
}

const LINE_POINTS = [0.05, 0.5, 0.95, 0.5] as const
const ARROW_POINTS = [0.08, 0.5, 0.92, 0.5] as const

function line(
  type: Extract<ShapeType, `line-${string}`>,
  label: string,
  keywords: readonly string[],
  render: LineRenderDescriptor | ArrowRenderDescriptor,
  size: ShapeSize = { width: 720, height: 120 },
): ShapeCatalogItem {
  return item(type, "lines", label, keywords, size, false, render, "#5C6A72")
}

function polygon(
  type: Extract<ShapeType, `polygon-${string}`>,
  label: string,
  keywords: readonly string[],
  sides: number,
  rotation = 0,
): ShapeCatalogItem {
  return item(type, "polygons", label, keywords, { width: 560, height: 560 }, true, {
    kind: "polygon",
    sides,
    rotation,
  }, "#5C6A72")
}

function star(
  type: Extract<ShapeType, `star-${string}`> | "starburst",
  label: string,
  keywords: readonly string[],
  points: number,
  innerRadiusRatio: number,
): ShapeCatalogItem {
  return item(type, "stars", label, keywords, { width: 560, height: 560 }, true, {
    kind: "star",
    points,
    innerRadiusRatio,
    rotation: 0,
  }, "#5C6A72")
}

function blockArrow(
  type: Extract<ShapeType, `arrow-${string}`> | "arrow-double",
  label: string,
  keywords: readonly string[],
  commands: readonly PathCommand[],
  size: ShapeSize = { width: 640, height: 480 },
): ShapeCatalogItem {
  return item(type, "arrows", label, keywords, size, false, { kind: "path", commands }, "#5C6A72")
}

function path(
  type: Exclude<ShapeType, `line-${string}` | `polygon-${string}` | `star-${string}` | `arrow-${string}` | "starburst" | "arrow-double">,
  category: Exclude<ShapeCategoryId, "recent">,
  label: string,
  keywords: readonly string[],
  size: ShapeSize,
  commands: readonly PathCommand[],
  preserveAspectRatio = true,
): ShapeCatalogItem {
  return item(type, category, label, keywords, size, preserveAspectRatio, { kind: "path", commands }, "#5C6A72")
}

function item(
  type: ShapeType,
  category: Exclude<ShapeCategoryId, "recent">,
  label: string,
  keywords: readonly string[],
  size: ShapeSize,
  preserveAspectRatio: boolean,
  render: ShapeRenderDescriptor,
  fill: string,
): ShapeCatalogItem {
  return {
    type,
    category,
    label,
    keywords,
    fill,
    size,
    aspectRatio: size.width / size.height,
    preserveAspectRatio,
    render,
  }
}

const BEZIER_KAPPA = 0.5522848
const CIRCLE_CONTROL_OFFSET = Number((0.46 * BEZIER_KAPPA).toFixed(3))
const CIRCLE_CONTROL_HIGH = Number((0.5 + CIRCLE_CONTROL_OFFSET).toFixed(3))
const CIRCLE_CONTROL_LOW = Number((0.5 - CIRCLE_CONTROL_OFFSET).toFixed(3))
const BASIC_SQUARE = [
  { command: "M", x: 0.05, y: 0.05 },
  { command: "L", x: 0.95, y: 0.05 },
  { command: "L", x: 0.95, y: 0.95 },
  { command: "L", x: 0.05, y: 0.95 },
  { command: "Z" },
] as const satisfies readonly PathCommand[]

const BASIC_ROUNDED_RECTANGLE = [
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
] as const satisfies readonly PathCommand[]

const BASIC_TRIANGLE = [
  { command: "M", x: 0.5, y: 0.04 },
  { command: "L", x: 0.96, y: 0.94 },
  { command: "L", x: 0.04, y: 0.94 },
  { command: "Z" },
] as const satisfies readonly PathCommand[]

const BASIC_CIRCLE = [
  { command: "M", x: 0.5, y: 0.04 },
  { command: "C", x: 0.96, y: 0.5, controlX1: CIRCLE_CONTROL_HIGH, controlY1: 0.04, controlX2: 0.96, controlY2: CIRCLE_CONTROL_LOW },
  { command: "C", x: 0.5, y: 0.96, controlX1: 0.96, controlY1: CIRCLE_CONTROL_HIGH, controlX2: CIRCLE_CONTROL_HIGH, controlY2: 0.96 },
  { command: "C", x: 0.04, y: 0.5, controlX1: CIRCLE_CONTROL_LOW, controlY1: 0.96, controlX2: 0.04, controlY2: CIRCLE_CONTROL_HIGH },
  { command: "C", x: 0.5, y: 0.04, controlX1: 0.04, controlY1: CIRCLE_CONTROL_LOW, controlX2: CIRCLE_CONTROL_LOW, controlY2: 0.04 },
  { command: "Z" },
] as const satisfies readonly PathCommand[]

const BASIC_INVERTED_TRIANGLE = [
  { command: "M", x: 0.04, y: 0.06 },
  { command: "L", x: 0.96, y: 0.06 },
  { command: "L", x: 0.5, y: 0.96 },
  { command: "Z" },
] as const satisfies readonly PathCommand[]

const BLOCK_ARROW_RIGHT = [
  { command: "M", x: 0.05, y: 0.34 },
  { command: "L", x: 0.62, y: 0.34 },
  { command: "L", x: 0.62, y: 0.12 },
  { command: "L", x: 0.95, y: 0.5 },
  { command: "L", x: 0.62, y: 0.88 },
  { command: "L", x: 0.62, y: 0.66 },
  { command: "L", x: 0.05, y: 0.66 },
  { command: "Z" },
] as const satisfies readonly PathCommand[]

const BLOCK_ARROW_LEFT = [
  { command: "M", x: 0.95, y: 0.34 },
  { command: "L", x: 0.38, y: 0.34 },
  { command: "L", x: 0.38, y: 0.12 },
  { command: "L", x: 0.05, y: 0.5 },
  { command: "L", x: 0.38, y: 0.88 },
  { command: "L", x: 0.38, y: 0.66 },
  { command: "L", x: 0.95, y: 0.66 },
  { command: "Z" },
] as const satisfies readonly PathCommand[]

const BLOCK_ARROW_UP = [
  { command: "M", x: 0.34, y: 0.95 },
  { command: "L", x: 0.34, y: 0.38 },
  { command: "L", x: 0.12, y: 0.38 },
  { command: "L", x: 0.5, y: 0.05 },
  { command: "L", x: 0.88, y: 0.38 },
  { command: "L", x: 0.66, y: 0.38 },
  { command: "L", x: 0.66, y: 0.95 },
  { command: "Z" },
] as const satisfies readonly PathCommand[]

const BLOCK_ARROW_DOWN = [
  { command: "M", x: 0.34, y: 0.05 },
  { command: "L", x: 0.34, y: 0.62 },
  { command: "L", x: 0.12, y: 0.62 },
  { command: "L", x: 0.5, y: 0.95 },
  { command: "L", x: 0.88, y: 0.62 },
  { command: "L", x: 0.66, y: 0.62 },
  { command: "L", x: 0.66, y: 0.05 },
  { command: "Z" },
] as const satisfies readonly PathCommand[]

const BLOCK_ARROW_DOUBLE = [
  { command: "M", x: 0.05, y: 0.5 },
  { command: "L", x: 0.28, y: 0.12 },
  { command: "L", x: 0.28, y: 0.32 },
  { command: "L", x: 0.72, y: 0.32 },
  { command: "L", x: 0.72, y: 0.12 },
  { command: "L", x: 0.95, y: 0.5 },
  { command: "L", x: 0.72, y: 0.88 },
  { command: "L", x: 0.72, y: 0.68 },
  { command: "L", x: 0.28, y: 0.68 },
  { command: "L", x: 0.28, y: 0.88 },
  { command: "Z" },
] as const satisfies readonly PathCommand[]

const FLOW_PREPARATION = [
  { command: "M", x: 0.2, y: 0.05 },
  { command: "L", x: 0.8, y: 0.05 },
  { command: "L", x: 0.95, y: 0.5 },
  { command: "L", x: 0.8, y: 0.95 },
  { command: "L", x: 0.2, y: 0.95 },
  { command: "L", x: 0.05, y: 0.5 },
  { command: "Z" },
] as const satisfies readonly PathCommand[]

const FLOW_TERMINATOR = [
  { command: "M", x: 0.35, y: 0.2 },
  { command: "L", x: 0.65, y: 0.2 },
  { command: "C", x: 0.95, y: 0.5, controlX1: 0.816, controlY1: 0.2, controlX2: 0.95, controlY2: 0.334 },
  { command: "C", x: 0.65, y: 0.8, controlX1: 0.95, controlY1: 0.666, controlX2: 0.816, controlY2: 0.8 },
  { command: "L", x: 0.35, y: 0.8 },
  { command: "C", x: 0.05, y: 0.5, controlX1: 0.184, controlY1: 0.8, controlX2: 0.05, controlY2: 0.666 },
  { command: "C", x: 0.35, y: 0.2, controlX1: 0.05, controlY1: 0.334, controlX2: 0.184, controlY2: 0.2 },
  { command: "Z" },
] as const satisfies readonly PathCommand[]

const FLOW_PROCESS = BASIC_SQUARE

const FLOW_DECISION = [
  { command: "M", x: 0.5, y: 0.04 },
  { command: "L", x: 0.96, y: 0.5 },
  { command: "L", x: 0.5, y: 0.96 },
  { command: "L", x: 0.04, y: 0.5 },
  { command: "Z" },
] as const satisfies readonly PathCommand[]

const FLOW_CYLINDER = [
  { command: "M", x: 0.08, y: 0.18 },
  { command: "C", x: 0.5, y: 0.04, controlX1: 0.12, controlY1: 0.04, controlX2: 0.88, controlY2: 0.04 },
  { command: "C", x: 0.92, y: 0.18, controlX1: 0.92, controlY1: 0.18, controlX2: 0.92, controlY2: 0.18 },
  { command: "L", x: 0.92, y: 0.82 },
  { command: "C", x: 0.5, y: 0.96, controlX1: 0.92, controlY1: 0.96, controlX2: 0.08, controlY2: 0.96 },
  { command: "L", x: 0.08, y: 0.18 },
  { command: "Z" },
] as const satisfies readonly PathCommand[]

const FLOW_DOCUMENT = [
  { command: "M", x: 0.05, y: 0.05 },
  { command: "L", x: 0.95, y: 0.05 },
  { command: "L", x: 0.95, y: 0.8 },
  { command: "C", x: 0.8, y: 0.94, controlX1: 0.88, controlY1: 0.86, controlX2: 0.84, controlY2: 0.94 },
  { command: "C", x: 0.65, y: 0.8, controlX1: 0.75, controlY1: 0.94, controlX2: 0.7, controlY2: 0.86 },
  { command: "C", x: 0.5, y: 0.94, controlX1: 0.6, controlY1: 0.86, controlX2: 0.55, controlY2: 0.94 },
  { command: "C", x: 0.35, y: 0.8, controlX1: 0.45, controlY1: 0.94, controlX2: 0.4, controlY2: 0.86 },
  { command: "C", x: 0.2, y: 0.94, controlX1: 0.3, controlY1: 0.86, controlX2: 0.25, controlY2: 0.94 },
  { command: "L", x: 0.05, y: 0.8 },
  { command: "Z" },
] as const satisfies readonly PathCommand[]

const SPEECH_RECTANGLE = [
  ...BASIC_SQUARE.slice(0, 4),
  { command: "L", x: 0.42, y: 0.95 },
  { command: "L", x: 0.42, y: 0.82 },
  { command: "L", x: 0.05, y: 0.82 },
  { command: "Z" },
] as const satisfies readonly PathCommand[]

const SPEECH_OVAL = [
  { command: "M", x: 0.5, y: 0.08 },
  { command: "C", x: 0.95, y: 0.4, controlX1: 0.749, controlY1: 0.08, controlX2: 0.95, controlY2: 0.223 },
  { command: "C", x: 0.5, y: 0.72, controlX1: 0.95, controlY1: 0.577, controlX2: 0.749, controlY2: 0.72 },
  { command: "L", x: 0.4, y: 0.94 },
  { command: "L", x: 0.4, y: 0.7 },
  { command: "C", x: 0.05, y: 0.4, controlX1: 0.251, controlY1: 0.72, controlX2: 0.05, controlY2: 0.577 },
  { command: "C", x: 0.5, y: 0.08, controlX1: 0.05, controlY1: 0.223, controlX2: 0.251, controlY2: 0.08 },
  { command: "Z" },
] as const satisfies readonly PathCommand[]

const SPEECH_CLOUD = [
  { command: "M", x: 0.2, y: 0.7 },
  { command: "C", x: 0.05, y: 0.55, controlX1: 0.05, controlY1: 0.7, controlX2: 0.05, controlY2: 0.4 },
  { command: "C", x: 0.2, y: 0.25, controlX1: 0.05, controlY1: 0.3, controlX2: 0.12, controlY2: 0.15 },
  { command: "C", x: 0.4, y: 0.2, controlX1: 0.3, controlY1: 0.08, controlX2: 0.5, controlY2: 0.08 },
  { command: "C", x: 0.55, y: 0.28, controlX1: 0.58, controlY1: 0.1, controlX2: 0.78, controlY2: 0.12 },
  { command: "C", x: 0.85, y: 0.38, controlX1: 0.9, controlY1: 0.2, controlX2: 0.98, controlY2: 0.42 },
  { command: "C", x: 0.9, y: 0.7, controlX1: 0.98, controlY1: 0.62, controlX2: 0.82, controlY2: 0.78 },
  { command: "L", x: 0.65, y: 0.78 },
  { command: "L", x: 0.55, y: 0.96 },
  { command: "L", x: 0.42, y: 0.78 },
  { command: "Z" },
] as const satisfies readonly PathCommand[]

const SPEECH_ROUNDED = [
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
] as const satisfies readonly PathCommand[]

const SPEECH_TAIL = [
  { command: "M", x: 0.08, y: 0.08 },
  { command: "L", x: 0.92, y: 0.08 },
  { command: "L", x: 0.92, y: 0.75 },
  { command: "L", x: 0.62, y: 0.75 },
  { command: "L", x: 0.5, y: 0.95 },
  { command: "L", x: 0.38, y: 0.75 },
  { command: "L", x: 0.08, y: 0.75 },
  { command: "Z" },
] as const satisfies readonly PathCommand[]

const CLOUD_SMALL = [
  { command: "M", x: 0.2, y: 0.7 },
  { command: "C", x: 0.05, y: 0.7, controlX1: 0.05, controlY1: 0.48, controlX2: 0.14, controlY2: 0.42 },
  { command: "C", x: 0.18, y: 0.18, controlX1: 0.2, controlY1: 0.35, controlX2: 0.32, controlY2: 0.15 },
  { command: "C", x: 0.5, y: 0.3, controlX1: 0.42, controlY1: 0.12, controlX2: 0.62, controlY2: 0.12 },
  { command: "C", x: 0.7, y: 0.18, controlX1: 0.68, controlY1: 0.34, controlX2: 0.82, controlY2: 0.35 },
  { command: "C", x: 0.95, y: 0.45, controlX1: 0.88, controlY1: 0.2, controlX2: 0.95, controlY2: 0.48 },
  { command: "C", x: 0.95, y: 0.7, controlX1: 0.95, controlY1: 0.68, controlX2: 0.85, controlY2: 0.7 },
  { command: "Z" },
] as const satisfies readonly PathCommand[]

const CLOUD_WIDE = [
  { command: "M", x: 0.08, y: 0.72 },
  { command: "C", x: 0.02, y: 0.62, controlX1: 0.02, controlY1: 0.72, controlX2: 0.02, controlY2: 0.42 },
  { command: "C", x: 0.2, y: 0.35, controlX1: 0.04, controlY1: 0.35, controlX2: 0.12, controlY2: 0.15 },
  { command: "C", x: 0.4, y: 0.32, controlX1: 0.3, controlY1: 0.16, controlX2: 0.5, controlY2: 0.16 },
  { command: "C", x: 0.58, y: 0.4, controlX1: 0.6, controlY1: 0.18, controlX2: 0.82, controlY2: 0.2 },
  { command: "C", x: 0.78, y: 0.55, controlX1: 0.95, controlY1: 0.35, controlX2: 0.98, controlY2: 0.58 },
  { command: "C", x: 0.95, y: 0.72, controlX1: 0.95, controlY1: 0.7, controlX2: 0.9, controlY2: 0.72 },
  { command: "Z" },
] as const satisfies readonly PathCommand[]

const CLOUD_PUFFY = [
  { command: "M", x: 0.1, y: 0.7 },
  { command: "C", x: 0.02, y: 0.52, controlX1: 0.02, controlY1: 0.68, controlX2: 0.02, controlY2: 0.48 },
  { command: "C", x: 0.15, y: 0.36, controlX1: 0.02, controlY1: 0.38, controlX2: 0.08, controlY2: 0.22 },
  { command: "C", x: 0.3, y: 0.28, controlX1: 0.22, controlY1: 0.12, controlX2: 0.38, controlY2: 0.12 },
  { command: "C", x: 0.44, y: 0.36, controlX1: 0.46, controlY1: 0.18, controlX2: 0.62, controlY2: 0.18 },
  { command: "C", x: 0.58, y: 0.28, controlX1: 0.62, controlY1: 0.1, controlX2: 0.78, controlY2: 0.16 },
  { command: "C", x: 0.94, y: 0.4, controlX1: 0.9, controlY1: 0.18, controlX2: 0.98, controlY2: 0.42 },
  { command: "C", x: 0.96, y: 0.7, controlX1: 0.98, controlY1: 0.62, controlX2: 0.88, controlY2: 0.72 },
  { command: "Z" },
] as const satisfies readonly PathCommand[]

const CLOUD_ROUNDED = [
  { command: "M", x: 0.08, y: 0.78 },
  { command: "C", x: 0.03, y: 0.55, controlX1: 0.03, controlY1: 0.78, controlX2: 0.03, controlY2: 0.45 },
  { command: "C", x: 0.15, y: 0.35, controlX1: 0.04, controlY1: 0.36, controlX2: 0.08, controlY2: 0.22 },
  { command: "C", x: 0.3, y: 0.3, controlX1: 0.22, controlY1: 0.15, controlX2: 0.4, controlY2: 0.15 },
  { command: "C", x: 0.48, y: 0.36, controlX1: 0.48, controlY1: 0.18, controlX2: 0.64, controlY2: 0.18 },
  { command: "C", x: 0.82, y: 0.35, controlX1: 0.72, controlY1: 0.18, controlX2: 0.88, controlY2: 0.24 },
  { command: "C", x: 0.97, y: 0.5, controlX1: 0.98, controlY1: 0.38, controlX2: 0.98, controlY2: 0.62 },
  { command: "C", x: 0.95, y: 0.78, controlX1: 0.98, controlY1: 0.72, controlX2: 0.85, controlY2: 0.78 },
  { command: "Z" },
] as const satisfies readonly PathCommand[]

const CLOUD_SILHOUETTE = [
  { command: "M", x: 0.07, y: 0.76 },
  { command: "C", x: 0.02, y: 0.64, controlX1: 0.02, controlY1: 0.76, controlX2: 0.02, controlY2: 0.5 },
  { command: "C", x: 0.14, y: 0.4, controlX1: 0.04, controlY1: 0.4, controlX2: 0.08, controlY2: 0.26 },
  { command: "C", x: 0.29, y: 0.29, controlX1: 0.2, controlY1: 0.1, controlX2: 0.4, controlY2: 0.1 },
  { command: "C", x: 0.47, y: 0.38, controlX1: 0.48, controlY1: 0.18, controlX2: 0.64, controlY2: 0.18 },
  { command: "C", x: 0.64, y: 0.28, controlX1: 0.68, controlY1: 0.1, controlX2: 0.84, controlY2: 0.16 },
  { command: "C", x: 0.96, y: 0.3, controlX1: 0.9, controlY1: 0.18, controlX2: 0.98, controlY2: 0.34 },
  { command: "L", x: 0.92, y: 0.76 },
  { command: "Z" },
] as const satisfies readonly PathCommand[]

const HEART_CLASSIC = [
  { command: "M", x: 0.5, y: 0.92 },
  { command: "L", x: 0.08, y: 0.5 },
  { command: "C", x: 0.08, y: 0.12, controlX1: 0.08, controlY1: 0.3, controlX2: 0.25, controlY2: 0.05 },
  { command: "C", x: 0.5, y: 0.28, controlX1: 0.34, controlY1: 0.05, controlX2: 0.42, controlY2: 0.18 },
  { command: "C", x: 0.75, y: 0.05, controlX1: 0.58, controlY1: 0.18, controlX2: 0.92, controlY2: 0.05 },
  { command: "C", x: 0.92, y: 0.5, controlX1: 0.92, controlY1: 0.14, controlX2: 0.92, controlY2: 0.3 },
  { command: "Z" },
] as const satisfies readonly PathCommand[]

const HEART_ROUNDED = [
  { command: "M", x: 0.5, y: 0.92 },
  { command: "C", x: 0.12, y: 0.58, controlX1: 0.15, controlY1: 0.82, controlX2: 0.06, controlY2: 0.68 },
  { command: "C", x: 0.16, y: 0.18, controlX1: 0.04, controlY1: 0.52, controlX2: 0.14, controlY2: 0.12 },
  { command: "C", x: 0.4, y: 0.18, controlX1: 0.25, controlY1: 0.02, controlX2: 0.4, controlY2: 0.08 },
  { command: "C", x: 0.5, y: 0.3, controlX1: 0.44, controlY1: 0.18, controlX2: 0.46, controlY2: 0.24 },
  { command: "C", x: 0.6, y: 0.18, controlX1: 0.54, controlY1: 0.24, controlX2: 0.56, controlY2: 0.18 },
  { command: "C", x: 0.84, y: 0.18, controlX1: 0.6, controlY1: 0.08, controlX2: 0.75, controlY2: 0.02 },
  { command: "C", x: 0.94, y: 0.58, controlX1: 0.86, controlY1: 0.12, controlX2: 0.96, controlY2: 0.52 },
  { command: "Z" },
] as const satisfies readonly PathCommand[]
const HEART_SLIM = [
  { command: "M", x: 0.5, y: 0.95 },
  { command: "L", x: 0.2, y: 0.58 },
  { command: "C", x: 0.1, y: 0.2, controlX1: 0.12, controlY1: 0.42, controlX2: 0.2, controlY2: 0.08 },
  { command: "C", x: 0.5, y: 0.3, controlX1: 0.32, controlY1: 0.08, controlX2: 0.4, controlY2: 0.2 },
  { command: "C", x: 0.8, y: 0.08, controlX1: 0.6, controlY1: 0.2, controlX2: 0.88, controlY2: 0.42 },
  { command: "Z" },
] as const satisfies readonly PathCommand[]
const HEART_DOUBLE = [
  { command: "M", x: 0.5, y: 0.94 },
  { command: "L", x: 0.04, y: 0.46 },
  { command: "C", x: 0.04, y: 0.1, controlX1: 0.08, controlY1: 0.3, controlX2: 0.26, controlY2: 0.04 },
  { command: "C", x: 0.5, y: 0.25, controlX1: 0.34, controlY1: 0.06, controlX2: 0.42, controlY2: 0.16 },
  { command: "C", x: 0.74, y: 0.04, controlX1: 0.58, controlY1: 0.16, controlX2: 0.92, controlY2: 0.04 },
  { command: "C", x: 0.96, y: 0.46, controlX1: 0.94, controlY1: 0.08, controlX2: 0.96, controlY2: 0.3 },
  { command: "Z" },
] as const satisfies readonly PathCommand[]
const HEART_BURST = [
  { command: "M", x: 0.5, y: 0.95 },
  { command: "L", x: 0.4, y: 0.67 },
  { command: "L", x: 0.1, y: 0.75 },
  { command: "L", x: 0.25, y: 0.48 },
  { command: "L", x: 0.03, y: 0.25 },
  { command: "L", x: 0.37, y: 0.3 },
  { command: "L", x: 0.5, y: 0.05 },
  { command: "L", x: 0.63, y: 0.3 },
  { command: "L", x: 0.97, y: 0.25 },
  { command: "L", x: 0.75, y: 0.48 },
  { command: "L", x: 0.9, y: 0.75 },
  { command: "L", x: 0.6, y: 0.67 },
  { command: "Z" },
] as const satisfies readonly PathCommand[]

export const SHAPE_OPTIONS: readonly ShapeCatalogItem[] = [
  line("line-solid", "Línea sólida", ["linea", "recta", "solida"], {
    kind: "line",
    points: LINE_POINTS,
    dashed: false,
  }),
  line("line-dashed", "Línea segmentada", ["linea", "segmentada", "discontinua", "guion"], {
    kind: "line",
    points: LINE_POINTS,
    dashed: true,
  }),
  line("line-dotted", "Línea punteada", ["linea", "punteada", "puntos"], {
    kind: "line",
    points: LINE_POINTS,
    dashed: true,
    dotted: true,
  }),
  line("line-arrow", "Flecha final", ["linea", "flecha", "direccion"], {
    kind: "arrow",
    points: ARROW_POINTS,
    startPointer: false,
    endPointer: true,
  }),
  line("line-double-arrow", "Flecha doble", ["linea", "flecha", "doble", "bidireccional"], {
    kind: "arrow",
    points: ARROW_POINTS,
    startPointer: true,
    endPointer: true,
  }),
  item("basic-square", "basic", "Cuadrado", ["cuadrado", "rectangulo", "forma basica"], { width: 560, height: 560 }, true, { kind: "path", commands: BASIC_SQUARE }, "#5C6A72"),
  path("basic-rounded-rectangle", "basic", "Rectángulo redondeado", ["rectangulo", "redondeado", "forma basica"], { width: 640, height: 480 }, BASIC_ROUNDED_RECTANGLE, false),
  path("basic-circle", "basic", "Círculo", ["circulo", "redondo", "forma basica"], { width: 560, height: 560 }, BASIC_CIRCLE, true),
  path("basic-triangle", "basic", "Triángulo", ["triangulo", "forma basica"], { width: 560, height: 560 }, BASIC_TRIANGLE, true),
  path("basic-inverted-triangle", "basic", "Triángulo invertido", ["triangulo", "invertido", "forma basica"], { width: 560, height: 560 }, BASIC_INVERTED_TRIANGLE, true),
  polygon("polygon-pentagon", "Pentágono", ["poligono", "pentagono"], 5),
  polygon("polygon-hexagon-pointy", "Hexágono vertical", ["poligono", "hexagono", "vertical", "puntiagudo"], 6),
  polygon("polygon-hexagon-flat", "Hexágono horizontal", ["poligono", "hexagono", "horizontal", "plano"], 6, Math.PI / 6),
  polygon("polygon-octagon", "Octágono", ["poligono", "octagono"], 8),
  polygon("polygon-decagon", "Decágono", ["poligono", "decagono", "diez lados"], 10),
  star("star-four-point", "Estrella de cuatro puntas", ["estrella", "cuatro puntas"], 4, 0.42),
  star("star-five-point", "Estrella de cinco puntas", ["estrella", "cinco puntas"], 5, 0.42),
  star("star-six-point", "Estrella de seis puntas", ["estrella", "seis puntas"], 6, 0.42),
  star("star-eight-point", "Estrella de ocho puntas", ["estrella", "ocho puntas"], 8, 0.42),
  star("starburst", "Estallido", ["estrella", "rayos", "explosion", "burst"], 12, 0.7),
  blockArrow("arrow-right", "Flecha derecha", ["flecha", "derecha", "bloque"], BLOCK_ARROW_RIGHT),
  blockArrow("arrow-left", "Flecha izquierda", ["flecha", "izquierda", "bloque"], BLOCK_ARROW_LEFT),
  blockArrow("arrow-up", "Flecha arriba", ["flecha", "arriba", "bloque"], BLOCK_ARROW_UP),
  blockArrow("arrow-down", "Flecha abajo", ["flecha", "abajo", "bloque"], BLOCK_ARROW_DOWN),
  blockArrow("arrow-double", "Flecha doble", ["flecha", "doble", "dos puntas", "bloque"], BLOCK_ARROW_DOUBLE),
  path("flowchart-preparation", "flowchart", "Preparación", ["flujo", "diagrama", "preparacion", "hexagono"], { width: 640, height: 420 }, FLOW_PREPARATION, false),
  path("flowchart-terminator", "flowchart", "Terminador", ["flujo", "diagrama", "inicio", "fin", "capsula"], { width: 640, height: 360 }, FLOW_TERMINATOR, false),
  path("flowchart-process", "flowchart", "Proceso", ["flujo", "diagrama", "proceso", "rectangulo"], { width: 640, height: 480 }, FLOW_PROCESS, false),
  path("flowchart-decision", "flowchart", "Decisión", ["flujo", "diagrama", "decision", "rombo"], { width: 560, height: 560 }, FLOW_DECISION, true),
  path("flowchart-cylinder", "flowchart", "Base de datos", ["flujo", "diagrama", "base de datos", "cilindro"], { width: 560, height: 560 }, FLOW_CYLINDER, false),
  path("flowchart-document", "flowchart", "Documento", ["flujo", "diagrama", "documento"], { width: 560, height: 560 }, FLOW_DOCUMENT, false),
  path("speech-rectangle", "speech-bubbles", "Globo rectangular", ["globo", "dialogo", "rectangulo", "comentario"], { width: 640, height: 520 }, SPEECH_RECTANGLE, false),
  path("speech-oval", "speech-bubbles", "Globo ovalado", ["globo", "dialogo", "ovalo", "burbuja"], { width: 640, height: 520 }, SPEECH_OVAL, false),
  path("speech-cloud", "speech-bubbles", "Globo de nube", ["globo", "dialogo", "nube", "comentario"], { width: 640, height: 520 }, SPEECH_CLOUD, false),
  path("speech-rounded", "speech-bubbles", "Globo redondeado", ["globo", "dialogo", "redondeado"], { width: 640, height: 520 }, SPEECH_ROUNDED, false),
  path("speech-tail", "speech-bubbles", "Globo con cola", ["globo", "dialogo", "cola", "bocadillo"], { width: 640, height: 520 }, SPEECH_TAIL, false),
  path("cloud-small", "clouds", "Nube pequeña", ["nube", "nubes", "pequena", "clima"], { width: 560, height: 420 }, CLOUD_SMALL, false),
  path("cloud-wide", "clouds", "Nube alargada", ["nube", "nubes", "ancha", "clima"], { width: 720, height: 360 }, CLOUD_WIDE, false),
  path("cloud-puffy", "clouds", "Nube esponjosa", ["nube", "nubes", "puffy", "esponjosa", "clima"], { width: 640, height: 440 }, CLOUD_PUFFY, false),
  path("cloud-rounded", "clouds", "Nube redondeada", ["nube", "nubes", "redondeada"], { width: 640, height: 440 }, CLOUD_ROUNDED, false),
  path("cloud-silhouette", "clouds", "Silueta de nube", ["nube", "nubes", "silueta"], { width: 640, height: 440 }, CLOUD_SILHOUETTE, false),
  path("heart-classic", "hearts", "Corazón clásico", ["corazon", "corazón", "corazones", "amor"], { width: 560, height: 560 }, HEART_CLASSIC, true),
  path("heart-rounded", "hearts", "Corazón redondeado", ["corazon", "corazón", "corazones", "redondeado"], { width: 560, height: 560 }, HEART_ROUNDED, true),
  path("heart-slim", "hearts", "Corazón estilizado", ["corazon", "corazón", "corazones", "delgado"], { width: 560, height: 560 }, HEART_SLIM, true),
  path("heart-double", "hearts", "Corazón doble", ["corazon", "corazón", "corazones", "doble"], { width: 560, height: 560 }, HEART_DOUBLE, true),
  path("heart-burst", "hearts", "Corazón estallado", ["corazon", "corazón", "corazones", "estallado", "rayos"], { width: 560, height: 560 }, HEART_BURST, true),
]

export const SHAPE_CATEGORIES: readonly ShapeCategory[] = [
  { id: "recent", label: CATEGORY_LABELS.recent, itemTypes: [], isDynamic: true },
  { id: "lines", label: CATEGORY_LABELS.lines, itemTypes: ["line-solid", "line-dashed", "line-dotted", "line-arrow", "line-double-arrow"] },
  { id: "basic", label: CATEGORY_LABELS.basic, itemTypes: ["basic-square", "basic-rounded-rectangle", "basic-circle", "basic-triangle", "basic-inverted-triangle"] },
  { id: "polygons", label: CATEGORY_LABELS.polygons, itemTypes: ["polygon-pentagon", "polygon-hexagon-pointy", "polygon-hexagon-flat", "polygon-octagon", "polygon-decagon"] },
  { id: "stars", label: CATEGORY_LABELS.stars, itemTypes: ["star-four-point", "star-five-point", "star-six-point", "star-eight-point", "starburst"] },
  { id: "arrows", label: CATEGORY_LABELS.arrows, itemTypes: ["arrow-right", "arrow-left", "arrow-up", "arrow-down", "arrow-double"] },
  { id: "flowchart", label: CATEGORY_LABELS.flowchart, itemTypes: ["flowchart-preparation", "flowchart-terminator", "flowchart-process", "flowchart-decision", "flowchart-cylinder", "flowchart-document"] },
  { id: "speech-bubbles", label: CATEGORY_LABELS["speech-bubbles"], itemTypes: ["speech-rectangle", "speech-oval", "speech-cloud", "speech-rounded", "speech-tail"] },
  { id: "clouds", label: CATEGORY_LABELS.clouds, itemTypes: ["cloud-small", "cloud-wide", "cloud-puffy", "cloud-rounded", "cloud-silhouette"] },
  { id: "hearts", label: CATEGORY_LABELS.hearts, itemTypes: ["heart-classic", "heart-rounded", "heart-slim", "heart-double", "heart-burst"] },
]

const SHAPE_BY_TYPE = new Map<ShapeType, ShapeCatalogItem>(SHAPE_OPTIONS.map((item) => [item.type, item]))
const CATEGORY_BY_ID = new Map<ShapeCategoryId, ShapeCategory>(SHAPE_CATEGORIES.map((category) => [category.id, category]))

export function isShapeType(value: unknown): value is ShapeType {
  return typeof value === "string" && SHAPE_BY_TYPE.has(value as ShapeType)
}

export function getShapeOption(type: ShapeType): ShapeCatalogItem {
  const option = SHAPE_BY_TYPE.get(type)

  if (!option) {
    throw new Error(`Unknown shape type: ${type}`)
  }

  return option
}

export function getShapeRenderDescriptor(type: ShapeType): ShapeRenderDescriptor {
  return getShapeOption(type).render
}

export function getShapeDefaultSize(
  type: ShapeType,
  bounds: ShapeSize,
): ShapeSize {
  const option = getShapeOption(type)
  const availableWidth = Math.max(1, bounds.width)
  const availableHeight = Math.max(1, bounds.height)

  if (!option.preserveAspectRatio) {
    return {
      width: Math.min(option.size.width, availableWidth),
      height: Math.min(option.size.height, availableHeight),
    }
  }

  const scale = Math.min(availableWidth / option.size.width, availableHeight / option.size.height)

  return {
    width: Math.max(1, Math.round(option.size.width * scale)),
    height: Math.max(1, Math.round(option.size.height * scale)),
  }
}

export function searchShapes(query: string, items: readonly ShapeCatalogItem[] = SHAPE_OPTIONS): ShapeCatalogItem[] {
  return filterSearchItems(items, query, [
    "label",
    (item) => item.keywords.join(" "),
    (item) => CATEGORY_BY_ID.get(item.category)?.label ?? "",
  ])
}

export function listRecentShapes(
  recentTypes: readonly unknown[],
  limit = 5,
  items: readonly ShapeCatalogItem[] = SHAPE_OPTIONS,
): ShapeCatalogItem[] {
  if (limit <= 0) {
    return []
  }

  const byType = new Map(items.map((item) => [item.type, item]))
  const seen = new Set<ShapeType>()
  const recent: ShapeCatalogItem[] = []

  for (const value of recentTypes) {
    if (!isShapeType(value) || seen.has(value) || !byType.has(value)) {
      continue
    }

    seen.add(value)
    recent.push(byType.get(value) as ShapeCatalogItem)

    if (recent.length >= limit) {
      break
    }
  }

  return recent
}

export function parseShapeDragPayload(payload: unknown): ShapeType | null {
  if (typeof payload !== "string") {
    return null
  }

  const normalized = normalizeSearchText(payload)

  return isShapeType(normalized) ? normalized : null
}

export function isShapeCatalogItem(value: unknown): value is ShapeCatalogItem {
  if (!isRecord(value)) {
    return false
  }

  if (!isShapeType(value.type) || !isCategoryId(value.category)) {
    return false
  }

  if (typeof value.label !== "string" || value.label.trim().length === 0 || !Array.isArray(value.keywords)) {
    return false
  }

  if (!value.keywords.every((keyword) => typeof keyword === "string" && keyword.trim().length > 0)) {
    return false
  }

  if (!isShapeSize(value.size) || typeof value.aspectRatio !== "number" || !Number.isFinite(value.aspectRatio)) {
    return false
  }

  return typeof value.preserveAspectRatio === "boolean" && isShapeRenderDescriptor(value.render)
}

export type ShapeCatalogValidation = {
  valid: boolean
  errors: string[]
}

export function validateShapeCatalog(items: readonly ShapeCatalogItem[] = SHAPE_OPTIONS): ShapeCatalogValidation {
  const errors: string[] = []
  const seen = new Set<string>()

  for (const item of items) {
    if (!isShapeCatalogItem(item)) {
      errors.push("invalid item")
      continue
    }

    if (seen.has(item.type)) {
      errors.push(`duplicate type: ${item.type}`)
    }
    seen.add(item.type)

    const category = CATEGORY_BY_ID.get(item.category)
    if (!category?.itemTypes.includes(item.type)) {
      errors.push(`category mismatch: ${item.type}`)
    }
  }

  for (const category of SHAPE_CATEGORIES.slice(1)) {
    for (const type of category.itemTypes) {
      if (!seen.has(type)) {
        errors.push(`missing type: ${type}`)
      }
    }
  }

  return { valid: errors.length === 0, errors }
}

function isCategoryId(value: unknown): value is Exclude<ShapeCategoryId, "recent"> {
  return typeof value === "string" && value !== "recent" && CATEGORY_BY_ID.has(value as ShapeCategoryId)
}

function isShapeSize(value: unknown): value is ShapeSize {
  return isRecord(value)
    && typeof value.width === "number"
    && Number.isFinite(value.width)
    && value.width > 0
    && typeof value.height === "number"
    && Number.isFinite(value.height)
    && value.height > 0
}

function isShapeRenderDescriptor(value: unknown): value is ShapeRenderDescriptor {
  if (!isRecord(value) || typeof value.kind !== "string") {
    return false
  }

  if (value.kind === "line" || value.kind === "arrow") {
    return Array.isArray(value.points)
      && value.points.length === 4
      && value.points.every((point) => typeof point === "number" && Number.isFinite(point))
  }

  if (value.kind === "polygon") {
    return typeof value.sides === "number" && Number.isInteger(value.sides) && value.sides >= 3
      && typeof value.rotation === "number" && Number.isFinite(value.rotation)
  }

  if (value.kind === "star") {
    return typeof value.points === "number" && Number.isInteger(value.points) && value.points >= 3
      && typeof value.innerRadiusRatio === "number" && value.innerRadiusRatio > 0 && value.innerRadiusRatio < 1
      && typeof value.rotation === "number" && Number.isFinite(value.rotation)
  }

  if (value.kind === "path") {
    return Array.isArray(value.commands)
      && value.commands.length > 2
      && value.commands.at(-1)?.command === "Z"
      && value.commands.every(isPathCommand)
  }

  return false
}

function isPathCommand(value: unknown): value is PathCommand {
  if (!isRecord(value) || typeof value.command !== "string") {
    return false
  }

  if (value.command === "Z") {
    return true
  }

  if (!isNormalizedCoordinate(value.x) || !isNormalizedCoordinate(value.y)) {
    return false
  }

  if (value.command === "M" || value.command === "L") {
    return true
  }

  if (value.command === "Q") {
    return isNormalizedCoordinate(value.controlX) && isNormalizedCoordinate(value.controlY)
  }

  if (value.command === "C") {
    return isNormalizedCoordinate(value.controlX1)
      && isNormalizedCoordinate(value.controlY1)
      && isNormalizedCoordinate(value.controlX2)
      && isNormalizedCoordinate(value.controlY2)
  }

  return false
}

function isNormalizedCoordinate(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
