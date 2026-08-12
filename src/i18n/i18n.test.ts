import { describe, expect, it } from "vitest"

import {
  DEFAULT_LOCALE,
  formatRelativeProjectUpdate,
  resolveLocale,
  translate,
} from "./i18n"

describe("application internationalization", () => {
  it("uses English by default and falls back to it for unsupported locales", () => {
    expect(DEFAULT_LOCALE).toBe("en")
    expect(resolveLocale(undefined)).toBe("en")
    expect(resolveLocale("fr-FR")).toBe("en")
    expect(resolveLocale("pt-BR")).toBe("pt")
    expect(resolveLocale("es-CO")).toBe("es")
  })

  it("translates interface copy naturally and interpolates values", () => {
    expect(translate("en", "workspace.heroTitle")).toBe("What will you create today?")
    expect(translate("es", "workspace.heroTitle")).toBe("¿Qué vas a crear hoy?")
    expect(translate("pt", "workspace.heroTitle")).toBe("O que você vai criar hoje?")
    expect(translate("pt", "workspace.canvasSize", { width: 1080, height: 1920 })).toBe(
      "A tela será criada com 1080 × 1920 pixels.",
    )
  })

  it("formats recent updates with locale-aware grammar", () => {
    const now = new Date("2026-08-04T15:00:00.000Z").getTime()

    expect(formatRelativeProjectUpdate("en", now - 2 * 60 * 60_000, now)).toBe("Edited 2 hours ago")
    expect(formatRelativeProjectUpdate("es", now - 2 * 60 * 60_000, now)).toBe("Editado hace 2 horas")
    expect(formatRelativeProjectUpdate("pt", now - 2 * 60 * 60_000, now)).toBe("Editado há 2 horas")
  })
})
