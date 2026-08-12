import {
  ChevronDown,
  ChevronsDown,
  ChevronsUp,
  ChevronUp,
  Eye,
  EyeOff,
  GripVertical,
  Lock,
  LockOpen,
} from "lucide-react"
import { useLayoutEffect, useMemo, useRef, useState, type DragEvent, type ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { type CanvasElement, type Page, type Selection, selectionIncludesElement } from "@/editor/document"
import { getLayerPreviewOrder, type LayerDropPlacement } from "@/editor/layers"
import { filterSearchItems } from "@/editor/search"
import { useI18n } from "@/i18n/i18n-context"

export type LayerMove = "forward" | "backward" | "front" | "back"

type LayersPanelProps = {
  page?: Page
  searchQuery: string
  selection: Selection
  onMoveElement: (pageId: string, elementId: string, move: LayerMove) => void
  onReorderElement: (pageId: string, elementId: string, targetIndex: number) => void
  onSelectElement: (pageId: string, elementId: string, additive: boolean) => void
  onToggleLocked: (pageId: string, elementId: string) => void
  onToggleVisibility: (pageId: string, elementId: string) => void
}

function readableType(element: CanvasElement, tx: (source: string) => string) {
  if (element.type === "image") return tx("Imagen")
  if (element.type === "text") return tx("Texto")
  return tx("Forma")
}

function LayerAction({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          size="icon-xs"
          variant="ghost"
          aria-label={label}
          disabled={disabled}
          onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

export function LayersPanel({
  page,
  searchQuery,
  selection,
  onMoveElement,
  onReorderElement,
  onSelectElement,
  onToggleLocked,
  onToggleVisibility,
}: LayersPanelProps) {
  const { tx } = useI18n()
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null)
  const [previewLayerIds, setPreviewLayerIds] = useState<string[] | null>(null)
  const [announcement, setAnnouncement] = useState("")
  const previewLayerIdsRef = useRef<string[] | null>(null)
  const rowRefs = useRef(new Map<string, HTMLDivElement>())
  const previousRowBoundsRef = useRef(new Map<string, DOMRect>())
  const rowAnimationsRef = useRef(new Map<string, Animation>())
  const layerItems = useMemo(() => [...(page?.elements ?? [])].reverse(), [page])
  const layerIds = useMemo(() => layerItems.map((element) => element.id), [layerItems])
  const layerItemsById = useMemo(
    () => new Map(layerItems.map((element) => [element.id, element])),
    [layerItems],
  )
  const visualLayerItems = useMemo(
    () => (draggedElementId && previewLayerIds ? previewLayerIds : layerIds)
      .map((elementId) => layerItemsById.get(elementId))
      .filter((element): element is CanvasElement => element !== undefined),
    [draggedElementId, layerIds, layerItemsById, previewLayerIds],
  )
  const filteredLayerItems = useMemo(
    () => filterSearchItems(visualLayerItems, searchQuery, ["name", "type"]),
    [searchQuery, visualLayerItems],
  )
  const canDragLayers = searchQuery.trim().length === 0 && layerItems.length > 1

  useLayoutEffect(() => {
    const nextBounds = new Map<string, DOMRect>()

    for (const element of filteredLayerItems) {
      const row = rowRefs.current.get(element.id)

      if (row) nextBounds.set(element.id, row.getBoundingClientRect())
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (!prefersReducedMotion) {
      for (const [elementId, nextBoundsForRow] of nextBounds) {
        const previousBounds = previousRowBoundsRef.current.get(elementId)
        const row = rowRefs.current.get(elementId)

        if (!previousBounds || !row) continue

        const deltaX = previousBounds.left - nextBoundsForRow.left
        const deltaY = previousBounds.top - nextBoundsForRow.top

        if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) continue

        rowAnimationsRef.current.get(elementId)?.cancel()
        const animation = row.animate(
          [
            { transform: `translate(${deltaX}px, ${deltaY}px)` },
            { transform: "translate(0, 0)" },
          ],
          {
            duration: 180,
            easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
          },
        )

        rowAnimationsRef.current.set(elementId, animation)
        const clearAnimation = () => {
          if (rowAnimationsRef.current.get(elementId) === animation) {
            rowAnimationsRef.current.delete(elementId)
          }
        }

        animation.addEventListener("finish", clearAnimation, { once: true })
        animation.addEventListener("cancel", clearAnimation, { once: true })
      }
    }

    previousRowBoundsRef.current = nextBounds
  }, [filteredLayerItems])

  const clearDragState = () => {
    setDraggedElementId(null)
    setPreviewLayerIds(null)
    previewLayerIdsRef.current = null
  }

  const previewLayerOrder = (event: DragEvent<HTMLDivElement>, targetElementId: string) => {
    if (!canDragLayers || !draggedElementId) return

    event.preventDefault()
    event.dataTransfer.dropEffect = "move"

    if (draggedElementId === targetElementId) return

    const bounds = event.currentTarget.getBoundingClientRect()
    const placement: LayerDropPlacement = event.clientY < bounds.top + bounds.height / 2 ? "before" : "after"
    const currentPreviewIds = previewLayerIdsRef.current ?? layerIds
    const nextPreviewIds = getLayerPreviewOrder(
      currentPreviewIds,
      draggedElementId,
      targetElementId,
      placement,
    )

    if (!nextPreviewIds || nextPreviewIds.every((elementId, index) => elementId === currentPreviewIds[index])) return

    previewLayerIdsRef.current = nextPreviewIds
    setPreviewLayerIds(nextPreviewIds)
  }

  const dropLayer = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()

    if (!page || !draggedElementId) {
      clearDragState()
      return
    }

    const finalLayerIds = previewLayerIdsRef.current ?? layerIds
    const visualIndex = finalLayerIds.indexOf(draggedElementId)
    const targetIndex = visualIndex < 0 ? null : finalLayerIds.length - 1 - visualIndex
    const draggedElement = layerItems.find((element) => element.id === draggedElementId)

    if (targetIndex !== null) {
      onReorderElement(page.id, draggedElementId, targetIndex)
      setAnnouncement(`${draggedElement?.name ?? tx("Capa")} ${tx("se movió a la posición")} ${visualIndex + 1}.`)
    }

    clearDragState()
  }

  if (!page || page.elements.length === 0) {
    return <div className="editor-layers-panel__empty">{tx("Agrega elementos para ver tus capas aquí.")}</div>
  }

  return (
    <div className="editor-layers-panel" aria-label={tx("Orden de capas")}>
      {searchQuery.trim() ? (
        <p className="editor-layers-panel__hint">{tx("Limpia la búsqueda para cambiar el orden arrastrando.")}</p>
      ) : (
        <p className="editor-layers-panel__hint">{tx("Arrastra una capa para cambiar su posición en el diseño.")}</p>
      )}

      {filteredLayerItems.length === 0 ? (
        <div className="editor-layers-panel__empty">{tx("No hay capas para esa búsqueda.")}</div>
      ) : null}

      <div
        className="editor-layers-panel__list"
        onDragOver={(event) => {
          if (canDragLayers && draggedElementId) event.preventDefault()
        }}
        onDrop={dropLayer}
      >
        {filteredLayerItems.map((element) => {
          const canonicalIndex = page.elements.findIndex((candidate) => candidate.id === element.id)
          const isBack = canonicalIndex === 0
          const isFront = canonicalIndex === page.elements.length - 1
          const isLayerSelected = selectionIncludesElement(selection, page.id, element.id)
          const isLayerVisible = element.visible ?? true
          const isDragged = draggedElementId === element.id

          return (
            <div
              ref={(row) => {
                if (row) rowRefs.current.set(element.id, row)
                else rowRefs.current.delete(element.id)
              }}
              key={element.id}
              className="editor-layer-row"
              data-selected={isLayerSelected || undefined}
              data-dragging={isDragged || undefined}
              onDragOver={(event) => previewLayerOrder(event, element.id)}
            >
              <div className="editor-layer-row__main">
                <span
                  className="editor-layer-row__drag-handle"
                  role="button"
                  tabIndex={canDragLayers ? 0 : -1}
                  draggable={canDragLayers}
                  aria-disabled={!canDragLayers}
                  aria-label={`${tx("Reordenar")} ${element.name}`}
                  aria-keyshortcuts="ArrowUp ArrowDown Home End"
                  title={tx(canDragLayers ? "Arrastrar para reordenar" : "Reordenamiento no disponible")}
                  onKeyDown={(event) => {
                    if (!canDragLayers) return

                    const keyboardMove =
                      event.key === "ArrowUp"
                        ? "forward"
                        : event.key === "ArrowDown"
                          ? "backward"
                          : event.key === "Home"
                            ? "front"
                            : event.key === "End"
                              ? "back"
                              : null

                    if (!keyboardMove) return

                    event.preventDefault()
                    onMoveElement(page.id, element.id, keyboardMove)
                    setAnnouncement(`${element.name} ${tx("cambió de posición.")}`)
                  }}
                  onDragStart={(event) => {
                    if (!canDragLayers) {
                      event.preventDefault()
                      return
                    }

                    event.dataTransfer.effectAllowed = "move"
                    event.dataTransfer.setData("text/plain", element.id)
                    previewLayerIdsRef.current = layerIds
                    setPreviewLayerIds(layerIds)
                    setDraggedElementId(element.id)
                    setAnnouncement(`${tx("Moviendo")} ${element.name}.`)
                  }}
                  onDragEnd={clearDragState}
                >
                  <GripVertical aria-hidden="true" />
                </span>

                <button
                  type="button"
                  className="editor-layer-row__select"
                  onClick={(event) => onSelectElement(page.id, element.id, event.shiftKey || event.metaKey)}
                >
                  <span className="editor-layer-row__name">{element.name}</span>
                  <span className="editor-layer-row__meta">
                    {readableType(element, tx)}
                    {element.groupId ? ` · ${tx("agrupado")}` : ""}
                  </span>
                </button>

                <LayerAction
                  label={`${tx(isLayerVisible ? "Ocultar" : "Mostrar")} ${element.name}`}
                  onClick={() => onToggleVisibility(page.id, element.id)}
                >
                  {isLayerVisible ? <Eye /> : <EyeOff />}
                </LayerAction>
                <LayerAction
                  label={`${tx(element.locked ? "Desbloquear" : "Bloquear")} ${element.name}`}
                  onClick={() => onToggleLocked(page.id, element.id)}
                >
                  {element.locked ? <Lock /> : <LockOpen />}
                </LayerAction>
              </div>

              {isLayerSelected ? (
                <div className="editor-layer-row__position-actions" aria-label={`${tx("Posición")} ${element.name}`}>
                  <span>{tx("Posición")}</span>
                  <LayerAction
                    label={tx("Traer al frente")}
                    disabled={isFront}
                    onClick={() => onMoveElement(page.id, element.id, "front")}
                  >
                    <ChevronsUp />
                  </LayerAction>
                  <LayerAction
                    label={tx("Traer hacia delante")}
                    disabled={isFront}
                    onClick={() => onMoveElement(page.id, element.id, "forward")}
                  >
                    <ChevronUp />
                  </LayerAction>
                  <LayerAction
                    label={tx("Enviar hacia atrás")}
                    disabled={isBack}
                    onClick={() => onMoveElement(page.id, element.id, "backward")}
                  >
                    <ChevronDown />
                  </LayerAction>
                  <LayerAction
                    label={tx("Enviar al fondo")}
                    disabled={isBack}
                    onClick={() => onMoveElement(page.id, element.id, "back")}
                  >
                    <ChevronsDown />
                  </LayerAction>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
      <p className="sr-only" aria-live="polite">{announcement}</p>
    </div>
  )
}
