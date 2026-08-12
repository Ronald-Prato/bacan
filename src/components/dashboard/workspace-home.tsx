import { useMemo, useState, type ReactNode } from "react"
import { ArrowUpRight, Check, Moon, Plus, Sun, X } from "lucide-react"

import { formatRecentProjectUpdate } from "@/editor/dashboard"
import type { SavedProject } from "@/editor/projects"
import {
  DESIGN_FORMATS,
  resolveCustomDesignSize,
  type CustomDesignSize,
  type CustomDesignUnit,
  type DesignFormatId,
} from "@/editor/templates"
import { cn } from "@/lib/utils"

type WorkspaceHomeProps = {
  accountMenu?: ReactNode
  isLoading: boolean
  recentProjects: SavedProject[]
  theme: "light" | "dark"
  onThemeChange: (theme: "light" | "dark") => void
  onCreateFormat: (formatId: DesignFormatId) => void
  onCreateCustom: (size: CustomDesignSize) => void
  onOpenProject: (projectId: string) => void
}

function ProjectPreview({ project }: { project: SavedProject }) {
  return (
    <span className="workspace-home__project-preview" aria-hidden="true">
      {project.previewUrl ? (
        <img src={project.previewUrl} alt="" />
      ) : (
        <span className="workspace-home__project-preview-fallback">
          {project.name.trim().charAt(0).toUpperCase() || "B"}
        </span>
      )}
    </span>
  )
}

