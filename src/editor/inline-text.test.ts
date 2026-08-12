import { describe, expect, it } from "vitest"

import { createTextElement, normalizeTextElement } from "./document"
import { getInlineTextEditorLayout, getInlineTextKeyboardAction } from "./inline-text"

describe("inline text editing", () => {
  it("maps a text element to a scaled overlay with matching typography", () => {
    const element = normalizeTextElement({
      ...createTextElement(() => "text-1"),
      x: 120,
      y: 80,
      width: 640,
      height: 180,
      rotation: 12,
      opacity: 0.75,
      fontSize: 48,
      fontWeight: "bold",
      fontStyle: "italic",
      textDecoration: "underline",
      align: "right",
      lineHeight: 1.25,
      letterSpacing: 3,
    })

    expect(getInlineTextEditorLayout(element, 0.5)).toEqual({
      left: 60,
      top: 40,
      width: 320,
      height: 90,
      rotation: 12,
      fontFamily: element.fontFamily,
      fontSize: 24,
      fontWeight: "bold",
      fontStyle: "italic",
      textDecoration: "underline",
      textAlign: "right",
      lineHeight: 1.25,
      letterSpacing: 1.5,
      color: element.fill,
      opacity: 0.75,
    })
  })

  it("commits with Command or Control plus Enter and cancels with Escape", () => {
    expect(getInlineTextKeyboardAction({ key: "Escape", metaKey: false, ctrlKey: false })).toBe("cancel")
    expect(getInlineTextKeyboardAction({ key: "Enter", metaKey: true, ctrlKey: false })).toBe("commit")
    expect(getInlineTextKeyboardAction({ key: "Enter", metaKey: false, ctrlKey: true })).toBe("commit")
    expect(getInlineTextKeyboardAction({ key: "Enter", metaKey: false, ctrlKey: false })).toBeNull()
  })
})
