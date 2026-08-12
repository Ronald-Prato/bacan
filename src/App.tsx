import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react"
import { useConvex, useMutation, useQuery } from "convex/react"
import Konva from "konva"
import {
  AlignCenter,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignHorizontalJustifyStart,
  AlignHorizontalSpaceBetween,
  AlignLeft,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
  AlignVerticalSpaceBetween,
  Accessibility,
  BringToFront,
  ChevronDown,
  Circle,
  Clock,
  CloudUpload,
  ClipboardPaste,
  Copy,
  CopyPlus,
  Download,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Layers3,
  Languages,
  Link2,
  Lock,
  MessageCircle,
  MousePointer2,
  Palette,
  PenLine,
  Plus,
  Search,
  Share2,
  Shapes,
  SquarePlus,
  Square,
  Trash2,
  Triangle,
  Type,
  Redo2,
  Undo2,
  WandSparkles,
  type LucideIcon,
} from "lucide-react"
import {
  Circle as KonvaCircle,
  Group as KonvaGroup,
  Image as KonvaImage,
  Layer as KonvaLayer,
  Line,
  Rect,
  RegularPolygon,
  Stage,
  Text,
  Transformer,
} from "react-konva"

import {
  CANVAS_SIZE,
  DEFAULT_SHAPE_SIZE,
  FONT_OPTIONS,
  SHAPE_OPTIONS,
  addElementToPage,
  alignElementToCanvas,
  createMultiSelection,
  createDefaultImageCrop,
  createImageElement,
  createInitialDocument,
  createDefaultImageFilters,
  createSelectionForElement,
  createSelectionForElementsInBounds,
  createSelectionForPageElements,
  createShapeElement,
  createTextElement,
  deleteElements,
  deletePage,
  distributePageElements,
  duplicateElements,
  duplicateElementBehind,
  findElement,
  findSelectedElements,
  getSelectionElementIds,
  groupElements,
  insertPageAfter,
  moveElementsByDelta,
  moveElementBackward,
  moveElementForward,
  moveElementToBack,
  moveElementToFront,
  normalizeImageElement,
  normalizeTextElement,
  selectionIncludesElement,
  setElementsLocked,
  toggleElementLocked,
  toggleElementSelection,
  toggleElementVisibility,
  ungroupElements,
  updateImageCrop,
  updateImageFilters,
  updateImageMask,
  updateTextStyle,
  updateElement,
  type Asset,
  type CanvasElement,
  type ElementAlignment,
  type ElementDistributionAxis,
  type EditorDocument,
  type ImageMask,
  type Selection,
  type SelectionBounds,
  type ShapeType,
} from "@/editor/document"
import {
  createLocalAsset,
  isSupportedImageAsset,
  normalizeAssetName,
  summarizeAssetRecord,
  type AssetRecord,
  type LibraryAsset,
} from "@/editor/assets"
import {
  filterBackgroundPalettes,
  normalizeBackgroundColorForPicker,
} from "@/editor/backgrounds"
import {
  createDocumentFingerprint,
  createProjectVersionDocument,
  createProjectVersionDraft,
  createProjectSavePayload,
  isEditorDocument,
  summarizeProjectVersionRecord,
  summarizeProjectRecord,
  type ProjectVersionRecord,
  type ProjectRecord,
  type SavedProjectVersion,
  type SavedProject,
} from "@/editor/projects"
import {
  PRESENCE_COLORS,
  createPresenceClientId,
  createPresenceDraft,
  listActiveCollaborators,
  type CollaboratorPresence,
  type PresenceDraft,
  type PresenceRecord,
} from "@/editor/presence"
import {
  createHistoryState,
  pushHistory,
  redoHistory,
  replaceHistoryPresent,
  undoHistory,
} from "@/editor/history"
import {
  createCommentDraft,
  describeCommentTarget,
  summarizeCommentRecord,
  type CommentDraft,
  type CommentRecord,
  type EditorComment,
} from "@/editor/comments"
import { listRecentProjects } from "@/editor/dashboard"
import {
  SHARE_ACCESS_OPTIONS,
  createProjectShareDraft,
  getShareTokenFromPath,
  summarizeProjectShareRecord,
  type ProjectShareRecord,
  type SavedProjectShare,
  type ShareAccess,
} from "@/editor/sharing"
import { filterSearchItems } from "@/editor/search"
import { snapElementPosition, type SnapGuide } from "@/editor/snapping"
import { getEditorWheelZoom, getZoomedScrollPosition } from "@/editor/zoom"
import { getContextMenuActions, type ContextMenuActionId } from "@/editor/context-menu"
import {
  copyElementsToClipboard,
  pasteElementsFromClipboard,
  type ElementClipboard,
} from "@/editor/element-clipboard"
import {
  DESIGN_FORMATS,
  createBlankDocumentForFormat,
  createBlankDocumentForSize,
  resizeDocumentToFormat,
  createSharedTemplateDraft,
  type DesignFormatId,
  type CustomDesignSize,
  type SharedTemplateRecord,
  type SharedTemplateSummary,
} from "@/editor/templates"
import {
  EXPORT_FORMATS,
  buildExportFileName,
  createExportOptions,
  getExportMimeType,
  type ExportFormatId,
} from "@/editor/export"
import { WorkspaceHome } from "@/components/dashboard/workspace-home"
import { CanvasContextMenu } from "@/components/editor/canvas-context-menu"
import { ElementMetadataDialog } from "@/components/editor/element-metadata-dialog"
import {
  EditorContextSidebar,
  EditorFooter,
  EditorToolRail,
  EditorTopBar,
  EditorWorkspace,
  type EditorToolItem,
} from "@/components/editor/editor-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { api } from "../convex/_generated/api"
import type { Id } from "../convex/_generated/dataModel"

type StageMap = Record<string, Konva.Stage | null>
type SnapPreview = {
  pageId: string
  guides: SnapGuide[]
} | null
type DragSelection = {
  pageId: string
  start: { x: number; y: number }
  end: { x: number; y: number }
} | null
type ElementContextMenu = {
  pageId: string
  elementId: string
  x: number
  y: number
} | null
type AutosaveStatus = "local" | "saved" | "saving" | "loading" | "error"
type ProjectPersistence = {
  isEnabled: boolean
  isLoading: boolean
  projects: SavedProject[]
  saveProject: (projectId: string | null, document: EditorDocument) => Promise<string | null>
  loadProject: (projectId: string) => Promise<EditorDocument | null>
}
type ElementMetadataEditor = {
  kind: "link" | "altText"
  pageId: string
  elementIds: string[]
  value: string
} | null
type ProjectVersionPersistence = {
  isEnabled: boolean
  isLoading: boolean
  versions: SavedProjectVersion[]
  selectProject: (projectId: string | null) => void
  saveVersion: (draft: ReturnType<typeof createProjectVersionDraft>) => Promise<void>
  loadVersion: (versionId: string) => Promise<ProjectVersionRecord | null>
}
type AssetPersistence = {
  isEnabled: boolean
  isLoading: boolean
  assets: LibraryAsset[]
  uploadAsset: (file: File) => Promise<LibraryAsset>
}
type CommentPersistence = {
  isEnabled: boolean
  listComments: (projectId: string) => Promise<EditorComment[]>
  createComment: (projectId: string, comment: CommentDraft) => Promise<void>
}
type SharePersistence = {
  isEnabled: boolean
  isLoading: boolean
  shares: SavedProjectShare[]
  selectProject: (projectId: string | null) => void
  createShare: (draft: ReturnType<typeof createProjectShareDraft>) => Promise<void>
  revokeShare: (shareId: string) => Promise<void>
}
type PresencePersistence = {
  isEnabled: boolean
  isLoading: boolean
  clientId: string
  color: string
  collaborators: CollaboratorPresence[]
  selectProject: (projectId: string | null) => void
  heartbeat: (projectId: string, draft: PresenceDraft) => Promise<void>
  leave: (projectId: string, clientId: string) => Promise<void>
}
type SharedTemplatePersistence = {
  isEnabled: boolean
  isLoading: boolean
  templates: SharedTemplateSummary[]
  publishTemplate: (draft: ReturnType<typeof createSharedTemplateDraft>) => Promise<void>
  loadTemplate: (templateId: string) => Promise<SharedTemplateRecord | null>
}
type DocumentUpdater = EditorDocument | ((currentDocument: EditorDocument) => EditorDocument)

const colorSwatches = ["#111827", "#ffffff", "#ef4444", "#f59e0b", "#14b8a6", "#3b82f6", "#9cff6d"]
const backgroundSwatches = ["#ffffff", "#f8fafc", "#fef3c7", "#d9f99d", "#ccfbf1", "#dbeafe", "#ede9fe", "#111827"]
const SHOW_INSPECTOR = true
const SHAPE_DRAG_MIME = "application/x-bacan-shape"
const MAX_CANVAS_PREVIEW_SIZE = 720
const MAX_ZOOMED_CANVAS_PREVIEW_SIZE = 1536
const MIN_CANVAS_PREVIEW_SCALE = 0.05
const SNAP_THRESHOLD_SCREEN_PX = 8
const AUTOSAVE_DELAY_MS = 900
const PAGE_EXIT_FALLBACK_MS = 420

const localProjectPersistence: ProjectPersistence = {
  isEnabled: false,
  isLoading: false,
  projects: [],
  saveProject: async () => null,
  loadProject: async () => null,
}

const localProjectVersionPersistence: ProjectVersionPersistence = {
  isEnabled: false,
  isLoading: false,
  versions: [],
  selectProject: () => undefined,
  saveVersion: async () => undefined,
  loadVersion: async () => null,
}

const localAssetPersistence: AssetPersistence = {
  isEnabled: false,
  isLoading: false,
  assets: [],
  uploadAsset: async (file) =>
    createLocalAsset({
      id: createId(),
      fileName: file.name,
      src: await fileToDataUrl(file),
      contentType: file.type || undefined,
      size: file.size,
    }),
}

const localCommentPersistence: CommentPersistence = {
  isEnabled: false,
  listComments: async () => [],
  createComment: async () => undefined,
}

const localSharePersistence: SharePersistence = {
  isEnabled: false,
  isLoading: false,
  shares: [],
  selectProject: () => undefined,
  createShare: async () => undefined,
  revokeShare: async () => undefined,
}

const localPresencePersistence: PresencePersistence = {
  isEnabled: false,
  isLoading: false,
  clientId: "local",
  color: "#9cff6d",
  collaborators: [],
  selectProject: () => undefined,
  heartbeat: async () => undefined,
  leave: async () => undefined,
}

const localSharedTemplatePersistence: SharedTemplatePersistence = {
  isEnabled: false,
  isLoading: false,
  templates: [],
  publishTemplate: async () => undefined,
  loadTemplate: async () => null,
}

type ToolId =
  | "templates"
  | "layers"
  | "elements"
  | "text"
  | "uploads"
  | "tools"
  | "projects"
  | "photos"
  | "background"
  | "comments"

const sidebarTools: EditorToolItem<ToolId>[] = [
  { id: "layers", label: "Capas", icon: Layers3 },
  { id: "elements", label: "Elementos", icon: Shapes },
  { id: "text", label: "Texto", icon: Type },
  { id: "uploads", label: "Archivos subidos", shortLabel: "Archivos su...", icon: CloudUpload },
  { id: "tools", label: "Herramientas", shortLabel: "Herramient...", icon: PenLine },
  { id: "photos", label: "Fotos", icon: ImageIcon },
  { id: "background", label: "Fondo", icon: Palette },
  { id: "comments", label: "Comentarios", shortLabel: "Comentar...", icon: MessageCircle },
]

function createId() {
  return crypto.randomUUID()
}

function readableType(element: CanvasElement) {
  if (element.type === "image") {
    return "Imagen"
  }

  if (element.type === "text") {
    return "Texto"
  }

  return "Forma"
}

function isShapeType(value: string): value is ShapeType {
  return SHAPE_OPTIONS.some((shape) => shape.type === value)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error ?? new Error("No se pudo leer el archivo"))
    reader.readAsDataURL(file)
  })
}

function loadImageSize(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new window.Image()

    image.onload = () => resolve({ width: image.width, height: image.height })
    image.onerror = () => reject(new Error("No se pudo cargar la imagen"))
    image.src = src
  })
}

function waitForNextFrame() {
  return new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve())
    })
  })
}

function getStageDocumentPointer(stage: Konva.Stage | null, scale: number) {
  const pointer = stage?.getPointerPosition()

  if (!pointer) {
    return null
  }

  return {
    x: pointer.x / scale,
    y: pointer.y / scale,
  }
}

function createDragSelectionBounds(
  start: { x: number; y: number },
  end: { x: number; y: number },
): SelectionBounds {
  return {
    x: start.x,
    y: start.y,
    width: end.x - start.x,
    height: end.y - start.y,
  }
}

function hasDragSelectionArea(bounds: SelectionBounds) {
  return Math.abs(bounds.width) >= 8 || Math.abs(bounds.height) >= 8
}

function isCanvasBackgroundTarget(target: Konva.Node) {
  return target === target.getStage() || target.name() === "canvas-background" || target.name() === "canvas-placeholder"
}

function useCanvasImage(src: string) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    const nextImage = new window.Image()
    nextImage.onload = () => setImage(nextImage)
    nextImage.src = src

    return () => {
      nextImage.onload = null
    }
  }, [src])

  return image
}

function EditableImage({
  element,
}: {
  element: Extract<CanvasElement, { type: "image" }>
}) {
  const imageRef = useRef<Konva.Image>(null)
  const image = useCanvasImage(element.src)
  const imageElement = normalizeImageElement(element)
  const { filters } = imageElement
  const { crop } = imageElement
  const hasBlur = filters.blur > 0
  const sourceWidth = image?.naturalWidth || image?.width || 1
  const sourceHeight = image?.naturalHeight || image?.height || 1
  const cropConfig = {
    x: Math.round(sourceWidth * crop.x),
    y: Math.round(sourceHeight * crop.y),
    width: Math.round(sourceWidth * crop.width),
    height: Math.round(sourceHeight * crop.height),
  }
  const konvaFilters = useMemo(
    () => [
      Konva.Filters.Brighten,
      Konva.Filters.Contrast,
      Konva.Filters.HSL,
      ...(hasBlur ? [Konva.Filters.Blur] : []),
    ],
    [hasBlur],
  )

  useEffect(() => {
    const node = imageRef.current

    if (!node || !image) {
      return
    }

    node.cache()
    node.getLayer()?.batchDraw()

    return () => {
      node.clearCache()
    }
  }, [image, filters.brightness, filters.contrast, filters.saturation, filters.blur])

  return (
    <KonvaGroup
      clipFunc={
        imageElement.mask === "none"
          ? undefined
          : (context) => {
              if (imageElement.mask === "circle") {
                const radius = Math.min(element.width, element.height) / 2
                context.arc(element.width / 2, element.height / 2, radius, 0, Math.PI * 2)
                return
              }

              const radius = Math.min(72, element.width / 5, element.height / 5)
              context.moveTo(radius, 0)
              context.lineTo(element.width - radius, 0)
              context.quadraticCurveTo(element.width, 0, element.width, radius)
              context.lineTo(element.width, element.height - radius)
              context.quadraticCurveTo(element.width, element.height, element.width - radius, element.height)
              context.lineTo(radius, element.height)
              context.quadraticCurveTo(0, element.height, 0, element.height - radius)
              context.lineTo(0, radius)
              context.quadraticCurveTo(0, 0, radius, 0)
              context.closePath()
            }
      }
    >
      <KonvaImage
        ref={imageRef}
        image={image ?? undefined}
        width={element.width}
        height={element.height}
        opacity={element.opacity}
        crop={cropConfig}
        filters={konvaFilters}
        brightness={filters.brightness}
        contrast={filters.contrast}
        saturation={filters.saturation}
        blurRadius={filters.blur}
      />
    </KonvaGroup>
  )
}

function EditableShape({
  element,
}: {
  element: Extract<CanvasElement, { type: "shape" }>
}) {
  if (element.shapeType === "circle") {
    return (
      <KonvaCircle
        x={element.width / 2}
        y={element.height / 2}
        radius={Math.min(element.width, element.height) / 2}
        fill={element.fill}
        stroke={element.stroke}
        strokeWidth={2}
        opacity={element.opacity}
      />
    )
  }

  if (element.shapeType === "triangle") {
    return (
      <RegularPolygon
        x={element.width / 2}
        y={element.height / 2}
        sides={3}
        radius={Math.min(element.width, element.height) / 2}
        fill={element.fill}
        stroke={element.stroke}
        strokeWidth={2}
        opacity={element.opacity}
      />
    )
  }

  return (
    <Rect
      width={element.width}
      height={element.height}
      cornerRadius={12}
      fill={element.fill}
      stroke={element.stroke}
      strokeWidth={2}
      opacity={element.opacity}
    />
  )
}

