import type { CanvasElement, EditorDocument, IdFactory } from "./document"

export type ElementClipboard = {
  elements: CanvasElement[]
}

function cloneElement(element: CanvasElement): CanvasElement {
  if (element.type === "image") {
    return {
      ...element,
      crop: { ...element.crop },
      filters: { ...element.filters },
    }
  }

  return { ...element }
}

export function copyElementsToClipboard(elements: CanvasElement[]): ElementClipboard {
  return {
    elements: elements.map(cloneElement),
  }
}

export function pasteElementsFromClipboard(
  document: EditorDocument,
  pageId: string,
  clipboard: ElementClipboard,
  createId: IdFactory,
  offset = 28,
): { document: EditorDocument; pastedIds: string[] } {
  const pageIndex = document.pages.findIndex((page) => page.id === pageId)

  if (pageIndex < 0 || clipboard.elements.length === 0) {
    return { document, pastedIds: [] }
  }

  const groupCounts = clipboard.elements.reduce((counts, element) => {
    if (element.groupId) {
      counts.set(element.groupId, (counts.get(element.groupId) ?? 0) + 1)
    }

    return counts
  }, new Map<string, number>())
  const copiedGroupIds = new Map<string, string>()
  for (const [sourceGroupId, count] of groupCounts) {
    if (count > 1) {
      copiedGroupIds.set(sourceGroupId, createId())
    }
  }
  const pastedIds: string[] = []
  const pastedElements = clipboard.elements.map((source) => {
    const id = createId()
    pastedIds.push(id)

    const groupId = source.groupId && (groupCounts.get(source.groupId) ?? 0) > 1
      ? copiedGroupIds.get(source.groupId)
      : undefined

    return cloneElement({
      ...source,
      id,
      name: `${source.name} copia`,
      x: source.x + offset,
      y: source.y + offset,
      groupId,
    } as CanvasElement)
  })
  const pages = [...document.pages]
  const page = pages[pageIndex]
  pages[pageIndex] = {
    ...page,
    elements: [...page.elements, ...pastedElements],
  }

  return {
    document: { ...document, pages },
    pastedIds,
  }
}
