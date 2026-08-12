import type { TextElement } from "./document"

export type InlineTextEditorLayout = {
  left: number
  top: number
  width: number
  height: number
  rotation: number
  fontFamily: string
  fontSize: number
  fontWeight: TextElement["fontWeight"]
  fontStyle: TextElement["fontStyle"]
  textDecoration: TextElement["textDecoration"]
  textAlign: TextElement["align"]
  lineHeight: number
  letterSpacing: number
  color: string
  opacity: number
}

export type InlineTextKeyboardAction = "commit" | "cancel"

export function getInlineTextEditorLayout(
  element: TextElement,
  canvasScale: number,
): InlineTextEditorLayout {
  return {
    left: element.x * canvasScale,
    top: element.y * canvasScale,
    width: element.width * canvasScale,
    height: element.height * canvasScale,
    rotation: element.rotation,
    fontFamily: element.fontFamily,
    fontSize: element.fontSize * canvasScale,
    fontWeight: element.fontWeight,
    fontStyle: element.fontStyle,
    textDecoration: element.textDecoration,
    textAlign: element.align,
    lineHeight: element.lineHeight,
    letterSpacing: element.letterSpacing * canvasScale,
    color: element.fill,
    opacity: element.opacity,
  }
}

export function getInlineTextKeyboardAction(event: {
  key: string
  metaKey: boolean
  ctrlKey: boolean
}): InlineTextKeyboardAction | null {
  if (event.key === "Escape") {
    return "cancel"
  }

  if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
    return "commit"
  }

  return null
}
