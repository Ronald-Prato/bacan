type EditorWheelZoomInput = {
  currentScale: number
  deltaY: number
  metaKey: boolean
  altKey: boolean
  minScale: number
  maxScale: number
}

type Point = { x: number; y: number }
type Size = { width: number; height: number }
type ScrollPosition = { left: number; top: number }

type ZoomedScrollPositionInput = {
  pointer: Point
  scroll: ScrollPosition
  previousContentSize: Size
  nextContentSize: Size
  viewportSize: Size
}

const WHEEL_ZOOM_SENSITIVITY = 0.0025
const MAX_WHEEL_DELTA = 100

export function getEditorWheelZoom({
  currentScale,
  deltaY,
  metaKey,
  altKey,
  minScale,
  maxScale,
}: EditorWheelZoomInput): number | null {
  if (!metaKey && !altKey) {
    return null
  }

  const normalizedDelta = clamp(deltaY, -MAX_WHEEL_DELTA, MAX_WHEEL_DELTA)
  const nextScale = currentScale * Math.exp(-normalizedDelta * WHEEL_ZOOM_SENSITIVITY)

  return clamp(nextScale, minScale, maxScale)
}

export function getZoomedScrollPosition({
  pointer,
  scroll,
  previousContentSize,
  nextContentSize,
  viewportSize,
}: ZoomedScrollPositionInput): ScrollPosition {
  const horizontalAnchor = (scroll.left + pointer.x) / Math.max(previousContentSize.width, 1)
  const verticalAnchor = (scroll.top + pointer.y) / Math.max(previousContentSize.height, 1)

  return {
    left: clamp(
      horizontalAnchor * nextContentSize.width - pointer.x,
      0,
      Math.max(0, nextContentSize.width - viewportSize.width),
    ),
    top: clamp(
      verticalAnchor * nextContentSize.height - pointer.y,
      0,
      Math.max(0, nextContentSize.height - viewportSize.height),
    ),
  }
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum)
}
