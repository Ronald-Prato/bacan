export const LOGIN_PATH = "/login"
export const CALLBACK_PATH = "/sso-callback"

export function safeReturnTo(value: string | null) {
  if (!value) return "/"

  try {
    const url = new URL(value, window.location.origin)
    if (url.origin !== window.location.origin) return "/"
    if (url.pathname === LOGIN_PATH || url.pathname === CALLBACK_PATH) return "/"
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return "/"
  }
}
