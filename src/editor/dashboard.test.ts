import { describe, expect, it } from "vitest"

import { formatRecentProjectUpdate, listRecentProjects } from "./dashboard"
import type { SavedProject } from "./projects"

const projects: SavedProject[] = [
  { id: "old", name: "Old", updatedAt: 100, pageCount: 1, elementCount: 3 },
  { id: "new", name: "New", updatedAt: 300, pageCount: 2, elementCount: 8 },
  { id: "mid", name: "Mid", updatedAt: 200, pageCount: 1, elementCount: 4 },
]
describe("workspace dashboard helpers", () => {
  it("lists recent projects in descending update order", () => {
    expect(listRecentProjects(projects, 2).map((project) => project.id)).toEqual(["new", "mid"])
  })

  it("describes recent project updates without exposing dashboard stats", () => {
    const now = new Date("2026-08-04T15:00:00.000Z").getTime()

    expect(formatRecentProjectUpdate(now - 30_000, now)).toBe("Editado ahora")
    expect(formatRecentProjectUpdate(now - 2 * 60 * 60_000, now)).toBe("Editado hace 2 horas")
    expect(formatRecentProjectUpdate(now - 3 * 24 * 60 * 60_000, now)).toBe("Editado hace 3 días")
    expect(formatRecentProjectUpdate(now - 14 * 24 * 60 * 60_000, now)).toBe("Editado el 21 de jul")
  })
})
