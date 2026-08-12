import { ChevronLeft, ChevronRight, Mic, Plus, Search } from "lucide-react"
import { useId, useMemo, useState, type CSSProperties, type DragEvent, type FormEvent, type ReactNode } from "react"

import {
  SHAPE_CATEGORIES,
  SHAPE_DRAG_MIME,
  SHAPE_OPTIONS,
  getShapeRenderDescriptor,
  listRecentShapes,
  searchShapes,
  type PathCommand,
  type ShapeCatalogItem,
  type ShapeRenderDescriptor,
} from "@/editor/shapes"
import { cn } from "@/lib/utils"

/**
 * The panel owns interaction state only. Shape geometry and catalog metadata
 * stay in `src/editor/shapes.ts`; adding a shape is delegated to the editor.
 */
export type ShapesPanelProps = {
  recentShapeTypes?: readonly string[]
  recentItems?: readonly ShapeCatalogItem[]
  items?: readonly ShapeCatalogItem[]
  onAddShape: (item: ShapeCatalogItem) => void
  onBack?: () => void
  onGenerate?: (prompt: string) => void
  onSearch?: (query: string) => void
  generateDisabled?: boolean
  className?: string
}

const panelSurface = "var(--shapes-surface, var(--vacan-background, #1e1f26))"
const panelForeground = "var(--shapes-foreground, var(--vacan-foreground, #f6f7ef))"
const panelAccent = "var(--shapes-accent, var(--vacan-accent, #7434d5))"
const panelMuted = "color-mix(in srgb, var(--shapes-foreground, var(--vacan-foreground, #f6f7ef)) 68%, transparent)"
const panelBorder = "color-mix(in srgb, var(--shapes-foreground, var(--vacan-foreground, #f6f7ef)) 22%, transparent)"
const panelSubsurface = "color-mix(in srgb, var(--shapes-foreground, var(--vacan-foreground, #f6f7ef)) 8%, var(--shapes-surface, var(--vacan-background, #1e1f26)))"

function assertNever(value: never): never {
  throw new Error(`Unsupported shape preview command: ${String(value)}`)
}

function regularPolygonPoints(sides: number, radius: number, center: number, rotation = 0) {
  return Array.from({ length: Math.max(3, sides) }, (_, index) => {
    const angle = -Math.PI / 2 + rotation + (index * Math.PI * 2) / Math.max(3, sides)
    return `${center + Math.cos(angle) * radius},${center + Math.sin(angle) * radius}`
  }).join(" ")
}

function starPoints(points: number, innerRadiusRatio: number, center: number, rotation = 0) {
  const count = Math.max(2, points) * 2
  return Array.from({ length: count }, (_, index) => {
    const angle = -Math.PI / 2 + rotation + (index * Math.PI) / Math.max(2, points)
    const radius = index % 2 === 0 ? center - 5 : (center - 5) * innerRadiusRatio
    return `${center + Math.cos(angle) * radius},${center + Math.sin(angle) * radius}`
  }).join(" ")
}

function pathFromCommands(commands: readonly PathCommand[]) {
  return commands.map((command) => {
    switch (command.command) {
      case "M":
        return `M ${8 + command.x * 40} ${8 + command.y * 40}`
      case "L":
        return `L ${8 + command.x * 40} ${8 + command.y * 40}`
      case "C":
        return `C ${8 + command.controlX1 * 40} ${8 + command.controlY1 * 40} ${8 + command.controlX2 * 40} ${8 + command.controlY2 * 40} ${8 + command.x * 40} ${8 + command.y * 40}`
      case "Q":
        return `Q ${8 + command.controlX * 40} ${8 + command.controlY * 40} ${8 + command.x * 40} ${8 + command.y * 40}`
      case "Z":
        return "Z"
      default:
        return assertNever(command)
    }
  }).join(" ")
}

