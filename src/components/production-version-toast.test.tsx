// @vitest-environment jsdom

import { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ProductionVersionToast } from "./production-version-toast"

describe("ProductionVersionToast", () => {
  beforeEach(() => {
    ;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ""
    document.documentElement.classList.remove("dark")
    delete (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT
  })

  it("offers to update after production publishes a new version", async () => {
    const fetchVersion = vi
      .fn<() => Promise<string | null>>()
      .mockResolvedValueOnce("commit-a")
      .mockResolvedValue("commit-b")
    const reloadPage = vi.fn()
    const container = document.createElement("div")
    document.body.append(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <ProductionVersionToast
          enabled
          pollIntervalMs={1_000}
          fetchVersion={fetchVersion}
          reloadPage={reloadPage}
        />,
      )
    })

    expect(container.querySelector('[role="status"]')).toBeNull()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1_000)
    })

    expect(container.textContent).toContain("New version available")
    expect(container.querySelector(".production-version-toast")?.classList.contains("editor-theme-light")).toBe(true)

    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-action="reload"]')?.click()
    })

    expect(reloadPage).toHaveBeenCalledOnce()
    expect(container.querySelector('[role="status"]')).toBeNull()

    await act(async () => root.unmount())
  })
})