function EditableElement({
  element,
  isSelected,
  canTransform,
  onSelect,
  onChange,
  onAltDragStart,
  onDragMove,
  onDragEnd,
  onContextMenu,
  onTextDoubleClick,
  showSelectionControls,
}: {
  element: CanvasElement
  isSelected: boolean
  canTransform: boolean
  onSelect: (additive: boolean) => void
  onChange: (changes: Partial<CanvasElement>) => void
  onAltDragStart: () => void
  onDragMove: (position: { x: number; y: number }) => { x: number; y: number }
  onDragEnd: () => void
  onContextMenu: (position: { x: number; y: number }) => void
  onTextDoubleClick: () => void
  showSelectionControls: boolean
}) {
  const groupRef = useRef<Konva.Group>(null)
  const transformerRef = useRef<Konva.Transformer>(null)
  const textElement = element.type === "text" ? normalizeTextElement(element) : null
  const isVisible = element.visible ?? true

  useEffect(() => {
    if (!isSelected || !groupRef.current || !transformerRef.current) {
      return
    }

    transformerRef.current.nodes([groupRef.current])
    transformerRef.current.getLayer()?.batchDraw()
  }, [isSelected, element])

  const handleTransformEnd = () => {
    if (element.locked) {
      return
    }

    const node = groupRef.current

    if (!node) {
      return
    }

    const scaleX = node.scaleX()
    const scaleY = node.scaleY()

    node.scaleX(1)
    node.scaleY(1)

    onChange({
      x: node.x(),
      y: node.y(),
      width: Math.max(28, element.width * scaleX),
      height: Math.max(28, element.height * scaleY),
      rotation: node.rotation(),
    })
  }

  if (!isVisible) {
    return null
  }

  return (
    <>
      <KonvaGroup
        ref={groupRef}
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        rotation={element.rotation}
        draggable={!element.locked}
        onMouseEnter={(event) => {
          event.target.getStage()?.container().style.setProperty("cursor", "pointer")
        }}
        onMouseLeave={(event) => {
          event.target.getStage()?.container().style.removeProperty("cursor")
        }}
        onClick={(event) => onSelect(event.evt.shiftKey || event.evt.metaKey || event.evt.ctrlKey)}
        onTap={() => onSelect(false)}
        onContextMenu={(event) => {
          event.evt.preventDefault()
          event.cancelBubble = true
          onContextMenu({ x: event.evt.clientX, y: event.evt.clientY })
        }}
        onDblClick={() => {
          if (element.type === "text") {
            onTextDoubleClick()
          }
        }}
        onDblTap={() => {
          if (element.type === "text") {
            onTextDoubleClick()
          }
        }}
        onDragStart={(event) => {
          if (event.evt.altKey) {
            onAltDragStart()
          }
        }}
        onDragMove={(event) => {
          const nextPosition = onDragMove({
            x: event.target.x(),
            y: event.target.y(),
          })

          event.target.position(nextPosition)
        }}
        onDragEnd={(event) => {
          onChange({
            x: event.target.x(),
            y: event.target.y(),
          })
          onDragEnd()
        }}
        onTransformEnd={handleTransformEnd}
      >
        {element.type === "image" ? <EditableImage element={element} /> : null}
        {element.type === "shape" ? <EditableShape element={element} /> : null}
        {textElement ? (
          <Text
            text={textElement.text}
            width={textElement.width}
            height={textElement.height}
            fill={textElement.fill}
            fontFamily={textElement.fontFamily}
            fontSize={textElement.fontSize}
            fontStyle={`${textElement.fontWeight}${textElement.fontStyle === "italic" ? " italic" : ""}`}
            textDecoration={textElement.textDecoration}
            align={textElement.align}
            lineHeight={textElement.lineHeight}
            letterSpacing={textElement.letterSpacing}
            verticalAlign="middle"
            opacity={textElement.opacity}
          />
        ) : null}
        {isSelected && showSelectionControls ? (
          <Rect
            width={element.width}
            height={element.height}
            listening={false}
            stroke="#9cff6d"
            strokeWidth={4}
            dash={canTransform ? undefined : [20, 14]}
          />
        ) : null}
      </KonvaGroup>
      {isSelected && showSelectionControls && canTransform && !element.locked ? (
        <Transformer
          ref={transformerRef}
          rotateEnabled
          borderStroke="#9cff6d"
          anchorStroke="#9cff6d"
          anchorFill="#ffffff"
          anchorSize={10}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 28 || newBox.height < 28) {
              return oldBox
            }

            return newBox
          }}
        />
      ) : null}
    </>
  )
}

function PanelSearch({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="flex h-12 items-center gap-3 rounded-md border border-white/10 bg-[#0e1115] px-3 text-[#9aa5a1] focus-within:border-[#9cff6d]/50 focus-within:ring-2 focus-within:ring-[#9cff6d]/15">
      <Search className="size-5 shrink-0 text-[#9cff6d]" />
      <input
        className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#f6f7ef] outline-none placeholder:text-[#6f7a75]"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function ToolAction({
  icon: Icon,
  label,
  disabled,
  onClick,
}: {
  icon: LucideIcon
  label: string
  disabled?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      className="flex h-20 flex-col items-center justify-center gap-2 rounded-md border border-white/10 bg-[#181c20] text-xs font-semibold text-[#cfd7d2] transition hover:border-[#9cff6d]/55 hover:bg-[#1d2422] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      disabled={disabled}
      onClick={onClick}
    >
      <Icon className="size-5" />
      {label}
    </button>
  )
}

type SharedProjectLookup = {
  share: ProjectShareRecord
  project: ProjectRecord
} | null

function StaticCanvasElement({ element }: { element: CanvasElement }) {
  if ((element.visible ?? true) === false) {
    return null
  }

  const textElement = element.type === "text" ? normalizeTextElement(element) : null

  return (
    <KonvaGroup
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation}
    >
      {element.type === "image" ? <EditableImage element={element} /> : null}
      {element.type === "shape" ? <EditableShape element={element} /> : null}
      {textElement ? (
        <Text
          text={textElement.text}
          width={textElement.width}
          height={textElement.height}
          fill={textElement.fill}
          fontFamily={textElement.fontFamily}
          fontSize={textElement.fontSize}
          fontStyle={`${textElement.fontWeight}${textElement.fontStyle === "italic" ? " italic" : ""}`}
          textDecoration={textElement.textDecoration}
          align={textElement.align}
          lineHeight={textElement.lineHeight}
          letterSpacing={textElement.letterSpacing}
          verticalAlign="middle"
          opacity={textElement.opacity}
        />
      ) : null}
    </KonvaGroup>
  )
}

