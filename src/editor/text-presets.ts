import { createTextElement, normalizeTextElement } from "./document"
import { filterSearchItems } from "./search"
import type { DocumentSize, IdFactory, TextElement } from "./document"

export const TEXT_PRESET_DRAG_MIME = "application/x-bacan-text-preset"

export type TextPresetSection = "basic" | "style" | "combination"

export type TextPresetStyle = Pick<TextElement, "fontFamily" | "fontSize" | "fill"> &
  Partial<Pick<TextElement, "align" | "fontWeight" | "fontStyle" | "textDecoration" | "lineHeight" | "letterSpacing">>

export type TextPresetElementDefinition = {
  text: string
  name: string
  x: number
  y: number
  width: number
  height: number
  style: TextPresetStyle
}

export type TextPreset = {
  id: string
  label: string
  section: TextPresetSection
  description: string
  keywords: readonly string[]
  elements: readonly TextPresetElementDefinition[]
}

const TEXT_STYLE_DEFAULTS: Pick<TextPresetStyle, "align" | "fontWeight" | "fontStyle" | "textDecoration" | "lineHeight" | "letterSpacing"> = {
  align: "center",
  fontWeight: "normal",
  fontStyle: "normal",
  textDecoration: "none",
  lineHeight: 1.08,
  letterSpacing: 0,
}

const titleElement: TextPresetElementDefinition = {
  text: "Tu idea empieza aquí",
  name: "Título",
  x: 102,
  y: 304,
  width: 996,
  height: 192,
  style: {
    ...TEXT_STYLE_DEFAULTS,
    fontFamily: "Bebas Neue",
    fontSize: 148,
    fill: "#111827",
    fontWeight: "bold",
    letterSpacing: 2,
  },
}

const subtitleElement: TextPresetElementDefinition = {
  text: "Haz que tu mensaje destaque",
  name: "Subtítulo",
  x: 150,
  y: 327,
  width: 900,
  height: 146,
  style: {
    ...TEXT_STYLE_DEFAULTS,
    fontFamily: "Oswald",
    fontSize: 72,
    fill: "#374151",
    letterSpacing: 1,
  },
}

const bodyElement: TextPresetElementDefinition = {
  text: "Agrega contexto, emoción y claridad a tu historia.",
  name: "Cuerpo",
  x: 130,
  y: 320,
  width: 940,
  height: 160,
  style: {
    ...TEXT_STYLE_DEFAULTS,
    fontFamily: "Geist Variable",
    fontSize: 42,
    fill: "#4b5563",
    align: "left",
    lineHeight: 1.3,
  },
}

