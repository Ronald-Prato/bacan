export type LayerDropPlacement = "before" | "after"

export function getLayerPreviewOrder(
  layerIdsFrontToBack: readonly string[],
  draggedElementId: string,
  targetElementId: string,
  placement: LayerDropPlacement,
): string[] | null {
  if (
    draggedElementId === targetElementId ||
    !layerIdsFrontToBack.includes(draggedElementId) ||
    !layerIdsFrontToBack.includes(targetElementId)
  ) {
    return null
  }

  const reorderedIds = layerIdsFrontToBack.filter((elementId) => elementId !== draggedElementId)
  const targetIndex = reorderedIds.indexOf(targetElementId)
  const insertionIndex = targetIndex + (placement === "after" ? 1 : 0)

  reorderedIds.splice(insertionIndex, 0, draggedElementId)

  return reorderedIds
}

/**
 * Layer rows are presented from front to back while the document stores them
 * from back to front. This helper translates a visual drop into the canonical
 * document index expected by moveElementToLayerIndex.
 */
export function getLayerDropTargetIndex(
  layerIdsFrontToBack: readonly string[],
  draggedElementId: string,
  targetElementId: string,
  placement: LayerDropPlacement,
): number | null {
  const reorderedIds = getLayerPreviewOrder(
    layerIdsFrontToBack,
    draggedElementId,
    targetElementId,
    placement,
  )

  if (!reorderedIds) {
    return null
  }

  return reorderedIds.length - 1 - reorderedIds.indexOf(draggedElementId)
}
