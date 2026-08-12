import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  resolveLocale,
  translate,
  translateInterface,
  type Locale,
  type MessageKey,
} from "./i18n"

type I18nContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: MessageKey, values?: Record<string, string | number>) => string
  tx: (source: string) => string
}

const defaultContextValue: I18nContextValue = {
  locale: DEFAULT_LOCALE,
  setLocale: () => undefined,
  t: (key, values) => translate(DEFAULT_LOCALE, key, values),
  tx: (source) => translateInterface(DEFAULT_LOCALE, source),
}

const I18nContext = createContext<I18nContextValue>(defaultContextValue)

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE
  const savedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY)
  return savedLocale ? resolveLocale(savedLocale) : DEFAULT_LOCALE
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(getInitialLocale)

  useEffect(() => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
    window.document.documentElement.lang = locale
  }, [locale])

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    setLocale,
    t: (key, values) => translate(locale, key, values),
    tx: (source) => translateInterface(locale, source),
  }), [locale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

// oxlint-disable-next-line react/only-export-components -- provider and its domain hook form one public module.
export function useI18n(): I18nContextValue {
  return useContext(I18nContext)
}
