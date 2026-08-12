import { useState } from "react"
import { Check, Download, FileArchive, Image as ImageIcon, X } from "lucide-react"
import { Popover } from "radix-ui"

import {
  EXPORT_FORMATS,
  EXPORT_SCALES,
  createExportOptions,
  getExportOutputSize,
  type ExportFormatId,
  type ExportOptions,
  type ExportScale,
} from "@/editor/export"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

const MAX_BROWSER_EXPORT_DIMENSION = 16_384

type ExportMenuProps = {
  activePageNumber: number
  documentSize: { width: number; height: number }
  isExporting: boolean
  onExport: (options: ExportOptions) => void
  onOptionsChange: (options: ExportOptions) => void
  options: ExportOptions
  pageCount: number
  theme: "light" | "dark"
}

export function ExportMenu({
  activePageNumber,
  documentSize,
  isExporting,
  onExport,
  onOptionsChange,
  options,
  pageCount,
  theme,
}: ExportMenuProps) {
  const [open, setOpen] = useState(false)
  const outputSize = getExportOutputSize(documentSize, options.scale)
  const selectedPageCount = options.pageSelection === "all" ? pageCount : 1

  const updateOptions = (overrides: Partial<ExportOptions>) => {
    onOptionsChange(createExportOptions({ ...options, ...overrides }))
  }

  const startExport = () => {
    setOpen(false)
    onExport(options)
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          type="button"
          className="editor-export-trigger"
          disabled={isExporting || pageCount === 0}
          aria-label="Exportar diseño"
        >
          <Download data-icon="inline-start" />
          <span className="hidden sm:inline">Exportar</span>
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          collisionPadding={12}
          className="editor-export-menu"
          data-theme={theme}
          aria-label="Opciones de exportación"
        >
          <header className="editor-export-menu__header">
            <div>
              <h2>Exportar diseño</h2>
              <p>Elige páginas, formato y resolución.</p>
            </div>
            <Popover.Close asChild>
              <Button type="button" size="icon-sm" variant="ghost" aria-label="Cerrar exportación">
                <X />
              </Button>
            </Popover.Close>
          </header>

          <div className="editor-export-menu__section">
            <Label>Páginas</Label>
            <div className="editor-export-segmented" role="group" aria-label="Páginas para exportar">
              <PageSelectionButton
                checked={options.pageSelection === "all"}
                label={`Todas (${pageCount})`}
                onClick={() => updateOptions({ pageSelection: "all" })}
              />
              <PageSelectionButton
                checked={options.pageSelection === "current"}
                label={`Actual (${activePageNumber})`}
                onClick={() => updateOptions({ pageSelection: "current" })}
              />
            </div>
          </div>

          <div className="editor-export-menu__section">
            <Label>Tipo de archivo</Label>
            <div className="editor-export-formats" role="group" aria-label="Tipo de archivo">
              {EXPORT_FORMATS.map((format) => (
                <button
                  key={format.id}
                  type="button"
                  className="editor-export-format"
                  data-active={options.format === format.id}
                  aria-pressed={options.format === format.id}
                  onClick={() => updateOptions({ format: format.id })}
                >
                  <span>{format.label}</span>
                  <small>{getFormatDescription(format.id)}</small>
                  {options.format === format.id ? <Check aria-hidden="true" /> : null}
                </button>
              ))}
            </div>
          </div>

          <div className="editor-export-menu__section">
            <Label htmlFor="export-resolution">Resolución</Label>
            <select
              id="export-resolution"
              value={options.scale}
              onChange={(event) => updateOptions({ scale: Number(event.target.value) as ExportScale })}
            >
              {EXPORT_SCALES.map((resolution) => {
                const size = getExportOutputSize(documentSize, resolution.scale)
                const isTooLarge = Math.max(size.width, size.height) > MAX_BROWSER_EXPORT_DIMENSION

                return (
                  <option key={resolution.scale} value={resolution.scale} disabled={isTooLarge}>
                    {resolution.label} · {size.width} × {size.height}px
                  </option>
                )
              })}
            </select>
          </div>

          {options.format === "jpg" ? (
            <div className="editor-export-menu__section">
              <div className="editor-export-menu__label-row">
                <Label>Calidad</Label>
                <span>{Math.round(options.quality * 100)}%</span>
              </div>
              <Slider
                value={[options.quality]}
                min={0.1}
                max={1}
                step={0.05}
                onValueChange={([quality]) => updateOptions({ quality })}
                aria-label="Calidad JPG"
              />
            </div>
          ) : null}

          <footer className="editor-export-menu__footer">
            <div className="editor-export-menu__summary">
              {options.format === "pdf" ? <FileArchive aria-hidden="true" /> : <ImageIcon aria-hidden="true" />}
              <span>
                {selectedPageCount} {selectedPageCount === 1 ? "página" : "páginas"} · {outputSize.width} × {outputSize.height}px
              </span>
            </div>
            <Button type="button" className="editor-export-menu__submit" onClick={startExport} disabled={isExporting}>
              <Download data-icon="inline-start" />
              {options.pageSelection === "all" && pageCount > 1 ? "Exportar todo" : "Exportar diseño"}
            </Button>
          </footer>
          <Popover.Arrow className="editor-export-menu__arrow" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

function PageSelectionButton({
  checked,
  label,
  onClick,
}: {
  checked: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button type="button" data-active={checked} aria-pressed={checked} onClick={onClick}>
      {label}
    </button>
  )
}

function getFormatDescription(format: ExportFormatId): string {
  if (format === "jpg") {
    return "Ligero"
  }

  if (format === "pdf") {
    return "Documento"
  }

  return "Nítido"
}

export type ExportProgress = {
  message: string
  previewUrl: string | null
  progress: number
  status: "rendering" | "packaging" | "complete" | "error"
}

export function ExportProgressToast({
  exportProgress,
  onClose,
}: {
  exportProgress: ExportProgress | null
  onClose: () => void
}) {
  if (!exportProgress) {
    return null
  }

  const isComplete = exportProgress.status === "complete"
  const isError = exportProgress.status === "error"

  return (
    <aside
      className="editor-export-toast"
      data-status={exportProgress.status}
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
    >
      <div className="editor-export-toast__preview" aria-hidden="true">
        {exportProgress.previewUrl ? (
          <img src={exportProgress.previewUrl} alt="" />
        ) : (
          <ImageIcon />
        )}
      </div>
      <div className="editor-export-toast__content">
        <div className="editor-export-toast__title-row">
          <strong>
            {isComplete ? "🎉 Diseño exportado" : isError ? "No se pudo exportar" : "Exportando diseño"}
          </strong>
          <button type="button" aria-label="Cerrar progreso de exportación" onClick={onClose}>
            <X />
          </button>
        </div>
        <p>{exportProgress.message}</p>
        <div
          className="editor-export-toast__progress"
          role="progressbar"
          aria-label="Progreso de exportación"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(exportProgress.progress)}
        >
          <span style={{ width: `${exportProgress.progress}%` }} />
        </div>
      </div>
    </aside>
  )
}
