import { useMemo, useState } from "react"
import { ArrowUpRight, Check, Plus, X } from "lucide-react"

import { formatRecentProjectUpdate } from "@/editor/dashboard"
import type { SavedProject } from "@/editor/projects"
import {
  DESIGN_FORMATS,
  resolveCustomDesignSize,
  type CustomDesignSize,
  type CustomDesignUnit,
  type DesignFormatId,
} from "@/editor/templates"

type WorkspaceHomeProps = {
  isLoading: boolean
  recentProjects: SavedProject[]
  onCreateFormat: (formatId: DesignFormatId) => void
  onCreateCustom: (size: CustomDesignSize) => void
  onOpenProject: (projectId: string) => void
}

const previewVariants = [
  {
    background: "bg-[#182220]",
    content: (
      <>
        <span className="absolute -left-[12%] top-[-28%] size-[88%] rotate-[18deg] bg-[#293c3b]" />
        <span className="absolute bottom-[-32%] right-[2%] size-[82%] rounded-full bg-[#b9f34a]" />
        <span className="absolute right-[-9%] top-[-17%] size-[64%] rotate-45 bg-[#9cc538]/70" />
      </>
    ),
  },
  {
    background: "bg-[#ff806e]",
    content: (
      <>
        <span className="absolute -bottom-[48%] -left-[15%] h-[94%] w-[130%] rounded-[50%] bg-[#ef516e]" />
        <span className="absolute -bottom-[55%] left-[16%] h-[91%] w-[112%] rounded-[50%] bg-[#26365e]" />
        <span className="absolute left-[29%] top-[20%] size-[15%] rounded-full bg-[#ffdda0]" />
        <span className="absolute -right-[4%] -top-[18%] h-[78%] w-[31%] rotate-[24deg] bg-[#17223f] [clip-path:polygon(45%_0,55%_0,52%_100%,48%_100%,49%_24%,32%_100%,26%_98%,45%_19%,9%_89%,3%_85%,42%_15%)]" />
      </>
    ),
  },
  {
    background: "bg-[#111a2d]",
    content: (
      <>
        <span className="absolute -bottom-[25%] -left-[19%] size-[90%] rounded-full bg-[#294b8b]" />
        <span className="absolute left-[42%] top-[15%] h-[58%] w-[24%] bg-[#f1e6c7]" />
        <span className="absolute bottom-[7%] right-[17%] size-[29%] bg-[#b9f34a]" />
        <span className="absolute bottom-[7%] right-[5%] size-[8%] rounded-full bg-[#d4ff58]" />
      </>
    ),
  },
] as const

function ProjectPreview({ index }: { index: number }) {
  const variant = previewVariants[index % previewVariants.length]

  return (
    <span className={`relative block aspect-[16/9] overflow-hidden ${variant.background}`} aria-hidden="true">
      {variant.content}
      <span className="absolute inset-0 bg-black/4" />
    </span>
  )
}

