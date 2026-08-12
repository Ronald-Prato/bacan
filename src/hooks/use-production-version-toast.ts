import { useCallback, useEffect, useRef, useState } from "react"

import { shouldNotifyProductionVersionUpdate } from "@/lib/production-version"

const VERSION_ENDPOINT = "/version.json"
const DEFAULT_POLL_INTERVAL_MS = 60_000

type VersionResponse = {
  version?: string | null
}

export type ProductionVersionToastOptions = {
  enabled?: boolean
  pollIntervalMs?: number
  fetchVersion?: () => Promise<string | null>
  reloadPage?: () => void
}

async function fetchProductionVersion() {
  const response = await fetch(VERSION_ENDPOINT, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  })

  if (!response.ok) return null

  const data = (await response.json()) as VersionResponse
  return typeof data.version === "string" ? data.version : null
}

function reloadCurrentPage() {
  window.location.reload()
}

export function useProductionVersionToast({
  enabled = import.meta.env.PROD,
  pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
  fetchVersion = fetchProductionVersion,
  reloadPage = reloadCurrentPage,
}: ProductionVersionToastOptions = {}) {
  const [availableVersion, setAvailableVersion] = useState<string | null>(null)
  const initialVersionRef = useRef<string | null>(null)
  const notifiedVersionRef = useRef<string | null>(null)
  const isCheckingVersionRef = useRef(false)

  const dismiss = useCallback(() => {
    setAvailableVersion(null)
  }, [])

  const reload = useCallback(() => {
    dismiss()
    reloadPage()
  }, [dismiss, reloadPage])

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return

    let isActive = true

    const checkVersion = async () => {
      if (isCheckingVersionRef.current) return
      isCheckingVersionRef.current = true

      try {
        const latestVersion = await fetchVersion()
        if (!isActive || !latestVersion) return

        if (!initialVersionRef.current) {
          initialVersionRef.current = latestVersion
          return
        }

        if (
          !shouldNotifyProductionVersionUpdate({
            initialVersion: initialVersionRef.current,
            latestVersion,
            notifiedVersion: notifiedVersionRef.current,
          })
        ) {
          return
        }

        notifiedVersionRef.current = latestVersion
        setAvailableVersion(latestVersion)
      } catch {
        // Version checks are opportunistic; a later check can retry.
      } finally {
        isCheckingVersionRef.current = false
      }
    }

    const checkVisibleVersion = () => {
      if (document.visibilityState === "visible") void checkVersion()
    }

    void checkVersion()
    const intervalId = window.setInterval(() => void checkVersion(), pollIntervalMs)
    window.addEventListener("focus", checkVisibleVersion)
    document.addEventListener("visibilitychange", checkVisibleVersion)

    return () => {
      isActive = false
      window.clearInterval(intervalId)
      window.removeEventListener("focus", checkVisibleVersion)
      document.removeEventListener("visibilitychange", checkVisibleVersion)
    }
  }, [enabled, fetchVersion, pollIntervalMs])

  return {
    availableVersion,
    dismiss,
    reload,
  }
}
