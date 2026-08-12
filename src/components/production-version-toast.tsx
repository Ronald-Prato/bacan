import { RefreshCw, X } from "lucide-react"

import {
  useProductionVersionToast,
  type ProductionVersionToastOptions,
} from "@/hooks/use-production-version-toast"
import { useI18n } from "@/i18n/i18n-context"

export function ProductionVersionToast(options: ProductionVersionToastOptions = {}) {
  const { tx } = useI18n()
  const { availableVersion, dismiss, reload } = useProductionVersionToast(options)

  if (!availableVersion) return null

  const themeClass = document.documentElement.classList.contains("dark")
    ? "editor-theme-dark"
    : "editor-theme-light"

  return (
    <div className="production-version-toast-region" aria-live="polite">
      <section
        className={`production-version-toast ${themeClass}`}
        role="status"
        aria-atomic="true"
      >
        <div className="production-version-toast__header">
          <div className="production-version-toast__copy">
            <p className="production-version-toast__title">{tx("Nueva versión disponible")}</p>
            <p className="production-version-toast__description">
              {tx("Actualiza para usar la última versión de Bacan.")}
            </p>
          </div>
          <button
            className="production-version-toast__dismiss"
            type="button"
            aria-label={tx("Ocultar aviso de nueva versión")}
            onClick={dismiss}
          >
            <X aria-hidden="true" size={16} />
          </button>
        </div>
        <button
          className="production-version-toast__reload"
          data-action="reload"
          type="button"
          onClick={reload}
        >
          <RefreshCw aria-hidden="true" size={16} />
          {tx("Actualizar")}
        </button>
      </section>
    </div>
  )
}