function ShapePreview({ item }: { item: ShapeCatalogItem }) {
  const descriptor: ShapeRenderDescriptor = getShapeRenderDescriptor(item.type)
  const stroke = "currentColor"
  const common = {
    fill: descriptor.kind === "line" || descriptor.kind === "arrow" ? "none" : "currentColor",
    stroke,
    strokeWidth: 2.25,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  }
  let shape: ReactNode

  if (descriptor.kind === "line" || descriptor.kind === "arrow") {
    const [startX, startY, endX, endY] = descriptor.points
    const x1 = 8 + startX * 40
    const y1 = 8 + startY * 40
    const x2 = 8 + endX * 40
    const y2 = 8 + endY * 40
    const startPointer = descriptor.kind === "arrow" && descriptor.startPointer
    const endPointer = descriptor.kind === "arrow" && descriptor.endPointer
    const angle = Math.atan2(y2 - y1, x2 - x1)
    const arrow = (x: number, y: number, direction: number) => {
      const size = 5
      const tip = `${x},${y}`
      const left = `${x - Math.cos(angle + direction * Math.PI * 0.75) * size},${y - Math.sin(angle + direction * Math.PI * 0.75) * size}`
      const right = `${x - Math.cos(angle + direction * Math.PI * 1.25) * size},${y - Math.sin(angle + direction * Math.PI * 1.25) * size}`
      return <polygon key={`${x}-${y}-${direction}`} points={`${tip} ${left} ${right}`} fill="currentColor" />
    }

    shape = (
      <>
        <line x1={x1} y1={y1} x2={x2} y2={y2} {...common} strokeDasharray={descriptor.dashed ? "5 4" : undefined} />
        {startPointer ? arrow(x1, y1, -1) : null}
        {endPointer ? arrow(x2, y2, 1) : null}
      </>
    )
  } else if (descriptor.kind === "polygon") {
    shape = <polygon points={regularPolygonPoints(descriptor.sides, 20, 28, descriptor.rotation)} {...common} />
  } else if (descriptor.kind === "star") {
    shape = <polygon points={starPoints(descriptor.points, descriptor.innerRadiusRatio, 28, descriptor.rotation)} {...common} />
  } else {
    shape = <path d={pathFromCommands(descriptor.commands)} {...common} />
  }

  return (
    <svg className="shapes-panel__preview" viewBox="0 0 56 56" aria-hidden="true" focusable="false">
      {shape}
    </svg>
  )
}

function ShapeTile({
  item,
  isOverflow,
  onOverflow,
  onAddShape,
}: {
  item: ShapeCatalogItem
  isOverflow?: boolean
  onOverflow?: () => void
  onAddShape: (item: ShapeCatalogItem) => void
}) {
  const handleDragStart = (event: DragEvent<HTMLButtonElement>) => {
    event.dataTransfer.effectAllowed = "copy"
    event.dataTransfer.setData(SHAPE_DRAG_MIME, item.type)
  }

  return (
    <button
      type="button"
      draggable
      className="shapes-panel__tile group relative grid size-14 shrink-0 place-items-center rounded-md border text-foreground transition-colors hover:border-[var(--shapes-accent)] focus-visible:border-[var(--shapes-accent)] focus-visible:outline-2 focus-visible:outline-[var(--shapes-accent)] disabled:cursor-not-allowed"
      style={{ borderColor: panelBorder, backgroundColor: panelSubsurface, color: panelForeground }}
      aria-label={isOverflow ? "Ver todas las formas" : `Agregar ${item.label}`}
      aria-expanded={isOverflow ? false : undefined}
      title={item.label}
      onClick={() => isOverflow && onOverflow ? onOverflow() : onAddShape(item)}
      onDragStart={handleDragStart}
    >
      <ShapePreview item={item} />
      {isOverflow ? (
        <span
          className="shapes-panel__tile-overflow absolute inset-0 grid place-items-center rounded-md"
          style={{ backgroundColor: `color-mix(in srgb, ${panelSurface} 78%, transparent)`, color: panelForeground }}
          aria-hidden="true"
        >
          <ChevronRight className="size-5" />
        </span>
      ) : null}
    </button>
  )
}