export function WorkspaceHome({
  isLoading,
  recentProjects,
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
    <main className="min-h-screen bg-[#0a0d10] text-[#f7f8f4]">
      <header className="flex h-[72px] items-center border-b border-white/9 px-5 sm:px-8">
        <span className="text-xl font-bold tracking-[-0.035em] text-white">Bacan</span>
      </header>

      <div className="mx-auto w-full max-w-7xl px-5 pb-16 pt-14 sm:px-8 sm:pt-20">
        <section className="mx-auto max-w-2xl text-center">
          <h1 className="text-balance text-4xl font-bold tracking-[-0.045em] text-white sm:text-5xl">
            ¿Qué vas a crear hoy?
          </h1>

          <button
            type="button"
            className="group mt-9 flex w-full items-center gap-5 rounded-2xl border border-white/10 bg-[#151a20] p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[#b9f34a]/45 hover:bg-[#191f25] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b9f34a] sm:p-7"
            onClick={() => setIsCreateOpen(true)}
          >
            <span className="grid size-14 shrink-0 place-items-center rounded-full bg-[#b9f34a] text-[#0a1008] transition group-hover:scale-105 sm:size-16">
              <Plus className="size-7 sm:size-8" strokeWidth={2.25} />
            </span>
            <span className="min-w-0">
              <span className="block text-lg font-semibold tracking-[-0.02em] text-white sm:text-xl">
                Crear nuevo diseño
              </span>
              <span className="mt-1 block text-sm text-[#929b9d] sm:text-base">Empieza desde un lienzo en blanco</span>
            </span>
            <ArrowUpRight className="ml-auto hidden size-5 text-[#70797b] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#b9f34a] sm:block" />
          </button>
        </section>

        <section className="mt-16 sm:mt-20" aria-labelledby="recent-projects-heading">
          <h2 id="recent-projects-heading" className="text-xl font-semibold tracking-[-0.025em] text-white sm:text-2xl">
            Recientes
          </h2>

          {isLoading ? (
            <div className="mt-5 rounded-2xl border border-white/9 bg-[#12171c] px-5 py-12 text-center text-sm text-[#899295]">
              Cargando proyectos...
            </div>
          ) : null}

          {!isLoading && recentProjects.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-white/13 bg-[#101419] px-5 py-12 text-center">
              <p className="font-medium text-[#d9dedb]">Todavía no tienes proyectos recientes.</p>
              <p className="mt-1 text-sm text-[#818b8d]">Crea un diseño para empezar.</p>
            </div>
          ) : null}

          {!isLoading && recentProjects.length > 0 ? (
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {recentProjects.map((project, index) => (
                <button
                  key={project.id}
                  type="button"
                  className="group overflow-hidden rounded-2xl border border-white/9 bg-[#12171c] text-left transition duration-200 hover:-translate-y-1 hover:border-white/20 hover:bg-[#151b20] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b9f34a]"
                  onClick={() => onOpenProject(project.id)}
                >
                  <ProjectPreview index={index} />
                  <span className="flex items-start gap-4 px-5 py-4">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold tracking-[-0.015em] text-white">{project.name}</span>
                      <span className="mt-1 block text-sm text-[#899295]">
                        {formatRecentProjectUpdate(project.updatedAt)}
                      </span>
                    </span>
                    <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-[#626b6e] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#b9f34a]" />
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </section>
      </div>

      {isCreateOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => event.target === event.currentTarget && setIsCreateOpen(false)}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="create-design-title" className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-[#12171c]">
            <header className="flex items-start justify-between border-b border-white/9 px-6 py-5 sm:px-8">
              <div>
                <h2 id="create-design-title" className="text-2xl font-bold tracking-[-0.035em] text-white">Crear nuevo diseño</h2>
                <p className="mt-1 text-sm text-[#929b9d]">Elige un formato o define las dimensiones exactas.</p>
              </div>
              <button type="button" aria-label="Cerrar" className="grid size-10 place-items-center rounded-full text-[#929b9d] transition hover:bg-white/8 hover:text-white" onClick={() => setIsCreateOpen(false)}><X className="size-5" /></button>
            </header>

            <div className="space-y-7 px-6 py-6 sm:px-8">
              <section>
                <h3 className="text-xs font-bold uppercase tracking-[0.13em] text-[#7f898b]">Tamaños estándar</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {DESIGN_FORMATS.map((format) => {
                    const isSelected = selectedFormatId === format.id && unit === "px" && Number(width) === format.size.width && Number(height) === format.size.height
                    return (
                      <button key={format.id} type="button" className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition ${isSelected ? "border-[#b9f34a] bg-[#b9f34a]/8" : "border-white/10 bg-[#181e24] hover:border-white/25"}`} onClick={() => chooseFormat(format.id)}>
                        <span className="grid h-12 w-14 place-items-center rounded-lg bg-[#0d1115]">
                          <span className="block border border-[#879194] bg-[#293137]" style={{ width: format.size.width >= format.size.height ? 32 : 22, height: format.size.height >= format.size.width ? 32 : 22 }} />
                        </span>
                        <span className="min-w-0 flex-1"><span className="block font-semibold text-white">{format.name}</span><span className="text-sm text-[#899295]">{format.size.width} × {format.size.height} px</span></span>
                        {isSelected ? <Check className="size-5 text-[#b9f34a]" /> : null}
                      </button>
                    )
                  })}
                </div>
              </section>

              <section className="rounded-2xl border border-white/10 bg-[#0e1317] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold text-white">Tamaño personalizado</h3><div className="flex rounded-lg bg-[#1b2228] p-1">{(["px", "cm"] as const).map((value) => <button key={value} type="button" className={`rounded-md px-4 py-1.5 text-sm font-semibold ${unit === value ? "bg-[#b9f34a] text-[#11170d]" : "text-[#929b9d]"}`} onClick={() => setUnit(value)}>{value}</button>)}</div></div>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <label className="text-sm text-[#aab1b2]">Ancho<input type="number" min="0" step={unit === "cm" ? "0.1" : "1"} value={width} onChange={(event) => setWidth(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-white/12 bg-[#171d22] px-3 text-white outline-none focus:border-[#b9f34a]" /></label>
                  <label className="text-sm text-[#aab1b2]">Alto<input type="number" min="0" step={unit === "cm" ? "0.1" : "1"} value={height} onChange={(event) => setHeight(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-white/12 bg-[#171d22] px-3 text-white outline-none focus:border-[#b9f34a]" /></label>
                  <label className={`text-sm ${unit === "px" ? "text-[#596265]" : "text-[#aab1b2]"}`}>Resolución (ppp)<input type="number" min="72" max="600" step="1" value={dpi} disabled={unit === "px"} onChange={(event) => setDpi(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-white/12 bg-[#171d22] px-3 text-white outline-none disabled:opacity-40 focus:border-[#b9f34a]" /></label>
                </div>
                <p className={`mt-4 text-sm ${customResult.error ? "text-[#ff8e82]" : "text-[#8e999a]"}`}>{customResult.error || `El lienzo se creará a ${customResult.size?.width} × ${customResult.size?.height} píxeles${unit === "cm" ? ` a ${dpi} ppp` : ""}.`}</p>
              </section>
            </div>

            <footer className="flex justify-end gap-3 border-t border-white/9 px-6 py-5 sm:px-8"><button type="button" className="rounded-xl px-5 py-2.5 font-semibold text-[#b8c0c1] hover:bg-white/7" onClick={() => setIsCreateOpen(false)}>Cancelar</button><button type="button" disabled={!customResult.size} className="rounded-xl bg-[#b9f34a] px-6 py-2.5 font-bold text-[#11170d] transition hover:bg-[#c9ff65] disabled:cursor-not-allowed disabled:opacity-40" onClick={createDesign}>Crear diseño</button></footer>
          </section>
        </div>
      ) : null}
    </main>
  )
}
