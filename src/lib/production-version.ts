export type ProductionVersionState = {
  initialVersion: string | null
  latestVersion: string | null
  notifiedVersion?: string | null
}

function normalizeVersion(version: string | null | undefined) {
  const normalizedVersion = version?.trim()
  return normalizedVersion || null
}

export function shouldNotifyProductionVersionUpdate({
  initialVersion,
  latestVersion,
  notifiedVersion = null,
}: ProductionVersionState) {
  const normalizedInitialVersion = normalizeVersion(initialVersion)
  const normalizedLatestVersion = normalizeVersion(latestVersion)
  const normalizedNotifiedVersion = normalizeVersion(notifiedVersion)

  if (!normalizedInitialVersion || !normalizedLatestVersion) return false

  return (
    normalizedLatestVersion !== normalizedInitialVersion &&
    normalizedLatestVersion !== normalizedNotifiedVersion
  )
}
