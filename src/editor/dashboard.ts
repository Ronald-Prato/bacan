import type { SavedProject } from "./projects"

export function listRecentProjects(projects: SavedProject[], limit = 6): SavedProject[] {
  return [...projects].sort((first, second) => second.updatedAt - first.updatedAt).slice(0, limit)
}

export function formatRecentProjectUpdate(updatedAt: number, now = Date.now()): string {
  const elapsed = Math.max(0, now - updatedAt)
  const elapsedMinutes = Math.floor(elapsed / 60_000)
  const elapsedHours = Math.floor(elapsed / 3_600_000)
  const elapsedDays = Math.floor(elapsed / 86_400_000)

  if (elapsedMinutes < 1) {
    return "Editado ahora"
  }

  if (elapsedHours < 1) {
    return `Editado hace ${elapsedMinutes} ${elapsedMinutes === 1 ? "minuto" : "minutos"}`
  }

  if (elapsedDays < 1) {
    return `Editado hace ${elapsedHours} ${elapsedHours === 1 ? "hora" : "horas"}`
  }

  if (elapsedDays < 7) {
    return `Editado hace ${elapsedDays} ${elapsedDays === 1 ? "día" : "días"}`
  }

  return `Editado el ${new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
  })
    .format(updatedAt)
    .replace(".", "")}`
}
