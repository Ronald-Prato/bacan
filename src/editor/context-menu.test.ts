import { describe, expect, it } from "vitest"

import {
  addElementToPage,
  createImageElement,
  createInitialDocument,
  createMultiSelection,
  createShapeElement,
  createTextElement,
  type Asset,
} from "./document"
import { getContextMenuActions, type ContextMenuAction, type ContextMenuCapabilities } from "./context-menu"

const asset: Asset = {
  id: "asset-1",
  name: "Hero",
  src: "data:image/png;base64,hero",
}

function actionMap(actions: ContextMenuAction[]) {
  return Object.fromEntries(actions.map((action) => [action.id, action])) as Record<
    ContextMenuAction["id"],
    ContextMenuAction
  >
}

function documentWithElements(elements: Parameters<typeof addElementToPage>[2][]) {
  const document = createInitialDocument(() => "page-1")
  const pageId = document.pages[0].id

  return {
    document: elements.reduce(
      (currentDocument, element) => addElementToPage(currentDocument, pageId, element),
      document,
    ),
    pageId,
  }
}

function allOptionalCapabilities(): ContextMenuCapabilities {
  return {
    comment: true,
    link: true,
    duration: true,
    "alt-text": true,
    "magic-text": true,
    translate: true,
    "create-component": true,
  }
}

describe("context menu action model", () => {
  it("keeps local actions available for a single text selection", () => {
    const text = createTextElement(() => "text-1")
    const { document, pageId } = documentWithElements([text])
    const actions = actionMap(
      getContextMenuActions({
        document,
        selection: { pageId, elementId: text.id },
      }),
    )

    expect(Object.keys(actions)).toEqual([
      "copy",
      "duplicate",
      "delete",
      "align",
      "lock",
      "comment",
      "link",
      "duration",
      "alt-text",
      "magic-text",
      "translate",
      "create-component",
    ])
    for (const id of ["copy", "duplicate", "delete", "align", "lock"] as const) {
      expect(actions[id]).toMatchObject({
        source: "local",
        state: "available",
        visible: true,
        enabled: true,
      })
    }
    expect(actions.comment).toMatchObject({
      source: "optional",
      state: "disabled",
      visible: true,
      enabled: false,
      reason: "capability-unavailable",
    })
    expect(actions["alt-text"]).toMatchObject({ state: "hidden", visible: false, enabled: false })
  })

  it("enables text-only optional actions only for text elements", () => {
    const text = createTextElement(() => "text-1")
    const shape = createShapeElement("rect", () => "shape-1")
    const { document: textDocument, pageId: textPageId } = documentWithElements([text])
    const { document: shapeDocument, pageId: shapePageId } = documentWithElements([shape])
    const capabilities = allOptionalCapabilities()

    const textActions = actionMap(
      getContextMenuActions({
        document: textDocument,
        selection: { pageId: textPageId, elementId: text.id },
        capabilities,
      }),
    )
    const shapeActions = actionMap(
      getContextMenuActions({
        document: shapeDocument,
        selection: { pageId: shapePageId, elementId: shape.id },
        capabilities,
      }),
    )

    expect(textActions["magic-text"]).toMatchObject({ state: "available", visible: true, enabled: true })
    expect(textActions.translate).toMatchObject({ state: "available", visible: true, enabled: true })
    expect(textActions["alt-text"]).toMatchObject({ state: "hidden", visible: false, enabled: false })
    expect(shapeActions["magic-text"]).toMatchObject({ state: "hidden", visible: false, enabled: false })
    expect(shapeActions.translate).toMatchObject({ state: "hidden", visible: false, enabled: false })
    expect(shapeActions["create-component"]).toMatchObject({ state: "available", visible: true, enabled: true })
  })

  it("enables alt text for a single image and leaves generic capabilities explicit", () => {
    const image = createImageElement({
      asset,
      imageSize: { width: 1200, height: 800 },
      createId: () => "image-1",
    })
    const { document, pageId } = documentWithElements([image])
    const actions = actionMap(
      getContextMenuActions({
        document,
        selection: { pageId, elementId: image.id },
        capabilities: { "alt-text": true, link: true },
      }),
    )

    expect(actions["alt-text"]).toMatchObject({ state: "available", visible: true, enabled: true })
    expect(actions.link).toMatchObject({ state: "available", visible: true, enabled: true })
    expect(actions.comment).toMatchObject({
      state: "disabled",
      visible: true,
      enabled: false,
      reason: "capability-unavailable",
    })
    expect(actions["magic-text"]).toMatchObject({ state: "hidden", visible: false, enabled: false })
    expect(actions.translate).toMatchObject({ state: "hidden", visible: false, enabled: false })
  })

  it("keeps local actions available for multiple selection and narrows target-specific options", () => {
    const first = createTextElement(() => "text-1")
    const second = createTextElement(() => "text-2")
    const { document, pageId } = documentWithElements([first, second])
    const actions = actionMap(
      getContextMenuActions({
        document,
        selection: createMultiSelection(pageId, [first.id, second.id]),
        capabilities: allOptionalCapabilities(),
      }),
    )

    for (const id of ["copy", "duplicate", "delete", "align", "lock"] as const) {
      expect(actions[id].state).toBe("available")
    }
    expect(actions.comment).toMatchObject({ state: "hidden", visible: false, enabled: false })
    expect(actions["magic-text"]).toMatchObject({ state: "hidden", visible: false, enabled: false })
    expect(actions.translate).toMatchObject({ state: "available", visible: true, enabled: true })
    expect(actions["create-component"]).toMatchObject({ state: "available", visible: true, enabled: true })
  })

  it("hides type-specific actions for a mixed selection", () => {
    const text = createTextElement(() => "text-1")
    const image = createImageElement({
      asset,
      imageSize: { width: 1200, height: 800 },
      createId: () => "image-1",
    })
    const { document, pageId } = documentWithElements([text, image])
    const actions = actionMap(
      getContextMenuActions({
        document,
        selection: createMultiSelection(pageId, [text.id, image.id]),
        capabilities: allOptionalCapabilities(),
      }),
    )

    expect(actions["alt-text"]).toMatchObject({ state: "hidden", visible: false, enabled: false })
    expect(actions["magic-text"]).toMatchObject({ state: "hidden", visible: false, enabled: false })
    expect(actions.translate).toMatchObject({ state: "hidden", visible: false, enabled: false })
    expect(actions.link).toMatchObject({ state: "available", visible: true, enabled: true })
    expect(actions.duration).toMatchObject({ state: "available", visible: true, enabled: true })
  })

  it("hides every action when there is no selection", () => {
    const actions = getContextMenuActions({ document: createInitialDocument(() => "page-1"), selection: null })

    expect(actions.every((action) => action.state === "hidden" && !action.visible && !action.enabled)).toBe(true)
    expect(actions.every((action) => action.reason === "no-selection")).toBe(true)
  })
})