export const TEXT_PRESETS = [
  {
    id: "title",
    label: "Título",
    section: "basic",
    description: "Un título principal para abrir tu composición.",
    keywords: ["titulo", "principal", "encabezado", "headline"],
    elements: [titleElement],
  },
  {
    id: "subtitle",
    label: "Subtítulo",
    section: "basic",
    description: "Una línea secundaria para acompañar el mensaje.",
    keywords: ["subtitulo", "bajada", "secundario", "descripcion"],
    elements: [subtitleElement],
  },
  {
    id: "body",
    label: "Cuerpo de texto",
    section: "basic",
    description: "Texto legible para explicar, contar o invitar.",
    keywords: ["cuerpo", "parrafo", "texto", "legible", "descripcion"],
    elements: [bodyElement],
  },
  {
    id: "impact",
    label: "Impacto",
    section: "style",
    description: "Una composición pesada y directa para mensajes fuertes.",
    keywords: ["impacto", "llamativo", "fuerte", "poster", "cartel"],
    elements: [
      {
        ...titleElement,
        text: "Hazlo inolvidable",
        name: "Impacto",
        style: {
          ...titleElement.style,
          fontFamily: "Bungee",
          fontSize: 112,
          fill: "#f59e0b",
          letterSpacing: 0,
        },
      },
    ],
  },
  {
    id: "outlined",
    label: "Contorno editorial",
    section: "style",
    description: "Una voz editorial condensada para titulares con carácter.",
    keywords: ["contorno", "editorial", "condensada", "moderno", "llamativo"],
    elements: [
      {
        ...titleElement,
        text: "Mira más allá",
        name: "Contorno editorial",
        style: {
          ...titleElement.style,
          fontFamily: "Oswald",
          fontSize: 132,
          fill: "#2563eb",
          letterSpacing: 5,
        },
      },
    ],
  },
  {
    id: "neon",
    label: "Neón",
    section: "style",
    description: "Un acento brillante para piezas nocturnas y audaces.",
    keywords: ["neon", "brillante", "noche", "audaz", "resplandor"],
    elements: [
      {
        ...titleElement,
        text: "Enciende la noche",
        name: "Neón",
        style: {
          ...titleElement.style,
          fontFamily: "Bebas Neue",
          fontSize: 142,
          fill: "#d946ef",
          letterSpacing: 4,
        },
      },
    ],
  },
  {
    id: "handwritten",
    label: "Manuscrita",
    section: "style",
    description: "Una firma cercana para mensajes personales y espontáneos.",
    keywords: ["manuscrita", "escrito a mano", "casual", "cercano", "firma"],
    elements: [
      {
        ...titleElement,
        text: "Hecho con cariño",
        name: "Manuscrita",
        style: {
          ...titleElement.style,
          fontFamily: "Caveat",
          fontSize: 134,
          fill: "#16a34a",
          fontWeight: "normal",
          letterSpacing: 1,
        },
      },
    ],
  },
  {
    id: "serif-display",
    label: "Serif de portada",
    section: "style",
    description: "Una portada elegante con contraste y presencia.",
    keywords: ["serif", "portada", "elegante", "clasico", "revista"],
    elements: [
      {
        ...titleElement,
        text: "Una nueva perspectiva",
        name: "Serif de portada",
        style: {
          ...titleElement.style,
          fontFamily: "DM Serif Display",
          fontSize: 108,
          fill: "#7c3aed",
          fontWeight: "normal",
          letterSpacing: 0,
        },
      },
    ],
  },
  {
    id: "editorial-pair",
    label: "Editorial en capas",
    section: "combination",
    description: "Título y bajada con ritmo de portada editorial.",
    keywords: ["combinacion", "editorial", "capas", "portada", "titulo y subtitulo"],
    elements: [
      {
        text: "Historias que dejan huella",
        name: "Título editorial",
        x: 102,
        y: 264,
        width: 996,
        height: 164,
        style: {
          ...TEXT_STYLE_DEFAULTS,
          fontFamily: "DM Serif Display",
          fontSize: 98,
          fill: "#111827",
          fontWeight: "normal",
        },
      },
      {
        text: "Ideas para mirar el mundo distinto",
        name: "Bajada editorial",
        x: 180,
        y: 472,
        width: 840,
        height: 64,
        style: {
          ...TEXT_STYLE_DEFAULTS,
          fontFamily: "Oswald",
          fontSize: 40,
          fill: "#6b7280",
          letterSpacing: 2,
        },
      },
    ],
  },
  {
    id: "contrast-duo",
    label: "Contraste moderno",
    section: "combination",
    description: "Una dupla condensada para titulares de alto contraste.",
    keywords: ["combinacion", "contraste", "moderno", "duo", "condensado"],
    elements: [
      {
        text: "MENOS RUIDO",
        name: "Titular de contraste",
        x: 100,
        y: 258,
        width: 1000,
        height: 170,
        style: {
          ...TEXT_STYLE_DEFAULTS,
          fontFamily: "Bebas Neue",
          fontSize: 146,
          fill: "#111827",
          fontWeight: "bold",
          letterSpacing: 3,
        },
      },
      {
        text: "Más intención",
        name: "Acento de contraste",
        x: 100,
        y: 458,
        width: 700,
        height: 84,
        style: {
          ...TEXT_STYLE_DEFAULTS,
          fontFamily: "Caveat",
          fontSize: 62,
          fill: "#ea580c",
          align: "left",
          fontWeight: "bold",
        },
      },
    ],
  },
  {
    id: "neon-stack",
    label: "Neón nocturno",
    section: "combination",
    description: "Una combinación vibrante para eventos, música y cultura.",
    keywords: ["combinacion", "neon", "nocturno", "musica", "evento", "vibrante"],
    elements: [
      {
        text: "VIVE",
        name: "Palabra neón",
        x: 210,
        y: 238,
        width: 780,
        height: 154,
        style: {
          ...TEXT_STYLE_DEFAULTS,
          fontFamily: "Bungee",
          fontSize: 142,
          fill: "#d946ef",
          fontWeight: "bold",
        },
      },
      {
        text: "SIN PAUSA",
        name: "Remate neón",
        x: 160,
        y: 410,
        width: 880,
        height: 154,
        style: {
          ...TEXT_STYLE_DEFAULTS,
          fontFamily: "Bebas Neue",
          fontSize: 132,
          fill: "#22d3ee",
          fontWeight: "bold",
          letterSpacing: 5,
        },
      },
    ],
  },
  {
    id: "playful-pair",
    label: "Juego tipográfico",
    section: "combination",
    description: "Un dúo expresivo para campañas alegres y cercanas.",
    keywords: ["combinacion", "juego", "divertido", "alegre", "cercano", "creativo"],
    elements: [
      {
        text: "Dale color",
        name: "Mensaje juguetón",
        x: 110,
        y: 252,
        width: 980,
        height: 176,
        style: {
          ...TEXT_STYLE_DEFAULTS,
          fontFamily: "Bungee",
          fontSize: 114,
          fill: "#f97316",
          fontWeight: "bold",
        },
      },
      {
        text: "a tus ideas",
        name: "Firma juguetona",
        x: 260,
        y: 448,
        width: 680,
        height: 104,
        style: {
          ...TEXT_STYLE_DEFAULTS,
          fontFamily: "Caveat",
          fontSize: 78,
          fill: "#16a34a",
          fontWeight: "bold",
        },
      },
    ],
  },
  {
    id: "event-trio",
    label: "Evento destacado",
    section: "combination",
    description: "Tres niveles para anunciar una fecha o lanzamiento.",
    keywords: ["combinacion", "evento", "fecha", "lanzamiento", "tres niveles", "creativo"],
    elements: [
      {
        text: "SÁBADO",
        name: "Día del evento",
        x: 140,
        y: 220,
        width: 920,
        height: 136,
        style: {
          ...TEXT_STYLE_DEFAULTS,
          fontFamily: "Oswald",
          fontSize: 98,
          fill: "#2563eb",
          fontWeight: "bold",
          letterSpacing: 8,
        },
      },
      {
        text: "12 OCT",
        name: "Fecha del evento",
        x: 160,
        y: 360,
        width: 880,
        height: 172,
        style: {
          ...TEXT_STYLE_DEFAULTS,
          fontFamily: "Bebas Neue",
          fontSize: 160,
          fill: "#111827",
          fontWeight: "bold",
          letterSpacing: 3,
        },
      },
      {
        text: "Reserva tu lugar",
        name: "Invitación del evento",
        x: 240,
        y: 548,
        width: 720,
        height: 64,
        style: {
          ...TEXT_STYLE_DEFAULTS,
          fontFamily: "Caveat",
          fontSize: 56,
          fill: "#ea580c",
        },
      },
    ],
  },
] as const satisfies readonly TextPreset[]

