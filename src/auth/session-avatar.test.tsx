// @vitest-environment jsdom

import { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { SessionAvatarMenu } from "./session-avatar"

describe("SessionAvatarMenu", () => {
  beforeEach(() => {
    ;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  })

  afterEach(() => {
    document.body.innerHTML = ""
    delete (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT
  })

  it("shows the signed-in identity and the custom sign-out action", async () => {
    const onSignOut = vi.fn()
    const container = document.createElement("div")
    document.body.append(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <SessionAvatarMenu
          imageUrl="/alice.png"
          initial="A"
          label="Alice"
          name="Alice"
          email="alice@example.com"
          onSignOut={onSignOut}
        />,
      )
    })
    await act(async () => {
      container.querySelector<HTMLButtonElement>("[aria-haspopup=menu]")?.click()
    })

    expect(container.querySelector('[role="menu"]')).toBeTruthy()
    expect(container.querySelectorAll('[role="menuitem"]')).toHaveLength(1)
    expect(container.textContent).toContain("Alice")
    expect(container.textContent).toContain("alice@example.com")

    await act(async () => {
      container.querySelector<HTMLButtonElement>('[role="menuitem"]')?.click()
    })
    expect(onSignOut).toHaveBeenCalledOnce()

    await act(async () => root.unmount())
  })
})
