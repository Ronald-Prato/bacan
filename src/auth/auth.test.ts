// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest"

import { safeReturnTo } from "./redirects"

describe("auth redirects", () => {
  beforeEach(() => window.history.replaceState({}, "", "/"))

  it("keeps same-origin paths including query strings and hashes", () => {
    expect(safeReturnTo("/share/abc?mode=view#page-2")).toBe("/share/abc?mode=view#page-2")
  })

  it("rejects external redirects and authentication loops", () => {
    expect(safeReturnTo("https://evil.example/designs")).toBe("/")
    expect(safeReturnTo("/login")).toBe("/")
    expect(safeReturnTo("/sso-callback")).toBe("/")
  })
})
