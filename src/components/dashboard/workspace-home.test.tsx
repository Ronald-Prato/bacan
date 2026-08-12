// @vitest-environment jsdom

import { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { WorkspaceHome } from "./workspace-home"
import { I18nProvider } from "@/i18n/i18n-context"

describe("WorkspaceHome", () => {
  beforeEach(() => {
    ;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    localStorage.clear()
  })

  it("starts in English and persists a language selected from the header", async () => {
    const container = document.createElement("div")
    document.body.append(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <I18nProvider>
          <WorkspaceHome
            isLoading={false}
            recentProjects={[]}
            theme="light"
            onThemeChange={() => undefined}
            onCreateFormat={() => undefined}
            onCreateCustom={() => undefined}
            onOpenProject={() => undefined}
          />
        </I18nProvider>,
      )
    })

    expect(container.textContent).toContain("What will you create today?")

    await act(async () => {
      container.querySelector<HTMLButtonElement>('[aria-label="Select language"]')?.click()
    })
    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-locale="pt"]')?.click()
    })

    expect(container.textContent).toContain("O que você vai criar hoje?")
    expect(localStorage.getItem("bacan-language")).toBe("pt")
    expect(document.documentElement.lang).toBe("pt")

    await act(async () => root.unmount())

    const reloadedRoot = createRoot(container)
    await act(async () => {
      reloadedRoot.render(
        <I18nProvider>
          <WorkspaceHome
            isLoading={false}
            recentProjects={[]}
            theme="light"
            onThemeChange={() => undefined}
            onCreateFormat={() => undefined}
            onCreateCustom={() => undefined}
            onOpenProject={() => undefined}
          />
        </I18nProvider>,
      )
    })
    expect(container.textContent).toContain("O que você vai criar hoje?")

    await act(async () => reloadedRoot.unmount())
  })

  afterEach(() => {
    document.body.innerHTML = ""
    delete (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT
  })

  it("uses the selected theme and renders compact cards with the real project preview", async () => {
    const onThemeChange = vi.fn()
    const previewUrl = "data:image/jpeg;base64,real-project-preview"
    const container = document.createElement("div")
    document.body.append(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <I18nProvider>
          <WorkspaceHome
            isLoading={false}
            recentProjects={[{
              id: "project-1",
              name: "Post cuadrado",
              updatedAt: 100,
              pageCount: 1,
              elementCount: 3,
              previewUrl,
            }]}
            theme="light"
            onThemeChange={onThemeChange}
            onCreateFormat={() => undefined}
            onCreateCustom={() => undefined}
            onOpenProject={() => undefined}
          />
        </I18nProvider>,
      )
    })

    expect(container.querySelector("main")?.classList.contains("editor-theme-light")).toBe(true)
    expect(container.querySelector(".workspace-home__project-grid")).not.toBeNull()

    const projectCard = container.querySelector<HTMLButtonElement>(".workspace-home__project-card")
    expect(projectCard).not.toBeNull()
    expect(projectCard!.classList.contains("rounded-md")).toBe(true)
    expect(projectCard!.classList.contains("rounded-2xl")).toBe(false)
    expect(projectCard!.querySelector<HTMLImageElement>("img")?.src).toBe(previewUrl)
    expect(projectCard!.querySelector("[data-mocked-preview]")).toBeNull()
    expect(projectCard!.querySelector(".workspace-home__project-meta")?.classList.contains("px-3")).toBe(true)

    await act(async () => {
      container.querySelector<HTMLButtonElement>('[aria-label="Use dark theme"]')?.click()
    })
    expect(onThemeChange).toHaveBeenCalledWith("dark")

    await act(async () => root.unmount())
  })
})
