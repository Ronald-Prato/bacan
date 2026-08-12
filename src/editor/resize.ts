export type ElementResizeBounds = {
  x: number
  y: number
  width: number
  height: number
  rotation: number
}

export type ElementResizeTransform = Omit<ElementResizeBounds, "width" | "height"> & {
  scaleX: number
  scaleY: number
}

export type LiveElementResize = ElementResizeBounds & {
  scaleX: number
  scaleY: number
}

export const MIN_ELEMENT_SIZE = 28

export function getLiveElementResize(
  currentBounds: Pick<ElementResizeBounds, "width" | "height">,
  transform: ElementResizeTransform,
  minimumSize = MIN_ELEMENT_SIZE,
): LiveElementResize {
  return {
    x: transform.x,
    y: transform.y,
    width: Math.max(minimumSize, currentBounds.width * transform.scaleX),
    height: Math.max(minimumSize, currentBounds.height * transform.scaleY),
    rotation: transform.rotation,
    scaleX: 1,
    scaleY: 1,
  }
}
