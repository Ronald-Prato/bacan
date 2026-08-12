import {
  SHAPE_DRAG_MIME,
  type ShapeCatalogItem,
  type ShapeSize,
} from "@/editor/shapes"

const DRAG_PREVIEW_MAX_SIZE = 96

type ShapeDragTransfer = Pick<DataTransfer, "effectAllowed" | "setData" | "setDragImage">

function fitShapeInsidePreview({ width, height }: ShapeSize): ShapeSize {
  const scale = DRAG_PREVIEW_MAX_SIZE / Math.max(width, height)

  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  }
}

/**
 * Configures an HTML drag without exposing the catalog tile in its drag image.
 * The temporary node must remain mounted until the browser captures it.
 */
export function startShapeDrag(
  dataTransfer: ShapeDragTransfer,
  source: HTMLElement,
  item: ShapeCatalogItem,
) {
  dataTransfer.effectAllowed = "copy"
  dataTransfer.setData(SHAPE_DRAG_MIME, item.type)

  const sourcePreview = source.querySelector<SVGSVGElement>(".shapes-panel__preview")
  if (!sourcePreview) {
    return
  }

  const previewSize = fitShapeInsidePreview(item.size)
  const dragImage = source.ownerDocument.createElement("div")
  const preview = sourcePreview.cloneNode(true) as SVGSVGElement

  dragImage.className = "shapes-panel__drag-preview"
  Object.assign(dragImage.style, {
    position: "fixed",
    top: "-10000px",
    left: "-10000px",
    width: `${previewSize.width}px`,
    height: `${previewSize.height}px`,
    overflow: "visible",
    border: "0",
    padding: "0",
    background: "transparent",
    color: item.fill,
    pointerEvents: "none",
  })

  preview.setAttribute("preserveAspectRatio", "none")
  Object.assign(preview.style, {
    display: "block",
    width: "100%",
    height: "100%",
    overflow: "visible",
  })
  dragImage.append(preview)
  source.ownerDocument.body.append(dragImage)

  dataTransfer.setDragImage(
    dragImage,
    previewSize.width / 2,
    previewSize.height / 2,
  )

  setTimeout(() => dragImage.remove(), 0)
}
