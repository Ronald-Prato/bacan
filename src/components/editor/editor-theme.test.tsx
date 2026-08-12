// @vitest-environment jsdom
/// <reference types="node" />

import { readFileSync } from "node:fs"

import { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { ShapesPanel } from "./shapes-panel"

const stylesheet = readFileSync(`${process.cwd()}/src/index.css`, "utf8")

describe("editor panel themes", () => {
  beforeEach(() => {
    ;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  })

  afterEach(() => {
    document.body.innerHTML = ""
    delete (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT
  })

  it("lets the shapes panel inherit its dark surface instead of pinning light tokens inline", async () => {
    const container = document.createElement("div")
    document.body.append(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <main className="editor-theme-dark">
          <ShapesPanel items={[]} onAddShape={() => undefined} />
        </main>,
      )
    })

    const panel = container.querySelector<HTMLElement>(".shapes-panel")
    expect(panel).not.toBeNull()
    expect(panel!.style.getPropertyValue("--shapes-surface")).toBe("")
    expect(panel!.style.getPropertyValue("--shapes-foreground")).toBe("")
    expect(panel!.style.backgroundColor).toBe("")

    await act(async () => root.unmount())
  })

  it("defines separate dark-safe defaults and canonical light overrides for panel libraries", () => {
    expect(stylesheet).toMatch(
      /\.shapes-panel\s*{[^}]*--shapes-surface:\s*var\(--background\);[^}]*--shapes-foreground:\s*var\(--foreground\);/s,
    )
    expect(stylesheet).toMatch(
      /\.editor-theme-light \.shapes-panel\s*{[^}]*--shapes-surface:\s*var\(--vacan-background\);[^}]*--shapes-foreground:\s*var\(--vacan-foreground\);/s,
    )
    expect(stylesheet).toContain(
      "--text-library-preview: color-mix(in srgb, currentColor 8%, var(--text-library-background));",
    )
    expect(stylesheet).toContain(
      "--text-library-preview: color-mix(in srgb, white 45%, var(--vacan-background));",
    )
  })
})
