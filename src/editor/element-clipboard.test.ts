import { describe, expect, it } from "vitest"

import {
  addElementToPage,
  createImageElement,
  createInitialDocument,
  createShapeElement,
  createTextElement,
  groupElements,
  type Asset,
} from "./document"
import { copyElementsToClipboard, pasteElementsFromClipboard } from "./element-clipboard"

function idSequence(prefix = "id") {
  let index = 0

  return () => `${prefix}-${++index}`
}

const asset: Asset = {
  id: "asset-1",
  name: "Hero",
  src: "data:image/png;base64,hero",
}

describe("element clipboard", () => {
  it("captures an immutable snapshot of selected elements", () => {
    const text = createTextElement(() => "text-1")
    const clipboard = copyElementsToClipboard([text])

    text.text = "Edited after copy"

    expect(clipboard.elements[0]).toMatchObject({ id: "text-1", text: "Text" })
  })

  it("pastes new elements with offset ids and an independent copied group", () => {
    const nextId = idSequence()
    const document = createInitialDocument(nextId)
    const pageId = document.pages[0].id
    const text = createTextElement(nextId)
    const shape = createShapeElement("rect", nextId)
    const image = createImageElement({ asset, imageSize: { width: 800, height: 600 }, createId: nextId })
    const withElements = [text, shape, image].reduce(
      (current, element) => addElementToPage(current, pageId, element),
      document,
    )
    const grouped = groupElements(withElements, pageId, [text.id, shape.id], nextId)
    const clipboard = copyElementsToClipboard(grouped.document.pages[0].elements)

    const pasted = pasteElementsFromClipboard(grouped.document, pageId, clipboard, nextId, 40)
    const pastedElements = pasted.document.pages[0].elements.slice(-3)

    expect(pasted.pastedIds).toEqual(["id-7", "id-8", "id-9"])
    expect(pastedElements.map(({ x, y }) => ({ x, y }))).toEqual([
      { x: text.x + 40, y: text.y + 40 },
      { x: shape.x + 40, y: shape.y + 40 },
      { x: image.x + 40, y: image.y + 40 },
    ])
    expect(pastedElements[0].groupId).toBe("id-6")
    expect(pastedElements[1].groupId).toBe("id-6")
    expect(pastedElements[0].groupId).not.toBe(grouped.groupId)
    expect(pastedElements[2].groupId).toBeUndefined()
  })

  it("does not keep a source group when only one member was copied", () => {
    const nextId = idSequence()
    const document = createInitialDocument(nextId)
    const pageId = document.pages[0].id
    const first = createShapeElement("rect", nextId)
    const second = createShapeElement("circle", nextId)
    const withElements = [first, second].reduce(
      (current, element) => addElementToPage(current, pageId, element),
      document,
    )
    const grouped = groupElements(withElements, pageId, [first.id, second.id], nextId)
    const clipboard = copyElementsToClipboard([grouped.document.pages[0].elements[0]])

    const pasted = pasteElementsFromClipboard(grouped.document, pageId, clipboard, nextId)

    expect(pasted.document.pages[0].elements.at(-1)?.groupId).toBeUndefined()
  })

  it("leaves the document untouched when there is nothing to paste", () => {
    const document = createInitialDocument(() => "page-1")

    expect(
      pasteElementsFromClipboard(document, "page-1", { elements: [] }, () => "unused").document,
    ).toBe(document)
  })
})