function SharedProjectPreview({
  document,
  projectName,
  access,
}: {
  document: EditorDocument
  projectName: string
  access: ShareAccess
}) {
  const documentSize = document.size ?? CANVAS_SIZE
  const previewScale = Math.min(760 / Math.max(documentSize.width, documentSize.height), 1)
  const previewWidth = Math.round(documentSize.width * previewScale)
  const previewHeight = Math.round(documentSize.height * previewScale)
  const accessLabel = SHARE_ACCESS_OPTIONS.find((option) => option.value === access)?.label ?? "Puede ver"

  return (
    <main className="min-h-screen bg-[#0d0e14] text-slate-100">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-[#121619] px-4">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold text-white">{projectName}</h1>
          <p className="text-xs text-slate-400">{accessLabel}</p>
        </div>
        <Badge className="bg-[#9cff6d]/15 text-[#d8ffba]">Compartido</Badge>
      </header>
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-4 py-8">
        {document.pages.map((page, pageIndex) => (
          <section key={page.id} className="w-full">
            <div className="mx-auto mb-3 flex items-center gap-2 text-slate-300" style={{ width: previewWidth }}>
              <Badge className="bg-white text-slate-950">{pageIndex + 1}</Badge>
              <h2 className="text-sm font-bold">{page.name}</h2>
            </div>
            <div className="mx-auto w-fit bg-white ring-1 ring-black/40">
              <Stage width={previewWidth} height={previewHeight} scaleX={previewScale} scaleY={previewScale}>
                <KonvaLayer>
                  <Rect width={documentSize.width} height={documentSize.height} fill={page.background} />
                  {page.elements.map((element) => (
                    <StaticCanvasElement key={element.id} element={element} />
                  ))}
                </KonvaLayer>
              </Stage>
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}

function SharedProjectRoute({ token }: { token: string }) {
  const result = useQuery(api.projectShares.getByToken, { token }) as SharedProjectLookup | undefined

  if (result === undefined) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#0d0e14] p-6 text-slate-100">
        <div className="rounded-md border border-white/10 bg-[#121619] p-5 text-sm text-slate-300">
          Cargando proyecto compartido...
        </div>
      </main>
    )
  }

  if (!result || !isEditorDocument(result.project.canvas)) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#0d0e14] p-6 text-slate-100">
        <div className="rounded-md border border-white/10 bg-[#121619] p-5 text-sm text-slate-300">
          Link no disponible.
        </div>
      </main>
    )
  }

  return (
    <SharedProjectPreview
      document={result.project.canvas}
      projectName={result.project.name}
      access={result.share.access}
    />
  )
}

function EditorApp({
  persistence,
  versionPersistence,
  assetPersistence,
  commentPersistence,
  sharePersistence,
  presencePersistence,
}: {
  persistence: ProjectPersistence
  versionPersistence: ProjectVersionPersistence
  assetPersistence: AssetPersistence
  commentPersistence: CommentPersistence
  sharePersistence: SharePersistence
  presencePersistence: PresencePersistence
  sharedTemplatePersistence: SharedTemplatePersistence
}) {
  const [documentHistory, setDocumentHistory] = useState(() =>
    createHistoryState<EditorDocument>(createInitialDocument(createId)),
  )
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)
  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>(
    persistence.isEnabled ? "saved" : "local",
  )
  const [autosaveError, setAutosaveError] = useState("")
  const [versionLabel, setVersionLabel] = useState("")
  const [versionStatus, setVersionStatus] = useState("")
  const [assetUploadError, setAssetUploadError] = useState("")
  const [comments, setComments] = useState<EditorComment[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentBody, setCommentBody] = useState("")
  const [commentAuthor, setCommentAuthor] = useState("Colaborador")
  const [commentError, setCommentError] = useState("")
  const [shareAccess, setShareAccess] = useState<ShareAccess>("comment")
  const [shareStatus, setShareStatus] = useState("")
  const [localAssets, setLocalAssets] = useState<LibraryAsset[]>([])
  const [workspaceView, setWorkspaceView] = useState<"home" | "editor">("home")
  const [activePageId, setActivePageId] = useState<string | null>(null)
  const [activeTool, setActiveTool] = useState<ToolId>("layers")
  const [panelSearchQuery, setPanelSearchQuery] = useState("")
  const [expandedBackgroundPaletteId, setExpandedBackgroundPaletteId] = useState<string | null>(null)
  const [exportOptions, setExportOptions] = useState(() => createExportOptions())
  const [animatingPageId, setAnimatingPageId] = useState<string | null>(null)
  const [removingPageId, setRemovingPageId] = useState<string | null>(null)
  const [selection, setSelection] = useState<Selection>(null)
  const [elementContextMenu, setElementContextMenu] = useState<ElementContextMenu>(null)
  const [elementClipboard, setElementClipboard] = useState<ElementClipboard>({ elements: [] })
  const [elementMetadataEditor, setElementMetadataEditor] = useState<ElementMetadataEditor>(null)
  const [editingText, setEditingText] = useState("")
  const [snapPreview, setSnapPreview] = useState<SnapPreview>(null)
  const [dragSelection, setDragSelection] = useState<DragSelection>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [pagePendingDeletion, setPagePendingDeletion] = useState<string | null>(null)
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const savedTheme = localStorage.getItem("bacan-editor-theme")
    return savedTheme === "light" ? "light" : "dark"
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasViewportRef = useRef<HTMLDivElement>(null)
  const stageRefs = useRef<StageMap>({})
  const altDuplicatedDragRef = useRef<string | null>(null)
  const document = documentHistory.present
  const lastSavedFingerprintRef = useRef(createDocumentFingerprint(document))
  const initialCanvasPreviewScale = MAX_CANVAS_PREVIEW_SIZE / CANVAS_SIZE.width
  const fittedCanvasPreviewScaleRef = useRef(initialCanvasPreviewScale)
  const hasManualCanvasZoomRef = useRef(false)
  const pendingZoomAnchorRef = useRef<{
    pointer: { x: number; y: number }
    scroll: { left: number; top: number }
    previousContentSize: { width: number; height: number }
  } | null>(null)
  const [canvasPreviewScale, setCanvasPreviewScale] = useState(initialCanvasPreviewScale)
  const canUndo = documentHistory.past.length > 0
  const canRedo = documentHistory.future.length > 0

  useEffect(() => {
    window.document.documentElement.classList.toggle("dark", theme === "dark")
    localStorage.setItem("bacan-editor-theme", theme)
  }, [theme])

  const refreshComments = useCallback(async () => {
    if (!commentPersistence.isEnabled || !currentProjectId) {
      setComments([])
      return
    }

    setCommentsLoading(true)
    setCommentError("")

    try {
      setComments(await commentPersistence.listComments(currentProjectId))
    } catch (error) {
      setCommentError(error instanceof Error ? error.message : "No se pudieron cargar los comentarios")
    } finally {
      setCommentsLoading(false)
    }
  }, [commentPersistence, currentProjectId])

  const setDocument = useCallback((updater: DocumentUpdater) => {
    setDocumentHistory((currentHistory) => {
      const nextDocument =
        typeof updater === "function" ? updater(currentHistory.present) : updater

      return pushHistory(currentHistory, nextDocument, {
        fingerprint: createDocumentFingerprint,
      })
    })
  }, [])

  const completePageDeletion = useCallback((pageId: string) => {
    setDocument((currentDocument) => deletePage(currentDocument, pageId))
    setRemovingPageId((currentPageId) => (currentPageId === pageId ? null : currentPageId))
  }, [setDocument])

  const replaceDocumentHistory = useCallback((nextDocument: EditorDocument) => {
    setDocumentHistory((currentHistory) => replaceHistoryPresent(currentHistory, nextDocument))
  }, [])

  const undoDocument = useCallback(() => {
    setDocumentHistory((currentHistory) => undoHistory(currentHistory))
  }, [])

  const redoDocument = useCallback(() => {
    setDocumentHistory((currentHistory) => redoHistory(currentHistory))
  }, [])

  const resolvedActivePageId = selection?.pageId ?? activePageId ?? document.pages[0]?.id
  const activePage = document.pages.find((page) => page.id === resolvedActivePageId) ?? document.pages[0]
  const selectedElementIds = useMemo(() => getSelectionElementIds(selection), [selection])
  const selectedElements = useMemo(() => findSelectedElements(document, selection), [document, selection])
  const selectedElement = useMemo(
    () => (selectedElementIds.length === 1 ? findElement(document, selection) : null),
    [document, selectedElementIds.length, selection],
  )
  const hasSelection = selectedElementIds.length > 0
  const hasMultiSelection = selectedElementIds.length > 1
  const allSelectedLocked = selectedElements.length > 0 && selectedElements.every((element) => element.locked)
  const selectedElementsHaveGroup = selectedElements.some((element) => element.groupId)
  const selectedImageElement = selectedElement?.type === "image" ? normalizeImageElement(selectedElement) : null
  const selectedTextElement = selectedElement?.type === "text" ? normalizeTextElement(selectedElement) : null
  const presenceSelectionName = hasMultiSelection
    ? `${selectedElementIds.length} capas`
    : selectedElement?.name ?? null
  const presenceClientId = presencePersistence.clientId
  const presenceColor = presencePersistence.color
  const isPresenceEnabled = presencePersistence.isEnabled
  const heartbeatPresence = presencePersistence.heartbeat
  const selectPresenceProject = presencePersistence.selectProject
  const remoteCollaborators = presencePersistence.collaborators.filter((collaborator) => !collaborator.isSelf)
  const totalElements = document.pages.reduce((count, page) => count + page.elements.length, 0)
  const assets = assetPersistence.isEnabled ? assetPersistence.assets : localAssets
  const recentProjects = useMemo(() => listRecentProjects(persistence.projects, 3), [persistence.projects])
  const documentSize = document.size ?? CANVAS_SIZE
  const canvasPreviewWidth = Math.round(documentSize.width * canvasPreviewScale)
  const canvasPreviewHeight = Math.round(documentSize.height * canvasPreviewScale)
  const dragSelectionBounds = dragSelection
    ? createDragSelectionBounds(dragSelection.start, dragSelection.end)
    : null
  const showSelectionControls = !isExporting
  const contextMenuElement = useMemo(
    () =>
      elementContextMenu
        ? document.pages
            .find((page) => page.id === elementContextMenu.pageId)
            ?.elements.find((element) => element.id === elementContextMenu.elementId) ?? null
        : null,
    [document, elementContextMenu],
  )
  const contextMenuActions = useMemo(
    () => getContextMenuActions({
      document,
      selection: elementContextMenu ? selection : null,
      hasClipboardElements: elementClipboard.elements.length > 0,
      capabilities: {
        comment: true,
        link: true,
        "alt-text": true,
      },
    }),
    [document, elementClipboard.elements.length, elementContextMenu, selection],
  )
  const contextMenuActionById = useMemo(
    () => Object.fromEntries(contextMenuActions.map((action) => [action.id, action])) as Record<ContextMenuActionId, (typeof contextMenuActions)[number]>,
    [contextMenuActions],
  )

  const closeElementContextMenu = useCallback(() => setElementContextMenu(null), [])

  useEffect(() => {
    if (!document.pages.some((page) => page.id === activePageId)) {
      setActivePageId(document.pages[0]?.id ?? null)
    }
  }, [activePageId, document.pages])

  useEffect(() => {
    if (selectedElement?.type === "text") {
      setEditingText(selectedElement.text)
    }
  }, [selectedElement])

  useEffect(() => {
    setPanelSearchQuery("")
  }, [activeTool])

  useEffect(() => {
    versionPersistence.selectProject(currentProjectId)
  }, [currentProjectId, versionPersistence])

  useEffect(() => {
    sharePersistence.selectProject(currentProjectId)
  }, [currentProjectId, sharePersistence])

  useEffect(() => {
    selectPresenceProject(currentProjectId)
  }, [currentProjectId, selectPresenceProject])

  useEffect(() => {
    if (!isPresenceEnabled || !currentProjectId) {
      return
    }

    const sendHeartbeat = () => {
      void heartbeatPresence(
        currentProjectId,
        createPresenceDraft({
          clientId: presenceClientId,
          displayName: commentAuthor,
          color: presenceColor,
          pageId: resolvedActivePageId ?? null,
          selectedElementName: presenceSelectionName,
        }),
      )
    }

    sendHeartbeat()
    const intervalId = window.setInterval(sendHeartbeat, 15_000)

    return () => window.clearInterval(intervalId)
  }, [
    commentAuthor,
    currentProjectId,
    heartbeatPresence,
    isPresenceEnabled,
    presenceClientId,
    presenceColor,
    presenceSelectionName,
    resolvedActivePageId,
  ])

  useEffect(() => {
    void refreshComments()
  }, [refreshComments])

  useEffect(() => {
    const viewport = canvasViewportRef.current

    if (!viewport) {
      return
    }

    hasManualCanvasZoomRef.current = false

    const resizePreview = () => {
      if (hasManualCanvasZoomRef.current) {
        return
      }

      const availableWidth = Math.max(1, viewport.clientWidth - 32)
      const availableHeight = Math.max(1, viewport.clientHeight - 64)
      const maxPreviewScale = MAX_CANVAS_PREVIEW_SIZE / Math.max(documentSize.width, documentSize.height)
      const fittedScale = Math.min(
        availableWidth / documentSize.width,
        availableHeight / documentSize.height,
        maxPreviewScale,
      )

      fittedCanvasPreviewScaleRef.current = fittedScale
      pendingZoomAnchorRef.current = null
      setCanvasPreviewScale(fittedScale)
    }

    resizePreview()

    const observer = new ResizeObserver(resizePreview)
    observer.observe(viewport)

    return () => observer.disconnect()
  }, [documentSize.height, documentSize.width])

  useEffect(() => {
    const viewport = canvasViewportRef.current

    if (!viewport) {
      return
    }

    const handleWheel = (event: WheelEvent) => {
      const deltaMultiplier =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? 16
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? viewport.clientHeight
            : 1
      const fittedScale = fittedCanvasPreviewScaleRef.current
      const maximumScale = Math.max(
        fittedScale,
        Math.min(
          1,
          MAX_ZOOMED_CANVAS_PREVIEW_SIZE / Math.max(documentSize.width, documentSize.height),
        ),
      )
      const nextScale = getEditorWheelZoom({
        currentScale: canvasPreviewScale,
        deltaY: event.deltaY * deltaMultiplier,
        metaKey: event.metaKey,
        altKey: event.altKey,
        minScale: Math.min(MIN_CANVAS_PREVIEW_SCALE, fittedScale),
        maxScale: maximumScale,
      })

      if (nextScale === null) {
        return
      }

      event.preventDefault()

      if (nextScale === canvasPreviewScale) {
        return
      }

      const viewportBounds = viewport.getBoundingClientRect()
      pendingZoomAnchorRef.current = {
        pointer: {
          x: event.clientX - viewportBounds.left,
          y: event.clientY - viewportBounds.top,
        },
        scroll: {
          left: viewport.scrollLeft,
          top: viewport.scrollTop,
        },
        previousContentSize: {
          width: viewport.scrollWidth,
          height: viewport.scrollHeight,
        },
      }
      hasManualCanvasZoomRef.current = true
      setCanvasPreviewScale(nextScale)
    }

    viewport.addEventListener("wheel", handleWheel, { passive: false })

    return () => viewport.removeEventListener("wheel", handleWheel)
  }, [canvasPreviewScale, documentSize.height, documentSize.width])

  useLayoutEffect(() => {
    const viewport = canvasViewportRef.current
    const anchor = pendingZoomAnchorRef.current

    if (!viewport || !anchor) {
      return
    }

    pendingZoomAnchorRef.current = null
    const nextScroll = getZoomedScrollPosition({
      ...anchor,
      nextContentSize: {
        width: viewport.scrollWidth,
        height: viewport.scrollHeight,
      },
      viewportSize: {
        width: viewport.clientWidth,
        height: viewport.clientHeight,
      },
    })

    viewport.scrollLeft = nextScroll.left
    viewport.scrollTop = nextScroll.top
  }, [canvasPreviewScale])

  useEffect(() => {
    if (!animatingPageId) {
      return
    }

    const timeoutId = window.setTimeout(() => setAnimatingPageId(null), 520)

    return () => window.clearTimeout(timeoutId)
  }, [animatingPageId])

  useEffect(() => {
    if (!removingPageId) {
      return
    }

    const timeoutId = window.setTimeout(
      () => completePageDeletion(removingPageId),
      PAGE_EXIT_FALLBACK_MS,
    )

    return () => window.clearTimeout(timeoutId)
  }, [completePageDeletion, removingPageId])

  useEffect(() => {
    if (!persistence.isEnabled) {
      setAutosaveStatus("local")
      return
    }

    const fingerprint = createDocumentFingerprint(document)

    if (fingerprint === lastSavedFingerprintRef.current) {
      return
    }

    setAutosaveStatus("saving")
    setAutosaveError("")

    let isCancelled = false
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        try {
          const savedProjectId = await persistence.saveProject(currentProjectId, document)

          if (isCancelled) {
            return
          }

          if (savedProjectId) {
            setCurrentProjectId(savedProjectId)
          }

          lastSavedFingerprintRef.current = createDocumentFingerprint(document)
          setAutosaveStatus("saved")
        } catch (error) {
          if (isCancelled) {
            return
          }

          setAutosaveError(error instanceof Error ? error.message : "No se pudo guardar el proyecto")
          setAutosaveStatus("error")
        }
      })()
    }, AUTOSAVE_DELAY_MS)

    return () => {
      isCancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [currentProjectId, document, persistence])

  const saveCurrentProject = useCallback(async () => {
    if (!persistence.isEnabled) {
      return
    }

    setAutosaveStatus("saving")
    setAutosaveError("")

    try {
      const savedProjectId = await persistence.saveProject(currentProjectId, document)

      if (savedProjectId) {
        setCurrentProjectId(savedProjectId)
      }

      lastSavedFingerprintRef.current = createDocumentFingerprint(document)
      setAutosaveStatus("saved")
    } catch (error) {
      setAutosaveError(error instanceof Error ? error.message : "No se pudo guardar el proyecto")
      setAutosaveStatus("error")
    }
  }, [currentProjectId, document, persistence])

  const openProject = useCallback(
    async (projectId: string) => {
      if (!persistence.isEnabled) {
        return
      }

      setAutosaveStatus("loading")
      setAutosaveError("")

      try {
        const loadedDocument = await persistence.loadProject(projectId)

        if (!loadedDocument) {
          throw new Error("El proyecto no tiene un canvas valido")
        }

        replaceDocumentHistory(loadedDocument)
        setCurrentProjectId(projectId)
        setActivePageId(loadedDocument.pages[0]?.id ?? null)
        setSelection(null)
        setWorkspaceView("editor")
        lastSavedFingerprintRef.current = createDocumentFingerprint(loadedDocument)
        setAutosaveStatus("saved")
      } catch (error) {
        setAutosaveError(error instanceof Error ? error.message : "No se pudo abrir el proyecto")
        setAutosaveStatus("error")
      }
    },
    [persistence, replaceDocumentHistory],
  )

  const saveCurrentVersion = useCallback(async () => {
    if (!versionPersistence.isEnabled) {
      setVersionStatus("Conecta Convex para guardar versiones.")
      return
    }

    try {
      let projectId = currentProjectId

      if (!projectId) {
        projectId = await persistence.saveProject(null, document)

        if (projectId) {
          setCurrentProjectId(projectId)
          lastSavedFingerprintRef.current = createDocumentFingerprint(document)
          setAutosaveStatus("saved")
        }
      }

      if (!projectId) {
        throw new Error("Guarda el proyecto antes de crear una version.")
      }

      await versionPersistence.saveVersion(
        createProjectVersionDraft({
          projectId,
          document,
          label: versionLabel,
        }),
      )
      setVersionLabel("")
      setVersionStatus("Version guardada.")
    } catch (error) {
      setVersionStatus(error instanceof Error ? error.message : "No se pudo guardar la version.")
    }
  }, [currentProjectId, document, persistence, versionLabel, versionPersistence])

  const restoreProjectVersion = useCallback(
    async (versionId: string) => {
      if (!versionPersistence.isEnabled) {
        return
      }

      try {
        const version = await versionPersistence.loadVersion(versionId)
        const restoredDocument = version ? createProjectVersionDocument(version) : null

        if (!restoredDocument) {
          throw new Error("La version no tiene un canvas valido.")
        }

        replaceDocumentHistory(restoredDocument)
        setActivePageId(restoredDocument.pages[0]?.id ?? null)
        setSelection(null)
        setAutosaveStatus(persistence.isEnabled ? "saving" : "local")
        setVersionStatus("Version restaurada.")
      } catch (error) {
        setVersionStatus(error instanceof Error ? error.message : "No se pudo restaurar la version.")
      }
    },
    [persistence.isEnabled, replaceDocumentHistory, versionPersistence],
  )

  const createShareLink = async () => {
    if (!sharePersistence.isEnabled) {
      setShareStatus("Convex no esta conectado.")
      return
    }

    let projectId = currentProjectId

    try {
      if (!projectId) {
        projectId = await persistence.saveProject(null, document)

        if (!projectId) {
          throw new Error("Guarda el proyecto antes de compartirlo.")
        }

        setCurrentProjectId(projectId)
      }

      await sharePersistence.createShare(
        createProjectShareDraft({
          projectId,
          access: shareAccess,
        }),
      )
      sharePersistence.selectProject(projectId)
      setShareStatus("Link creado.")
    } catch (error) {
      setShareStatus(error instanceof Error ? error.message : "No se pudo crear el link.")
    }
  }

  const revokeShareLink = async (shareId: string) => {
    if (!sharePersistence.isEnabled) {
      return
    }

    try {
      await sharePersistence.revokeShare(shareId)
      setShareStatus("Link revocado.")
    } catch (error) {
      setShareStatus(error instanceof Error ? error.message : "No se pudo revocar el link.")
    }
  }

  const setDocumentName = (name: string) => {
    setDocument((currentDocument) => ({ ...currentDocument, name }))
  }

  const selectElement = (pageId: string, elementId: string, additive = false) => {
    setActivePageId(pageId)
    setSelection((currentSelection) =>
      additive
        ? toggleElementSelection(document, currentSelection, pageId, elementId)
        : createSelectionForElement(document, pageId, elementId),
    )
  }

  const selectEveryElementOnActivePage = () => {
    if (!resolvedActivePageId) {
      return
    }

    setActivePageId(resolvedActivePageId)
    setSelection(createSelectionForPageElements(document, resolvedActivePageId))
  }

  const moveSelectedByKeyboard = (delta: { x: number; y: number }) => {
    if (!selection || selectedElementIds.length === 0) {
      return
    }

    setDocument((currentDocument) => moveElementsByDelta(currentDocument, selection.pageId, selectedElementIds, delta))
  }

  const beginDragSelection = (pageId: string, stage: Konva.Stage | null) => {
    const pointer = getStageDocumentPointer(stage, canvasPreviewScale)

    if (!pointer) {
      return
    }

    setActivePageId(pageId)
    setDragSelection({
      pageId,
      start: pointer,
      end: pointer,
    })
  }

  const updateDragSelection = (pageId: string, stage: Konva.Stage | null) => {
    const pointer = getStageDocumentPointer(stage, canvasPreviewScale)

    if (!pointer) {
      return
    }

    setDragSelection((currentSelection) =>
      currentSelection?.pageId === pageId
        ? {
            ...currentSelection,
            end: pointer,
          }
        : currentSelection,
    )
  }

  const completeDragSelection = (pageId: string) => {
    if (!dragSelection || dragSelection.pageId !== pageId) {
      return
    }

    const bounds = createDragSelectionBounds(dragSelection.start, dragSelection.end)

    setSelection(hasDragSelectionArea(bounds) ? createSelectionForElementsInBounds(document, pageId, bounds) : null)
    setDragSelection(null)
  }

  const addImageAssetToPage = (
    asset: Asset,
    imageSize: { width: number; height: number },
    pageId = resolvedActivePageId,
  ) => {
    if (!pageId) {
      return
    }

    const element = createImageElement({ asset, imageSize, createId, canvasSize: documentSize })
    setDocument((currentDocument) => addElementToPage(currentDocument, pageId, element))
    setActivePageId(pageId)
    setSelection({ pageId, elementId: element.id })
  }

  const addAssetFromFile = async (file: File, pageId = resolvedActivePageId) => {
    setAssetUploadError("")

    try {
      if (file.type && !isSupportedImageAsset(file.type)) {
        throw new Error("Solo se pueden subir imagenes compatibles.")
      }

      const asset = await assetPersistence.uploadAsset(file)
      const imageSize = await loadImageSize(asset.src)

      if (!assetPersistence.isEnabled) {
        setLocalAssets((currentAssets) => [asset, ...currentAssets])
      }

      addImageAssetToPage(asset, imageSize, pageId)
    } catch (error) {
      setAssetUploadError(error instanceof Error ? error.message : "No se pudo subir la imagen")
    }
  }

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])

    files.forEach((file) => {
      void addAssetFromFile(file)
    })
    event.target.value = ""
  }

  const addText = () => {
    if (!resolvedActivePageId) {
      return
    }

    const element = createTextElement(createId, documentSize)
    setDocument((currentDocument) => addElementToPage(currentDocument, resolvedActivePageId, element))
    setActivePageId(resolvedActivePageId)
    setSelection({ pageId: resolvedActivePageId, elementId: element.id })
  }

  const addShape = (
    shapeType: ShapeType,
    pageId = resolvedActivePageId,
    position = {
      x: Math.round((documentSize.width - DEFAULT_SHAPE_SIZE.width) / 2),
      y: Math.round((documentSize.height - DEFAULT_SHAPE_SIZE.height) / 2),
    },
  ) => {
    if (!pageId) {
      return
    }

    const element = createShapeElement(shapeType, createId, position, documentSize)
    setDocument((currentDocument) => addElementToPage(currentDocument, pageId, element))
    setActivePageId(pageId)
    setSelection({ pageId, elementId: element.id })
  }

  const dropShapeOnPage = (event: DragEvent<HTMLDivElement>, pageId: string) => {
    const shapeType = event.dataTransfer.getData(SHAPE_DRAG_MIME)

    if (!isShapeType(shapeType)) {
      return
    }

    event.preventDefault()

    const stage = stageRefs.current[pageId]
    const canvasRect = stage?.container().getBoundingClientRect()

    if (!canvasRect) {
      return
    }

    const shapeWidth = DEFAULT_SHAPE_SIZE.width
    const shapeHeight = DEFAULT_SHAPE_SIZE.height
    const x = clamp(
      (event.clientX - canvasRect.left) / canvasPreviewScale - shapeWidth / 2,
      0,
      documentSize.width - shapeWidth,
    )
    const y = clamp(
      (event.clientY - canvasRect.top) / canvasPreviewScale - shapeHeight / 2,
      0,
      documentSize.height - shapeHeight,
    )

    addShape(shapeType, pageId, { x, y })
  }

  const handlePageDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (event.dataTransfer.types.includes(SHAPE_DRAG_MIME) || event.dataTransfer.types.includes("Files")) {
      event.preventDefault()
      event.dataTransfer.dropEffect = "copy"
    }
  }

  const handlePageDrop = (event: DragEvent<HTMLDivElement>, pageId: string) => {
    const files = Array.from(event.dataTransfer.files)

    if (files.length > 0) {
      event.preventDefault()
      files.forEach((file) => void addAssetFromFile(file, pageId))
      return
    }

    dropShapeOnPage(event, pageId)
  }

  const addNewPageAfter = (pageId: string) => {
    if (removingPageId) {
      return
    }

    const result = insertPageAfter(document, pageId, createId)

    setDocument(result.document)
    setActivePageId(result.pageId)
    setAnimatingPageId(result.pageId)
    setSelection(null)
  }

  const addNewPage = () => {
    const targetPageId = document.pages.at(-1)?.id

    if (targetPageId) {
      addNewPageAfter(targetPageId)
    }
  }

  const removePage = (pageId: string) => {
    if (removingPageId) {
      return
    }

    const pageIndex = document.pages.findIndex((page) => page.id === pageId)
    const page = document.pages[pageIndex]

    if (!page || document.pages.length <= 1) {
      return
    }

    if (page.elements.length > 0) {
      setPagePendingDeletion(pageId)
      return
    }

    confirmPageDeletion(pageId)
  }

  const confirmPageDeletion = (pageId = pagePendingDeletion) => {
    if (!pageId || removingPageId) {
      return
    }

    const pageIndex = document.pages.findIndex((page) => page.id === pageId)
    const nextActivePageId = document.pages[pageIndex + 1]?.id ?? document.pages[pageIndex - 1]?.id ?? null

    if (resolvedActivePageId === pageId) {
      setActivePageId(nextActivePageId)
    }
    setSelection(null)
    setPagePendingDeletion(null)
    setRemovingPageId(pageId)
  }

  const updatePageBackground = (pageId: string, background: string) => {
    setDocument((currentDocument) => ({
      ...currentDocument,
      pages: currentDocument.pages.map((page) => (page.id === pageId ? { ...page, background } : page)),
    }))
    setActivePageId(pageId)
  }

  const updateSelected = (changes: Partial<CanvasElement>) => {
    if (!selection || !selectedElement) {
      return
    }

    setDocument((currentDocument) =>
      updateElement(currentDocument, selection.pageId, selectedElement.id, changes),
    )
  }

  const updateSelectedTextStyle = (changes: Parameters<typeof updateTextStyle>[3]) => {
    if (!selection || !selectedElement) {
      return
    }

    setDocument((currentDocument) =>
      updateTextStyle(currentDocument, selection.pageId, selectedElement.id, changes),
    )
  }

  const updateSelectedImageFilters = (changes: Parameters<typeof updateImageFilters>[3]) => {
    if (!selection || !selectedElement) {
      return
    }

    setDocument((currentDocument) =>
      updateImageFilters(currentDocument, selection.pageId, selectedElement.id, changes),
    )
  }

  const updateSelectedImageCrop = (changes: Parameters<typeof updateImageCrop>[3]) => {
    if (!selection || !selectedElement) {
      return
    }

    setDocument((currentDocument) =>
      updateImageCrop(currentDocument, selection.pageId, selectedElement.id, changes),
    )
  }

  const updateSelectedImageMask = (mask: ImageMask) => {
    if (!selection || !selectedElement) {
      return
    }

    setDocument((currentDocument) => updateImageMask(currentDocument, selection.pageId, selectedElement.id, mask))
  }

  const submitComment = async () => {
    if (!commentPersistence.isEnabled || !currentProjectId) {
      setCommentError("Guarda el proyecto antes de comentar.")
      return
    }

    const draft = createCommentDraft({
      body: commentBody,
      authorName: commentAuthor,
      pageId: resolvedActivePageId ?? null,
      elementId: selectedElementIds[0] ?? null,
    })

    if (!draft.body) {
      setCommentError("Escribe un comentario antes de enviarlo.")
      return
    }

    setCommentError("")

    try {
      await commentPersistence.createComment(currentProjectId, draft)
      setCommentBody("")
      await refreshComments()
    } catch (error) {
      setCommentError(error instanceof Error ? error.message : "No se pudo crear el comentario")
    }
  }

  const openElementContextMenu = (
    pageId: string,
    elementId: string,
    position: { x: number; y: number },
  ) => {
    setActivePageId(pageId)
    setSelection((currentSelection) =>
      selectionIncludesElement(currentSelection, pageId, elementId)
        ? currentSelection
        : createSelectionForElement(document, pageId, elementId),
    )
    setSnapPreview(null)
    setElementContextMenu({ pageId, elementId, ...position })
  }

  const duplicateContextMenuElement = () => {
    if (!elementContextMenu || !selection) {
      return
    }

    const pageId = selection.pageId
    const result = duplicateElements(document, pageId, selectedElementIds, createId)
    setDocument(result.document)
    setSelection(createMultiSelection(pageId, result.duplicatedIds))
  }

  const removeContextMenuElement = () => {
    if (!elementContextMenu || !selection) {
      return
    }

    const pageId = selection.pageId
    setDocument((currentDocument) => deleteElements(currentDocument, pageId, selectedElementIds))
    setSelection(null)
  }

  const copySelectedElements = () => {
    if (selectedElements.length === 0) {
      return
    }

    setElementClipboard(copyElementsToClipboard(selectedElements))
  }

  const pasteCopiedElements = () => {
    const pageId = selection?.pageId ?? activePage?.id

    if (!pageId || elementClipboard.elements.length === 0) {
      return
    }

    const result = pasteElementsFromClipboard(document, pageId, elementClipboard, createId)
    setDocument(result.document)
    setSelection(createMultiSelection(pageId, result.pastedIds))
  }

  const openElementMetadataEditor = (kind: "link" | "altText") => {
    if (!selection || selectedElementIds.length === 0) {
      return
    }

    const field = kind === "link" ? "link" : "altText"
    const value = selectedElements.length === 1 ? selectedElements[0][field] ?? "" : ""
    setElementMetadataEditor({ kind, pageId: selection.pageId, elementIds: selectedElementIds, value })
  }

  const saveElementMetadata = () => {
    if (!elementMetadataEditor) {
      return
    }

    const { kind, pageId, elementIds, value } = elementMetadataEditor
    const normalizedValue = value.trim() || undefined
    setDocument((currentDocument) =>
      elementIds.reduce(
        (nextDocument, elementId) => updateElement(
          nextDocument,
          pageId,
          elementId,
          kind === "link" ? { link: normalizedValue } : { altText: normalizedValue },
        ),
        currentDocument,
      ),
    )
    setElementMetadataEditor(null)
  }

  const removeSelected = () => {
    if (!selection || selectedElementIds.length === 0) {
      return
    }

    setDocument((currentDocument) => deleteElements(currentDocument, selection.pageId, selectedElementIds))
    setSelection(null)
  }

  const duplicateSelected = () => {
    if (!selection || selectedElementIds.length === 0) {
      return
    }

    const result = duplicateElements(document, selection.pageId, selectedElementIds, createId)
    setDocument(result.document)
    setSelection(createMultiSelection(selection.pageId, result.duplicatedIds))
  }

  const moveSelectedForward = () => {
    if (!selection || !selectedElement) {
      return
    }

    setDocument((currentDocument) =>
      moveElementForward(currentDocument, selection.pageId, selectedElement.id),
    )
  }

  const moveSelectedBackward = () => {
    if (!selection || !selectedElement) {
      return
    }

    setDocument((currentDocument) =>
      moveElementBackward(currentDocument, selection.pageId, selectedElement.id),
    )
  }

  const moveSelectedToFront = () => {
    if (!selection || !selectedElement) {
      return
    }

    setDocument((currentDocument) =>
      moveElementToFront(currentDocument, selection.pageId, selectedElement.id),
    )
  }

  const moveSelectedToBack = () => {
    if (!selection || !selectedElement) {
      return
    }

    setDocument((currentDocument) =>
      moveElementToBack(currentDocument, selection.pageId, selectedElement.id),
    )
  }

  const toggleSelectedLocked = () => {
    if (!selection || selectedElementIds.length === 0) {
      return
    }

    setDocument((currentDocument) =>
      setElementsLocked(currentDocument, selection.pageId, selectedElementIds, !allSelectedLocked),
    )
  }

  const toggleLayerVisibility = (pageId: string, elementId: string) => {
    setDocument((currentDocument) => toggleElementVisibility(currentDocument, pageId, elementId))
  }

  const alignSelectedToCanvas = (alignment: ElementAlignment) => {
    if (!selection || selectedElementIds.length === 0) {
      return
    }

    setDocument((currentDocument) =>
      selectedElementIds.reduce(
        (nextDocument, elementId) => alignElementToCanvas(nextDocument, selection.pageId, elementId, alignment),
        currentDocument,
      ),
    )
  }

  const groupSelected = () => {
    if (!selection || selectedElementIds.length < 2) {
      return
    }

    setDocument((currentDocument) => {
      const result = groupElements(currentDocument, selection.pageId, selectedElementIds, createId)
      return result.document
    })
    setSelection(createMultiSelection(selection.pageId, selectedElementIds))
  }

  const ungroupSelected = () => {
    if (!selection || selectedElementIds.length === 0) {
      return
    }

    setDocument((currentDocument) => ungroupElements(currentDocument, selection.pageId, selectedElementIds))
    setSelection(createMultiSelection(selection.pageId, selectedElementIds))
  }

  const distributeActivePageElements = (axis: ElementDistributionAxis) => {
    if (!resolvedActivePageId) {
      return
    }

    setDocument((currentDocument) => distributePageElements(currentDocument, resolvedActivePageId, axis))
  }

  const duplicateBehindForAltDrag = (pageId: string, elementId: string) => {
    const dragKey = `${pageId}:${elementId}`

    if (altDuplicatedDragRef.current === dragKey) {
      return
    }

    altDuplicatedDragRef.current = dragKey
    setDocument((currentDocument) => duplicateElementBehind(currentDocument, pageId, elementId, createId))
  }

  const exportActivePage = async () => {
    if (!resolvedActivePageId) {
      return
    }

    setIsExporting(true)
    await waitForNextFrame()

    let dataUrl: string | undefined

    try {
      dataUrl = stageRefs.current[resolvedActivePageId]?.toDataURL({
        pixelRatio: 1 / canvasPreviewScale,
        mimeType: getExportMimeType(exportOptions.format),
        quality: exportOptions.quality,
      })
    } finally {
      setIsExporting(false)
    }

    if (!dataUrl) {
      return
    }

    if (exportOptions.format === "pdf") {
      const { jsPDF } = await import("jspdf")
      const pdf = new jsPDF({
        orientation: documentSize.width >= documentSize.height ? "landscape" : "portrait",
        unit: "px",
        format: [documentSize.width, documentSize.height],
        compress: true,
      })

      pdf.addImage(dataUrl, "PNG", 0, 0, documentSize.width, documentSize.height)
      pdf.save(buildExportFileName(document.name, "pdf"))
      return
    }

    const link = globalThis.document.createElement("a")
    link.download = buildExportFileName(document.name, exportOptions.format)
    link.href = dataUrl
    link.click()
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isTyping =
        target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable

      if (isTyping) {
        return
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault()

        if (event.shiftKey) {
          redoDocument()
        } else {
          undoDocument()
        }

        return
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "y") {
        event.preventDefault()
        redoDocument()
        return
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "a") {
        event.preventDefault()
        selectEveryElementOnActivePage()
        return
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "c") {
        event.preventDefault()
        copySelectedElements()
        return
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "v") {
        event.preventDefault()
        pasteCopiedElements()
        return
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "d") {
        event.preventDefault()
        duplicateSelected()
      }

      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        const step = event.shiftKey ? 10 : 1
        const delta = {
          x: event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0,
          y: event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0,
        }

        event.preventDefault()
        moveSelectedByKeyboard(delta)
        return
      }

      if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault()
        removeSelected()
      }

      if (event.key.toLowerCase() === "t") {
        event.preventDefault()
        addText()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => window.removeEventListener("keydown", handleKeyDown)
  })

  const autosaveLabel =
    autosaveStatus === "local"
      ? "Local"
      : autosaveStatus === "saving"
        ? "Guardando"
        : autosaveStatus === "loading"
          ? "Abriendo"
          : autosaveStatus === "error"
            ? "Sin guardar"
            : "Guardado"

  const createBlankFormat = (formatId: DesignFormatId) => {
    const nextDocument = createBlankDocumentForFormat(formatId, createId)

    replaceDocumentHistory(nextDocument)
    setCurrentProjectId(null)
    setActivePageId(nextDocument.pages[0]?.id ?? null)
    setSelection(null)
    setWorkspaceView("editor")
    lastSavedFingerprintRef.current = createDocumentFingerprint(nextDocument)
    setAutosaveError("")
    setAutosaveStatus(persistence.isEnabled ? "saved" : "local")
  }

  const createBlankCustomSize = (size: CustomDesignSize) => {
    const nextDocument = createBlankDocumentForSize(size, createId)

    replaceDocumentHistory(nextDocument)
    setCurrentProjectId(null)
    setActivePageId(nextDocument.pages[0]?.id ?? null)
    setSelection(null)
    setWorkspaceView("editor")
    lastSavedFingerprintRef.current = createDocumentFingerprint(nextDocument)
    setAutosaveError("")
    setAutosaveStatus(persistence.isEnabled ? "saved" : "local")
  }

  const resizeCurrentDocument = (formatId: DesignFormatId) => {
    setDocument((currentDocument) => resizeDocumentToFormat(currentDocument, formatId))
  }

  const renderPanelSearch = (placeholder: string) => (
    <PanelSearch
      placeholder={placeholder}
      value={panelSearchQuery}
      onChange={setPanelSearchQuery}
    />
  )

  const renderToolPanel = () => {
    const filteredShapes = filterSearchItems(SHAPE_OPTIONS, panelSearchQuery, ["label", "type"])
    const filteredAssets = filterSearchItems(assets, panelSearchQuery, ["name"])
    const filteredBackgroundSwatches = filterSearchItems(
      backgroundSwatches.map((color) => ({ color })),
      panelSearchQuery,
      ["color"],
    ).map((swatch) => swatch.color)
    const filteredBackgroundPalettes = filterBackgroundPalettes(panelSearchQuery)
    const filteredProjects = filterSearchItems(persistence.projects, panelSearchQuery, [
      "name",
      (project) => `${project.pageCount} paginas ${project.elementCount} elementos`,
    ])
    const filteredDesignFormats = filterSearchItems(DESIGN_FORMATS, panelSearchQuery, [
      "name",
      "category",
      (format) => `${format.size.width} ${format.size.height}`,
    ])
    const layerItems = [...(activePage?.elements ?? [])].reverse()
    const filteredLayerItems = filterSearchItems(layerItems, panelSearchQuery, ["name", "type"])
    const toolActions = [
      { icon: MousePointer2, label: "Seleccionar", onClick: () => setSelection(null), disabled: false },
      { icon: Undo2, label: "Deshacer", onClick: undoDocument, disabled: !canUndo },
      { icon: Redo2, label: "Rehacer", onClick: redoDocument, disabled: !canRedo },
      { icon: Layers3, label: "Agrupar", onClick: groupSelected, disabled: selectedElementIds.length < 2 },
      { icon: Layers3, label: "Desagrupar", onClick: ungroupSelected, disabled: !selectedElementsHaveGroup },
      { icon: Layers3, label: "Duplicar", onClick: duplicateSelected, disabled: !hasSelection },
      { icon: BringToFront, label: "Al frente", onClick: moveSelectedToFront, disabled: !selectedElement },
      { icon: Layers3, label: "Adelante", onClick: moveSelectedForward, disabled: !selectedElement },
      { icon: Layers3, label: "Atras", onClick: moveSelectedBackward, disabled: !selectedElement },
      { icon: Layers3, label: "Al fondo", onClick: moveSelectedToBack, disabled: !selectedElement },
      {
        icon: AlignHorizontalSpaceBetween,
        label: "Distribuir horizontal",
        onClick: () => distributeActivePageElements("horizontal"),
        disabled: (activePage?.elements.length ?? 0) < 3,
      },
      {
        icon: AlignVerticalSpaceBetween,
        label: "Distribuir vertical",
        onClick: () => distributeActivePageElements("vertical"),
        disabled: (activePage?.elements.length ?? 0) < 3,
      },
      {
        icon: Lock,
        label: allSelectedLocked ? "Desbloquear" : "Bloquear",
        onClick: toggleSelectedLocked,
        disabled: !hasSelection,
      },
      { icon: Trash2, label: "Eliminar", onClick: removeSelected, disabled: !hasSelection },
      { icon: Download, label: "Exportar", onClick: exportActivePage, disabled: totalElements === 0 },
    ]
    const filteredToolActions = filterSearchItems(toolActions, panelSearchQuery, ["label"])

    if (activeTool === "elements") {
      return (
        <>
          {renderPanelSearch("Busca elementos")}
          <div className="grid grid-cols-3 gap-2">
            {filteredShapes.map((shape) => {
              const Icon = shape.type === "circle" ? Circle : shape.type === "triangle" ? Triangle : Square

              return (
                <button
                  key={shape.type}
                  type="button"
                  draggable
                  className="flex h-20 flex-col items-center justify-center gap-2 rounded-md border border-white/10 bg-[#181c20] text-xs font-semibold text-slate-200 transition hover:border-[#9cff6d]"
                  onClick={() => addShape(shape.type)}
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = "copy"
                    event.dataTransfer.setData(SHAPE_DRAG_MIME, shape.type)
                  }}
                >
                  <Icon className="size-6" style={{ color: shape.fill }} />
                  {shape.label}
                </button>
              )
            })}
          </div>
        </>
      )
    }

    if (activeTool === "layers") {
      return (
        <>
          {renderPanelSearch("Busca capas")}
          <div className="space-y-2">
            {!activePage || activePage.elements.length === 0 ? (
              <div className="rounded-md border border-white/10 bg-[#181c20] p-4 text-sm text-slate-400">
                Agrega elementos para ver tus capas aqui.
              </div>
            ) : null}
            {activePage && activePage.elements.length > 0 && filteredLayerItems.length === 0 ? (
              <div className="rounded-md border border-white/10 bg-[#181c20] p-4 text-sm text-slate-400">
                No hay capas para esa busqueda.
              </div>
            ) : null}
            {filteredLayerItems.map((element) => {
              const isLayerSelected = activePage ? selectionIncludesElement(selection, activePage.id, element.id) : false
              const isLayerVisible = element.visible ?? true

              return (
                <div
                  key={element.id}
                  className={`flex items-center gap-2 rounded-md border px-2 py-2 text-sm transition ${
                    isLayerSelected ? "border-[#9cff6d] bg-[#17231d]" : "border-white/10 bg-[#181c20]"
                  }`}
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={(event) => {
                      if (!activePage) {
                        return
                      }

                      selectElement(activePage.id, element.id, event.shiftKey || event.metaKey)
                    }}
                  >
                    <span className="block truncate font-semibold text-slate-100">{element.name}</span>
                    <span className="text-xs text-slate-500">
                      {readableType(element)}
                      {element.groupId ? " - agrupado" : ""}
                    </span>
                  </button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon-sm"
                        variant="outline"
                        aria-label={isLayerVisible ? "Ocultar capa" : "Mostrar capa"}
                        onClick={() => activePage ? toggleLayerVisibility(activePage.id, element.id) : null}
                      >
                        {isLayerVisible ? <Eye /> : <EyeOff />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isLayerVisible ? "Ocultar" : "Mostrar"}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon-sm"
                        variant={element.locked ? "default" : "outline"}
                        aria-label={element.locked ? "Desbloquear capa" : "Bloquear capa"}
                        onClick={() => {
                          if (!activePage) {
                            return
                          }

                          setDocument((currentDocument) =>
                            toggleElementLocked(currentDocument, activePage.id, element.id),
                          )
                        }}
                      >
                        <Lock />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{element.locked ? "Desbloquear" : "Bloquear"}</TooltipContent>
                  </Tooltip>
                </div>
              )
            })}
          </div>
        </>
      )
    }

    if (activeTool === "text") {
      return (
        <>
          <Button className="h-12 w-full bg-[#9cff6d] text-base font-bold text-[#09100d] hover:bg-[#8de85f]" onClick={addText}>
            <Type data-icon="inline-start" />
            Agregar caja de texto
          </Button>
        </>
      )
    }

    if (activeTool === "uploads" || activeTool === "photos") {
      return (
        <>
          {renderPanelSearch(activeTool === "photos" ? "Busca fotos" : "Busca archivos")}
          <button
            type="button"
            className="flex h-24 w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-[#9cff6d] bg-[#151c18] text-slate-100 transition hover:bg-[#1d2a22]"
            onClick={() => fileInputRef.current?.click()}
          >
            <CloudUpload className="size-7" />
            <span className="text-sm font-bold">
              {assetPersistence.isEnabled ? "Subir a biblioteca" : "Subir imagenes"}
            </span>
          </button>
          {assetUploadError ? (
            <div className="rounded-md border border-red-400/30 bg-red-950/30 p-3 text-sm text-red-100">
              {assetUploadError}
            </div>
          ) : null}
          <div className="grid max-h-[42vh] grid-cols-2 gap-2 overflow-auto pr-1">
            {assetPersistence.isLoading ? (
              <div className="col-span-2 rounded-md border border-white/10 bg-[#181c20] p-4 text-sm text-slate-400">
                Cargando biblioteca...
              </div>
            ) : null}
            {assets.length === 0 ? (
              <div className="col-span-2 rounded-md border border-white/10 bg-[#181c20] p-4 text-sm text-slate-400">
                {assetPersistence.isEnabled
                  ? "Las imagenes guardadas en Convex apareceran aqui."
                  : "Las imagenes que subas apareceran aqui."}
              </div>
            ) : null}
            {assets.length > 0 && filteredAssets.length === 0 ? (
              <div className="col-span-2 rounded-md border border-white/10 bg-[#181c20] p-4 text-sm text-slate-400">
                No hay archivos para esa busqueda.
              </div>
            ) : null}
            {filteredAssets.map((asset) => (
              <button
                key={asset.id}
                type="button"
                className="group overflow-hidden rounded-md border border-white/10 bg-[#181c20] text-left transition hover:border-[#9cff6d]"
                onClick={() => {
                  const image = new window.Image()
                  image.onload = () =>
                    addImageAssetToPage(asset, { width: image.width, height: image.height })
                  image.src = asset.src
                }}
              >
                <img src={asset.src} alt="" className="aspect-square w-full object-cover" />
                <span className="block truncate px-2 py-1.5 text-xs text-slate-300">{asset.name}</span>
              </button>
            ))}
          </div>
        </>
      )
    }

    if (activeTool === "background") {
      const activeBackgroundColor = normalizeBackgroundColorForPicker(activePage?.background ?? "#ffffff")

      return (
        <>
          {renderPanelSearch("Busca fondos")}

          <section className="editor-background-controls space-y-2">
            <Label htmlFor="custom-background-color">Color personalizado</Label>
            <div className="editor-custom-background-color flex items-center gap-3 rounded-md border border-white/10 bg-[#181c20] p-2">
              <input
                id="custom-background-color"
                type="color"
                value={activeBackgroundColor}
                className="editor-color-picker h-10 w-14 shrink-0 cursor-pointer rounded-md bg-transparent"
                aria-label="Elegir color de fondo personalizado"
                onChange={(event) => {
                  if (activePage) {
                    updatePageBackground(activePage.id, event.target.value)
                  }
                }}
              />
              <span className="font-mono text-sm font-semibold uppercase text-slate-300">
                {activeBackgroundColor}
              </span>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Colores rapidos</h3>
            <div className="grid grid-cols-4 gap-2">
              {filteredBackgroundSwatches.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`aspect-square rounded-md border-2 transition-colors hover:border-[#9cff6d] ${
                    activeBackgroundColor === color.toLowerCase()
                      ? "border-[#9cff6d]"
                      : "border-white/15"
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Fondo ${color}`}
                  aria-pressed={activeBackgroundColor === color.toLowerCase()}
                  onClick={() => activePage ? updatePageBackground(activePage.id, color) : null}
                />
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Paletas</h3>
            <div className="space-y-2">
              {filteredBackgroundPalettes.map((palette) => {
                const isExpanded = expandedBackgroundPaletteId === palette.id

                return (
                  <article
                    key={palette.id}
                    className="editor-background-palette overflow-hidden rounded-md border border-white/10 bg-[#181c20]"
                  >
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-white/5"
                      aria-expanded={isExpanded}
                      aria-controls={`background-palette-${palette.id}`}
                      onClick={() => setExpandedBackgroundPaletteId(isExpanded ? null : palette.id)}
                    >
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-100">
                        {palette.name}
                      </span>
                      <span className="flex shrink-0 overflow-hidden rounded-sm border border-white/10" aria-hidden="true">
                        {palette.colors.slice(0, 4).map((color) => (
                          <span key={color} className="size-4" style={{ backgroundColor: color }} />
                        ))}
                      </span>
                      <ChevronDown
                        className={`size-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <div
                      id={`background-palette-${palette.id}`}
                      className="editor-palette-colors"
                      data-expanded={isExpanded}
                      inert={!isExpanded}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <div className="grid grid-cols-5 gap-2 border-t border-white/10 p-3">
                          {palette.colors.map((color) => {
                            const isActive = activeBackgroundColor === color.toLowerCase()

                            return (
                              <button
                                key={color}
                                type="button"
                                className={`aspect-square rounded-sm border-2 transition-colors hover:border-[#9cff6d] ${
                                  isActive
                                    ? "border-[#9cff6d]"
                                    : "border-white/15"
                                }`}
                                style={{ backgroundColor: color }}
                                aria-label={`Usar ${color} de la paleta ${palette.name}`}
                                aria-pressed={isActive}
                                onClick={() => activePage ? updatePageBackground(activePage.id, color) : null}
                              />
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          {filteredBackgroundSwatches.length === 0 && filteredBackgroundPalettes.length === 0 ? (
            <div className="rounded-md border border-white/10 bg-[#181c20] p-4 text-sm text-slate-400">
              No hay fondos para esa busqueda.
            </div>
          ) : null}
        </>
      )
    }

    if (activeTool === "projects") {
      return (
        <>
          {renderPanelSearch("Busca proyectos")}
          <div className="grid grid-cols-2 gap-2">
            <Button
              className="border-white/15 bg-transparent text-slate-100 hover:bg-white/10"
              variant="outline"
              onClick={() => createBlankFormat("square-post")}
            >
              <Plus data-icon="inline-start" />
              Nuevo
            </Button>
            <Button
              className="bg-[#9cff6d] text-[#09100d] hover:bg-[#8de85f]"
              onClick={saveCurrentProject}
              disabled={!persistence.isEnabled || autosaveStatus === "saving"}
            >
              <CloudUpload data-icon="inline-start" />
              Guardar
            </Button>
          </div>
          {!persistence.isEnabled ? (
            <div className="rounded-md border border-white/10 bg-[#181c20] p-4 text-sm leading-6 text-slate-400">
              Configura VITE_CONVEX_URL para guardar y abrir proyectos con Convex.
            </div>
          ) : null}
          {autosaveError ? (
            <div className="rounded-md border border-red-400/30 bg-red-950/30 p-3 text-sm text-red-100">
              {autosaveError}
            </div>
          ) : null}
          <section className="space-y-2 rounded-md border border-white/10 bg-[#181c20] p-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Versiones</h3>
            <Input
              value={versionLabel}
              placeholder="Nombre de version"
              onChange={(event) => setVersionLabel(event.target.value)}
              disabled={!versionPersistence.isEnabled}
            />
            <Button
              type="button"
              className="w-full"
              onClick={saveCurrentVersion}
              disabled={!versionPersistence.isEnabled}
            >
              <Clock data-icon="inline-start" />
              Guardar version
            </Button>
            {versionStatus ? <p className="text-xs leading-5 text-slate-400">{versionStatus}</p> : null}
            {!versionPersistence.isEnabled ? (
              <p className="text-xs leading-5 text-slate-500">Convex no esta conectado.</p>
            ) : null}
            {versionPersistence.isLoading ? (
              <p className="text-xs leading-5 text-slate-500">Cargando versiones...</p>
            ) : null}
            {!versionPersistence.isLoading && versionPersistence.versions.length === 0 ? (
              <p className="text-xs leading-5 text-slate-500">Todavia no hay versiones guardadas.</p>
            ) : null}
            <div className="grid gap-2">
              {versionPersistence.versions.map((version) => (
                <button
                  key={version.id}
                  type="button"
                  className="rounded-md border border-white/10 bg-[#121619] p-3 text-left transition hover:border-[#9cff6d]"
                  onClick={() => void restoreProjectVersion(version.id)}
                >
                  <span className="block truncate text-sm font-semibold text-white">{version.label}</span>
                  <span className="block text-xs text-slate-400">
                    {version.pageCount} paginas - {version.elementCount} elementos
                  </span>
                  <span className="block text-xs text-slate-500">
                    {new Date(version.createdAt).toLocaleDateString()}
                  </span>
                </button>
              ))}
            </div>
          </section>
          <section className="space-y-2 rounded-md border border-white/10 bg-[#181c20] p-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Compartir</h3>
            <select
              value={shareAccess}
              onChange={(event) => setShareAccess(event.target.value as ShareAccess)}
              className="h-8 w-full rounded-lg border border-white/10 bg-[#0e1115] px-2 text-sm text-slate-100"
              disabled={!sharePersistence.isEnabled}
            >
              {SHARE_ACCESS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button
              type="button"
              className="w-full"
              onClick={() => void createShareLink()}
              disabled={!sharePersistence.isEnabled}
            >
              <Share2 data-icon="inline-start" />
              Crear link
            </Button>
            {shareStatus ? <p className="text-xs leading-5 text-slate-400">{shareStatus}</p> : null}
            {!sharePersistence.isEnabled ? (
              <p className="text-xs leading-5 text-slate-500">Convex no esta conectado.</p>
            ) : null}
            {sharePersistence.isLoading ? (
              <p className="text-xs leading-5 text-slate-500">Cargando links...</p>
            ) : null}
            {!sharePersistence.isLoading && sharePersistence.shares.length === 0 ? (
              <p className="text-xs leading-5 text-slate-500">Todavia no hay links de acceso.</p>
            ) : null}
            <div className="grid gap-2">
              {sharePersistence.shares.map((share) => (
                <div
                  key={share.id}
                  className={`rounded-md border p-3 ${
                    share.isActive ? "border-white/10 bg-[#121619]" : "border-white/8 bg-[#0e1115] opacity-70"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {SHARE_ACCESS_OPTIONS.find((option) => option.value === share.access)?.label}
                      </p>
                      <p className="truncate pt-1 text-xs text-slate-500">{share.url}</p>
                    </div>
                    <Badge className={share.isActive ? "bg-emerald-500/15 text-emerald-100" : "bg-white/8 text-slate-300"}>
                      {share.isActive ? "Activo" : "Revocado"}
                    </Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        void navigator.clipboard?.writeText(share.url)
                        setShareStatus("Link copiado.")
                      }}
                    >
                      Copiar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void revokeShareLink(share.id)}
                      disabled={!share.isActive}
                    >
                      Revocar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <div className="space-y-2">
            {persistence.isLoading ? (
              <div className="rounded-md border border-white/10 bg-[#181c20] p-4 text-sm text-slate-400">
                Cargando proyectos...
              </div>
            ) : null}
            {persistence.isEnabled && !persistence.isLoading && persistence.projects.length === 0 ? (
              <div className="rounded-md border border-white/10 bg-[#181c20] p-4 text-sm text-slate-400">
                Guarda tu primer diseno para verlo aqui.
              </div>
            ) : null}
            {persistence.projects.length > 0 && filteredProjects.length === 0 ? (
              <div className="rounded-md border border-white/10 bg-[#181c20] p-4 text-sm text-slate-400">
                No hay proyectos para esa busqueda.
              </div>
            ) : null}
            {filteredProjects.map((project) => (
              <button
                key={project.id}
                type="button"
                className={`flex w-full items-center justify-between gap-3 rounded-md border px-3 py-3 text-left text-sm text-slate-200 transition hover:border-[#9cff6d] ${
                  project.id === currentProjectId ? "border-[#9cff6d] bg-[#17231d]" : "border-white/10 bg-[#181c20]"
                }`}
                onClick={() => {
                  void openProject(project.id)
                }}
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{project.name}</span>
                  <span className="text-xs text-slate-400">
                    {project.pageCount} paginas - {project.elementCount} elementos
                  </span>
                </span>
                <span className="shrink-0 text-xs text-slate-500">
                  {new Date(project.updatedAt).toLocaleDateString()}
                </span>
              </button>
            ))}
          </div>
        </>
      )
    }

    if (activeTool === "comments") {
      const filteredComments = filterSearchItems(comments, panelSearchQuery, ["body", "authorName"])

      return (
        <>
          {renderPanelSearch("Busca comentarios")}
          {!commentPersistence.isEnabled ? (
            <div className="rounded-md border border-white/10 bg-[#181c20] p-4 text-sm leading-6 text-slate-400">
              Configura VITE_CONVEX_URL para comentar con otros colaboradores.
            </div>
          ) : null}
          {commentPersistence.isEnabled && !currentProjectId ? (
            <div className="rounded-md border border-white/10 bg-[#181c20] p-4 text-sm leading-6 text-slate-400">
              Guarda el proyecto antes de crear comentarios.
            </div>
          ) : null}
          <div className="space-y-3 rounded-md border border-white/10 bg-[#181c20] p-3">
            <Input
              value={commentAuthor}
              onChange={(event) => setCommentAuthor(event.target.value)}
              placeholder="Tu nombre"
              className="bg-[#0e1115] text-slate-100"
            />
            <textarea
              value={commentBody}
              onChange={(event) => setCommentBody(event.target.value)}
              placeholder="Agrega un comentario"
              className="min-h-24 w-full resize-none rounded-lg border border-white/10 bg-[#0e1115] px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus-visible:border-[#9cff6d]"
            />
            <Button
              className="w-full bg-[#9cff6d] text-[#09100d] hover:bg-[#8de85f]"
              onClick={() => {
                void submitComment()
              }}
              disabled={!commentPersistence.isEnabled || !currentProjectId}
            >
              <MessageCircle data-icon="inline-start" />
              Comentar
            </Button>
          </div>
          {commentError ? (
            <div className="rounded-md border border-red-400/30 bg-red-950/30 p-3 text-sm text-red-100">
              {commentError}
            </div>
          ) : null}
          <div className="space-y-2">
            {commentsLoading ? (
              <div className="rounded-md border border-white/10 bg-[#181c20] p-4 text-sm text-slate-400">
                Cargando comentarios...
              </div>
            ) : null}
            {!commentsLoading && comments.length === 0 ? (
              <div className="rounded-md border border-white/10 bg-[#181c20] p-4 text-sm text-slate-400">
                Todavia no hay comentarios.
              </div>
            ) : null}
            {comments.length > 0 && filteredComments.length === 0 ? (
              <div className="rounded-md border border-white/10 bg-[#181c20] p-4 text-sm text-slate-400">
                No hay comentarios para esa busqueda.
              </div>
            ) : null}
            {filteredComments.map((comment) => {
              const page = document.pages.find((candidate) => candidate.id === comment.pageId)
              const element = comment.elementId
                ? page?.elements.find((candidate) => candidate.id === comment.elementId)
                : null

              return (
                <article key={comment.id} className="rounded-md border border-white/10 bg-[#181c20] p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-white">{comment.authorName}</span>
                    <span className="shrink-0 text-xs text-slate-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-slate-300">{comment.body}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {describeCommentTarget({ pageName: page?.name, elementName: element?.name })}
                  </p>
                </article>
              )
            })}
          </div>
        </>
      )
    }

    if (activeTool === "tools") {
      return (
        <>
          {renderPanelSearch("Busca herramientas")}
          <div className="space-y-3 rounded-md border border-white/10 bg-[#181c20] p-3">
            <div className="space-y-2">
              <Label htmlFor="export-format" className="text-slate-300">Formato</Label>
              <select
                id="export-format"
                value={exportOptions.format}
                onChange={(event) =>
                  setExportOptions((currentOptions) =>
                    createExportOptions({
                      ...currentOptions,
                      format: event.target.value as ExportFormatId,
                    }),
                  )
                }
                className="h-8 w-full rounded-lg border border-white/10 bg-[#0e1115] px-2 text-sm text-slate-100"
              >
                {EXPORT_FORMATS.map((format) => (
                  <option key={format.id} value={format.id}>
                    {format.label}
                  </option>
                ))}
              </select>
            </div>
            {exportOptions.format === "jpg" ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-300">Calidad</Label>
                  <span className="text-xs text-slate-400">{Math.round(exportOptions.quality * 100)}%</span>
                </div>
                <Slider
                  value={[exportOptions.quality]}
                  min={0.1}
                  max={1}
                  step={0.05}
                  onValueChange={([quality]) =>
                    setExportOptions((currentOptions) => createExportOptions({ ...currentOptions, quality }))
                  }
                />
              </div>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {filteredToolActions.map((action) => (
              <ToolAction
                key={action.label}
                icon={action.icon}
                label={action.label}
                onClick={action.onClick}
                disabled={action.disabled}
              />
            ))}
          </div>
        </>
      )
    }

    return (
      <>
        {renderPanelSearch("Busca tamaños")}
        <section className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Tamanos</h3>
          <div className="grid grid-cols-2 gap-2">
            {filteredDesignFormats.map((format) => (
              <button
                key={format.id}
                type="button"
                className="rounded-md border border-white/10 bg-[#181c20] px-3 py-3 text-left transition hover:border-[#9cff6d]"
                onClick={() => createBlankFormat(format.id)}
              >
                <span className="block text-sm font-semibold text-white">{format.name}</span>
                <span className="text-xs text-slate-400">
                  {format.size.width} x {format.size.height}
                </span>
              </button>
            ))}
          </div>
        </section>
        <section className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Redimensionar</h3>
          <div className="grid grid-cols-2 gap-2">
            {filteredDesignFormats.map((format) => (
              <button
                key={format.id}
                type="button"
                className="rounded-md border border-white/10 bg-[#121619] px-3 py-2 text-left text-xs font-semibold text-slate-300 transition hover:border-[#9cff6d]"
                onClick={() => resizeCurrentDocument(format.id)}
              >
                {format.name}
              </button>
            ))}
          </div>
        </section>
      </>
    )
  }

  if (workspaceView === "home") {
    return (
      <WorkspaceHome
        isLoading={persistence.isLoading}
        recentProjects={recentProjects}
        onCreateFormat={createBlankFormat}
        onCreateCustom={createBlankCustomSize}
        onOpenProject={(projectId) => void openProject(projectId)}
      />
    )
  }

  return (
    <main className={`min-h-screen bg-[#0d1012] text-[#f6f7ef] ${theme === "light" ? "editor-theme-light" : "editor-theme-dark"}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleUpload}
      />
      <EditorTopBar
        autosaveLabel={autosaveLabel}
        canSave={persistence.isEnabled && autosaveStatus !== "saving"}
        documentName={document.name}
        onComments={() => setActiveTool("comments")}
        onDocumentNameChange={setDocumentName}
        onHome={() => setWorkspaceView("home")}
        onResize={() => setActiveTool("templates")}
        onSave={saveCurrentProject}
        onThemeChange={setTheme}
        theme={theme}
      />

      <div className="grid min-h-[calc(100vh-4rem)] grid-cols-[96px_minmax(0,1fr)] lg:grid-cols-[96px_320px_minmax(0,1fr)] xl:grid-cols-[96px_320px_minmax(0,1fr)_320px]">
        <EditorToolRail activeTool={activeTool} tools={sidebarTools} onSelectTool={setActiveTool} />

        <EditorContextSidebar
          title={activeTool === "templates" ? "Redimensionar" : sidebarTools.find((tool) => tool.id === activeTool)?.label ?? "Herramientas"}
          badgeLabel={`${assets.length} assets`}
        >
          {renderToolPanel()}
        </EditorContextSidebar>

        <EditorWorkspace
          viewportRef={canvasViewportRef}
          stats={[
            `${documentSize.width} x ${documentSize.height}px`,
            `${document.pages.length} paginas`,
            `${totalElements} elementos`,
          ]}
          toolbarLeading={
            remoteCollaborators.length > 0 ? (
              <div className="mr-2 flex items-center -space-x-2">
                  {remoteCollaborators.slice(0, 4).map((collaborator) => (
                    <Tooltip key={collaborator.id}>
                      <TooltipTrigger asChild>
                        <span
                          className="grid size-7 place-items-center rounded-full border border-[#101417] text-[10px] font-bold text-white"
                          style={{ backgroundColor: collaborator.color }}
                        >
                          {collaborator.displayName.slice(0, 1).toUpperCase()}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {collaborator.displayName}
                        {collaborator.selectedElementName ? ` - ${collaborator.selectedElementName}` : ""}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                  {remoteCollaborators.length > 4 ? (
                    <span className="grid size-7 place-items-center rounded-full border border-[#0f1017] bg-white/10 text-[10px] font-bold text-white">
                      +{remoteCollaborators.length - 4}
                    </span>
                  ) : null}
              </div>
            ) : null
          }
          toolbarActions={
            <>
              <Button
                size="icon-sm"
                variant="ghost"
                className="text-[#cfd7d2] hover:bg-white/10"
                aria-label="Deshacer"
                onClick={undoDocument}
                disabled={!canUndo}
              >
                <Undo2 />
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                className="text-[#cfd7d2] hover:bg-white/10"
                aria-label="Rehacer"
                onClick={redoDocument}
                disabled={!canRedo}
              >
                <Redo2 />
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                className="text-[#cfd7d2] hover:bg-white/10"
                aria-label={allSelectedLocked ? "Desbloquear" : "Bloquear"}
                onClick={toggleSelectedLocked}
                disabled={!hasSelection}
              >
                <Lock />
              </Button>
              <Button size="icon-sm" variant="ghost" className="text-[#cfd7d2] hover:bg-white/10" aria-label="Duplicar" onClick={duplicateSelected} disabled={!hasSelection}>
                <CopyPlus />
              </Button>
              <Button size="icon-sm" variant="ghost" className="text-[#cfd7d2] hover:bg-white/10" aria-label="Agregar pagina" onClick={addNewPage} disabled={Boolean(removingPageId)}>
                <SquarePlus />
              </Button>
            </>
          }
          footer={
            <EditorFooter
              activePageLabel={`${resolvedActivePageId ? document.pages.findIndex((page) => page.id === resolvedActivePageId) + 1 : 1} de ${document.pages.length}`}
              zoomLabel={`${Math.round(canvasPreviewScale * 100)}%`}
            />
          }
        >
            <div className="flex w-max min-w-full flex-col items-center gap-10">
              {document.pages.map((page, pageIndex) => (
                <section
                  key={page.id}
                  className={`bacan-page-transition w-full ${page.id === animatingPageId ? "bacan-page-enter" : ""} ${page.id === removingPageId ? "bacan-page-exit" : ""}`}
                  onAnimationEnd={(event) => {
                    if (event.animationName === "bacan-page-exit" && page.id === removingPageId) {
                      completePageDeletion(page.id)
                    }
                  }}
                >
                  <div className="bacan-page-transition-content">
                  <div className="mx-auto mb-3 flex items-center justify-between text-[#cfd7d2]" style={{ width: canvasPreviewWidth }}>
                    <div className="flex items-center gap-2">
                      <Badge className={page.id === resolvedActivePageId ? "bg-[#dfffcf] text-[#09100d]" : "border-white/10 bg-white/8 text-[#cfd7d2]"}>
                        {pageIndex + 1}
                      </Badge>
                      <h2 className="text-sm font-bold">{page.name}</h2>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="text-[#cfd7d2] hover:bg-red-500/10 hover:text-red-300"
                        aria-label={`Eliminar ${page.name}`}
                        onClick={() => removePage(page.id)}
                        disabled={document.pages.length <= 1 || Boolean(removingPageId)}
                      >
                        <Trash2 />
                      </Button>
                      <Button size="icon-sm" variant="ghost" className="text-[#cfd7d2] hover:bg-white/10" aria-label="Agregar pagina" onClick={() => addNewPageAfter(page.id)} disabled={Boolean(removingPageId)}>
                        <SquarePlus />
                      </Button>
                    </div>
                  </div>

                  <div
                    className="mx-auto w-fit overflow-hidden rounded-[3px] bg-white ring-1 ring-white/10"
                    onDragOver={handlePageDragOver}
                    onDrop={(event) => handlePageDrop(event, page.id)}
                  >
                    <Stage
                      ref={(stage) => {
                        stageRefs.current[page.id] = stage
                      }}
                      width={canvasPreviewWidth}
                      height={canvasPreviewHeight}
                      scaleX={canvasPreviewScale}
                      scaleY={canvasPreviewScale}
                      onMouseDown={(event) => {
                        if (isCanvasBackgroundTarget(event.target)) {
                          beginDragSelection(page.id, event.target.getStage())
                        }
                      }}
                      onMouseMove={(event) => {
                        if (dragSelection?.pageId === page.id) {
                          updateDragSelection(page.id, event.target.getStage())
                        }
                      }}
                      onMouseUp={() => {
                        completeDragSelection(page.id)
                      }}
                      onMouseLeave={() => {
                        if (dragSelection?.pageId === page.id) {
                          completeDragSelection(page.id)
                        }
                      }}
                      onTouchStart={(event) => {
                        if (isCanvasBackgroundTarget(event.target)) {
                          setActivePageId(page.id)
                          setSelection(null)
                        }
                      }}
                      onContextMenu={(event) => {
                        event.evt.preventDefault()

                        if (isCanvasBackgroundTarget(event.target)) {
                          closeElementContextMenu()
                        }
                      }}
                    >
                      <KonvaLayer>
                        <Rect
                          name="canvas-background"
                          width={documentSize.width}
                          height={documentSize.height}
                          fill={page.background}
                        />
                        {page.elements.length === 0 ? (
                          <Text
                            name="canvas-placeholder"
                            text="Sube una imagen, agrega texto o inserta una forma"
                            x={documentSize.width * 0.18}
                            y={documentSize.height / 2 - 42}
                            width={documentSize.width * 0.64}
                            align="center"
                            fill="#64748b"
                            fontSize={48}
                          />
                        ) : null}
                        {page.elements.map((element) => (
                          <EditableElement
                            key={element.id}
                            element={element}
                            isSelected={selectionIncludesElement(selection, page.id, element.id)}
                            canTransform={!hasMultiSelection}
                            showSelectionControls={showSelectionControls}
                            onSelect={(additive) => selectElement(page.id, element.id, additive)}
                            onChange={(changes) => {
                              setDocument((currentDocument) => {
                                const nextX = changes.x
                                const nextY = changes.y
                                const shouldMoveSelection =
                                  selectedElementIds.length > 1 &&
                                  selectionIncludesElement(selection, page.id, element.id) &&
                                  nextX !== undefined &&
                                  nextY !== undefined
                                const movedDocument = shouldMoveSelection
                                  ? moveElementsByDelta(
                                      currentDocument,
                                      page.id,
                                      selectedElementIds.filter((selectedId) => selectedId !== element.id),
                                      {
                                        x: nextX - element.x,
                                        y: nextY - element.y,
                                      },
                                    )
                                  : currentDocument

                                return updateElement(movedDocument, page.id, element.id, changes)
                              })
                            }}
                            onAltDragStart={() => duplicateBehindForAltDrag(page.id, element.id)}
                            onDragMove={(position) => {
                              const snappedPosition = snapElementPosition({
                                element,
                                position,
                                elements: page.elements,
                                canvasSize: documentSize,
                                threshold: SNAP_THRESHOLD_SCREEN_PX / canvasPreviewScale,
                              })

                              setSnapPreview(
                                snappedPosition.guides.length > 0
                                  ? { pageId: page.id, guides: snappedPosition.guides }
                                  : null,
                              )

                              return {
                                x: snappedPosition.x,
                                y: snappedPosition.y,
                              }
                            }}
                            onDragEnd={() => setSnapPreview(null)}
                            onContextMenu={(position) =>
                              openElementContextMenu(page.id, element.id, position)
                            }
                            onTextDoubleClick={() => {
                              setActivePageId(page.id)
                              setSelection({ pageId: page.id, elementId: element.id })
                              setEditingText(element.type === "text" ? element.text : "")
                            }}
                          />
                        ))}
                        {snapPreview?.pageId === page.id
                          ? snapPreview.guides.map((guide) => (
                              <Line
                                key={`${guide.axis}:${guide.position}`}
                                points={
                                  guide.axis === "vertical"
                                    ? [guide.position, 0, guide.position, documentSize.height]
                                    : [0, guide.position, documentSize.width, guide.position]
                                }
                                stroke="#9cff6d"
                                strokeWidth={2}
                                strokeScaleEnabled={false}
                                dash={[18, 12]}
                                listening={false}
                              />
                            ))
                          : null}
                        {showSelectionControls && dragSelection?.pageId === page.id && dragSelectionBounds ? (
                          <Rect
                            x={Math.min(dragSelectionBounds.x, dragSelectionBounds.x + dragSelectionBounds.width)}
                            y={Math.min(dragSelectionBounds.y, dragSelectionBounds.y + dragSelectionBounds.height)}
                            width={Math.abs(dragSelectionBounds.width)}
                            height={Math.abs(dragSelectionBounds.height)}
                            fill="rgba(156, 255, 109, 0.08)"
                            stroke="#9cff6d"
                            strokeWidth={2}
                            dash={[18, 12]}
                            listening={false}
                          />
                        ) : null}
                      </KonvaLayer>
                    </Stage>
                  </div>
                  {pageIndex === document.pages.length - 1 ? (
                    <div className="editor-add-page mx-auto mt-5 flex h-12 overflow-hidden rounded-md border border-white/12 bg-[#101417] text-[#cfd7d2]" style={{ width: canvasPreviewWidth }}>
                      <button
                        type="button"
                        className="flex flex-1 items-center justify-center gap-2 text-sm font-bold transition hover:bg-[#9cff6d]/10 hover:text-[#dfffcf] disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => addNewPageAfter(page.id)}
                        disabled={Boolean(removingPageId)}
                      >
                        <Plus className="size-4" />
                        Agregar una pagina
                      </button>
                    </div>
                  ) : null}
                  </div>
                </section>
              ))}
            </div>
        </EditorWorkspace>

        {pagePendingDeletion ? (
          <div
            className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setPagePendingDeletion(null)
            }}
          >
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-page-title"
              aria-describedby="delete-page-description"
              className="w-full max-w-md rounded-xl border border-white/12 bg-[#171b1f] p-5 text-slate-100"
            >
              <h2 id="delete-page-title" className="text-lg font-bold">¿Eliminar esta página?</h2>
              <p id="delete-page-description" className="mt-2 text-sm leading-6 text-slate-400">
                Esta página contiene elementos. Al eliminarla, también se eliminará todo su contenido.
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setPagePendingDeletion(null)}>
                  Cancelar
                </Button>
                <Button type="button" className="bg-red-500 text-white hover:bg-red-400" onClick={() => confirmPageDeletion()}>
                  <Trash2 data-icon="inline-start" />
                  Eliminar página
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {elementContextMenu && contextMenuElement ? (
          <CanvasContextMenu
            x={elementContextMenu.x}
            y={elementContextMenu.y}
            onClose={closeElementContextMenu}
            items={[
              {
                id: "copy",
                label: "Copiar",
                icon: Copy,
                shortcut: "⌘C",
                disabled: !contextMenuActionById.copy.enabled,
                onSelect: copySelectedElements,
              },
              {
                id: "paste",
                label: "Pegar",
                icon: ClipboardPaste,
                shortcut: "⌘V",
                disabled: !contextMenuActionById.paste.enabled,
                onSelect: pasteCopiedElements,
              },
              {
                id: "duplicate",
                label: "Duplicar",
                icon: CopyPlus,
                shortcut: "⌘D",
                disabled: !contextMenuActionById.duplicate.enabled,
                onSelect: duplicateContextMenuElement,
              },
              {
                id: "delete",
                label: "Eliminar",
                icon: Trash2,
                shortcut: "Delete",
                destructive: true,
                disabled: !contextMenuActionById.delete.enabled,
                onSelect: removeContextMenuElement,
              },
              {
                id: "align",
                label: "Alinear a la página",
                icon: AlignHorizontalJustifyCenter,
                separatorBefore: true,
                disabled: !contextMenuActionById.align.enabled,
                submenu: [
                  { label: "Izquierda", icon: AlignHorizontalJustifyStart, onSelect: () => alignSelectedToCanvas("left") },
                  { label: "Centro", icon: AlignHorizontalJustifyCenter, onSelect: () => alignSelectedToCanvas("center") },
                  { label: "Derecha", icon: AlignHorizontalJustifyEnd, onSelect: () => alignSelectedToCanvas("right") },
                  { label: "Arriba", icon: AlignVerticalJustifyStart, separatorBefore: true, onSelect: () => alignSelectedToCanvas("top") },
                  { label: "Medio", icon: AlignVerticalJustifyCenter, onSelect: () => alignSelectedToCanvas("middle") },
                  { label: "Abajo", icon: AlignVerticalJustifyEnd, onSelect: () => alignSelectedToCanvas("bottom") },
                ],
              },
              {
                id: "create-component",
                label: "Crear un componente",
                icon: Shapes,
                premium: true,
                disabled: !contextMenuActionById["create-component"].enabled,
                separatorBefore: true,
              },
              ...(contextMenuActionById.comment.visible ? [{
                id: "comment",
                label: "Comentar",
                icon: MessageCircle,
                shortcut: "⌥⌘N",
                disabled: !contextMenuActionById.comment.enabled,
                onSelect: () => setActiveTool("comments"),
              }] : []),
              {
                id: "lock",
                label: allSelectedLocked ? "Desbloquear" : "Bloquear",
                icon: Lock,
                shortcut: "⌥⇧L",
                disabled: !contextMenuActionById.lock.enabled,
                onSelect: toggleSelectedLocked,
              },
              ...(contextMenuActionById.link.visible ? [{
                id: "link",
                label: "Enlace",
                icon: Link2,
                shortcut: "⌘K",
                disabled: !contextMenuActionById.link.enabled,
                onSelect: () => openElementMetadataEditor("link"),
              }] : []),
              ...(contextMenuActionById.duration.visible ? [{
                id: "duration",
                label: "Mostrar la duración del elemento",
                icon: Clock,
                disabled: !contextMenuActionById.duration.enabled,
              }] : []),
              ...(contextMenuActionById["alt-text"].visible ? [{
                id: "alt-text",
                label: "Texto alternativo",
                icon: Accessibility,
                disabled: !contextMenuActionById["alt-text"].enabled,
                onSelect: () => openElementMetadataEditor("altText"),
              }] : []),
              ...(contextMenuActionById["magic-text"].visible ? [{
                id: "magic-text",
                label: "Texto Mágico",
                icon: WandSparkles,
                premium: true,
                separatorBefore: true,
                disabled: !contextMenuActionById["magic-text"].enabled,
              }] : []),
              ...(contextMenuActionById.translate.visible ? [{
                id: "translate",
                label: "Traducir el texto",
                icon: Languages,
                premium: true,
                disabled: !contextMenuActionById.translate.enabled,
              }] : []),
            ]}
          />
        ) : null}

        {elementMetadataEditor ? (
          <ElementMetadataDialog
            title={elementMetadataEditor.kind === "link" ? "Enlace del elemento" : "Texto alternativo"}
            description={
              elementMetadataEditor.kind === "link"
                ? "Abre esta URL cuando el diseño se publique en un formato interactivo."
                : "Describe el elemento para personas que usan tecnologías de asistencia."
            }
            label={elementMetadataEditor.kind === "link" ? "URL" : "Descripción"}
            multiline={elementMetadataEditor.kind === "altText"}
            value={elementMetadataEditor.value}
            onChange={(value) => setElementMetadataEditor((current) => current ? { ...current, value } : current)}
            onCancel={() => setElementMetadataEditor(null)}
            onSave={saveElementMetadata}
          />
        ) : null}

        {SHOW_INSPECTOR ? (
        <aside className="editor-inspector hidden border-l border-white/8 bg-[#121619] p-4 text-slate-100 xl:block">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white">Inspector</h2>
              <p className="text-xs text-slate-400">
                {hasMultiSelection
                  ? `${selectedElementIds.length} elementos seleccionados`
                  : selectedElement
                    ? `${readableType(selectedElement)} seleccionado`
                    : "Selecciona un elemento"}
              </p>
            </div>
            <div className="flex gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon-sm"
                    variant="outline"
                    aria-label="Duplicar"
                    onClick={duplicateSelected}
                    disabled={!hasSelection}
                  >
                    <Layers3 />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Duplicar</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon-sm"
                    variant="outline"
                    aria-label="Eliminar"
                    onClick={removeSelected}
                    disabled={!hasSelection}
                  >
                    <Trash2 />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Eliminar</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {hasMultiSelection ? (
            <div className="space-y-5">
              <div className="rounded-md border border-white/10 bg-[#181c20] p-4">
                <p className="text-sm font-semibold text-white">{selectedElementIds.length} capas seleccionadas</p>
                <p className="pt-1 text-xs text-slate-400">
                  {selectedElements.map((element) => element.name).join(", ")}
                </p>
              </div>

              <div className="space-y-3">
                <Label>Alinear seleccion</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { alignment: "left", icon: AlignHorizontalJustifyStart, label: "Alinear izquierda" },
                    { alignment: "center", icon: AlignHorizontalJustifyCenter, label: "Alinear centro" },
                    { alignment: "right", icon: AlignHorizontalJustifyEnd, label: "Alinear derecha" },
                    { alignment: "top", icon: AlignVerticalJustifyStart, label: "Alinear arriba" },
                    { alignment: "middle", icon: AlignVerticalJustifyCenter, label: "Alinear medio" },
                    { alignment: "bottom", icon: AlignVerticalJustifyEnd, label: "Alinear abajo" },
                  ].map((option) => {
                    const Icon = option.icon

                    return (
                      <Button
                        key={option.alignment}
                        size="icon-sm"
                        variant="outline"
                        aria-label={option.label}
                        onClick={() => alignSelectedToCanvas(option.alignment as ElementAlignment)}
                      >
                        <Icon />
                      </Button>
                    )
                  })}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={groupSelected} disabled={selectedElementIds.length < 2}>
                  <Layers3 data-icon="inline-start" />
                  Agrupar
                </Button>
                <Button variant="outline" onClick={ungroupSelected} disabled={!selectedElementsHaveGroup}>
                  <Layers3 data-icon="inline-start" />
                  Desagrupar
                </Button>
                <Button variant="outline" onClick={toggleSelectedLocked}>
                  <Lock data-icon="inline-start" />
                  {allSelectedLocked ? "Desbloquear" : "Bloquear"}
                </Button>
                <Button variant="outline" onClick={duplicateSelected}>
                  <BringToFront data-icon="inline-start" />
                  Duplicar
                </Button>
                <Button className="col-span-2" variant="destructive" onClick={removeSelected}>
                  <Trash2 data-icon="inline-start" />
                  Eliminar seleccion
                </Button>
              </div>
            </div>
          ) : selectedElement ? (
            <div className="space-y-5">
              {selectedTextElement ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="text-content">Texto</Label>
                    <Input
                      id="text-content"
                      value={editingText}
                      onChange={(event) => {
                        setEditingText(event.target.value)
                        updateSelected({ text: event.target.value })
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Fuente</Label>
                    <div className="editor-font-list max-h-44 overflow-y-auto rounded-lg border border-white/10 bg-[#0e1115] p-1">
                      {FONT_OPTIONS.map((fontFamily) => (
                        <button
                          key={fontFamily}
                          type="button"
                          className={`grid w-full grid-cols-[minmax(0,1fr)_72px] items-center gap-3 rounded-md px-2 py-2 text-left text-xs transition hover:bg-white/10 ${
                            selectedTextElement.fontFamily === fontFamily ? "bg-[#9cff6d]/15 text-[#dfffcf]" : "text-slate-300"
                          }`}
                          onClick={() => updateSelected({ fontFamily })}
                        >
                          <span className="truncate">{fontFamily}</span>
                          <span className="text-right text-lg text-slate-100" style={{ fontFamily }} aria-hidden="true">Aa</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="text-font-size">Tamano</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="text-font-size"
                        type="number"
                        min={1}
                        step={1}
                        value={selectedTextElement.fontSize}
                        className="w-20 text-right"
                        onChange={(event) => {
                          const fontSize = event.currentTarget.valueAsNumber

                          if (Number.isFinite(fontSize) && fontSize > 0) {
                            updateSelected({ fontSize })
                          }
                        }}
                      />
                      <span className="text-sm text-slate-400" aria-hidden="true">px</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Alineacion</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: "left", icon: AlignLeft, label: "Izquierda" },
                        { value: "center", icon: AlignCenter, label: "Centro" },
                        { value: "right", icon: AlignRight, label: "Derecha" },
                      ].map((option) => {
                        const Icon = option.icon

                        return (
                          <Button
                            key={option.value}
                            size="icon-sm"
	                            variant={selectedTextElement.align === option.value ? "default" : "outline"}
	                            className="w-full border-white/15 text-current"
	                            aria-label={option.label}
	                            onClick={() => updateSelectedTextStyle({ align: option.value as typeof selectedTextElement.align })}
                          >
                            <Icon />
                          </Button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Interlineado</Label>
	                      <span className="text-xs text-slate-400">{selectedTextElement.lineHeight.toFixed(2)}</span>
                    </div>
                    <Slider
	                      value={[selectedTextElement.lineHeight]}
                      min={0.7}
                      max={2.5}
                      step={0.05}
                      onValueChange={([lineHeight]) => updateSelectedTextStyle({ lineHeight })}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Espaciado</Label>
	                      <span className="text-xs text-slate-400">{Math.round(selectedTextElement.letterSpacing)}px</span>
                    </div>
                    <Slider
	                      value={[selectedTextElement.letterSpacing]}
                      min={-50}
                      max={200}
                      step={1}
                      onValueChange={([letterSpacing]) => updateSelectedTextStyle({ letterSpacing })}
                    />
                  </div>
	                </>
	              ) : null}

              {selectedImageElement ? (
                <>
                  <div className="space-y-3">
                    <Label>Mascara</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: "none", label: "Ninguna" },
                        { value: "rounded", label: "Bordes" },
                        { value: "circle", label: "Circulo" },
                      ].map((option) => (
                        <Button
                          key={option.value}
                          type="button"
                          variant={selectedImageElement.mask === option.value ? "default" : "outline"}
                          onClick={() => updateSelectedImageMask(option.value as ImageMask)}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Recorte X</Label>
                      <span className="text-xs text-slate-400">{Math.round(selectedImageElement.crop.x * 100)}%</span>
                    </div>
                    <Slider
                      value={[selectedImageElement.crop.x]}
                      min={0}
                      max={1}
                      step={0.01}
                      onValueChange={([x]) => updateSelectedImageCrop({ x })}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Recorte Y</Label>
                      <span className="text-xs text-slate-400">{Math.round(selectedImageElement.crop.y * 100)}%</span>
                    </div>
                    <Slider
                      value={[selectedImageElement.crop.y]}
                      min={0}
                      max={1}
                      step={0.01}
                      onValueChange={([y]) => updateSelectedImageCrop({ y })}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Ancho visible</Label>
                      <span className="text-xs text-slate-400">
                        {Math.round(selectedImageElement.crop.width * 100)}%
                      </span>
                    </div>
                    <Slider
                      value={[selectedImageElement.crop.width]}
                      min={0.05}
                      max={1}
                      step={0.01}
                      onValueChange={([width]) => updateSelectedImageCrop({ width })}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Alto visible</Label>
                      <span className="text-xs text-slate-400">
                        {Math.round(selectedImageElement.crop.height * 100)}%
                      </span>
                    </div>
                    <Slider
                      value={[selectedImageElement.crop.height]}
                      min={0.05}
                      max={1}
                      step={0.01}
                      onValueChange={([height]) => updateSelectedImageCrop({ height })}
                    />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => updateSelectedImageCrop(createDefaultImageCrop())}
                  >
                    <ImageIcon data-icon="inline-start" />
                    Restablecer recorte
                  </Button>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Brillo</Label>
                      <span className="text-xs text-slate-400">
                        {Math.round(selectedImageElement.filters.brightness * 100)}%
                      </span>
                    </div>
                    <Slider
                      value={[selectedImageElement.filters.brightness]}
                      min={-1}
                      max={1}
                      step={0.05}
                      onValueChange={([brightness]) => updateSelectedImageFilters({ brightness })}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Contraste</Label>
                      <span className="text-xs text-slate-400">
                        {Math.round(selectedImageElement.filters.contrast * 100)}%
                      </span>
                    </div>
                    <Slider
                      value={[selectedImageElement.filters.contrast]}
                      min={-1}
                      max={1}
                      step={0.05}
                      onValueChange={([contrast]) => updateSelectedImageFilters({ contrast })}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Saturacion</Label>
                      <span className="text-xs text-slate-400">
                        {Math.round(selectedImageElement.filters.saturation * 100)}%
                      </span>
                    </div>
                    <Slider
                      value={[selectedImageElement.filters.saturation]}
                      min={-1}
                      max={1}
                      step={0.05}
                      onValueChange={([saturation]) => updateSelectedImageFilters({ saturation })}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Desenfoque</Label>
                      <span className="text-xs text-slate-400">{Math.round(selectedImageElement.filters.blur)}px</span>
                    </div>
                    <Slider
                      value={[selectedImageElement.filters.blur]}
                      min={0}
                      max={80}
                      step={1}
                      onValueChange={([blur]) => updateSelectedImageFilters({ blur })}
                    />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => updateSelectedImageFilters(createDefaultImageFilters())}
                  >
                    <WandSparkles data-icon="inline-start" />
                    Restablecer filtros
                  </Button>
                </>
              ) : null}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="element-x">X</Label>
                  <Input
                    id="element-x"
                    type="number"
                    value={Math.round(selectedElement.x)}
                    onChange={(event) => updateSelected({ x: Number(event.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="element-y">Y</Label>
                  <Input
                    id="element-y"
                    type="number"
                    value={Math.round(selectedElement.y)}
                    onChange={(event) => updateSelected({ y: Number(event.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="element-width">Ancho</Label>
                  <Input
                    id="element-width"
                    type="number"
                    value={Math.round(selectedElement.width)}
                    onChange={(event) => updateSelected({ width: Number(event.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="element-height">Alto</Label>
                  <Input
                    id="element-height"
                    type="number"
                    value={Math.round(selectedElement.height)}
                    onChange={(event) => updateSelected({ height: Number(event.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Rotacion</Label>
	                  <span className="text-xs text-slate-400">{Math.round(selectedElement.rotation)} deg</span>
                </div>
                <Slider
                  value={[selectedElement.rotation]}
                  min={-180}
                  max={180}
                  step={1}
                  onValueChange={([rotation]) => updateSelected({ rotation })}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Opacidad</Label>
	                  <span className="text-xs text-slate-400">{Math.round(selectedElement.opacity * 100)}%</span>
                </div>
                <Slider
                  value={[selectedElement.opacity]}
                  min={0.1}
                  max={1}
                  step={0.05}
                  onValueChange={([opacity]) => updateSelected({ opacity })}
                />
              </div>

              {selectedElement.type === "shape" || selectedElement.type === "text" ? (
                <div className="space-y-3">
                  <Label>Color</Label>
                  <div className="grid grid-cols-7 gap-2">
                    {colorSwatches.map((color) => (
                      <button
                        key={color}
                        type="button"
	                        className="size-7 rounded-full border border-white/20"
                        style={{ backgroundColor: color }}
                        aria-label={`Usar color ${color}`}
                        onClick={() => updateSelected({ fill: color })}
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              <Separator />

              <div className="grid grid-cols-2 gap-2">
                <Button className="border-white/20 bg-white/10 text-slate-100 hover:bg-white/20 hover:text-white" variant="outline" onClick={duplicateSelected}>
                  <BringToFront data-icon="inline-start" />
                  Duplicar
                </Button>
                <Button variant="destructive" onClick={removeSelected}>
                  <Trash2 data-icon="inline-start" />
                  Eliminar
                </Button>
              </div>
            </div>
          ) : (
	            <div className="rounded-md border border-dashed border-white/15 bg-[#181c20] p-4 text-sm leading-6 text-slate-400">
              Haz click en cualquier imagen, texto o forma para ver sus controladores y propiedades.
            </div>
          )}
        </aside>
        ) : null}
      </div>
    </main>
  )
}

function ConvexBackedApp() {
  const convex = useConvex()
  const projectRecords = useQuery(api.projects.list) as ProjectRecord[] | undefined
  const assetRecords = useQuery(api.assets.list) as AssetRecord[] | undefined
  const [activeVersionProjectId, setActiveVersionProjectId] = useState<string | null>(null)
  const [activeShareProjectId, setActiveShareProjectId] = useState<string | null>(null)
  const [activePresenceProjectId, setActivePresenceProjectId] = useState<string | null>(null)
  const versionRecords = useQuery(
    api.projectVersions.list,
    activeVersionProjectId ? { projectId: activeVersionProjectId as Id<"projects"> } : "skip",
  ) as ProjectVersionRecord[] | undefined
  const shareRecords = useQuery(
    api.projectShares.list,
    activeShareProjectId ? { projectId: activeShareProjectId as Id<"projects"> } : "skip",
  ) as ProjectShareRecord[] | undefined
  const presenceRecords = useQuery(
    api.projectPresence.list,
    activePresenceProjectId ? { projectId: activePresenceProjectId as Id<"projects"> } : "skip",
  ) as PresenceRecord[] | undefined
  const sharedTemplateRecords = useQuery(api.sharedTemplates.list) as
    | (Omit<SharedTemplateSummary, "id"> & { _id: string })[]
    | undefined
  const createProject = useMutation(api.projects.create)
  const updateProject = useMutation(api.projects.updateCanvas)
  const generateAssetUploadUrl = useMutation(api.assets.generateUploadUrl)
  const saveAsset = useMutation(api.assets.save)
  const createComment = useMutation(api.comments.create)
  const createProjectVersion = useMutation(api.projectVersions.create)
  const createProjectShare = useMutation(api.projectShares.create)
  const revokeProjectShare = useMutation(api.projectShares.revoke)
  const heartbeatProjectPresence = useMutation(api.projectPresence.heartbeat)
  const leaveProjectPresence = useMutation(api.projectPresence.leave)
  const createSharedTemplate = useMutation(api.sharedTemplates.create)

  const projects = useMemo(
    () => (projectRecords ?? []).map((project) => summarizeProjectRecord(project)),
    [projectRecords],
  )
  const assets = useMemo(
    () =>
      (assetRecords ?? [])
        .map((asset) => summarizeAssetRecord(asset))
        .filter((asset): asset is LibraryAsset => Boolean(asset)),
    [assetRecords],
  )
  const sharedTemplates = useMemo<SharedTemplateSummary[]>(
    () =>
      (sharedTemplateRecords ?? []).map((template) => ({
        id: template._id,
        name: template.name,
        description: template.description,
        authorName: template.authorName,
        pageCount: template.pageCount,
        elementCount: template.elementCount,
        createdAt: template.createdAt,
      })),
    [sharedTemplateRecords],
  )
  const versions = useMemo(
    () => (versionRecords ?? []).map((version) => summarizeProjectVersionRecord(version)),
    [versionRecords],
  )
  const shareOrigin = typeof window === "undefined" ? "" : window.location.origin
  const shares = useMemo(
    () => (shareRecords ?? []).map((share) => summarizeProjectShareRecord(share, shareOrigin)),
    [shareOrigin, shareRecords],
  )
  const presenceClientId = useMemo(() => createPresenceClientId(createId), [])
  const presenceColor = useMemo(() => PRESENCE_COLORS[Math.floor(Math.random() * PRESENCE_COLORS.length)], [])
  const collaborators = useMemo(
    () =>
      listActiveCollaborators(presenceRecords ?? [], {
        currentClientId: presenceClientId,
      }),
    [presenceClientId, presenceRecords],
  )

  const saveProject = useCallback(
    async (projectId: string | null, document: EditorDocument) => {
      const payload = createProjectSavePayload(document)

      if (projectId) {
        await updateProject({
          id: projectId as Id<"projects">,
          ...payload,
        })

        return projectId
      }

      return (await createProject(payload)) as string
    },
    [createProject, updateProject],
  )

  const loadProject = useCallback(
    async (projectId: string) => {
      const project = (await convex.query(api.projects.get, {
        id: projectId as Id<"projects">,
      })) as ProjectRecord | null

      return project && isEditorDocument(project.canvas) ? project.canvas : null
    },
    [convex],
  )

  const persistence = useMemo<ProjectPersistence>(
    () => ({
      isEnabled: true,
      isLoading: projectRecords === undefined,
      projects,
      saveProject,
      loadProject,
    }),
    [loadProject, projectRecords, projects, saveProject],
  )

  const versionPersistence = useMemo<ProjectVersionPersistence>(
    () => ({
      isEnabled: true,
      isLoading: activeVersionProjectId !== null && versionRecords === undefined,
      versions,
      selectProject: setActiveVersionProjectId,
      saveVersion: async (draft) => {
        await createProjectVersion({
          projectId: draft.projectId as Id<"projects">,
          label: draft.label,
          canvas: draft.canvas,
        })
        setActiveVersionProjectId(draft.projectId)
      },
      loadVersion: async (versionId) => {
        return (await convex.query(api.projectVersions.get, {
          id: versionId as Id<"projectVersions">,
        })) as ProjectVersionRecord | null
      },
    }),
    [activeVersionProjectId, convex, createProjectVersion, versionRecords, versions],
  )

  const uploadAsset = useCallback(
    async (file: File) => {
      const uploadUrl = await generateAssetUploadUrl()
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: file.type ? { "Content-Type": file.type } : undefined,
        body: file,
      })

      if (!response.ok) {
        throw new Error("No se pudo subir la imagen a Convex Storage")
      }

      const { storageId } = (await response.json()) as { storageId: string }
      const assetId = (await saveAsset({
        name: normalizeAssetName(file.name),
        storageId: storageId as Id<"_storage">,
        contentType: file.type || undefined,
        size: file.size,
      })) as string
      const assetRecord = (await convex.query(api.assets.get, {
        id: assetId as Id<"assets">,
      })) as AssetRecord | null
      const asset = assetRecord ? summarizeAssetRecord(assetRecord) : null

      if (!asset) {
        throw new Error("No se pudo cargar la imagen guardada")
      }

      return asset
    },
    [convex, generateAssetUploadUrl, saveAsset],
  )

  const assetPersistence = useMemo<AssetPersistence>(
    () => ({
      isEnabled: true,
      isLoading: assetRecords === undefined,
      assets,
      uploadAsset,
    }),
    [assetRecords, assets, uploadAsset],
  )

  const commentPersistence = useMemo<CommentPersistence>(
    () => ({
      isEnabled: true,
      listComments: async (projectId) => {
        const records = (await convex.query(api.comments.list, {
          projectId: projectId as Id<"projects">,
        })) as CommentRecord[]

        return records.map((record) => summarizeCommentRecord(record))
      },
      createComment: async (projectId, comment) => {
        await createComment({
          projectId: projectId as Id<"projects">,
          body: comment.body,
          authorName: comment.authorName,
          pageId: comment.pageId,
          elementId: comment.elementId,
        })
      },
    }),
    [convex, createComment],
  )

  const sharePersistence = useMemo<SharePersistence>(
    () => ({
      isEnabled: true,
      isLoading: activeShareProjectId !== null && shareRecords === undefined,
      shares,
      selectProject: setActiveShareProjectId,
      createShare: async (draft) => {
        await createProjectShare({
          projectId: draft.projectId as Id<"projects">,
          access: draft.access,
          token: draft.token,
        })
        setActiveShareProjectId(draft.projectId)
      },
      revokeShare: async (shareId) => {
        await revokeProjectShare({
          id: shareId as Id<"projectShares">,
        })
      },
    }),
    [activeShareProjectId, createProjectShare, revokeProjectShare, shareRecords, shares],
  )

  const heartbeatPresence = useCallback(
    async (projectId: string, draft: PresenceDraft) => {
      await heartbeatProjectPresence({
        projectId: projectId as Id<"projects">,
        clientId: draft.clientId,
        displayName: draft.displayName,
        color: draft.color,
        pageId: draft.pageId,
        selectedElementName: draft.selectedElementName,
      })
    },
    [heartbeatProjectPresence],
  )

  const leavePresence = useCallback(
    async (projectId: string, clientId: string) => {
      await leaveProjectPresence({
        projectId: projectId as Id<"projects">,
        clientId,
      })
    },
    [leaveProjectPresence],
  )

  const presencePersistence = useMemo<PresencePersistence>(
    () => ({
      isEnabled: true,
      isLoading: activePresenceProjectId !== null && presenceRecords === undefined,
      clientId: presenceClientId,
      color: presenceColor,
      collaborators,
      selectProject: setActivePresenceProjectId,
      heartbeat: heartbeatPresence,
      leave: leavePresence,
    }),
    [
      activePresenceProjectId,
      collaborators,
      heartbeatPresence,
      leavePresence,
      presenceClientId,
      presenceColor,
      presenceRecords,
    ],
  )

  const publishTemplate = useCallback(
    async (draft: ReturnType<typeof createSharedTemplateDraft>) => {
      await createSharedTemplate({
        name: draft.name,
        description: draft.description,
        authorName: draft.authorName,
        canvas: draft.canvas,
      })
    },
    [createSharedTemplate],
  )

  const loadSharedTemplate = useCallback(
    async (templateId: string) => {
      const template = (await convex.query(api.sharedTemplates.get, {
        id: templateId as Id<"sharedTemplates">,
      })) as (Omit<SharedTemplateRecord, "id"> & { _id: string }) | null

      return template
        ? {
            id: template._id,
            name: template.name,
            description: template.description,
            authorName: template.authorName,
            canvas: template.canvas,
            pageCount: template.pageCount,
            elementCount: template.elementCount,
            createdAt: template.createdAt,
          }
        : null
    },
    [convex],
  )

  const sharedTemplatePersistence = useMemo<SharedTemplatePersistence>(
    () => ({
      isEnabled: true,
      isLoading: sharedTemplateRecords === undefined,
      templates: sharedTemplates,
      publishTemplate,
      loadTemplate: loadSharedTemplate,
    }),
    [loadSharedTemplate, publishTemplate, sharedTemplateRecords, sharedTemplates],
  )

  return (
    <EditorApp
      persistence={persistence}
      versionPersistence={versionPersistence}
      assetPersistence={assetPersistence}
      commentPersistence={commentPersistence}
      sharePersistence={sharePersistence}
      presencePersistence={presencePersistence}
      sharedTemplatePersistence={sharedTemplatePersistence}
    />
  )
}

function App() {
  const shareToken = typeof window === "undefined" ? null : getShareTokenFromPath(window.location.pathname)

  if (shareToken) {
    if (!import.meta.env.VITE_CONVEX_URL) {
      return (
        <main className="grid min-h-screen place-items-center bg-[#0d0e14] p-6 text-slate-100">
          <div className="rounded-md border border-white/10 bg-[#121619] p-5 text-sm text-slate-300">
            Convex no esta conectado.
          </div>
        </main>
      )
    }

    return <SharedProjectRoute token={shareToken} />
  }

  if (import.meta.env.VITE_CONVEX_URL) {
    return <ConvexBackedApp />
  }

  return (
    <EditorApp
      persistence={localProjectPersistence}
      versionPersistence={localProjectVersionPersistence}
      assetPersistence={localAssetPersistence}
      commentPersistence={localCommentPersistence}
      sharePersistence={localSharePersistence}
      presencePersistence={localPresencePersistence}
      sharedTemplatePersistence={localSharedTemplatePersistence}
    />
  )
}

export default App
