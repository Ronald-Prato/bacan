const PROJECT_PREVIEW_MAX_SIZE = 360

type PreviewStage = {
  toDataURL: (options: {
    mimeType: "image/jpeg"
    quality: number
    pixelRatio: number
  }) => string
}

type ProjectPreviewSummary = {
  id: string
  previewUrl?: string
}

export function findProjectMissingPreview<T extends ProjectPreviewSummary>(
  projects: T[],
  attemptedProjectIds: ReadonlySet<string>,
): T | undefined {
  return projects.find(
    (project) => !project.previewUrl && !attemptedProjectIds.has(project.id),
  )
}

export function getProjectPreviewScale(size: { width: number; height: number }): number {
  return Math.min(PROJECT_PREVIEW_MAX_SIZE / Math.max(size.width, size.height), 1)
}

export function renderProjectPreview(stage: PreviewStage | null): string | undefined {
  if (!stage) {
    return undefined
  }

  try {
    return stage.toDataURL({
      mimeType: "image/jpeg",
      quality: 0.76,
      pixelRatio: 1,
    })
  } catch {
    return undefined
  }
}
