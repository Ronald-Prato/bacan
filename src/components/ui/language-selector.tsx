import { Check, Languages } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { LOCALE_OPTIONS, type Locale } from "@/i18n/i18n"
import { useI18n } from "@/i18n/i18n-context"
import { cn } from "@/lib/utils"

export function LanguageSelector({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const currentLanguage = LOCALE_OPTIONS.find((option) => option.locale === locale) ?? LOCALE_OPTIONS[0]

  useEffect(() => {
    if (!open) return
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("pointerdown", closeOutside)
    document.addEventListener("keydown", closeWithEscape)
    return () => {
      document.removeEventListener("pointerdown", closeOutside)
      document.removeEventListener("keydown", closeWithEscape)
    }
  }, [open])

  const chooseLocale = (nextLocale: Locale) => {
    setLocale(nextLocale)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className={cn("language-selector relative", className)}>
      <button
        type="button"
        className="language-selector__trigger flex h-10 items-center gap-1.5 rounded-md border px-2.5 text-sm font-bold"
        aria-label={t("language.select")}
        aria-haspopup="menu"
        aria-expanded={open}
        title={t("language.current", { language: currentLanguage.label })}
        onClick={() => setOpen((current) => !current)}
      >
        <Languages className="size-4" aria-hidden="true" />
        <span aria-hidden="true">{currentLanguage.shortLabel}</span>
      </button>
      {open ? (
        <div className="language-selector__menu absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-44 rounded-md border p-1" role="menu">
          {LOCALE_OPTIONS.map((option) => (
            <button
              key={option.locale}
              type="button"
              role="menuitemradio"
              aria-checked={locale === option.locale}
              data-locale={option.locale}
              className="language-selector__option flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-sm"
              onClick={() => chooseLocale(option.locale)}
            >
              <span className="w-6 text-xs font-bold opacity-70" aria-hidden="true">{option.shortLabel}</span>
              <span className="flex-1">{option.label}</span>
              {locale === option.locale ? <Check className="size-4" aria-hidden="true" /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
