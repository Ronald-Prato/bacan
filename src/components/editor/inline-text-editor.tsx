import { useLayoutEffect, useRef } from "react"

import { getInlineTextEditorLayout, getInlineTextKeyboardAction } from "@/editor/inline-text"
import type { TextElement } from "@/editor/document"

type InlineTextEditorProps = {
  canvasScale: number
  element: TextElement
  value: string
  onCancel: () => void
  onChange: (value: string) => void
  onCommit: () => void
}

export function InlineTextEditor({
  canvasScale,
  element,
  value,
  onCancel,
  onChange,
  onCommit,
}: InlineTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const layout = getInlineTextEditorLayout(element, canvasScale)

  useLayoutEffect(() => {
    const textarea = textareaRef.current

    if (!textarea) {
      return
    }

    textarea.focus()
    textarea.setSelectionRange(textarea.value.length, textarea.value.length)
  }, [])

  useLayoutEffect(() => {
    const textarea = textareaRef.current

    if (!textarea) {
      return
    }

    textarea.style.paddingBlock = "0"
    textarea.style.height = "0px"
    const contentHeight = textarea.scrollHeight

    textarea.style.height = `${layout.height}px`
    textarea.style.paddingTop = `${Math.max(0, (layout.height - contentHeight) / 2)}px`
  }, [layout.fontSize, layout.height, layout.letterSpacing, layout.lineHeight, layout.width, value])

  return (
    <textarea
      ref={textareaRef}
      className="editor-inline-text-editor"
      aria-label={`Editar ${element.name} en el lienzo`}
      value={value}
      spellCheck
      style={{
        left: layout.left,
        top: layout.top,
        width: layout.width,
        height: layout.height,
        transform: `rotate(${layout.rotation}deg)`,
        transformOrigin: "top left",
        fontFamily: layout.fontFamily,
        fontSize: layout.fontSize,
        fontWeight: layout.fontWeight,
        fontStyle: layout.fontStyle,
        textDecoration: layout.textDecoration,
        textAlign: layout.textAlign,
        lineHeight: layout.lineHeight,
        letterSpacing: layout.letterSpacing,
        color:
          layout.opacity < 1
            ? `color-mix(in srgb, ${layout.color} ${layout.opacity * 100}%, transparent)`
            : layout.color,
      }}
      onBlur={onCommit}
      onChange={(event) => onChange(event.currentTarget.value)}
      onKeyDown={(event) => {
        const action = getInlineTextKeyboardAction(event)

        if (!action) {
          return
        }

        event.preventDefault()
        event.stopPropagation()

        if (action === "cancel") {
          onCancel()
        } else {
          onCommit()
        }
      }}
    />
  )
}