function ShapeSection({
  category,
  items,
  expanded,
  onToggle,
  onAddShape,
  showViewAll = true,
}: {
  category: (typeof SHAPE_CATEGORIES)[number]
  items: readonly ShapeCatalogItem[]
  expanded: boolean
  onToggle: () => void
  onAddShape: (item: ShapeCatalogItem) => void
  showViewAll?: boolean
}) {
  if (items.length === 0) {
    return null
  }

  const visibleItems = expanded || category.isDynamic || !showViewAll ? items : items.slice(0, 5)
  const hasViewAll = !category.isDynamic && showViewAll

  return (
    <section className="shapes-panel__section space-y-3" aria-labelledby={`shapes-section-${category.id}`}>
      <div className="flex items-center justify-between gap-3">
        <h2 id={`shapes-section-${category.id}`} className="min-w-0 truncate text-sm font-semibold" style={{ color: panelForeground }}>
          {category.label}
        </h2>
        {hasViewAll ? (
          <button
            type="button"
            className="shapes-panel__view-all shrink-0 rounded-sm px-1 text-xs font-medium underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-[var(--shapes-accent)]"
            style={{ color: panelForeground }}
            aria-expanded={expanded}
            aria-controls={`shapes-grid-${category.id}`}
            onClick={onToggle}
          >
            {expanded ? "Ver menos" : "Ver todo"}
          </button>
        ) : null}
      </div>
      <div id={`shapes-grid-${category.id}`} className="shapes-panel__grid flex flex-wrap gap-2" role="list">
        {visibleItems.map((item, index) => (
          <div key={item.type} role="listitem">
            <ShapeTile
              item={item}
              isOverflow={!expanded && showViewAll && index === 4}
              onOverflow={onToggle}
              onAddShape={onAddShape}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

export function ShapesPanel({
  recentShapeTypes = [],
  recentItems,
  items = SHAPE_OPTIONS,
  onAddShape,
  onBack,
  onGenerate,
  onSearch,
  generateDisabled = false,
  className,
}: ShapesPanelProps) {
  const formId = useId()
  const inputId = useId()
  const [query, setQuery] = useState("")
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null)
  const [liveMessage, setLiveMessage] = useState("")
  const [liveMessageId, setLiveMessageId] = useState(0)
  const recent = recentItems ?? listRecentShapes(recentShapeTypes, 5)
  const matchingItems = useMemo(
    () => (query.trim() ? searchShapes(query, items) : items),
    [items, query],
  )
  const categories = useMemo(
    () => SHAPE_CATEGORIES.map((category) => ({
      category,
      items: category.isDynamic
        ? (query.trim()
          ? recent.filter((item) => matchingItems.some((match) => match.type === item.type))
          : recent)
        : matchingItems.filter((item) => item.category === category.id),
    })),
    [matchingItems, query, recent],
  )
  const hasResults = categories.some(({ items: categoryItems }) => categoryItems.length > 0)

  const submitSearch = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    onSearch?.(query.trim())
  }

  const handleAddShape = (item: ShapeCatalogItem) => {
    onAddShape(item)
    setLiveMessage(`Se agregó ${item.label}`)
    setLiveMessageId((current) => current + 1)
  }

  return (
    <section
      className={cn("shapes-panel flex min-h-0 flex-col", className)}
      style={{
        backgroundColor: panelSurface,
        color: panelForeground,
        "--shapes-accent": "var(--vacan-accent, #7434d5)",
        "--shapes-surface": "var(--vacan-background, #1e1f26)",
        "--shapes-foreground": "var(--vacan-foreground, #f6f7ef)",
      } as CSSProperties}
      aria-label="Formas"
    >
      <header className="shapes-panel__header shrink-0 space-y-4">
        <div className="flex h-5 items-center gap-3">
          <button
            type="button"
            className="grid size-7 place-items-center rounded-md focus-visible:outline-2 focus-visible:outline-[var(--shapes-accent)] disabled:opacity-50"
            style={{ color: panelForeground }}
            aria-label="Volver"
            disabled={!onBack}
            onClick={onBack}
          >
            <ChevronLeft className="size-5" />
          </button>
          <h1 className="text-base font-semibold">Formas</h1>
        </div>

        <form id={formId} className="shapes-panel__prompt relative" onSubmit={submitSearch}>
          <label htmlFor={inputId} className="sr-only">Describe tu elemento ideal</label>
          <Plus className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2" style={{ color: panelForeground }} />
          <input
            id={inputId}
            className="h-[59px] w-full rounded-2xl border bg-transparent pl-12 pr-12 text-sm outline-none placeholder:opacity-60 focus-visible:ring-2"
            style={{ borderColor: panelAccent, color: panelForeground, outlineColor: panelAccent }}
            value={query}
            placeholder="Describe tu elemento ideal"
            onChange={(event) => {
              const nextQuery = event.target.value
              setQuery(nextQuery)
              if (!nextQuery.trim()) {
                onSearch?.("")
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault()
                setQuery("")
                onSearch?.("")
              }
            }}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-md focus-visible:outline-2 focus-visible:outline-[var(--shapes-accent)]"
            style={{ color: panelForeground }}
            aria-label="Usar dictado por voz"
            disabled
          >
            <Mic className="size-5" />
          </button>
        </form>

        <div className="shapes-panel__actions grid grid-cols-2 gap-2">
          <button
            type="button"
            className="flex h-10 items-center justify-center gap-2 rounded-xl border text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            style={{ borderColor: panelBorder, backgroundColor: panelSubsurface, color: panelForeground }}
            disabled={generateDisabled || !onGenerate || query.trim().length === 0}
            onClick={() => {
              if (onGenerate && query.trim()) {
                onGenerate(query.trim())
              }
            }}
          >
            <Plus className="size-4" />
            Generar
          </button>
          <button
            type="submit"
            form={formId}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            style={{ borderColor: panelAccent, backgroundColor: panelAccent, color: "var(--vacan-foreground, #ffffff)" }}
          >
            <Search className="size-4" />
            Buscar
          </button>
        </div>
      </header>

      <div className="shapes-panel__catalog min-h-0 flex-1 overflow-y-auto overscroll-contain py-5" tabIndex={0}>
        {!hasResults ? (
          <p className="rounded-md border p-4 text-sm" style={{ borderColor: panelBorder, color: panelMuted }} role="status">
            No encontramos formas para esa búsqueda.
          </p>
        ) : null}
        <div className="space-y-7">
          {categories.map(({ category, items: categoryItems }) => (
            <ShapeSection
              key={category.id}
              category={category}
              items={categoryItems}
              expanded={expandedCategoryId === category.id}
              showViewAll={!query.trim()}
              onToggle={() => setExpandedCategoryId((current) => current === category.id ? null : category.id)}
              onAddShape={handleAddShape}
            />
          ))}
        </div>
        <div key={liveMessageId} className="sr-only" aria-live="polite">{liveMessage}</div>
      </div>
    </section>
  )
}