export function WorkspaceHome({
  accountMenu,
  isLoading,
  recentProjects,
  theme,
  onThemeChange,
  onCreateFormat,
  onCreateCustom,
  onOpenProject,
}: WorkspaceHomeProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedFormatId, setSelectedFormatId] = useState<DesignFormatId>("square-post")
  const [unit, setUnit] = useState<CustomDesignUnit>("px")
  const [width, setWidth] = useState("1080")
  const [height, setHeight] = useState("1080")
  const [dpi, setDpi] = useState("300")
  const customInput = useMemo<CustomDesignSize>(() => ({
    width: Number(width),
    height: Number(height),
    unit,
    dpi: Number(dpi),
  }), [dpi, height, unit, width])
  const customResult = useMemo(() => {
    try {
      return { size: resolveCustomDesignSize(customInput), error: "" }
    } catch (error) {
      return { size: null, error: error instanceof Error ? error.message : "Tamaño inválido." }
    }
  }, [customInput])

  const chooseFormat = (formatId: DesignFormatId) => {
    setSelectedFormatId(formatId)
    const format = DESIGN_FORMATS.find((candidate) => candidate.id === formatId)
    if (format) {
      setUnit("px")
      setWidth(String(format.size.width))
      setHeight(String(format.size.height))
    }
  }

  const createDesign = () => {
    const selectedFormat = DESIGN_FORMATS.find((format) => format.id === selectedFormatId)
    const matchesStandard = unit === "px" && selectedFormat && Number(width) === selectedFormat.size.width && Number(height) === selectedFormat.size.height

    if (matchesStandard) onCreateFormat(selectedFormat.id)
    else if (customResult.size) onCreateCustom(customInput)
  }

  return (
    <main className={cn(
      "workspace-home min-h-screen",
      theme === "light" ? "editor-theme-light" : "editor-theme-dark",
    )}>
      <header className="workspace-home__header flex h-16 items-center justify-between border-b px-5 sm:px-8">
        <span className="workspace-home__brand text-xl font-bold tracking-[-0.035em]">Bacan</span>
        <div className="flex items-center gap-3">
          <div className="workspace-home__theme-switcher flex items-center rounded-md border p-1" aria-label="Tema del inicio">
            <button
              type="button"
              className="workspace-home__theme-button grid size-8 place-items-center rounded-sm"
              aria-label="Usar tema claro"
              aria-pressed={theme === "light"}
              onClick={() => onThemeChange("light")}
            >
              <Sun className="size-4" />
            </button>
            <button
              type="button"
              className="workspace-home__theme-button grid size-8 place-items-center rounded-sm"
              aria-label="Usar tema oscuro"
              aria-pressed={theme === "dark"}
              onClick={() => onThemeChange("dark")}
            >
              <Moon className="size-4" />
            </button>
          </div>
          {accountMenu}
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-5 pb-16 pt-14 sm:px-8 sm:pt-20">
        <section className="mx-auto max-w-2xl text-center">
          <h1 className="workspace-home__title text-balance text-4xl font-bold tracking-[-0.045em] sm:text-5xl">
            ¿Qué vas a crear hoy?
          </h1>

          <button
            type="button"
            className="workspace-home__create-card group mt-9 flex w-full items-center gap-5 rounded-lg border p-5 text-left transition-colors sm:p-6"
            onClick={() => setIsCreateOpen(true)}
          >
            <span className="workspace-home__create-icon grid size-14 shrink-0 place-items-center rounded-full sm:size-16">
              <Plus className="size-7 sm:size-8" strokeWidth={2.25} />
            </span>
            <span className="min-w-0">
              <span className="workspace-home__primary-text block text-lg font-semibold tracking-[-0.02em] sm:text-xl">
                Crear nuevo diseño
              </span>
              <span className="workspace-home__muted-text mt-1 block text-sm sm:text-base">Empieza desde un lienzo en blanco</span>
            </span>
            <ArrowUpRight className="workspace-home__arrow ml-auto hidden size-5 sm:block" />
          </button>
        </section>

        <section className="mt-12 sm:mt-16" aria-labelledby="recent-projects-heading">
          <h2 id="recent-projects-heading" className="workspace-home__section-title text-lg font-semibold tracking-[-0.025em] sm:text-xl">
            Recientes
          </h2>

          {isLoading ? (
            <div className="workspace-home__status mt-4 rounded-md border px-5 py-8 text-center text-sm">
              Cargando proyectos...
            </div>
          ) : null}

          {!isLoading && recentProjects.length === 0 ? (
            <div className="workspace-home__status mt-4 rounded-md border border-dashed px-5 py-8 text-center">
              <p className="workspace-home__primary-text font-medium">Todavía no tienes proyectos recientes.</p>
              <p className="workspace-home__muted-text mt-1 text-sm">Crea un diseño para empezar.</p>
            </div>
          ) : null}

          {!isLoading && recentProjects.length > 0 ? (
            <div className="workspace-home__project-grid mt-4">
              {recentProjects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  className="workspace-home__project-card group overflow-hidden rounded-md border text-left transition-colors"
                  onClick={() => onOpenProject(project.id)}
                >
                  <ProjectPreview project={project} />
                  <span className="workspace-home__project-meta flex items-start gap-3 px-3 py-2.5">
                    <span className="min-w-0 flex-1">
                      <span className="workspace-home__primary-text block truncate text-sm font-semibold tracking-[-0.015em]">{project.name}</span>
                      <span className="workspace-home__muted-text mt-0.5 block text-xs">
                        {formatRecentProjectUpdate(project.updatedAt)}
                      </span>
                    </span>
                    <ArrowUpRight className="workspace-home__arrow mt-0.5 size-3.5 shrink-0" />
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </section>
      </div>

      {isCreateOpen ? (
        <div
          className="workspace-home__modal-backdrop fixed inset-0 z-50 grid place-items-center p-4"
          role="presentation"
          onMouseDown={(event) => event.target === event.currentTarget && setIsCreateOpen(false)}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="create-design-title" className="workspace-home__modal max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg border">
            <header className="workspace-home__modal-header flex items-start justify-between border-b px-6 py-5 sm:px-8">
              <div>
                <h2 id="create-design-title" className="workspace-home__primary-text text-2xl font-bold tracking-[-0.035em]">Crear nuevo diseño</h2>
                <p className="workspace-home__muted-text mt-1 text-sm">Elige un formato o define las dimensiones exactas.</p>
              </div>
              <button type="button" aria-label="Cerrar" className="workspace-home__quiet-button grid size-9 place-items-center rounded-md" onClick={() => setIsCreateOpen(false)}><X className="size-5" /></button>
            </header>

            <div className="space-y-7 px-6 py-6 sm:px-8">
              <section>
                <h3 className="workspace-home__muted-text text-xs font-bold uppercase tracking-[0.13em]">Tamaños estándar</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {DESIGN_FORMATS.map((format) => {
                    const isSelected = selectedFormatId === format.id && unit === "px" && Number(width) === format.size.width && Number(height) === format.size.height
                    return (
                      <button key={format.id} type="button" className="workspace-home__format-card flex items-center gap-4 rounded-md border p-4 text-left" data-selected={isSelected} onClick={() => chooseFormat(format.id)}>
                        <span className="workspace-home__format-icon grid h-12 w-14 place-items-center rounded-md">
                          <span className="workspace-home__format-ratio block border" style={{ width: format.size.width >= format.size.height ? 32 : 22, height: format.size.height >= format.size.width ? 32 : 22 }} />
                        </span>
                        <span className="min-w-0 flex-1"><span className="workspace-home__primary-text block font-semibold">{format.name}</span><span className="workspace-home__muted-text text-sm">{format.size.width} × {format.size.height} px</span></span>
                        {isSelected ? <Check className="workspace-home__accent-text size-5" /> : null}
                      </button>
                    )
                  })}
                </div>
              </section>

              <section className="workspace-home__custom-size rounded-md border p-5">
                <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="workspace-home__primary-text font-semibold">Tamaño personalizado</h3><div className="workspace-home__unit-switcher flex rounded-md p-1">{(["px", "cm"] as const).map((value) => <button key={value} type="button" className="workspace-home__unit-button rounded-sm px-4 py-1.5 text-sm font-semibold" data-selected={unit === value} onClick={() => setUnit(value)}>{value}</button>)}</div></div>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <label className="workspace-home__field-label text-sm">Ancho<input type="number" min="0" step={unit === "cm" ? "0.1" : "1"} value={width} onChange={(event) => setWidth(event.target.value)} className="workspace-home__field mt-2 h-11 w-full rounded-md border px-3 outline-none" /></label>
                  <label className="workspace-home__field-label text-sm">Alto<input type="number" min="0" step={unit === "cm" ? "0.1" : "1"} value={height} onChange={(event) => setHeight(event.target.value)} className="workspace-home__field mt-2 h-11 w-full rounded-md border px-3 outline-none" /></label>
                  <label className="workspace-home__field-label text-sm" data-disabled={unit === "px"}>Resolución (ppp)<input type="number" min="72" max="600" step="1" value={dpi} disabled={unit === "px"} onChange={(event) => setDpi(event.target.value)} className="workspace-home__field mt-2 h-11 w-full rounded-md border px-3 outline-none disabled:opacity-40" /></label>
                </div>
                <p className="workspace-home__size-message mt-4 text-sm" data-error={Boolean(customResult.error)}>{customResult.error || `El lienzo se creará a ${customResult.size?.width} × ${customResult.size?.height} píxeles${unit === "cm" ? ` a ${dpi} ppp` : ""}.`}</p>
              </section>
            </div>

            <footer className="workspace-home__modal-footer flex justify-end gap-3 border-t px-6 py-5 sm:px-8"><button type="button" className="workspace-home__quiet-button rounded-md px-5 py-2.5 font-semibold" onClick={() => setIsCreateOpen(false)}>Cancelar</button><button type="button" disabled={!customResult.size} className="workspace-home__primary-button rounded-md px-6 py-2.5 font-bold disabled:cursor-not-allowed disabled:opacity-40" onClick={createDesign}>Crear diseño</button></footer>
          </section>
        </div>
      ) : null}
    </main>
  )
}