const REFERENCE_CANVAS_SIZE = {
  width: 1200,
  height: 800,
} as const
const MAX_CONTENT_WIDTH_RATIO = 0.83
const MAX_CONTENT_HEIGHT_RATIO = 0.82

export function getTextPreset(id: string): TextPreset | undefined {
  return TEXT_PRESETS.find((preset) => preset.id === id)
}

export function filterTextPresets(query: string): TextPreset[] {
  return filterSearchItems(TEXT_PRESETS, query, [
    "id",
    "label",
    "description",
    (preset) => preset.keywords.join(" "),
  ])
}

export function createTextPresetElements({
  presetId,
  createId,
  canvasSize,
  position,
}: {
  presetId: string
  createId: IdFactory
  canvasSize: DocumentSize
  position?: { x: number; y: number }
}): TextElement[] {
  const preset = getTextPreset(presetId)

  if (!preset || preset.elements.length === 0 || canvasSize.width <= 0 || canvasSize.height <= 0) {
    return []
  }

  const bounds = getPresetBounds(preset.elements)
  const baseScale = Math.min(
    canvasSize.width / REFERENCE_CANVAS_SIZE.width,
    canvasSize.height / REFERENCE_CANVAS_SIZE.height,
  )
  const contentScale = Math.min(
    (canvasSize.width * MAX_CONTENT_WIDTH_RATIO) / bounds.width,
    (canvasSize.height * MAX_CONTENT_HEIGHT_RATIO) / bounds.height,
  )
  const scale = Math.max(0.0001, Math.min(baseScale, contentScale))
  const scaledBounds = scaleBounds(bounds, scale)
  const requestedCenter = position ?? {
    x: canvasSize.width / 2,
    y: canvasSize.height / 2,
  }
  const center = {
    x: clamp(requestedCenter.x, scaledBounds.width / 2, canvasSize.width - scaledBounds.width / 2),
    y: clamp(requestedCenter.y, scaledBounds.height / 2, canvasSize.height - scaledBounds.height / 2),
  }
  const origin = {
    x: center.x - scaledBounds.centerX,
    y: center.y - scaledBounds.centerY,
  }
  const groupId = preset.section === "combination" ? createId() : undefined

  return preset.elements.map((definition) => {
    const width = Math.max(1, Math.round(definition.width * scale))
    const height = Math.max(1, Math.round(definition.height * scale))
    const element = createTextElement(createId, canvasSize)
    const style = {
      ...definition.style,
      fontSize: Math.max(1, Math.round(definition.style.fontSize * scale)),
    }

    return normalizeTextElement({
      ...element,
      ...style,
      name: definition.name,
      text: definition.text,
      x: clamp(Math.round(origin.x + definition.x * scale), 0, Math.max(0, Math.floor(canvasSize.width - width))),
      y: clamp(Math.round(origin.y + definition.y * scale), 0, Math.max(0, Math.floor(canvasSize.height - height))),
      width,
      height,
      ...(groupId ? { groupId } : {}),
    })
  })
}

type PresetBounds = {
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
  centerX: number
  centerY: number
}

function getPresetBounds(elements: readonly TextPresetElementDefinition[]): PresetBounds {
  const left = Math.min(...elements.map((element) => element.x))
  const top = Math.min(...elements.map((element) => element.y))
  const right = Math.max(...elements.map((element) => element.x + element.width))
  const bottom = Math.max(...elements.map((element) => element.y + element.height))

  return {
    left,
    top,
    right,
    bottom,
    width: right - left,
    height: bottom - top,
    centerX: (left + right) / 2,
    centerY: (top + bottom) / 2,
  }
}

function scaleBounds(bounds: PresetBounds, scale: number): PresetBounds {
  return {
    left: bounds.left * scale,
    top: bounds.top * scale,
    right: bounds.right * scale,
    bottom: bounds.bottom * scale,
    width: bounds.width * scale,
    height: bounds.height * scale,
    centerX: bounds.centerX * scale,
    centerY: bounds.centerY * scale,
  }
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum)
}
