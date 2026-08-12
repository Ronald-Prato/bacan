import { describe, expect, it } from "vitest"

import { shouldNotifyProductionVersionUpdate } from "./production-version"

describe("shouldNotifyProductionVersionUpdate", () => {
  it("waits until the loaded production version is known", () => {
    expect(
      shouldNotifyProductionVersionUpdate({
        initialVersion: null,
        latestVersion: "commit-b",
      }),
    ).toBe(false)
  })

  it("does not notify while production serves the loaded version", () => {
    expect(
      shouldNotifyProductionVersionUpdate({
        initialVersion: "commit-a",
        latestVersion: "commit-a",
      }),
    ).toBe(false)
  })

  it("notifies when production serves a new version", () => {
    expect(
      shouldNotifyProductionVersionUpdate({
        initialVersion: "commit-a",
        latestVersion: "commit-b",
      }),
    ).toBe(true)
  })

  it("does not repeat a notification for the same version", () => {
    expect(
      shouldNotifyProductionVersionUpdate({
        initialVersion: "commit-a",
        latestVersion: "commit-b",
        notifiedVersion: "commit-b",
      }),
    ).toBe(false)
  })

  it("ignores blank version identifiers", () => {
    expect(
      shouldNotifyProductionVersionUpdate({
        initialVersion: "commit-a",
        latestVersion: "   ",
      }),
    ).toBe(false)
  })
})
