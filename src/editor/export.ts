export type ExportFormatId = "png" | "jpg" | "pdf"
export type ExportPageSelection = "all" | "current"
export type ExportScale = 1 | 2 | 3

export type ExportFormat = {
  id: ExportFormatId
  label: string
  extension: string
}

export type ExportOptions = {
  format: ExportFormatId
  pageSelection: ExportPageSelection
  quality: number
  scale: ExportScale
  transparentBackground: boolean
}

export const EXPORT_FORMATS: ExportFormat[] = [
  { id: "png", label: "PNG", extension: "png" },
  { id: "jpg", label: "JPG", extension: "jpg" },
  { id: "pdf", label: "PDF", extension: "pdf" },
]

export const EXPORT_SCALES: Array<{ label: string; scale: ExportScale }> = [
  { label: "Tamaño original", scale: 1 },
  { label: "Alta resolución", scale: 2 },
  { label: "Máxima resolución", scale: 3 },
]

export function createExportOptions(overrides: Partial<ExportOptions> = {}): ExportOptions {
  return {
    format: overrides.format ?? "png",
    pageSelection: overrides.pageSelection ?? "all",
    quality: clampQuality(overrides.quality ?? 0.92),
    scale: normalizeExportScale(overrides.scale),
    transparentBackground: overrides.transparentBackground ?? false,
  }
}

export function buildExportFileName(documentName: string, format: ExportFormatId): string {
  const extension = EXPORT_FORMATS.find((candidate) => candidate.id === format)?.extension ?? format
  return `${slugifyDocumentName(documentName)}.${extension}`
}

export function buildExportPageFileName(
  documentName: string,
  pageNumber: number,
  format: Exclude<ExportFormatId, "pdf">,
): string {
  return `${slugifyDocumentName(documentName)}-pagina-${pageNumber}.${format}`
}

export function buildExportArchiveName(documentName: string): string {
  return `${slugifyDocumentName(documentName)}.zip`
}

export function getExportPageIds(
  pageIds: readonly string[],
  activePageId: string | null,
  selection: ExportPageSelection,
): string[] {
  if (selection === "all") {
    return [...pageIds]
  }

  const resolvedPageId = activePageId && pageIds.includes(activePageId) ? activePageId : pageIds[0]
  return resolvedPageId ? [resolvedPageId] : []
}

export function getExportOutputSize(
  size: { width: number; height: number },
  scale: ExportScale,
): { width: number; height: number } {
  return {
    width: Math.round(size.width * scale),
    height: Math.round(size.height * scale),
  }
}

function slugifyDocumentName(documentName: string): string {
  const slug = documentName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return slug || "bacan"
}

export function getExportMimeType(format: ExportFormatId): "image/png" | "image/jpeg" {
  return format === "jpg" ? "image/jpeg" : "image/png"
}

function clampQuality(quality: number): number {
  return Math.min(Math.max(quality, 0.1), 1)
}

function normalizeExportScale(scale: ExportScale | undefined): ExportScale {
  return scale === 2 || scale === 3 ? scale : 1
}
