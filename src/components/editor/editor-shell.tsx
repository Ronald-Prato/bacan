import type { ReactNode, Ref } from "react"
import { Home, MessageCircle, PenLine, Share2, type LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export type EditorToolItem<TToolId extends string> = {
  id: TToolId
  label: string
  shortLabel?: string
  icon: LucideIcon
}

type EditorTopBarProps = {
  autosaveLabel: string
  canSave: boolean
  canShare: boolean
  documentName: string
  onComments: () => void
  onDocumentNameChange: (name: string) => void
  onHome: () => void
  onResize: () => void
  onSave: () => void
  onShare: () => void
}

export function EditorTopBar({
  autosaveLabel,
  canSave,
  canShare,
  documentName,
  onComments,
  onDocumentNameChange,
  onHome,
  onResize,
  onSave,
  onShare,
}: EditorTopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-white/8 bg-[#101316] px-3 text-[#f6f7ef] shadow-[0_1px_0_rgba(255,255,255,0.04),0_14px_42px_rgba(0,0,0,0.2)]">
      <div className="flex min-w-0 items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon-lg"
              variant="ghost"
              className="text-[#dce3d7] hover:bg-[#1a2020] hover:text-white"
              aria-label="Inicio"
              onClick={onHome}
            >
              <Home />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Inicio</TooltipContent>
        </Tooltip>
        <Button variant="ghost" className="hidden text-[#dce3d7] hover:bg-[#1a2020] hover:text-white sm:inline-flex">
          Archivo
        </Button>
        <Button
          variant="ghost"
          className="hidden text-[#dce3d7] hover:bg-[#1a2020] hover:text-white sm:inline-flex"
          onClick={onSave}
          disabled={!canSave}
        >
          Guardar
        </Button>
        <Button
          variant="ghost"
          className="hidden text-[#dce3d7] hover:bg-[#1a2020] hover:text-white sm:inline-flex"
          onClick={onResize}
        >
          Redimensionar
        </Button>
        <Button variant="ghost" className="hidden text-[#dce3d7] hover:bg-[#1a2020] hover:text-white md:inline-flex">
          <PenLine data-icon="inline-start" />
          Editar
        </Button>
        <Badge className="hidden border-[#9cff6d]/25 bg-[#9cff6d]/10 text-[#d8ffba] sm:inline-flex">
          {autosaveLabel}
        </Badge>
      </div>

      <div className="flex min-w-0 flex-1 justify-center">
        <Input
          value={documentName}
          onChange={(event) => onDocumentNameChange(event.target.value)}
          className="h-9 max-w-[380px] rounded-md border-white/8 bg-[#171b1e] text-center text-sm font-semibold text-[#f6f7ef] shadow-inner shadow-black/20 placeholder:text-white/40 focus-visible:border-[#9cff6d]/60 focus-visible:ring-[#9cff6d]/20"
          aria-label="Nombre del diseno"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button className="hidden border border-[#9cff6d]/20 bg-[#9cff6d]/10 text-[#d8ffba] hover:bg-[#9cff6d]/16 md:inline-flex" size="sm">
          Sube de categoria
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon-lg"
              variant="ghost"
              className="text-[#dce3d7] hover:bg-[#1a2020] hover:text-white"
              aria-label="Comentarios"
              onClick={onComments}
            >
              <MessageCircle />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Comentarios</TooltipContent>
        </Tooltip>
        <Button
          className="bg-[#dfffcf] text-[#09100d] shadow-[0_10px_24px_rgba(156,255,109,0.18)] hover:bg-[#c8ffad]"
          onClick={onShare}
          disabled={!canShare}
        >
          <Share2 data-icon="inline-start" />
          Compartir
        </Button>
      </div>
    </header>
  )
}

type EditorToolRailProps<TToolId extends string> = {
  activeTool: TToolId
  onSelectTool: (toolId: TToolId) => void
  tools: EditorToolItem<TToolId>[]
}

export function EditorToolRail<TToolId extends string>({
  activeTool,
  onSelectTool,
  tools,
}: EditorToolRailProps<TToolId>) {
  return (
    <aside className="relative z-20 border-r border-white/8 bg-[#0b0e10] py-3 shadow-[10px_0_34px_rgba(0,0,0,0.2)]">
      <nav className="flex flex-col items-center gap-1 px-2">
        {tools.map((tool) => {
          const Icon = tool.icon
          const isActive = activeTool === tool.id

          return (
            <button
              key={tool.id}
              type="button"
              className={cn(
                "group relative flex h-[72px] w-full flex-col items-center justify-center gap-1 rounded-md px-1 text-[10.5px] font-bold transition",
                isActive
                  ? "bg-[#171d1c] text-white shadow-[inset_3px_0_0_#9cff6d]"
                  : "text-[#87928e] hover:bg-[#121719] hover:text-[#f6f7ef]",
              )}
              onClick={() => onSelectTool(tool.id)}
            >
              <span
                className={cn(
                  "grid size-8 place-items-center rounded-md transition",
                  isActive ? "bg-[#9cff6d]/13 text-[#9cff6d]" : "text-[#9aa5a1] group-hover:text-[#dfffcf]",
                )}
              >
                <Icon className="size-5" />
              </span>
              <span className="w-full truncate px-1 text-center leading-tight">{tool.shortLabel ?? tool.label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

type EditorContextSidebarProps = {
  badgeLabel?: string
  children: ReactNode
  title: string
}

export function EditorContextSidebar({ badgeLabel, children, title }: EditorContextSidebarProps) {
  return (
    <aside className="hidden overflow-y-auto border-r border-white/8 bg-[#121619] p-4 shadow-[18px_0_46px_rgba(0,0,0,0.26)] lg:block">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9cff6d]">Panel</p>
          <h2 className="text-sm font-bold text-[#f6f7ef]">{title}</h2>
        </div>
        {badgeLabel ? (
          <Badge className="border-white/10 bg-white/[0.06] text-[#cfd7d2]">{badgeLabel}</Badge>
        ) : null}
      </div>
      <div className="space-y-4">{children}</div>
    </aside>
  )
}

type EditorWorkspaceProps = {
  children: ReactNode
  footer: ReactNode
  stats: string[]
  toolbarActions: ReactNode
  toolbarLeading?: ReactNode
  viewportRef?: Ref<HTMLDivElement>
}

export function EditorWorkspace({
  children,
  footer,
  stats,
  toolbarActions,
  toolbarLeading,
  viewportRef,
}: EditorWorkspaceProps) {
  return (
    <section className="flex min-w-0 flex-col bg-[#0d1012]">
      <div className="flex h-12 items-center justify-between border-b border-white/8 bg-[#101417] px-4">
        <div className="flex min-w-0 items-center gap-3 text-xs font-semibold text-[#8e9995]">
          {stats.map((stat) => (
            <span key={stat} className="whitespace-nowrap">{stat}</span>
          ))}
        </div>
        <div className="flex items-center gap-1 text-[#cfd7d2]">
          {toolbarLeading}
          {toolbarActions}
        </div>
      </div>

      <div
        ref={viewportRef}
        className="relative flex flex-1 justify-center overflow-auto bg-[radial-gradient(circle_at_30%_0%,rgba(156,255,109,0.08),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.025)_0_1px,transparent_1px)] bg-[length:auto,24px_24px] px-4 py-8"
      >
        {children}
      </div>
      {footer}
    </section>
  )
}

type EditorFooterProps = {
  activePageLabel: string
  zoomLabel: string
}

export function EditorFooter({ activePageLabel, zoomLabel }: EditorFooterProps) {
  return (
    <footer className="flex h-14 items-center justify-between border-t border-white/8 bg-[#101417] px-5 text-sm font-bold text-[#8e9995]">
      <div className="flex items-center gap-5">
        <span>Notas</span>
        <span>Temporizador</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden h-1 w-44 rounded-full bg-white/12 md:block">
          <div className="h-full w-[61%] rounded-full bg-[#9cff6d]" />
        </div>
        <span>{zoomLabel}</span>
        <span>Paginas</span>
        <span>{activePageLabel}</span>
      </div>
    </footer>
  )
}
